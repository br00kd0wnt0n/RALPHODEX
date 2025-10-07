import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Avatar,
  Link,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Twitter as TwitterIcon,
  VideoLibrary as TikTokIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface Post {
  id: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter';
  caption: string;
  mediaUrl?: string;
  postUrl: string;
  likes: number;
  comments: number;
  postedAt: string;
  type: 'image' | 'video' | 'text';
  duration?: string;
}

interface PostsResponse {
  creator_id: string;
  creator_name: string;
  platforms: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
  };
  posts: Post[];
  total_posts: number;
  fetched_at: string;
}

interface RecentPostsProps {
  creatorId: string;
}

const platformIcons = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  twitter: TwitterIcon,
};

const platformColors = {
  instagram: '#E4405F',
  youtube: '#FF0000', 
  tiktok: '#000000',
  twitter: '#1DA1F2',
};

function PostCard({ post }: { post: Post }) {
  const PlatformIcon = platformIcons[post.platform];
  const platformColor = platformColors[post.platform];

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 4,
      },
      transition: 'all 0.2s ease-in-out'
    }}>
      {post.mediaUrl && (
        <CardMedia
          component="img"
          height="200"
          image={post.mediaUrl}
          alt={post.caption}
          sx={{ objectFit: 'cover' }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar sx={{ bgcolor: platformColor, width: 24, height: 24, mr: 1 }}>
            <PlatformIcon sx={{ fontSize: 14 }} />
          </Avatar>
          <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
            {post.platform}
          </Typography>
          {post.type === 'video' && post.duration && (
            <Chip 
              label={post.duration} 
              size="small" 
              sx={{ ml: 'auto', fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>

        <Typography 
          variant="body2" 
          sx={{ 
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {post.caption}
        </Typography>

        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center">
              <FavoriteIcon sx={{ fontSize: 16, color: '#ff4757', mr: 0.5 }} />
              <Typography variant="caption">{post.likes.toLocaleString()}</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <CommentIcon sx={{ fontSize: 16, color: '#5f6368', mr: 0.5 }} />
              <Typography variant="caption">{post.comments.toLocaleString()}</Typography>
            </Box>
          </Box>
          
          <Tooltip title="Open original post">
            <IconButton 
              size="small" 
              onClick={() => window.open(post.postUrl, '_blank')}
              sx={{ color: platformColor }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography variant="caption" color="textSecondary">
          {formatDistanceToNow(new Date(post.postedAt), { addSuffix: true })}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function RecentPosts({ creatorId }: RecentPostsProps) {
  const [postsData, setPostsData] = useState<PostsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const fetchPosts = async () => {
    if (!creatorId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log(`🔄 Fetching posts for creator ${creatorId} from ${API_BASE_URL}`);
      const response = await axios.get(`${API_BASE_URL}/creators/${creatorId}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Posts fetched:', response.data);
      setPostsData(response.data);
    } catch (error: any) {
      console.error('❌ Failed to fetch creator posts:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to load recent posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [creatorId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Fetching recent posts...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <IconButton color="inherit" size="small" onClick={fetchPosts}>
            <RefreshIcon />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!postsData || (postsData.posts || []).length === 0) {
    return (
      <Alert severity="info">
        No recent posts found for this creator. Make sure their social media handles are configured.
      </Alert>
    );
  }

  // Get available platforms
  const availablePlatforms = Object.keys(postsData.platforms).filter(
    platform => postsData.platforms[platform as keyof typeof postsData.platforms]
  );

  // Filter posts by selected platform
  const filteredPosts = selectedPlatform === 'all' 
    ? (postsData.posts || []) 
    : (postsData.posts || []).filter(post => post.platform === selectedPlatform);

  return (
    <Card sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Recent Posts
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="caption" color="textSecondary">
            Last updated: {formatDistanceToNow(new Date(postsData.fetched_at), { addSuffix: true })}
          </Typography>
          <Tooltip title="Refresh posts">
            <IconButton size="small" onClick={fetchPosts} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {availablePlatforms.length > 1 && (
        <Box mb={3}>
          <Tabs 
            value={selectedPlatform} 
            onChange={(_, value) => setSelectedPlatform(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Platforms" value="all" />
            {availablePlatforms.map(platform => {
              const PlatformIcon = platformIcons[platform as keyof typeof platformIcons];
              return (
                <Tab
                  key={platform}
                  label={
                    <Box display="flex" alignItems="center">
                      <PlatformIcon sx={{ fontSize: 18, mr: 1 }} />
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Box>
                  }
                  value={platform}
                />
              );
            })}
          </Tabs>
        </Box>
      )}

      {(filteredPosts || []).length === 0 ? (
        <Alert severity="info">
          No posts found for the selected platform.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {(filteredPosts || []).slice(0, 3).map((post) => (
            <Grid item xs={12} sm={6} md={4} key={`${post.platform}-${post.id}`}>
              <PostCard post={post} />
            </Grid>
          ))}
        </Grid>
      )}

      {(filteredPosts || []).length > 3 && (
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="textSecondary">
            Showing 3 of {(filteredPosts || []).length} posts
          </Typography>
        </Box>
      )}
    </Card>
  );
}