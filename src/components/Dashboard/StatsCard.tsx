import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: number;
  icon: SvgIconComponent;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <Card sx={{ 
      height: '100%', 
      minHeight: 120,
      boxShadow: 2,
      '&:hover': {
        boxShadow: 4,
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          minHeight: 72,
        }}>
          <Box sx={{ flex: 1, mr: 2 }}>
            <Typography 
              color="text.secondary" 
              gutterBottom 
              variant="subtitle1"
              sx={{ 
                fontSize: '0.875rem',
                fontWeight: 600,
                lineHeight: 1.2,
                mb: 1
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              component="div"
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                fontSize: { xs: '1.75rem', sm: '2.125rem' }
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ 
              color: 'white', 
              fontSize: { xs: 24, sm: 30 }
            }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard; 