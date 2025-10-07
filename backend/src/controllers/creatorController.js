const { Creator, Interaction, CreatorComment } = require('../models');
const { Op } = require('sequelize');
const socialMediaFetcher = require('../utils/socialMediaFetcher');
const { fetchCommentsByPlatformMap, extractCaptionsFromPosts } = require('../utils/commentsFetcher');
const { buildWordCloud } = require('../utils/textAnalysis');

const creatorController = {
  async getAllCreators(req, res) {
    try {
      const { page = 1, limit = 20, search, tags, verified, metaFilter } = req.query;
      const offset = (page - 1) * limit;
      
      const where = {};
      
      if (search) {
        where[Op.or] = [
          { full_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { primary_content_type: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      if (tags) {
        const tagArray = tags.split(',');
        where.tags = { [Op.overlap]: tagArray };
      }
      
      if (verified !== undefined) {
        where.verified = verified === 'true';
      }
      
      // META Filter: >1K FB followers, Young Adult >20%, US >20%
      if (metaFilter === 'true') {
        where.facebook_followers = { [Op.gt]: 1000 };
        where[Op.and] = [
          { 'demographics.young_adult_percentage': { [Op.gt]: 20 } },
          { 'demographics.us_followers_percentage': { [Op.gt]: 20 } }
        ];
      }
      
      const creators = await Creator.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [{
          model: Interaction,
          as: 'interactions',
          limit: 5,
          order: [['date', 'DESC']]
        }]
      });
      
      res.json({
        creators: creators.rows,
        totalPages: Math.ceil(creators.count / limit),
        currentPage: parseInt(page),
        total: creators.count
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCreatorById(req, res) {
    try {
      const creator = await Creator.findByPk(req.params.id, {
        include: [{
          model: Interaction,
          as: 'interactions',
          order: [['date', 'DESC']]
        }]
      });
      
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      res.json(creator);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createCreator(req, res) {
    try {
      const creator = await Creator.create(req.body);
      res.status(201).json(creator);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateCreator(req, res) {
    try {
      const [updated] = await Creator.update(req.body, {
        where: { id: req.params.id },
        returning: true
      });
      
      if (!updated) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      const creator = await Creator.findByPk(req.params.id);
      res.json(creator);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteCreator(req, res) {
    try {
      const deleted = await Creator.destroy({
        where: { id: req.params.id }
      });
      
      if (!deleted) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async addInteraction(req, res) {
    try {
      const interaction = await Interaction.create({
        ...req.body,
        creator_id: req.params.id
      });
      
      res.status(201).json(interaction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getCreatorInsights(req, res) {
    try {
      const { generateCreatorInsights } = require('../services/aiService');
      
      const creator = await Creator.findByPk(req.params.id, {
        include: [{ 
          model: Interaction, 
          as: 'interactions',
          order: [['date', 'DESC']]
        }]
      });
      
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      const insights = await generateCreatorInsights(creator);
      
      res.json({
        creator_id: creator.id,
        creator_name: creator.full_name,
        ...insights
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCreatorRecommendations(req, res) {
    try {
      const { generateMatchingRecommendations } = require('../services/aiService');
      
      const creator = await Creator.findByPk(req.params.id);
      
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      const allCreators = await Creator.findAll({
        where: {
          id: { [Op.ne]: creator.id }
        },
        limit: 20
      });
      
      const recommendations = await generateMatchingRecommendations(creator, allCreators);
      
      res.json({
        creator_id: creator.id,
        creator_name: creator.full_name,
        ...recommendations
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCreatorPosts(req, res) {
    const startTime = Date.now();
    console.log('🎬 [API] POST /api/creators/:id/posts called');
    console.log('🎬 [API] Creator ID:', req.params.id);
    console.log('🎬 [API] Request headers:', {
      authorization: req.headers.authorization ? 'Bearer token present' : 'No auth token',
      userAgent: req.headers['user-agent'],
      origin: req.headers.origin
    });

    try {
      console.log('🔍 [API] Looking up creator in database...');
      const creator = await Creator.findByPk(req.params.id);
      
      if (!creator) {
        console.log('❌ [API] Creator not found for ID:', req.params.id);
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      console.log('✅ [API] Creator found:', {
        id: creator.id,
        name: creator.full_name,
        social_handles: {
          instagram: creator.instagram || 'Not set',
          youtube: creator.youtube || 'Not set',
          tiktok: creator.tiktok || 'Not set',
          twitter: creator.twitter || 'Not set'
        }
      });

      // Check environment variables
      console.log('🔑 [API] Environment variables check:', {
        RAPIDAPI_KEY: process.env.RAPIDAPI_KEY ? 'Set' : 'Not set',
        YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY ? 'Set' : 'Not set',
        TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN ? 'Set' : 'Not set'
      });
      
      // Fetch recent posts from social media platforms
      console.log('📡 [API] Calling socialMediaFetcher.fetchCreatorPosts...');
      const posts = await socialMediaFetcher.fetchCreatorPosts(creator);
      
      const elapsed = Date.now() - startTime;
      console.log('✅ [API] Social media fetch completed in', elapsed, 'ms');
      console.log('📊 [API] Final results:', {
        total_posts: posts.length,
        platforms_with_posts: [...new Set(posts.map(p => p.platform))],
        first_post_sample: posts.length > 0 ? {
          platform: posts[0].platform,
          id: posts[0].id,
          caption_preview: posts[0].caption.substring(0, 50) + '...'
        } : 'No posts'
      });

      const response = {
        creator_id: creator.id,
        creator_name: creator.full_name,
        platforms: {
          instagram: creator.instagram || null,
          youtube: creator.youtube || null,
          tiktok: creator.tiktok || null,
          twitter: creator.twitter || null
        },
        posts: posts,
        total_posts: posts.length,
        fetched_at: new Date().toISOString()
      };

      console.log('🚀 [API] Sending response with', posts.length, 'posts');
      res.json(response);
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error('❌ [API] Error in getCreatorPosts after', elapsed, 'ms:', {
        creatorId: req.params.id,
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      
      res.status(500).json({ 
        error: 'Failed to fetch social media posts',
        message: error.message 
      });
    }
  }
  ,

  async refreshConversationCloud(req, res) {
    const startTime = Date.now();
    try {
      const creator = await Creator.findByPk(req.params.id);
      if (!creator) return res.status(404).json({ error: 'Creator not found' });

      console.log(`[ConvoCloud] Refreshing for creator: ${creator.full_name} (${creator.id})`);
      console.log(`[ConvoCloud] Social handles: IG=${creator.instagram}, TT=${creator.tiktok}, YT=${creator.youtube}, TW=${creator.twitter}`);

      // Fetch recent posts across platforms (re-use existing fetcher)
      const posts = await socialMediaFetcher.fetchCreatorPosts(creator);
      console.log(`[ConvoCloud] Fetched ${posts.length} posts from socialMediaFetcher`);
      if (posts.length > 0) {
        console.log(`[ConvoCloud] Post platforms:`, posts.map(p => p.platform).join(', '));
      }

      // Attempt to fetch comments via scraper providers (if configured)
      const commentsByPlatform = await fetchCommentsByPlatformMap(posts);
      console.log(`[ConvoCloud] Comments by platform:`, Object.keys(commentsByPlatform).map(k => `${k}: ${commentsByPlatform[k]?.length || 0}`).join(', '));

      // Partition posts by platform
      const postsByPlat = posts.reduce((acc, p) => {
        acc[p.platform] = acc[p.platform] || [];
        acc[p.platform].push(p);
        return acc;
      }, {});

      // Build text corpora per platform and overall
      const captionsAll = extractCaptionsFromPosts(posts);
      const commentsTextsAll = [];
      const commentsByPlatTexts = {};
      const captionsByPlatTexts = {};
      const captionCountsByPlat = {};
      for (const [plat, arr] of Object.entries(commentsByPlatform)) {
        const texts = (arr || []).map(c => c.text).filter(Boolean);
        commentsTextsAll.push(...texts);
        commentsByPlatTexts[plat] = texts;
      }
      for (const [plat, arr] of Object.entries(postsByPlat)) {
        const texts = extractCaptionsFromPosts(arr);
        captionsByPlatTexts[plat] = texts;
        captionCountsByPlat[plat] = texts.length;
      }

      const cloud = buildWordCloud(commentsTextsAll, captionsAll);

      // Per-platform terms (computed independently per platform)
      const byPlatform = {};
      for (const plat of Object.keys(postsByPlat)) {
        const cTexts = commentsByPlatTexts[plat] || [];
        const capTexts = captionsByPlatTexts[plat] || [];
        const localCloud = buildWordCloud(cTexts, capTexts);
        byPlatform[plat] = localCloud.top_overall;
      }

      // Store results on creator
      await creator.update({
        conversation_terms: cloud.top_overall,
        conversation_terms_by_platform: byPlatform,
        last_comment_fetch_at: new Date(),
        analysis_metadata: {
          ...(creator.analysis_metadata || {}),
          conversation_sources: Object.keys(commentsByPlatform),
          caption_posts: posts.length,
          caption_posts_by_platform: captionCountsByPlat,
          comments_samples: Object.fromEntries(Object.entries(commentsByPlatTexts).map(([k,v]) => [k, v.length]))
        }
      });

      const elapsed = Date.now() - startTime;
      const result = {
        creator_id: creator.id,
        creator_name: creator.full_name,
        fetched_in_ms: elapsed,
        platforms: Object.keys(commentsByPlatform),
        summary: cloud
      };
      console.log(`[ConvoCloud] Complete! ${elapsed}ms, ${cloud.total_terms} terms generated`);
      return res.json(result);
    } catch (error) {
      console.error(`[ConvoCloud] Error:`, error);
      return res.status(500).json({ error: error.message });
    }
  },

  async refreshMetrics(req, res) {
    const startTime = Date.now();
    try {
      const creator = await Creator.findByPk(req.params.id);
      if (!creator) return res.status(404).json({ error: 'Creator not found' });

      console.log(`[Metrics] Refreshing metrics for creator: ${creator.full_name}`);

      // Fetch recent posts to calculate engagement
      const posts = await socialMediaFetcher.fetchCreatorPosts(creator);
      console.log(`[Metrics] Fetched ${posts.length} posts for analysis`);

      // Fetch channel/profile statistics for follower counts
      const channelStats = [];
      if (creator.youtube) {
        const ytStats = await socialMediaFetcher.fetchYouTubeChannelStats(creator.youtube);
        if (ytStats) channelStats.push(ytStats);
      }
      console.log(`[Metrics] Fetched channel stats:`, channelStats);

      // Organize posts by platform
      const postsByPlatform = posts.reduce((acc, post) => {
        if (!acc[post.platform]) acc[post.platform] = [];
        acc[post.platform].push(post);
        return acc;
      }, {});

      // Calculate metrics per platform
      const metricsByPlatform = {};
      let totalFollowers = 0;
      let totalEngagement = 0;
      let totalPosts = posts.length;

      for (const [platform, platformPosts] of Object.entries(postsByPlatform)) {
        const totalLikes = platformPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
        const totalComments = platformPosts.reduce((sum, p) => sum + (p.comments || 0), 0);
        const totalViews = platformPosts.reduce((sum, p) => sum + (p.views || 0), 0);

        const avgLikes = platformPosts.length > 0 ? totalLikes / platformPosts.length : 0;
        const avgComments = platformPosts.length > 0 ? totalComments / platformPosts.length : 0;
        const avgViews = platformPosts.length > 0 ? totalViews / platformPosts.length : 0;

        // Estimate engagement rate (likes + comments) / views * 100
        const engagementRate = avgViews > 0 ? ((avgLikes + avgComments) / avgViews) * 100 : 0;

        metricsByPlatform[platform] = {
          post_count: platformPosts.length,
          avg_likes: Math.round(avgLikes),
          avg_comments: Math.round(avgComments),
          avg_views: Math.round(avgViews),
          total_engagement: totalLikes + totalComments,
          engagement_rate: Math.round(engagementRate * 100) / 100
        };

        totalEngagement += (totalLikes + totalComments);
      }

      // Calculate overall engagement rate
      const overallEngagementRate = totalPosts > 0 ? (totalEngagement / totalPosts) / 100 : 0;

      // Calculate total audience from channel stats
      let calculatedAudience = 0;
      for (const stat of channelStats) {
        if (stat.subscriberCount) {
          calculatedAudience += stat.subscriberCount;
        }
        if (stat.followerCount) {
          calculatedAudience += stat.followerCount;
        }
      }

      // Update creator with new metrics
      const updateData = {
        metrics_by_platform: metricsByPlatform,
        engagement_rate: Math.round(overallEngagementRate * 100) / 100,
        metrics_updated_at: new Date(),
        activity_score: totalPosts > 0 ? Math.min(100, totalPosts * 10) : 0
      };

      // Only update audience_size if we found a value from the APIs
      if (calculatedAudience > 0) {
        updateData.audience_size = calculatedAudience;
      }

      await creator.update(updateData);

      const elapsed = Date.now() - startTime;
      console.log(`[Metrics] Complete! ${elapsed}ms, analyzed ${totalPosts} posts across ${Object.keys(postsByPlatform).length} platforms`);

      return res.json({
        creator_id: creator.id,
        creator_name: creator.full_name,
        fetched_in_ms: elapsed,
        platforms: Object.keys(postsByPlatform),
        metrics_by_platform: metricsByPlatform,
        overall: {
          total_posts: totalPosts,
          engagement_rate: Math.round(overallEngagementRate * 100) / 100,
          activity_score: Math.min(100, totalPosts * 10)
        }
      });
    } catch (error) {
      console.error(`[Metrics] Error:`, error);
      return res.status(500).json({ error: error.message });
    }
  },

  async getConversationCloudDiagnostics(req, res) {
    try {
      const creator = await Creator.findByPk(req.params.id);
      if (!creator) return res.status(404).json({ error: 'Creator not found' });

      const diagnostics = {
        creator: {
          id: creator.id,
          name: creator.full_name,
          social_handles: {
            instagram: creator.instagram || null,
            tiktok: creator.tiktok || null,
            youtube: creator.youtube || null,
            twitter: creator.twitter || null
          }
        },
        environment: {
          rapidapi_key_configured: !!process.env.RAPIDAPI_KEY,
          rapidapi_key_length: process.env.RAPIDAPI_KEY?.length || 0,
          instagram_posts_host: process.env.INSTAGRAM_POSTS_RAPIDAPI_HOST || 'instagram120.p.rapidapi.com',
          instagram_comments_host: process.env.INSTAGRAM_COMMENTS_RAPIDAPI_HOST || 'instagram120.p.rapidapi.com',
          instagram_comments_endpoints: process.env.INSTAGRAM_COMMENTS_ENDPOINTS || 'default',
          tiktok_host: process.env.TIKTOK_COMMENTS_RAPIDAPI_HOST || 'tiktok-scraper7.p.rapidapi.com'
        },
        conversation_data: {
          last_fetch: creator.last_comment_fetch_at || null,
          term_count: Object.keys(creator.conversation_terms || {}).length,
          platforms_with_data: Object.keys(creator.conversation_terms_by_platform || {}),
          sample_terms: Object.entries(creator.conversation_terms || {}).slice(0, 5)
        }
      };

      return res.json(diagnostics);
    } catch (error) {
      console.error('[Diagnostics] Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  ,

  async getComments(req, res) {
    try {
      const creator = await Creator.findByPk(req.params.id);
      if (!creator) return res.status(404).json({ error: 'Creator not found' });
      const comments = await CreatorComment.findAll({
        where: { creator_id: req.params.id },
        order: [['created_at', 'DESC']]
      });
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  ,

  async addComment(req, res) {
    try {
      const creator = await Creator.findByPk(req.params.id);
      if (!creator) return res.status(404).json({ error: 'Creator not found' });
      const { author_name, content } = req.body || {};
      if (!author_name || !content) {
        return res.status(400).json({ error: 'author_name and content are required' });
      }
      const comment = await CreatorComment.create({
        creator_id: req.params.id,
        author_name,
        content
      });
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = creatorController;
