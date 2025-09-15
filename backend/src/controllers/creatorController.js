const { Creator, Interaction } = require('../models');
const { Op } = require('sequelize');
const socialMediaFetcher = require('../utils/socialMediaFetcher');

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
};

module.exports = creatorController;
