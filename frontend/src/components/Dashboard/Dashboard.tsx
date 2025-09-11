import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
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
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: '3rem' }}>
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
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {creators.slice(0, 5).map((creator, index) => (
              <Box key={creator.id} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  bgcolor: '#EB008B', 
                  borderRadius: '50%', 
                  width: 32, 
                  height: 32, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mr: 2 
                }}>
                  <AddIcon sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    New creator added: <strong>{creator.full_name}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    {new Date(creator.createdAt).toLocaleDateString()} • {creator.primary_content_type} • {creator.audience_size.toLocaleString()} followers
                  </Typography>
                </Box>
                {creator.verified && (
                  <VerifiedIcon sx={{ color: '#31BDBF', ml: 1 }} />
                )}
              </Box>
            ))}
            {creators.length === 0 && (
              <Typography color="textSecondary">
                No recent activity to display.
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/creators')}
                fullWidth
              >
                Add New Creator
              </Button>
              <Button
                variant="outlined"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/creators')}
                fullWidth
              >
                View All Creators
              </Button>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performers
            </Typography>
            {[...creators]
              .sort((a, b) => b.engagement_rate - a.engagement_rate)
              .slice(0, 5)
              .map((creator) => (
                <Box key={creator.id} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {creator.full_name} - {creator.engagement_rate}%
                  </Typography>
                </Box>
              ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}