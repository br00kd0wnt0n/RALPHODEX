import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchCreatorById } from '../../store/slices/creatorSlice';

export default function CreatorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedCreator: creator, isLoading } = useAppSelector((state) => state.creators);

  useEffect(() => {
    if (id) {
      dispatch(fetchCreatorById(id));
    }
  }, [dispatch, id]);

  if (isLoading || !creator) {
    return <Typography>Loading...</Typography>;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <InstagramIcon />;
      case 'twitter': return <TwitterIcon />;
      case 'youtube': return <YouTubeIcon />;
      default: return null;
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/creators')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {creator.full_name}
        </Typography>
        <Button variant="contained" startIcon={<EditIcon />}>
          Edit Creator
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2, fontSize: '2rem' }}
            >
              {creator.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {creator.full_name}
            </Typography>
            <Chip
              label={creator.verified ? 'Verified' : 'Unverified'}
              color={creator.verified ? 'success' : 'default'}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="textSecondary">
              {creator.primary_content_type || 'Content Creator'}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            {creator.email && (
              <Box display="flex" alignItems="center" mb={1}>
                <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                <Typography variant="body2">{creator.email}</Typography>
              </Box>
            )}
            {creator.phone && (
              <Box display="flex" alignItems="center" mb={1}>
                <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                <Typography variant="body2">{creator.phone}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Audience Size
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(creator.audience_size)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Engagement Rate
                  </Typography>
                  <Typography variant="h4">
                    {creator.engagement_rate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Interactions
                  </Typography>
                  <Typography variant="h4">
                    {creator.interactions?.length || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Social Media Presence
            </Typography>
            <Grid container spacing={2}>
              {[
                { platform: 'Instagram', handle: creator.instagram },
                { platform: 'TikTok', handle: creator.tiktok },
                { platform: 'YouTube', handle: creator.youtube },
                { platform: 'Twitter', handle: creator.twitter },
              ].filter(social => social.handle).map((social) => (
                <Grid item xs={12} sm={6} key={social.platform}>
                  <Box display="flex" alignItems="center">
                    {getSocialIcon(social.platform)}
                    <Box ml={1}>
                      <Typography variant="body2" color="textSecondary">
                        {social.platform}
                      </Typography>
                      <Typography variant="body1">
                        @{social.handle}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {creator.tags.length > 0 && (
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {creator.tags.map((tag) => (
                  <Chip key={tag} label={tag} variant="outlined" />
                ))}
              </Box>
            </Paper>
          )}

          {creator.notes && (
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                {creator.notes}
              </Typography>
            </Paper>
          )}

          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Interactions
            </Typography>
            {creator.interactions && creator.interactions.length > 0 ? (
              creator.interactions.map((interaction: any) => (
                <Box key={interaction.id} sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2">
                    {interaction.interaction_type}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(interaction.date).toLocaleDateString()}
                  </Typography>
                  {interaction.notes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {interaction.notes}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography color="textSecondary">
                No interactions recorded yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}