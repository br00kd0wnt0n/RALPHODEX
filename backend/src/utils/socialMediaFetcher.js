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

  // Fetch Instagram posts using public endpoint (limited)
  async fetchInstagramPosts(handle) {
    try {
      const username = this.extractInstagramUsername(handle);
      if (!username) return [];

      // Note: This is a simplified approach. Instagram's public API is limited.
      // In a production environment, you'd want to use Instagram Basic Display API
      // or a third-party service like RapidAPI's Instagram scraper
      
      return [
        {
          id: 'mock_ig_1',
          platform: 'instagram',
          caption: 'Sample Instagram post - API integration needed for real data',
          mediaUrl: 'https://picsum.photos/300/300?random=1',
          postUrl: `https://instagram.com/${username}`,
          likes: 150,
          comments: 12,
          postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          type: 'image'
        },
        {
          id: 'mock_ig_2',
          platform: 'instagram',
          caption: 'Another sample post - integration with Instagram Basic Display API recommended',
          mediaUrl: 'https://picsum.photos/300/300?random=1',
          postUrl: `https://instagram.com/${username}`,
          likes: 89,
          comments: 5,
          postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          type: 'image'
        }
      ];
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

      // Note: You'll need to add YOUTUBE_API_KEY to your environment variables
      // const apiKey = process.env.YOUTUBE_API_KEY;
      // if (!apiKey) return [];

      // Mock data for now - replace with actual YouTube API call
      return [
        {
          id: 'mock_yt_1',
          platform: 'youtube',
          caption: 'Sample YouTube video - YouTube Data API integration needed',
          mediaUrl: 'https://picsum.photos/480/360?random=2',
          postUrl: `https://youtube.com/watch?v=sample1`,
          likes: 1250,
          comments: 85,
          postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          type: 'video',
          duration: '5:23'
        },
        {
          id: 'mock_yt_2',
          platform: 'youtube',
          caption: 'Another sample YouTube video',
          mediaUrl: 'https://picsum.photos/480/360?random=2',
          postUrl: `https://youtube.com/watch?v=sample2`,
          likes: 892,
          comments: 34,
          postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          type: 'video',
          duration: '3:45'
        }
      ];

      // Actual YouTube API implementation would look like this:
      /*
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          key: apiKey,
          channelId: channelId,
          part: 'snippet',
          order: 'date',
          maxResults: 3,
          type: 'video'
        }
      });

      return response.data.items.map(item => ({
        id: item.id.videoId,
        platform: 'youtube',
        caption: item.snippet.title,
        mediaUrl: item.snippet.thumbnails.medium.url,
        postUrl: `https://youtube.com/watch?v=${item.id.videoId}`,
        postedAt: new Date(item.snippet.publishedAt),
        type: 'video'
      }));
      */
    } catch (error) {
      console.error('Error fetching YouTube posts:', error);
      return [];
    }
  }

  // Fetch TikTok posts (very limited without official API)
  async fetchTikTokPosts(handle) {
    try {
      const username = this.extractTikTokUsername(handle);
      if (!username) return [];

      // TikTok's public API is very limited. Consider using:
      // 1. TikTok Research API (requires approval)
      // 2. Third-party scraping services
      // 3. Puppeteer for web scraping (resource intensive)

      return [
        {
          id: 'mock_tt_1',
          platform: 'tiktok',
          caption: 'Sample TikTok video - TikTok API integration needed',
          mediaUrl: 'https://picsum.photos/300/400?random=3',
          postUrl: `https://tiktok.com/@${username}`,
          likes: 2500,
          comments: 156,
          postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          type: 'video'
        }
      ];
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

      // Note: Twitter API v2 requires bearer token
      // const bearerToken = process.env.TWITTER_BEARER_TOKEN;
      // if (!bearerToken) return [];

      // Mock data for now
      return [
        {
          id: 'mock_tw_1',
          platform: 'twitter',
          caption: 'Sample tweet - Twitter API v2 integration needed for real data',
          mediaUrl: null,
          postUrl: `https://twitter.com/${username}/status/1234567890`,
          likes: 45,
          comments: 8,
          postedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          type: 'text'
        }
      ];

      // Actual Twitter API implementation:
      /*
      const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      });
      
      const userId = response.data.data.id;
      
      const tweetsResponse = await axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        },
        params: {
          max_results: 3,
          'tweet.fields': 'created_at,public_metrics'
        }
      });
      
      return tweetsResponse.data.data.map(tweet => ({
        id: tweet.id,
        platform: 'twitter',
        caption: tweet.text,
        mediaUrl: null,
        postUrl: `https://twitter.com/${username}/status/${tweet.id}`,
        likes: tweet.public_metrics.like_count,
        comments: tweet.public_metrics.reply_count,
        postedAt: new Date(tweet.created_at),
        type: 'text'
      }));
      */
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