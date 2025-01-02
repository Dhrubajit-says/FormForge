import React from 'react';
import { Box, Typography } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';

const Logo = ({ size = 'medium' }) => {
  const sizes = {
    small: {
      iconSize: 24,
      fontSize: '1.2rem'
    },
    medium: {
      iconSize: 36,
      fontSize: '1.8rem'
    },
    large: {
      iconSize: 48,
      fontSize: '2.4rem'
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      mb: 3
    }}>
      <QuizIcon 
        sx={{ 
          fontSize: sizes[size].iconSize,
          color: 'primary.main'
        }} 
      />
      <Typography
        variant={size === 'large' ? 'h3' : 'h4'}
        sx={{
          fontWeight: 'bold',
          background: (theme) => 
            `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: sizes[size].fontSize
        }}
      >
        Form Forge
      </Typography>
    </Box>
  );
};

export default Logo; 