const axios = require('axios');
const cheerio = require('cheerio');

class SocialMediaFetcher {
  
  // Extract Instagram username from various URL formats
  extractInstagramUsername(handle) {
    if (!handle) return null;
    
    // Remove @ symbol if present
    let username = handle.replace('@', '');
    
    // Extract from URL if it's a full URL
    const urlMatch = username.match(/instagram\.com\/([^\/\?]+)/);
    if (urlMatch) {
      username = urlMatch[1];
    }
    
    return username;
  }

  // Extract YouTube channel handle/ID from various formats
  extractYouTubeHandle(handle) {
    if (!handle) return null;
    
    let channelId = handle;
    
    // Extract from URL patterns
    const channelMatch = handle.match(/youtube\.com\/channel\/([^\/\?]+)/);
    const userMatch = handle.match(/youtube\.com\/user\/([^\/\?]+)/);
    const handleMatch = handle.match(/youtube\.com\/@([^\/\?]+)/);
    const cMatch = handle.match(/youtube\.com\/c\/([^\/\?]+)/);
    
    if (channelMatch) {
      channelId = channelMatch[1];
    } else if (userMatch) {
      channelId = userMatch[1];
    } else if (handleMatch) {
      channelId = `@${handleMatch[1]}`;
    } else if (cMatch) {
      channelId = cMatch[1];
    }
    
    return channelId;
  }

  // Extract TikTok username
  extractTikTokUsername(handle) {
    if (!handle) return null;
    
    let username = handle.replace('@', '');
    
    const urlMatch = username.match(/tiktok\.com\/@([^\/\?]+)/);
    if (urlMatch) {
      username = urlMatch[1];
    }
    
    return username;
  }

  // Extract Twitter username
  extractTwitterUsername(handle) {
    if (!handle) return null;
    
    let username = handle.replace('@', '');
    
    const urlMatch = username.match(/twitter\.com\/([^\/\?]+)|x\.com\/([^\/\?]+)/);
    if (urlMatch) {
      username = urlMatch[1] || urlMatch[2];
    }
    
    return username;
  }

  // Fetch Instagram posts using RapidAPI Instagram scraper
  async fetchInstagramPosts(handle) {
    try {
      const username = this.extractInstagramUsername(handle);
      if (!username) return [];

      const rapidApiKey = process.env.RAPIDAPI_KEY;
      if (!rapidApiKey) {
        console.log('RapidAPI key not configured for Instagram scraping');
        return [];
      }

      const response = await axios.get('https://instagram-scraper-api2.p.rapidapi.com/v1/posts', {
        params: {
          username_or_id_or_url: username,
          url_embed_safe: true
        },
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
        }
      });

      if (response.data && response.data.data && response.data.data.items) {
        return response.data.data.items.slice(0, 3).map(item => ({
          id: item.id,
          platform: 'instagram',
          caption: item.caption?.text || 'No caption',
          mediaUrl: item.image_versions2?.candidates?.[0]?.url || item.video_versions?.[0]?.url,
          postUrl: `https://instagram.com/p/${item.code}`,
          likes: item.like_count || 0,
          comments: item.comment_count || 0,
          postedAt: new Date(item.taken_at * 1000),
          type: item.media_type === 1 ? 'image' : 'video'
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      return [];
    }
  }

  // Fetch YouTube videos using YouTube Data API v3
  async fetchYouTubePosts(handle) {
    try {
      const channelId = this.extractYouTubeHandle(handle);
      if (!channelId) return [];

      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        console.log('YouTube API key not configured');
        return [];
      }

      // First, get the channel ID if we have a username
      let actualChannelId = channelId;
      if (!channelId.startsWith('UC')) {
        try {
          const channelResponse = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
            params: {
              key: apiKey,
              forUsername: channelId.replace('@', ''),
              part: 'id'
            }
          });
          
          if (channelResponse.data.items && channelResponse.data.items.length > 0) {
            actualChannelId = channelResponse.data.items[0].id;
          } else {
            // Try searching by custom URL/handle
            const searchResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
              params: {
                key: apiKey,
                q: channelId.replace('@', ''),
                type: 'channel',
                part: 'snippet',
                maxResults: 1
              }
            });
            
            if (searchResponse.data.items && searchResponse.data.items.length > 0) {
              actualChannelId = searchResponse.data.items[0].snippet.channelId;
            }
          }
        } catch (error) {
          console.error('Error finding YouTube channel:', error);
          return [];
        }
      }

