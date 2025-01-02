import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Timer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    if (timeLeft === 60) {
      setIsWarning(true);
    }

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'fixed',
        top: 80,
        right: 24,
        display: 'inline-flex',
        alignItems: 'center',
        bgcolor: 'background.paper',
        py: 1,
        px: 2,
        borderRadius: '8px',
        border: 1,
        borderColor: isWarning ? 'error.main' : 'grey.300',
        transition: 'all 0.3s ease',
        zIndex: 1000,
        boxShadow: isWarning 
          ? '0 2px 8px rgba(244, 67, 54, 0.25)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box 
        sx={{ 
          position: 'relative', 
          display: 'inline-flex',
          mr: 1.5,
          width: 32,
          height: 32
        }}
      >
        <CircularProgress
          variant="determinate"
          value={progress}
          color={isWarning ? "error" : "primary"}
          size={32}
          thickness={3}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AccessTimeIcon 
            color={isWarning ? "error" : "primary"} 
            sx={{ fontSize: 16 }}
          />
        </Box>
      </Box>
      <Typography 
        variant="h6" 
        component="div"
        color={isWarning ? "error" : "text.primary"}
        sx={{ 
          fontFamily: 'monospace',
          fontWeight: 'medium',
          fontSize: '1.1rem',
          minWidth: '60px',
        }}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Typography>
    </Paper>
  );
};

export default Timer; 