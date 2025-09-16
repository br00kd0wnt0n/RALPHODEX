const { RateLimiterMemory } = require('rate-limiter-flexible');
const { logger } = require('./logger');

// General API rate limiting (100 requests per 15 minutes)
const apiRateLimiter = new RateLimiterMemory({
  keyPrefix: 'api',
  points: 100, // Number of requests
  duration: 900, // Per 15 minutes (900 seconds)
});

// Social media rate limiting (10 requests per minute)
const socialMediaRateLimiter = new RateLimiterMemory({
  keyPrefix: 'social',
  points: 10, // Number of requests
  duration: 60, // Per minute (60 seconds)
});

// General API rate limiting middleware
const apiLimiter = async (req, res, next) => {
  try {
    const key = req.ip || 'unknown';
    await apiRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    logger.warn('API rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext
    });
    
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 15
    });
  }
};

// Social media rate limiting middleware
const socialMediaLimiter = async (req, res, next) => {
  try {
    const key = req.ip || 'unknown';
    await socialMediaRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    logger.warn('Social media rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      creatorId: req.params.id,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext
    });
    
    res.status(429).json({
      error: 'Social media endpoints are rate limited. Please wait before making another request.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 60
    });
  }
};

module.exports = {
  apiLimiter,
  socialMediaLimiter
};
