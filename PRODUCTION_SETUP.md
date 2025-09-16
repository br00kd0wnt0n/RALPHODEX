# Production Deployment Guide

## 🚀 Railway Deployment Setup

### 1. Environment Variables Required

Set these in your Railway dashboard for the backend service:

```env
# Core Configuration
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d

# Social Media API Keys (CRITICAL for social media features)
RAPIDAPI_KEY=your-rapidapi-key-here
YOUTUBE_API_KEY=your-youtube-api-key-here
TWITTER_BEARER_TOKEN=your-twitter-bearer-token-here

# AI Service
OPENAI_API_KEY=your-openai-api-key-here

# Logging
LOG_LEVEL=info

# Railway Specific
RAILWAY_STATIC_URL=https://your-app-name.up.railway.app
```

### 2. API Key Setup Instructions

#### RapidAPI (Instagram & TikTok)
1. Go to [RapidAPI](https://rapidapi.com/)
2. Subscribe to Instagram120 and TikTok Scraper APIs
3. Copy your RapidAPI key
4. Set as `RAPIDAPI_KEY` in Railway

#### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Create credentials (API Key)
4. Set as `YOUTUBE_API_KEY` in Railway

#### Twitter API
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Generate Bearer Token
4. Set as `TWITTER_BEARER_TOKEN` in Railway

### 3. Database Setup

Railway PostgreSQL:
1. Add PostgreSQL service to your Railway project
2. Copy the connection string
3. Set as `DATABASE_URL` in your backend service

### 4. Frontend Configuration

Update your frontend's build environment:
```env
REACT_APP_API_URL=https://your-backend-service.up.railway.app/api
```

### 5. Monitoring & Logs

#### Railway Logs
- Railway automatically captures console.log output
- Winston logger will send structured logs to Railway's logging system
- Check Railway dashboard → Deployments → Logs

#### Health Checks
- Backend: `https://your-backend.up.railway.app/api/health`
- Should return: `{"status":"OK","message":"Creator Rolodex API is running"}`

### 6. Troubleshooting

#### Social Media Not Working
1. Check API keys are set in Railway environment variables
2. Verify API subscriptions are active
3. Check Railway logs for API errors
4. Test endpoints individually

#### Logs Not Appearing
1. Ensure Winston is installed (`npm install winston`)
2. Check LOG_LEVEL is set to 'info' or 'debug'
3. Verify Railway service is capturing logs
4. Check for any startup errors

#### Database Connection Issues
1. Verify DATABASE_URL is correctly formatted
2. Check PostgreSQL service is running
3. Ensure database exists and is accessible
4. Check network connectivity between services

### 7. Performance Optimization

#### Rate Limiting
- General API: 100 requests per 15 minutes per IP
- Social Media: 10 requests per minute per IP
- Adjust limits in `rateLimiting.js` as needed

#### Caching
- Consider adding Redis for caching social media responses
- Implement response caching for frequently accessed creators

### 8. Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] API keys are properly secured in Railway
- [ ] CORS is configured for production domains
- [ ] Rate limiting is enabled
- [ ] Input validation is working
- [ ] Error messages don't leak sensitive information

## 🔧 Local Development

### Testing Social Media APIs
```bash
# Test Instagram
curl -H "X-RapidAPI-Key: YOUR_KEY" \
     "https://instagram120.p.rapidapi.com/api/instagram/user/username"

# Test YouTube
curl "https://www.googleapis.com/youtube/v3/channels?key=YOUR_KEY&forUsername=username"

# Test Twitter
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://api.twitter.com/2/users/by/username/username"
```

### Environment Setup
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your API keys

# Frontend
cd frontend
cp .env.example .env
# Edit .env with your API URL
```
