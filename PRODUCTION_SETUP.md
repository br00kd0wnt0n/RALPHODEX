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

### 1.1 Scraper Provider Configuration (Comments → Word Clouds)

Enable multi‑platform conversation word clouds by configuring provider hosts and endpoints. The same `RAPIDAPI_KEY` is used across providers; set the host per platform. Endpoints can be customized via env to match the provider’s docs.

```env
# Instagram comment scraping (RapidAPI)
# Required host for your provider
INSTAGRAM_COMMENTS_RAPIDAPI_HOST=instagram-api-fast-reliable-data-scraper.p.rapidapi.com
# Path:param pairs (comma-separated). Example below uses media id.
# The backend will call: https://$INSTAGRAM_COMMENTS_RAPIDAPI_HOST/comments?id=<media_id>
INSTAGRAM_COMMENTS_ENDPOINTS=/comments:id

# TikTok comment scraping (RapidAPI)
# Default host works with many plans; override if using a different provider
TIKTOK_COMMENTS_RAPIDAPI_HOST=tiktok-scraper7.p.rapidapi.com

# Optional: per-platform keys if you want quota isolation (fallback to RAPIDAPI_KEY)
# RAPIDAPI_KEY_INSTAGRAM=...
# RAPIDAPI_KEY_TIKTOK=...
```

Notes:
- You can list multiple Instagram endpoints as fallbacks by comma separating entries (e.g., `/comments:id,/comments-by-shortcode:shortcode`).
- If a provider rejects unknown params, contact the dev to adjust the parameter set (we currently send `count=100` when supported).

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

#### Conversation Cloud Refresh (Manual)
- Endpoint: `POST /api/creators/:id/conversations/refresh`
- Auth: Bearer JWT required (same as other protected routes)
- Purpose: Fetch recent posts and attempt to retrieve comments via configured scrapers; aggregate uni/bi/tri-grams into a word cloud and store on the creator.

Example:
```bash
curl -X POST \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  "https://your-backend.up.railway.app/api/creators/<CREATOR_ID>/conversations/refresh"
```

### 9. Seeding from the Creator Sheet (CSV/XLSX)

You can seed or upsert creators from the new sheet using the backend script. Note: the backend container does not include files outside `backend/`, so use a URL in production.

Options:
- Local to Production DB (recommended for one-off):
  1) Set `DATABASE_URL` to your Railway Postgres URL
  2) Run a dry-run:
  ```bash
  cd backend
  DATABASE_URL=<railway-postgres-url> node seedFromSheet.js --prod --dry-run --file="../INTERNAL Facebook for Creators _ Master Creator List - Master Creator List (1).csv"
  ```
  3) Upsert (safe):
  ```bash
  DATABASE_URL=<railway-postgres-url> node seedFromSheet.js --prod
  ```
  4) Replace all (destructive):
  ```bash
  DATABASE_URL=<railway-postgres-url> node seedFromSheet.js --prod --replace
  ```

- In Railway (backend service) using a public URL:
  1) Host the CSV/XLSX at a temporary URL (e.g., GitHub raw, S3)
  2) Run the script in a one-off shell/exec:
  ```bash
  node seedFromSheet.js --prod --replace --url="https://example.com/path/to/Master%20Creator%20List.csv"
  ```

Notes:
- The script supports both CSV and XLSX via `xlsx`.
- `--replace` truncates and re-inserts; omit it to upsert based on name + handle(s).
- Use `--dry-run` first to validate parsing and counts.

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
