import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Avatar,
  Snackbar,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Topic as TopicIcon,
  Article as ArticleIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Edit as EditIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { contentService } from '../../services/contentService';
import CategoryCreateDialog from './CategoryCreateDialog';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['contentStats'],
    queryFn: async () => {
      console.log('🔄 Fetching content stats...');
      const result = await contentService.getContentStats();
      console.log('📈 Stats result:', result);
      return result;
    },
    refetchInterval: 30000,
    retry: 1,
  });

  const handleCategoryCreated = () => {
    // Refetch stats to update the dashboard
    queryClient.invalidateQueries({ queryKey: ['contentStats'] });
    queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    setSuccessMessage('Category created successfully!');
  };

  const quickActions = [
    {
      title: 'Add New Category',
      description: 'Create a new subject category',
      icon: AddIcon,
      color: '#6366f1',
      action: () => setCreateDialogOpen(true),
    },
    {
      title: 'Manage Content',
      description: 'Edit existing learning materials',
      icon: EditIcon,
      color: '#10b981',
      action: () => navigate('/content'),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        height: '60vh',
        gap: 2,
      }}>
        <CircularProgress size={48} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'error.light',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Unable to load dashboard
          </Typography>
          <Typography variant="body2">
            There was an error loading your dashboard data. Please try refreshing the page.
          </Typography>
        </Alert>
      </Container>
    );
  }

  const statsData = [
    {
      title: 'Total Categories',
      value: stats?.totalCategories || 0,
      change: '+2.5%',
      icon: CategoryIcon,
      color: '#6366f1',
      bgColor: '#f0f9ff',
      description: 'Main subject categories',
    },
    {
      title: 'Total Topics',
      value: stats?.totalTopics || 0,
      change: '+12.3%',
      icon: TopicIcon,
      color: '#10b981',
      bgColor: '#f0fdf4',
      description: 'Learning topics available',
    },
    {
      title: 'Content Items',
      value: stats?.totalContent || 0,
      change: '+8.1%',
      icon: ArticleIcon,
      color: '#f59e0b',
      bgColor: '#fefbf2',
      description: 'Learning materials',
    },
    {
      title: 'Total Items',
      value: (stats?.totalCategories || 0) + (stats?.totalTopics || 0) + (stats?.totalContent || 0),
      change: '+15.2%',
      icon: TrendingUpIcon,
      color: '#ec4899',
      bgColor: '#fdf2f8',
      description: 'All content combined',
    },
  ];

  return (
    <Box sx={{ 
      flexGrow: 1, 
      backgroundColor: 'background.default',
      minHeight: '100vh',
      pb: 4,
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${stat.bgColor} 0%, ${stat.bgColor}99 100%)`,
                  border: '1px solid',
                  borderColor: 'grey.100',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}80 100%)`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          mb: 1,
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '2rem',
                          color: 'text.primary',
                          lineHeight: 1,
                          mb: 0.5,
                        }}
                      >
                        {stat.value.toLocaleString()}
                      </Typography>
                      <Chip
                        label={stat.change}
                        size="small"
                        sx={{
                          backgroundColor: '#dcfce7',
                          color: '#16a34a',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                        }}
                      />
                    </Box>
                    <Avatar
                      sx={{
                        backgroundColor: stat.color,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <stat.icon sx={{ fontSize: 24, color: 'white' }} />
                    </Avatar>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.8rem',
                    }}
                  >
                    {stat.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      backgroundColor: 'primary.main',
                      width: 40,
                      height: 40,
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Quick Actions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Frequently used administrative tasks
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Paper
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'grey.200',
                          borderRadius: 3,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: action.color,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${action.color}20`,
                          },
                        }}
                        onClick={action.action}
                      >
                        <Avatar
                          sx={{
                            backgroundColor: `${action.color}20`,
                            color: action.color,
                            width: 56,
                            height: 56,
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          <action.icon sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {action.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* System Status */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      backgroundColor: 'success.main',
                      width: 40,
                      height: 40,
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      System Status
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All systems operational
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ space: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Database Connection
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                      Connected
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Authentication
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                      Active
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Last Updated
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : 'Now'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Storage Used
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box 
                      sx={{ 
                        flex: 1, 
                        height: 8, 
                        backgroundColor: 'grey.200', 
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: '65%', 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      65%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    2.4 GB of 4 GB used
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Category Create Dialog */}
      <CategoryCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCategoryCreated}
      />

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard; 