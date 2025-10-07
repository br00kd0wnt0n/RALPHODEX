const axios = require('axios');
const { logger } = require('./logger');

// Centralized, pluggable comment fetchers for each platform.
// By default, scrapers are disabled; functions return [] and log guidance.

function extractInstagramShortcode(postUrl) {
  if (!postUrl) return null;
  const m = String(postUrl).match(/instagram\.com\/(?:p|reel|tv)\/([^\/\?]+)/);
  return m ? m[1] : null;
}

async function fetchInstagramCommentsForPosts(posts /* [{id, postUrl, ...}] */) {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    logger.warn('[IG] No RAPIDAPI_KEY; skipping Instagram comments.');
    return [];
  }

  const host = process.env.INSTAGRAM_COMMENTS_RAPIDAPI_HOST || 'instagram120.p.rapidapi.com';
  // Allow configuration of exact endpoints via ENV to match provider docs
  // Format (comma-separated): 
  //   "/your/path:shortcode,/another/path:code,/path-media:media_id"
  // If not set, fall back to common defaults.
  let candidates = [];
  const envEndpoints = process.env.INSTAGRAM_COMMENTS_ENDPOINTS;
  if (envEndpoints) {
    candidates = envEndpoints.split(',').map(s => s.trim()).filter(Boolean).map(spec => {
      const [path, param] = spec.split(':');
      return { url: `https://${host}${path}`, param: (param || 'shortcode').trim() };
    });
  } else {
    candidates = [
      { url: `https://${host}/api/instagram/post/comments`, param: 'shortcode' },
      { url: `https://${host}/api/instagram/comments`, param: 'shortcode' },
      { url: `https://${host}/post/comments`, param: 'shortcode' },
      { url: `https://${host}/comments`, param: 'shortcode' },
      // Some providers accept media_id or code
      { url: `https://${host}/post/comments`, param: 'code' },
      { url: `https://${host}/comments`, param: 'code' },
      { url: `https://${host}/post/comments`, param: 'media_id' },
    ];
  }

  const results = [];
  for (const p of posts) {
    const shortcode = extractInstagramShortcode(p.postUrl);
    const mediaId = p.id;
    const idCandidates = [shortcode, mediaId].filter(Boolean);
    if (idCandidates.length === 0) continue;

    let got = false;
    for (const idVal of idCandidates) {
      for (const cand of candidates) {
        try {
          const params = { count: 100 };
          params[cand.param] = idVal;
          const resp = await axios.get(cand.url, {
            params,
            headers: {
              'X-RapidAPI-Key': rapidApiKey,
              'X-RapidAPI-Host': host
            }
          });

          // Parse common shapes
          let comments = [];
          const d = resp.data;
          if (Array.isArray(d)) {
            comments = d;
          } else if (d?.data?.comments) {
            comments = d.data.comments;
          } else if (d?.comments) {
            comments = d.comments;
          } else if (d?.data?.items) {
            comments = d.data.items;
          }

          if (comments && comments.length) {
            comments.slice(0, 200).forEach(c => {
              const text = c.text || c.content || c.caption || c.comment || '';
              if (text) results.push({ platform: 'instagram', postId: idVal, text });
            });
            got = true;
            break;
          }
        } catch (e) {
          logger.debug(`[IG] comments attempt failed for ${idVal} via ${cand.url}: ${e.message}`);
        }
      }
      if (got) break;
    }
    if (!got) logger.info(`[IG] No comments returned for post ${p.postUrl || p.id}; skipping.`);
  }
  return results;
}

async function fetchTikTokCommentsForPosts(posts) {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    logger.warn('[TT] No RAPIDAPI_KEY; skipping TikTok comments.');
    return [];
  }

  const host = process.env.TIKTOK_COMMENTS_RAPIDAPI_HOST || 'tiktok-scraper7.p.rapidapi.com';
  // Candidate endpoints used by common RapidAPI providers
  const candidates = [
    { url: `https://${host}/post/comments`, idParam: 'aweme_id' },
    { url: `https://${host}/post/comments`, idParam: 'video_id' },
    { url: `https://${host}/comments/list`, idParam: 'aweme_id' },
  ];

  const results = [];
  for (const p of posts) {
    const vid = p.id;
    if (!vid) continue;
    let got = false;
    for (const cand of candidates) {
      try {
        const params = { count: 100 };
        params[cand.idParam] = vid;
        const resp = await axios.get(cand.url, {
          params,
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': host
          }
        });

        // Try common response shapes
        let comments = [];
        const d = resp.data;
        if (Array.isArray(d)) {
          comments = d;
        } else if (d?.data?.comments) {
          comments = d.data.comments;
        } else if (d?.comments) {
          comments = d.comments;
        } else if (d?.data?.list) {
          comments = d.data.list;
        }

        if (comments && comments.length) {
          comments.slice(0, 200).forEach(c => {
            const text = c.text || c.content || c.comment || '';
            if (text) results.push({ platform: 'tiktok', postId: vid, text });
          });
          got = true;
          break;
        }
      } catch (e) {
        logger.debug(`[TT] comments attempt failed for ${vid} via ${cand.url}: ${e.message}`);
      }
    }
    if (!got) {
      logger.info(`[TT] No comments returned for video ${vid}; skipping.`);
    }
  }
  return results;
}

async function fetchFacebookCommentsForPosts(posts) {
  // No Graph access for unmanaged Pages; scrapers would be needed.
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    logger.warn('[FB] No RAPIDAPI_KEY; skipping Facebook comments.');
    return [];
  }
  logger.info('[FB] Comment scraping not configured with a provider; returning empty list.');
  return [];
}

function extractCaptionsFromPosts(posts) {
  return posts.map(p => (p.caption || '')).filter(Boolean);
}

async function fetchCommentsByPlatformMap(posts) {
  // Partition posts by platform
  const byPlatform = posts.reduce((acc, p) => {
    acc[p.platform] = acc[p.platform] || [];
    acc[p.platform].push(p);
    return acc;
  }, {});

  const result = {};
  // Instagram
  if (byPlatform.instagram) {
    result.instagram = await fetchInstagramCommentsForPosts(byPlatform.instagram);
  }
  // TikTok
  if (byPlatform.tiktok) {
    result.tiktok = await fetchTikTokCommentsForPosts(byPlatform.tiktok);
  }
  // Facebook
  if (byPlatform.facebook) {
    result.facebook = await fetchFacebookCommentsForPosts(byPlatform.facebook);
  }
  return result;
}

module.exports = {
  fetchCommentsByPlatformMap,
  extractCaptionsFromPosts
};
