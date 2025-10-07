# Railway Deployment Instructions for Conversation Cloud Features

## ✅ Code Changes Deployed

The following changes have been merged to `main` and pushed to GitHub:
- Conversation Word Cloud UI on Creator Detail pages
- Multi-platform comment scraping (Instagram, TikTok, Twitter, Threads)
- Text analysis and word cloud generation
- Backend API endpoints for refreshing conversation data
- Database schema extensions for conversation metrics

## 🚀 Railway Configuration Steps

### 1. Backend Service Environment Variables

Add these environment variables to your **backend** service in Railway:

```env
# RapidAPI key (required for all social media APIs)
RAPIDAPI_KEY=your_rapidapi_key_here

# Instagram POSTS fetching (for getting recent posts)
INSTAGRAM_POSTS_RAPIDAPI_HOST=instagram-api-fast-reliable-data-scraper.p.rapidapi.com

# Instagram COMMENTS scraping (for word clouds)
INSTAGRAM_COMMENTS_RAPIDAPI_HOST=instagram-api-fast-reliable-data-scraper.p.rapidapi.com
INSTAGRAM_COMMENTS_ENDPOINTS=/comments:id

# TikTok comment scraping (RapidAPI)
TIKTOK_COMMENTS_RAPIDAPI_HOST=tiktok-scraper7.p.rapidapi.com
```

**Important:** There are TWO separate Instagram hosts:
- `INSTAGRAM_POSTS_RAPIDAPI_HOST` - for fetching posts from user profiles
- `INSTAGRAM_COMMENTS_RAPIDAPI_HOST` - for fetching comments on posts
- Both should use the same provider if using `instagram-api-fast-reliable-data-scraper`

**Optional** (if you want separate API keys per platform for quota isolation):
```env
RAPIDAPI_KEY_INSTAGRAM=your_instagram_specific_key
RAPIDAPI_KEY_TIKTOK=your_tiktok_specific_key
```

### 2. Frontend Service Build Environment

In Railway, go to your **frontend** service → Settings → Environment Variables and ensure:

```env
REACT_APP_API_URL=https://your-backend-service.up.railway.app/api
```

**Important**: Replace `your-backend-service` with your actual Railway backend service URL.

### 3. Verify Deployment Settings

#### Backend Service:
- **Root Directory**: Should be pointing to `backend/` or using `backend.Dockerfile`
- **Dockerfile Path**: `backend.Dockerfile` or `backend/Dockerfile`
- **Start Command**: `node server.js`
- **Health Check Path**: `/api/health`

#### Frontend Service:
- **Root Directory**: Should be pointing to `frontend/` or using `frontend.Dockerfile`
- **Dockerfile Path**: `frontend.Dockerfile` or `frontend/Dockerfile`
- **Start Command**: `/bin/sh /start.sh`
- **Health Check Path**: `/`

### 4. Trigger Redeployment

Once environment variables are configured:

1. Go to Railway dashboard
2. Navigate to **backend** service → Click "Deploy" or trigger redeploy
3. Navigate to **frontend** service → Click "Deploy" or trigger redeploy

### 5. Database Migration

The new database fields should auto-create via Sequelize. If you encounter issues:

1. Connect to your Railway Postgres database
2. Run this SQL to manually add the new columns:

```sql
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS conversation_terms JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS conversation_terms_by_platform JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_comment_fetch_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS metrics_updated_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS metrics_by_platform JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS activity_score FLOAT DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS verification JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS analysis_metadata JSONB DEFAULT '{}';
```

## 🧪 Testing the Deployment

### 1. Verify Backend is Running
```bash
curl https://your-backend.up.railway.app/api/health
```
Should return: `{"status":"OK","message":"Creator Rolodex API is running"}`

### 2. Test Frontend Access
Visit: `https://ralphodex.up.railway.app/dashboard`

### 3. Test Conversation Cloud Feature
1. Navigate to Dashboard
2. Click on any creator to open Creator Detail page
3. Scroll down to find "Conversation Word Cloud" section
4. Click "Refresh Cloud" button
5. Should see loading state, then populated word cloud with terms

### 4. Check Browser Console
- Open Developer Tools (F12)
- Check Console tab for errors
- Check Network tab to verify API calls to correct backend URL

## 🐛 Troubleshooting

### Frontend shows old version
1. **Hard refresh**: Shift + Reload (or Cmd/Ctrl + Shift + R)
2. **Clear cache**: Browser → Settings → Clear browsing data
3. Check Railway frontend deployment logs for build errors

### "Conversation Word Cloud" section not appearing
1. Verify you're on a **Creator Detail** page (not Dashboard)
2. Check browser console for JavaScript errors
3. Verify frontend deployed from correct branch (`main`)

### API calls failing / CORS errors
1. Check `REACT_APP_API_URL` is set correctly in Railway frontend service
2. Verify backend is accessible at the URL
3. Check Railway backend logs for errors
4. Ensure backend CORS is configured for your frontend domain

### Comment scraping not working
1. Verify `RAPIDAPI_KEY` is set in backend service
2. Check RapidAPI subscription is active for Instagram/TikTok APIs
3. Verify `INSTAGRAM_COMMENTS_RAPIDAPI_HOST` is correct
4. Check Railway backend logs for API errors when clicking "Refresh Cloud"

## 📊 Monitoring

After deployment, monitor:
- **Railway Logs**: Backend and frontend deployment logs
- **API Health**: Regular checks to `/api/health`
- **Database**: Check creators table has new JSONB columns populated
- **Browser DevTools**: Network tab showing successful API calls

## 🎯 What You Should See

When everything is working correctly:

1. **Creator Detail Page** displays:
   - Header with creator name and back button
   - Social media stats cards
   - **NEW: "Conversation Word Cloud" card** with:
     - "Refresh Cloud" button
     - Last updated timestamp (after first refresh)
     - Platform sources (Instagram, TikTok, etc.)
     - Sample counts (comments + captions)
     - Visual word cloud with sized chips
   - Profile details
   - Recent interactions

2. **Clicking "Refresh Cloud"**:
   - Button shows "Refreshing..." state
   - Backend fetches recent posts
   - Backend scrapes comments via RapidAPI
   - Text analysis generates word frequencies
   - UI updates with new terms
   - Timestamp updates

## 📝 Next Steps

After successful deployment:
- Test with multiple creators
- Verify different social platforms work
- Monitor RapidAPI usage/quotas
- Consider adding more platforms
- Set up automated cloud refresh (optional)
