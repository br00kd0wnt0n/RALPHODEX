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
    console.log('🔍 [INSTAGRAM] Starting fetch for handle:', handle);
    
    try {
      const username = this.extractInstagramUsername(handle);
      console.log('🔍 [INSTAGRAM] Extracted username:', username);
      
      if (!username) {
        console.log('❌ [INSTAGRAM] No valid username extracted from handle:', handle);
        return [];
      }

      const rapidApiKey = process.env.RAPIDAPI_KEY;
      if (!rapidApiKey) {
        console.log('❌ [INSTAGRAM] RapidAPI key not configured for Instagram scraping');
        return [];
      }
      console.log('✅ [INSTAGRAM] RapidAPI key found:', rapidApiKey ? 'Yes' : 'No');

      console.log('📡 [INSTAGRAM] Making API request to Instagram120...');
      // Try common Instagram120 API endpoints for user posts
      let response;
      try {
        // Try endpoint 1: /api/instagram/user/{username}
        console.log('🔍 [INSTAGRAM] Trying user endpoint...');
        response = await axios.get(`https://instagram120.p.rapidapi.com/api/instagram/user/${username}`, {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'instagram120.p.rapidapi.com'
          }
        });
      } catch (error1) {
        console.log('⚠️ [INSTAGRAM] User endpoint failed, trying posts endpoint...');
        try {
          // Try endpoint 2: /api/instagram/posts
          response = await axios.get('https://instagram120.p.rapidapi.com/api/instagram/posts', {
            params: {
              username: username
            },
            headers: {
              'X-RapidAPI-Key': rapidApiKey,
              'X-RapidAPI-Host': 'instagram120.p.rapidapi.com'
            }
          });
        } catch (error2) {
          console.log('⚠️ [INSTAGRAM] Posts endpoint failed, trying profile endpoint...');
          // Try endpoint 3: /api/instagram/profile
          response = await axios.get('https://instagram120.p.rapidapi.com/api/instagram/profile', {
            params: {
              username: username,
              include_posts: true
            },
            headers: {
              'X-RapidAPI-Key': rapidApiKey,
              'X-RapidAPI-Host': 'instagram120.p.rapidapi.com'
            }
          });
        }
      }

      console.log('📊 [INSTAGRAM] API Response Status:', response.status);
      console.log('📊 [INSTAGRAM] Raw response structure:', {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        dataType: typeof response.data,
        isArray: Array.isArray(response.data)
      });

      let posts = [];
      
      // Try to extract posts from various possible response structures
      if (response.data) {
        let postsData = null;
        
        // Pattern 1: Direct array of posts
        if (Array.isArray(response.data)) {
          postsData = response.data;
          console.log('📋 [INSTAGRAM] Using direct array format');
        }
        // Pattern 2: response.data.posts
        else if (response.data.posts && Array.isArray(response.data.posts)) {
          postsData = response.data.posts;
          console.log('📋 [INSTAGRAM] Using data.posts format');
        }
        // Pattern 3: response.data.data.items (old format)
        else if (response.data.data && response.data.data.items && Array.isArray(response.data.data.items)) {
          postsData = response.data.data.items;
          console.log('📋 [INSTAGRAM] Using data.data.items format');
        }
        // Pattern 4: response.data.media or similar
        else if (response.data.media && Array.isArray(response.data.media)) {
          postsData = response.data.media;
          console.log('📋 [INSTAGRAM] Using data.media format');
        }
        // Pattern 5: response.data.items
        else if (response.data.items && Array.isArray(response.data.items)) {
          postsData = response.data.items;
          console.log('📋 [INSTAGRAM] Using data.items format');
        }

        if (postsData && postsData.length > 0) {
          console.log('📊 [INSTAGRAM] Found', postsData.length, 'posts, sample structure:', {
            sampleKeys: Object.keys(postsData[0] || {}),
            hasId: !!postsData[0]?.id,
            hasCaption: !!postsData[0]?.caption,
            hasMedia: !!postsData[0]?.media_url || !!postsData[0]?.image_versions2
          });

          posts = postsData.slice(0, 3).map(item => ({
            id: item.id || item.pk || Math.random().toString(),
            platform: 'instagram',
            caption: item.caption?.text || item.caption || item.text || 'No caption',
            mediaUrl: item.media_url || item.image_versions2?.candidates?.[0]?.url || item.video_versions?.[0]?.url,
            postUrl: item.permalink || `https://instagram.com/p/${item.code || item.shortcode}`,
            likes: item.like_count || item.likes || 0,
            comments: item.comment_count || item.comments || 0,
            postedAt: new Date(item.taken_at ? item.taken_at * 1000 : item.timestamp || Date.now()),
            type: (item.media_type === 1 || item.type === 'image') ? 'image' : 'video'
          }));
        }
      }
        
      console.log('✅ [INSTAGRAM] Successfully processed', posts.length, 'posts');
      if (posts.length > 0) {
        console.log('📋 [INSTAGRAM] Posts summary:', posts.map(p => ({
          id: p.id,
          caption: p.caption.substring(0, 50) + '...',
          likes: p.likes,
          type: p.type
        })));
      } else {
        console.log('⚠️ [INSTAGRAM] No posts found in API response');
      }
        
      return posts;
    } catch (error) {
      console.error('❌ [INSTAGRAM] Error fetching Instagram posts:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      return [];
    }
  }

  // Fetch YouTube videos using YouTube Data API v3
  async fetchYouTubePosts(handle) {
    console.log('🔍 [YOUTUBE] Starting fetch for handle:', handle);
    
    try {
      const channelId = this.extractYouTubeHandle(handle);
      console.log('🔍 [YOUTUBE] Extracted channel ID:', channelId);
      
      if (!channelId) {
        console.log('❌ [YOUTUBE] No valid channel ID extracted from handle:', handle);
        return [];
      }

      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        console.log('❌ [YOUTUBE] YouTube API key not configured');
        return [];
      }
      console.log('✅ [YOUTUBE] YouTube API key found:', apiKey ? 'Yes' : 'No');

      // First, get the channel ID if we have a username
      let actualChannelId = channelId;
      if (!channelId.startsWith('UC')) {
        console.log('🔍 [YOUTUBE] Channel ID does not start with UC, resolving username/handle...');
        
        try {
          console.log('📡 [YOUTUBE] Attempting forUsername lookup...');
          const channelResponse = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
            params: {
              key: apiKey,
              forUsername: channelId.replace('@', ''),
              part: 'id'
            }
          });
          
          console.log('📊 [YOUTUBE] forUsername response:', {
            status: channelResponse.status,
            itemsCount: channelResponse.data.items?.length || 0
          });
          
          if (channelResponse.data.items && channelResponse.data.items.length > 0) {
            actualChannelId = channelResponse.data.items[0].id;
            console.log('✅ [YOUTUBE] Found channel ID via forUsername:', actualChannelId);
          } else {
            // Try searching by custom URL/handle
            console.log('📡 [YOUTUBE] forUsername failed, trying search...');
            const searchResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
              params: {
                key: apiKey,
                q: channelId.replace('@', ''),
                type: 'channel',
                part: 'snippet',
                maxResults: 1
              }
            });
            
            console.log('📊 [YOUTUBE] Search response:', {
              status: searchResponse.status,
              itemsCount: searchResponse.data.items?.length || 0
            });
            
            if (searchResponse.data.items && searchResponse.data.items.length > 0) {
              actualChannelId = searchResponse.data.items[0].snippet.channelId;
              console.log('✅ [YOUTUBE] Found channel ID via search:', actualChannelId);
            } else {
              console.log('❌ [YOUTUBE] Could not resolve channel ID for handle:', channelId);
            }
          }
        } catch (error) {
          console.error('❌ [YOUTUBE] Error finding YouTube channel:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText
          });
          return [];
        }
      } else {
        console.log('✅ [YOUTUBE] Using provided channel ID:', actualChannelId);
      }

      // Get recent videos from the channel
      console.log('📡 [YOUTUBE] Fetching recent videos for channel:', actualChannelId);
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

      console.log('📊 [YOUTUBE] Search videos response:', {
        status: response.status,
        itemsCount: response.data.items?.length || 0
      });

      if (response.data && response.data.items) {
        // Get video statistics for likes/comments
        const videoIds = response.data.items.map(item => item.id.videoId).join(',');
        console.log('📡 [YOUTUBE] Fetching video statistics for IDs:', videoIds);
        
        const statsResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
          params: {
            key: apiKey,
            id: videoIds,
            part: 'statistics,contentDetails'
          }
        });

        console.log('📊 [YOUTUBE] Video stats response:', {
          status: statsResponse.status,
          itemsCount: statsResponse.data.items?.length || 0
        });

        const statsMap = {};
        if (statsResponse.data && statsResponse.data.items) {
          statsResponse.data.items.forEach(item => {
            statsMap[item.id] = item;
          });
        }

        const posts = response.data.items.map(item => {
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

        console.log('✅ [YOUTUBE] Successfully processed', posts.length, 'posts');
        console.log('📋 [YOUTUBE] Posts summary:', posts.map(p => ({
          id: p.id,
          title: p.caption.substring(0, 50) + '...',
          likes: p.likes,
          views: stats ? stats.statistics?.viewCount : 'N/A'
        })));

        return posts;
      }

      console.log('⚠️ [YOUTUBE] No videos found in API response');
      return [];
    } catch (error) {
      console.error('❌ [YOUTUBE] Error fetching YouTube posts:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      return [];
    }
  }

  // Fetch TikTok posts using RapidAPI TikTok scraper
  async fetchTikTokPosts(handle) {
    console.log('🔍 [TIKTOK] Starting fetch for handle:', handle);
    
    try {
      const username = this.extractTikTokUsername(handle);
      console.log('🔍 [TIKTOK] Extracted username:', username);
      
      if (!username) {
        console.log('❌ [TIKTOK] No valid username extracted from handle:', handle);
        return [];
      }

      const rapidApiKey = process.env.RAPIDAPI_KEY;
      if (!rapidApiKey) {
        console.log('❌ [TIKTOK] RapidAPI key not configured for TikTok scraping');
        return [];
      }
      console.log('✅ [TIKTOK] RapidAPI key found:', rapidApiKey ? 'Yes' : 'No');

      console.log('📡 [TIKTOK] Making API request to TikTok scraper...');
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

      console.log('📊 [TIKTOK] API Response Status:', response.status);
      console.log('📊 [TIKTOK] API Response Data Structure:', {
        hasData: !!response.data,
        hasDataField: !!(response.data && response.data.data),
        hasVideos: !!(response.data && response.data.data && response.data.data.videos),
        videosCount: response.data?.data?.videos?.length || 0
      });

      if (response.data && response.data.data && response.data.data.videos) {
        const posts = response.data.data.videos.slice(0, 3).map(video => ({
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

        console.log('✅ [TIKTOK] Successfully processed', posts.length, 'posts');
        console.log('📋 [TIKTOK] Posts summary:', posts.map(p => ({
          id: p.id,
          caption: p.caption.substring(0, 50) + '...',
          likes: p.likes,
          duration: p.duration
        })));

        return posts;
      }

      console.log('⚠️ [TIKTOK] No videos found in API response');
      return [];
    } catch (error) {
      console.error('❌ [TIKTOK] Error fetching TikTok posts:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      return [];
    }
  }

  // Fetch Twitter posts using Twitter API v2
  async fetchTwitterPosts(handle) {
    console.log('🔍 [TWITTER] Starting fetch for handle:', handle);
    
    try {
      const username = this.extractTwitterUsername(handle);
      console.log('🔍 [TWITTER] Extracted username:', username);
      
      if (!username) {
        console.log('❌ [TWITTER] No valid username extracted from handle:', handle);
        return [];
      }

      const bearerToken = process.env.TWITTER_BEARER_TOKEN;
      if (!bearerToken) {
        console.log('❌ [TWITTER] Twitter Bearer Token not configured');
        return [];
      }
      console.log('✅ [TWITTER] Twitter Bearer Token found:', bearerToken ? 'Yes' : 'No');

      // Get user ID from username
      console.log('📡 [TWITTER] Looking up user ID for username:', username);
      const userResponse = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      });

      console.log('📊 [TWITTER] User lookup response:', {
        status: userResponse.status,
        hasData: !!userResponse.data,
        hasUserData: !!(userResponse.data && userResponse.data.data)
      });

      if (!userResponse.data || !userResponse.data.data) {
        console.log('❌ [TWITTER] Twitter user not found:', username);
        return [];
      }

      const userId = userResponse.data.data.id;
      console.log('✅ [TWITTER] Found user ID:', userId);
      
      // Get user's recent tweets
      console.log('📡 [TWITTER] Fetching recent tweets for user ID:', userId);
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

      console.log('📊 [TWITTER] Tweets response:', {
        status: tweetsResponse.status,
        hasData: !!tweetsResponse.data,
        hasTweets: !!(tweetsResponse.data && tweetsResponse.data.data),
        tweetsCount: tweetsResponse.data?.data?.length || 0,
        hasMedia: !!(tweetsResponse.data?.includes?.media)
      });

      if (!tweetsResponse.data || !tweetsResponse.data.data) {
        console.log('⚠️ [TWITTER] No tweets found for user');
        return [];
      }

      // Create media lookup map
      const mediaMap = {};
      if (tweetsResponse.data.includes && tweetsResponse.data.includes.media) {
        tweetsResponse.data.includes.media.forEach(media => {
          mediaMap[media.media_key] = media;
        });
        console.log('📊 [TWITTER] Found media attachments:', Object.keys(mediaMap).length);
      }
      
      const posts = tweetsResponse.data.data.map(tweet => {
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

      console.log('✅ [TWITTER] Successfully processed', posts.length, 'posts');
      console.log('📋 [TWITTER] Posts summary:', posts.map(p => ({
        id: p.id,
        text: p.caption.substring(0, 50) + '...',
        likes: p.likes,
        hasMedia: !!p.mediaUrl
      })));

      return posts;
    } catch (error) {
      console.error('❌ [TWITTER] Error fetching Twitter posts:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      return [];
    }
  }

  // Main function to fetch posts from all platforms for a creator
  async fetchCreatorPosts(creator) {
    console.log('🚀 [MAIN] Starting social media fetch for creator:', creator.full_name, `(ID: ${creator.id})`);
    console.log('📱 [MAIN] Available platforms:', {
      instagram: creator.instagram || 'Not configured',
      youtube: creator.youtube || 'Not configured', 
      tiktok: creator.tiktok || 'Not configured',
      twitter: creator.twitter || 'Not configured'
    });
    
    const posts = [];
    
    try {
      // Fetch from all available platforms
      console.log('📡 [MAIN] Starting parallel fetch from all platforms...');
      const fetchPromises = [
        creator.instagram ? this.fetchInstagramPosts(creator.instagram) : Promise.resolve([]),
        creator.youtube ? this.fetchYouTubePosts(creator.youtube) : Promise.resolve([]),
        creator.tiktok ? this.fetchTikTokPosts(creator.tiktok) : Promise.resolve([]),
        creator.twitter ? this.fetchTwitterPosts(creator.twitter) : Promise.resolve([])
      ];

      const [instagramPosts, youtubePosts, tiktokPosts, twitterPosts] = await Promise.all(fetchPromises);

      console.log('📊 [MAIN] Platform results:', {
        instagram: instagramPosts.length,
        youtube: youtubePosts.length,
        tiktok: tiktokPosts.length,
        twitter: twitterPosts.length
      });

      posts.push(...instagramPosts, ...youtubePosts, ...tiktokPosts, ...twitterPosts);

      // Sort by posted date (most recent first)
      posts.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

      console.log('✅ [MAIN] Total posts collected:', posts.length);
      console.log('📋 [MAIN] Final posts summary:', posts.slice(0, 9).map(p => ({
        platform: p.platform,
        id: p.id,
        caption: p.caption.substring(0, 30) + '...',
        likes: p.likes,
        postedAt: p.postedAt.toISOString().split('T')[0]
      })));

      // Return top 9 posts (3 per platform max)
      const finalPosts = posts.slice(0, 9);
      console.log('🎯 [MAIN] Returning', finalPosts.length, 'posts to API');
      
      return finalPosts;
      
    } catch (error) {
      console.error('❌ [MAIN] Error fetching creator posts:', {
        creatorId: creator.id,
        creatorName: creator.full_name,
        error: error.message,
        stack: error.stack
      });
      return [];
    }
  }
}

module.exports = new SocialMediaFetcher();