      // Get recent videos from the channel
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          key: apiKey,
          channelId: actualChannelId,
          part: 'snippet',
          order: 'date',
          maxResults: 3,
          type: 'video'
        }
      });

      if (response.data && response.data.items) {
        // Get video statistics for likes/comments
        const videoIds = response.data.items.map(item => item.id.videoId).join(',');
        const statsResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
          params: {
            key: apiKey,
            id: videoIds,
            part: 'statistics,contentDetails'
          }
        });

        const statsMap = {};
        if (statsResponse.data && statsResponse.data.items) {
          statsResponse.data.items.forEach(item => {
            statsMap[item.id] = item;
          });
        }

        return response.data.items.map(item => {
          const stats = statsMap[item.id.videoId];
          return {
            id: item.id.videoId,
            platform: 'youtube',
            caption: item.snippet.title,
            mediaUrl: item.snippet.thumbnails.medium.url,
            postUrl: `https://youtube.com/watch?v=${item.id.videoId}`,
            likes: stats ? parseInt(stats.statistics.likeCount || 0) : 0,
            comments: stats ? parseInt(stats.statistics.commentCount || 0) : 0,
            postedAt: new Date(item.snippet.publishedAt),
            type: 'video',
            duration: stats ? stats.contentDetails.duration : null
          };
        });
      }

      return [];
    } catch (error) {
      console.error('Error fetching YouTube posts:', error);
      return [];
    }
  }

  // Fetch TikTok posts using RapidAPI TikTok scraper
  async fetchTikTokPosts(handle) {
    try {
      const username = this.extractTikTokUsername(handle);
      if (!username) return [];

      const rapidApiKey = process.env.RAPIDAPI_KEY;
      if (!rapidApiKey) {
        console.log('RapidAPI key not configured for TikTok scraping');
        return [];
      }

      const response = await axios.get('https://tiktok-scraper7.p.rapidapi.com/user/posts', {
        params: {
          username: username,
          count: 3
        },
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com'
        }
      });

      if (response.data && response.data.data && response.data.data.videos) {
        return response.data.data.videos.slice(0, 3).map(video => ({
          id: video.id,
          platform: 'tiktok',
          caption: video.desc || 'No caption',
          mediaUrl: video.video?.cover || video.video?.originCover,
          postUrl: `https://tiktok.com/@${username}/video/${video.id}`,
          likes: video.stats?.diggCount || 0,
          comments: video.stats?.commentCount || 0,
          postedAt: new Date(video.createTime * 1000),
          type: 'video',
          duration: video.video?.duration ? `${Math.floor(video.video.duration / 1000)}s` : null
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching TikTok posts:', error);
      return [];
    }
  }

  // Fetch Twitter posts using Twitter API v2
  async fetchTwitterPosts(handle) {
    try {
      const username = this.extractTwitterUsername(handle);
      if (!username) return [];

      const bearerToken = process.env.TWITTER_BEARER_TOKEN;
      if (!bearerToken) {
        console.log('Twitter Bearer Token not configured');
        return [];
      }

      // Get user ID from username
      const userResponse = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      });

      if (!userResponse.data || !userResponse.data.data) {
        console.log(`Twitter user not found: ${username}`);
        return [];
      }

      const userId = userResponse.data.data.id;
      
      // Get user's recent tweets
      const tweetsResponse = await axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        },
        params: {
          max_results: 3,
          'tweet.fields': 'created_at,public_metrics,attachments',
          'media.fields': 'preview_image_url,url,type',
          'expansions': 'attachments.media_keys'
        }
      });

      if (!tweetsResponse.data || !tweetsResponse.data.data) {
        return [];
      }

      // Create media lookup map
      const mediaMap = {};
      if (tweetsResponse.data.includes && tweetsResponse.data.includes.media) {
        tweetsResponse.data.includes.media.forEach(media => {
          mediaMap[media.media_key] = media;
        });
      }
      
      return tweetsResponse.data.data.map(tweet => {
        let mediaUrl = null;
        
        // Check for media attachments
        if (tweet.attachments && tweet.attachments.media_keys) {
          const mediaKey = tweet.attachments.media_keys[0];
          const media = mediaMap[mediaKey];
          if (media) {
            mediaUrl = media.preview_image_url || media.url;
          }
        }

        return {
          id: tweet.id,
          platform: 'twitter',
          caption: tweet.text,
          mediaUrl: mediaUrl,
          postUrl: `https://twitter.com/${username}/status/${tweet.id}`,
          likes: tweet.public_metrics?.like_count || 0,
          comments: tweet.public_metrics?.reply_count || 0,
          postedAt: new Date(tweet.created_at),
          type: mediaUrl ? 'image' : 'text'
        };
      });
    } catch (error) {
      console.error('Error fetching Twitter posts:', error);
      return [];
    }
  }

  // Main function to fetch posts from all platforms for a creator
  async fetchCreatorPosts(creator) {
    const posts = [];
    
    try {
      // Fetch from all available platforms
      const [instagramPosts, youtubePosts, tiktokPosts, twitterPosts] = await Promise.all([
        creator.instagram ? this.fetchInstagramPosts(creator.instagram) : [],
        creator.youtube ? this.fetchYouTubePosts(creator.youtube) : [],
        creator.tiktok ? this.fetchTikTokPosts(creator.tiktok) : [],
        creator.twitter ? this.fetchTwitterPosts(creator.twitter) : []
      ]);

      posts.push(...instagramPosts, ...youtubePosts, ...tiktokPosts, ...twitterPosts);

      // Sort by posted date (most recent first)
      posts.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

      // Return top 9 posts (3 per platform max)
      return posts.slice(0, 9);
      
    } catch (error) {
      console.error('Error fetching creator posts:', error);
      return [];
    }
  }
}

module.exports = new SocialMediaFetcher();