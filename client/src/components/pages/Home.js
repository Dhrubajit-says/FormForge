import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  useTheme,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ overflow: 'hidden', minHeight: '100vh', pt: 8 }}>
      {/* Hero Section */}
      <Container maxWidth="xl">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Create Engaging Quizzes, Tests and Questionnaires
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
                The most powerful and flexible platform for creating and managing
                educational assessments.
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{ mt: 4 }}
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  background: theme.palette.background.paper,
                  borderRadius: 2
                }}
              >
                <Typography variant="h4" gutterBottom>
                  Features
                </Typography>
                {['Admin control', 'Timed tests supports auto save', 'Create custom quizzes / tests / questionnaires', 'Supports multiple question types','Add image in the question','Answer scripts','Update student score'].map((feature, index) => (
                  <Typography key={index} variant="h6" sx={{ mt: 2 }}>
                    ✓ {feature}
                  </Typography>
                ))}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
