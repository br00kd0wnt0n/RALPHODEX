import React, { useEffect, useState } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Psychology as PsychologyIcon,
  Recommend as RecommendIcon,
  ExpandMore as ExpandMoreIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchCreatorById, refreshConversationCloud } from '../../store/slices/creatorSlice';
import RecentPosts from '../SocialMedia/RecentPosts';

export default function CreatorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedCreator: creator, isLoading } = useAppSelector((state) => state.creators);
  
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [refreshingCloud, setRefreshingCloud] = useState(false);
  const [cloudError, setCloudError] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchCreatorById(id));
      // Auto-load AI insights and recommendations
      fetchAIInsights();
      fetchAIRecommendations();
    }
  }, [dispatch, id]);

  const fetchAIInsights = async () => {
    if (!id) return;
    
    setInsightsLoading(true);
    setAiError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/creators/${id}/insights`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI insights');
      }
      
      const data = await response.json();
      setInsights(data);
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchAIRecommendations = async () => {
    if (!id) return;
    
    setRecommendationsLoading(true);
    setAiError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/creators/${id}/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI recommendations');
      }
      
      const data = await response.json();
      setRecommendations(data);
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setRecommendationsLoading(false);
    }
  };

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

  const onRefreshCloud = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!id) return;
    setRefreshingCloud(true);
    setCloudError('');
    try {
      await dispatch(refreshConversationCloud(id)).unwrap();
      console.log('✅ Conversation cloud refreshed successfully');
    } catch (error: any) {
      console.error('❌ Conversation cloud refresh failed:', error);
      setCloudError(error?.message || 'Failed to refresh conversation cloud');
    } finally {
      setRefreshingCloud(false);
    }
  };

  const analysis: any = creator.analysis_metadata || {};
  const commentsSamples = analysis.comments_samples || {};
  const captionCounts = analysis.caption_posts_by_platform || {};
  const sourcePlatforms: string[] = analysis.conversation_sources || [];
  const terms = creator.conversation_terms || {};
  const topTerms = Object.entries(terms)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 50);

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

      {/* Top Row: Two Equal Height Modules */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          {/* Creator Info Module */}
          <Card sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #EB008B08 0%, #31BDBF08 100%)', height: '100%' }}>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2, 
                fontSize: '1.5rem',
                background: 'linear-gradient(135deg, #EB008B 0%, #31BDBF 100%)',
                fontWeight: 700
              }}
            >
              {creator.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Avatar>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {creator.full_name}
            </Typography>
            <Chip
              label={creator.verified ? 'Verified Creator' : 'Unverified'}
              color={creator.verified ? 'success' : 'default'}
              sx={{ mb: 2, fontWeight: 600 }}
              icon={creator.verified ? <VerifiedIcon /> : undefined}
            />
            <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500 }}>
              {creator.primary_content_type || 'Content Creator'}
            </Typography>

            {(creator.email || creator.phone) && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  Contact
                </Typography>
                {creator.email && (
                  <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                    <EmailIcon sx={{ mr: 1, color: '#EB008B', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{creator.email}</Typography>
                  </Box>
                )}
                {creator.phone && (
                  <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                    <PhoneIcon sx={{ mr: 1, color: '#EB008B', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{creator.phone}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* Metrics + Social Media Combined Module */}
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Key Metrics Section */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Performance Metrics
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #31BDBF15 0%, #31BDBF08 100%)',
                  border: '1px solid #31BDBF30',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: 2 },
                  transition: 'all 0.2s ease-in-out'
                }}>
                  <Typography color="textSecondary" variant="overline" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                    Audience
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#31BDBF', mb: 0.5 }}>
                    {formatNumber(creator.audience_size || 0)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                    Total followers
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #F1652415 0%, #F1652408 100%)',
                  border: '1px solid #F1652430',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: 2 },
                  transition: 'all 0.2s ease-in-out'
                }}>
                  <Typography color="textSecondary" variant="overline" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                    Engagement
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#F16524', mb: 0.5 }}>
                    {creator.engagement_rate || 0}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                    Avg. rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #EB008B15 0%, #EB008B08 100%)',
                  border: '1px solid #EB008B30',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: 2 },
                  transition: 'all 0.2s ease-in-out'
                }}>
                  <Typography color="textSecondary" variant="overline" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                    Interactions
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#EB008B', mb: 0.5 }}>
        {(creator.interactions || []).length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                    Total
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Social Media Presence Section */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', mb: 2 }}>
                <InstagramIcon sx={{ mr: 1, color: '#E4405F' }} />
                Social Media Presence
              </Typography>
              <Grid container spacing={1.5}>
                {[
                  { platform: 'Instagram', handle: creator.instagram, color: '#E4405F', icon: <InstagramIcon /> },
                  { platform: 'TikTok', handle: creator.tiktok, color: '#000000', icon: <InstagramIcon /> },
                  { platform: 'YouTube', handle: creator.youtube, color: '#FF0000', icon: <YouTubeIcon /> },
                  { platform: 'Twitter', handle: creator.twitter, color: '#1DA1F2', icon: <TwitterIcon /> },
                ].filter(social => social.handle).map((social) => (
                  <Grid item xs={6} key={social.platform}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${social.color}20`,
                        bgcolor: `${social.color}05`,
                        '&:hover': {
                          bgcolor: `${social.color}10`,
                          transform: 'translateY(-1px)',
                          boxShadow: 1
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <Box sx={{ color: social.color, mr: 1.5 }}>
                        {social.icon}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {social.platform}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          @{social.handle}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {![creator.instagram, creator.tiktok, creator.youtube, creator.twitter].some(handle => handle) && (
                <Typography color="textSecondary" variant="body2" sx={{ textAlign: 'center', py: 2, fontSize: '0.9rem' }}>
                  No social media handles on record.
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Conversation Word Cloud */}
      <Card sx={{ p: 3, mb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Conversation Word Cloud</Typography>
          <Button variant="outlined" onClick={onRefreshCloud} disabled={refreshingCloud}>
            {refreshingCloud ? 'Refreshing…' : 'Refresh Cloud'}
          </Button>
        </Box>
        {cloudError && (
          <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
            {cloudError}
          </Alert>
        )}
        {creator.last_comment_fetch_at && (
          <Typography variant="caption" color="textSecondary">
            Last updated: {new Date(creator.last_comment_fetch_at).toLocaleString()}
          </Typography>
        )}
        {sourcePlatforms.length > 0 && (
          <Box mt={0.5}>
            <Typography variant="caption" color="textSecondary">
              Sources: {sourcePlatforms.join(', ')}
            </Typography>
          </Box>
        )}
        {(Object.keys(commentsSamples).length > 0 || Object.keys(captionCounts).length > 0) && (
          <Box mt={0.5}>
            <Typography variant="caption" color="textSecondary">
              Samples — {Object.keys({ ...commentsSamples, ...captionCounts }).map((plat) => {
                const c = commentsSamples[plat] || 0;
                const caps = captionCounts[plat] || 0;
                return `${plat}: ${c} comments, ${caps} captions`;
              }).join(' • ')}
            </Typography>
          </Box>
        )}
        <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
          {refreshingCloud ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3, width: '100%', justifyContent: 'center' }}>
              <CircularProgress size={24} />
              <Typography color="textSecondary">Fetching posts and comments...</Typography>
            </Box>
          ) : topTerms.length > 0 ? (
            topTerms.map(([term, count]) => (
              <Chip
                key={term}
                label={`${term}`}
                sx={{
                  fontSize: Math.min(24, 10 + Math.log(1 + (count as number)) * 6),
                  backgroundColor: 'rgba(235, 0, 139, 0.08)'
                }}
              />
            ))
          ) : (
            <Typography color="textSecondary">No terms yet. Try Refresh Cloud.</Typography>
          )}
        </Box>
      </Card>

      {/* Profile Details Section */}
      <Box sx={{ mb: 2 }}>
          {/* Profile Details Card */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Profile Details
            </Typography>
            
            <Grid container spacing={2}>
              {(creator.tags || []).length > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Tags
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {(creator.tags || []).map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small"
                        sx={{ 
                          bgcolor: '#EB008B15', 
                          color: '#EB008B',
                          border: '1px solid #EB008B30',
                          fontWeight: 500
                        }} 
                      />
                    ))}
                  </Box>
                </Grid>
              )}

              {creator.notes && (
                <Grid item xs={12} md={(creator.tags || []).length > 0 ? 6 : 12}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Notes
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      bgcolor: '#f8f9fa',
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid #e9ecef',
                      fontSize: '0.9rem',
                      lineHeight: 1.6
                    }}
                  >
                    {creator.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Card>
      </Box>

      {/* AI Insights & Recommendations Section */}
      <Box sx={{ mb: 2 }}>
        <Card sx={{ p: 3, border: '1px solid #31BDBF30', background: 'linear-gradient(135deg, #31BDBF08 0%, #31BDBF03 100%)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                🤖 AI Insights & Recommendations
                {insights && (
                  <Chip 
                    label="✓ Analyzed" 
                    color="success" 
                    size="small" 
                    sx={{ ml: 2, fontSize: '0.7rem' }} 
                  />
                )}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={fetchAIInsights}
                disabled={insightsLoading}
                startIcon={insightsLoading ? <CircularProgress size={14} /> : <PsychologyIcon />}
                sx={{ 
                  textTransform: 'none', 
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  borderColor: '#31BDBF40',
                  color: '#31BDBF',
                  '&:hover': {
                    borderColor: '#31BDBF',
                    bgcolor: '#31BDBF10'
                  }
                }}
              >
                {insightsLoading ? 'Loading...' : 'Refresh Insights'}
              </Button>
              <Button 
                variant="outlined"
                size="small"
                onClick={fetchAIRecommendations}
                disabled={recommendationsLoading}
                startIcon={recommendationsLoading ? <CircularProgress size={14} /> : <RecommendIcon />}
                sx={{ 
                  textTransform: 'none', 
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  borderColor: '#F1652440',
                  color: '#F16524',
                  '&:hover': {
                    borderColor: '#F16524',
                    bgcolor: '#F1652410'
                  }
                }}
              >
                {recommendationsLoading ? 'Loading...' : 'Refresh Recommendations'}
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            {/* AI Insights Section */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                p: 2, 
                height: '100%',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid #31BDBF20',
                borderRadius: 2
              }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontSize: '0.95rem', fontWeight: 600, color: '#31BDBF', display: 'flex', alignItems: 'center' }}>
                  <PsychologyIcon sx={{ mr: 1, fontSize: 18 }} />
                  Key Insights
                  {insightsLoading && <CircularProgress size={14} sx={{ ml: 1 }} />}
                </Typography>
                {insightsLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 80, justifyContent: 'center' }}>
                    <CircularProgress size={24} sx={{ color: '#31BDBF', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                      Analyzing creator profile...
                    </Typography>
                  </Box>
                ) : insights ? (
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5, fontSize: '0.8rem', fontWeight: 600 }}>
                      Key Strengths
                    </Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap" sx={{ mb: 2 }}>
                      {(insights?.insights?.key_strengths || []).slice(0, 4).map((strength, index) => (
                        <Chip 
                          key={index} 
                          label={strength} 
                          size="small"
                          sx={{ 
                            fontSize: '0.7rem',
                            bgcolor: '#31BDBF15',
                            color: '#31BDBF',
                            border: '1px solid #31BDBF30'
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: '0.8rem', fontWeight: 600 }}>
                      Brand Partnership Potential
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#555' }}>
                      {insights?.insights?.brand_partnerships?.split('.')[0] + '.' || 'High potential for brand collaborations based on audience engagement.'}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <PsychologyIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
                      No insights available.
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                p: 2, 
                height: '100%',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid #F1652420',
                borderRadius: 2
              }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontSize: '0.95rem', fontWeight: 600, color: '#F16524', display: 'flex', alignItems: 'center' }}>
                  <RecommendIcon sx={{ mr: 1, fontSize: 18 }} />
                  Collaboration Recommendations
                  {recommendationsLoading && <CircularProgress size={14} sx={{ ml: 1 }} />}
                </Typography>
                {recommendationsLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 80, justifyContent: 'center' }}>
                    <CircularProgress size={24} sx={{ color: '#F16524', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                      Generating recommendations...
                    </Typography>
                  </Box>
                ) : recommendations ? (
                  <Box>
                    {typeof recommendations.recommendations === 'string' ? (
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#555' }}>
                        {recommendations.recommendations}
                      </Typography>
                    ) : recommendations.recommendations && typeof recommendations.recommendations === 'object' ? (
                      <Box>
                        {recommendations.recommendations.collaboration_score && (
                          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#F1652408', borderRadius: 1, border: '1px solid #F1652420' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#F16524' }}>
                              Collaboration Score: {recommendations.recommendations.collaboration_score}/10
                            </Typography>
                          </Box>
                        )}
                        {recommendations.recommendations.target_brands && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, color: 'textSecondary' }}>
                              Target Brands
                            </Typography>
                            {Array.isArray(recommendations.recommendations.target_brands) ? (
                              <Box display="flex" gap={0.5} flexWrap="wrap">
                                {recommendations.recommendations.target_brands.slice(0, 6).map((brand, index) => (
                                  <Chip 
                                    key={index} 
                                    label={brand} 
                                    size="small"
                                    sx={{ 
                                      fontSize: '0.7rem',
                                      bgcolor: '#F1652415',
                                      color: '#F16524',
                                      border: '1px solid #F1652430'
                                    }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#555' }}>
                                {recommendations.recommendations.target_brands}
                              </Typography>
                            )}
                          </Box>
                        )}
                        {recommendations.recommendations.similar_creators && (
                          <Box>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, color: 'textSecondary' }}>
                              Similar Creators
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#555' }}>
                              {Array.isArray(recommendations.recommendations.similar_creators) 
                                ? recommendations.recommendations.similar_creators.slice(0, 3).join(', ')
                                : recommendations.recommendations.similar_creators}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#555' }}>
                        No collaboration recommendations available.
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <RecommendIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
                      No recommendations available.
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
          
          {aiError && (
            <Alert severity="error" sx={{ mt: 2, fontSize: '0.75rem' }}>
              {aiError}
            </Alert>
          )}
        </Card>
      </Box>

      {/* Recent Posts Section */}
      <Box sx={{ mb: 2 }}>
        <RecentPosts creatorId={creator.id} />
      </Box>

      {/* Recent Interactions Section */}
      <Box>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon sx={{ mr: 1, color: '#F16524' }} />
            Recent Interactions
            {(creator.interactions || []).length > 0 && (
              <Chip 
                label={(creator.interactions || []).length} 
                size="small"
                sx={{ ml: 1, bgcolor: '#F1652420', color: '#F16524' }}
              />
            )}
          </Typography>
          {(creator.interactions || []).length > 0 ? (
            <Box>
              {(creator.interactions || []).map((interaction: any, index) => (
                <Box 
                  key={interaction.id} 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    py: 2,
                    px: 1,
                    borderBottom: index < (creator.interactions || []).length - 1 ? '1px solid #f0f0f0' : 'none',
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                      borderRadius: 1
                    }
                  }}
                >
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#F16524',
                    mt: 1,
                    mr: 2,
                    flexShrink: 0
                  }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {interaction.interaction_type}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(interaction.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {interaction.notes && (
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                        {interaction.notes}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography color="textSecondary">
                No interactions recorded yet.
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
