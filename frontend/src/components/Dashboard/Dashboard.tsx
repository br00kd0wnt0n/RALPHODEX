import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchCreators } from '../../store/slices/creatorSlice';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card sx={{ 
      height: '100%', 
      background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
      border: `1px solid ${color}30`,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 4,
      },
      transition: 'all 0.2s ease-in-out'
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ 
            color: `${color}90`, 
            fontSize: '2.5rem',
            p: 1,
            borderRadius: '12px',
            bgcolor: `${color}15`
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { creators, total, isLoading } = useAppSelector((state) => state.creators);

  useEffect(() => {
    dispatch(fetchCreators({ page: 1, limit: 50 }));
  }, [dispatch]);

  const verifiedCount = creators.filter(c => c.verified).length;
  const avgEngagement = creators.length > 0 
    ? (creators.reduce((sum, c) => sum + c.engagement_rate, 0) / creators.length).toFixed(1)
    : '0';

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Creators"
            value={total}
            icon={<PeopleIcon />}
            color="#EB008B"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Verified Creators"
            value={verifiedCount}
            icon={<VerifiedIcon />}
            color="#31BDBF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Engagement"
            value={`${avgEngagement}%`}
            icon={<TrendingUpIcon />}
            color="#F16524"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Month"
            value={creators.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length}
            icon={<PersonAddIcon />}
            color="#EB008B"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #EB008B10 0%, #31BDBF10 100%)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/creators')}
                fullWidth
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.2
                }}
              >
                Add New Creator
              </Button>
              <Button
                variant="outlined"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/creators')}
                fullWidth
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.2
                }}
              >
                View All Creators
              </Button>
            </Box>
          </Card>
          
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Top Performers
            </Typography>
            <Box>
              {[...creators]
                .sort((a, b) => b.engagement_rate - a.engagement_rate)
                .slice(0, 5)
                .map((creator, index) => (
                  <Box 
                    key={creator.id} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      py: 1.5,
                      px: 1,
                      borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                      '&:hover': {
                        bgcolor: '#f8f9fa',
                        borderRadius: 1,
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => navigate(`/creators/${creator.id}`)}
                  >
                    <Box display="flex" alignItems="center">
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          minWidth: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#EB008B20',
                          color: index < 3 ? 'white' : '#EB008B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          mr: 2
                        }}
                      >
                        {index + 1}
                      </Typography>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {creator.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {creator.primary_content_type}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#31BDBF' }}>
                        {creator.engagement_rate}%
                      </Typography>
                      {creator.verified && (
                        <VerifiedIcon sx={{ color: '#31BDBF', ml: 1, fontSize: 18 }} />
                      )}
                    </Box>
                  </Box>
                ))}
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Recent Activity
            </Typography>
            <Box>
              {creators.slice(0, 5).map((creator, index) => (
                <Box 
                  key={creator.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    py: 2,
                    px: 1,
                    borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                      borderRadius: 1,
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => navigate(`/creators/${creator.id}`)}
                >
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #EB008B 0%, #31BDBF 100%)', 
                    borderRadius: '50%', 
                    width: 40, 
                    height: 40, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mr: 3,
                    flexShrink: 0
                  }}>
                    <AddIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      New creator added: <span style={{ color: '#EB008B', fontWeight: 600 }}>{creator.full_name}</span>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={creator.primary_content_type} 
                        size="small" 
                        sx={{ bgcolor: '#F1652420', color: '#F16524', fontWeight: 500 }}
                      />
                      <Chip 
                        label={`${creator.audience_size.toLocaleString()} followers`} 
                        size="small" 
                        sx={{ bgcolor: '#31BDBF20', color: '#31BDBF', fontWeight: 500 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                        {new Date(creator.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  {creator.verified && (
                    <VerifiedIcon sx={{ color: '#31BDBF', ml: 2, fontSize: 24, flexShrink: 0 }} />
                  )}
                </Box>
              ))}
              {creators.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">
                    No recent activity to display.
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}