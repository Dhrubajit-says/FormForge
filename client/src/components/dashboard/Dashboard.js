import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  QuestionMark as QuestionIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { statsAPI } from '../../services/api';
import { useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(motion(Card))(({ theme }) => ({
  height: '100%',
  background: theme.palette.background.paper,
  borderRadius: '16px',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const StatNumber = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalAnswerScripts: 0,
    sharedTemplates: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const auth = useSelector(state => state.auth);
  const userName = auth?.user?.username;
  console.log('Auth state:', auth);  // Debug log to see the structure

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await statsAPI.getDashboardStats();
      console.log('Stats response:', response.data); // Debug log
      
      // Update the mapping to match server response
      setStats({
        totalTemplates: response.data.templatesCount || 0,
        totalAnswerScripts: response.data.responsesCount || 0,
        sharedTemplates: response.data.questionsCount || 0  // You might want to add a proper shared templates count
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats({
        totalTemplates: 0,
        totalAnswerScripts: 0,
        sharedTemplates: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const statCards = [
    {
      title: "Total Templates",
      value: stats.totalTemplates,
      icon: <QuizIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main
    },
    {
      title: "Total Responses",
      value: stats.totalAnswerScripts,
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main
    },
    {
      title: "Total Questions",
      value: stats.sharedTemplates,
      icon: <QuestionIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main
    }
  ];

  const actionButtons = [
    {
      title: "Create Template",
      description: "Design new quizzes and tests",
      icon: <AddIcon />,
      action: () => navigate('/templates/new'),
      color: theme.palette.primary.main
    },
    {
      title: "View Templates",
      description: "Manage your existing templates",
      icon: <QuizIcon />,
      action: () => navigate('/templates'),
      color: theme.palette.secondary.main
    },
    {
      title: "Answer Scripts",
      description: "Review student submissions",
      icon: <AssessmentIcon />,
      action: () => navigate('/answer-scripts'),
      color: theme.palette.success.main
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Hello, {userName}! 👋
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Ready to create amazing learning experiences?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ 
            maxWidth: '800px',
            lineHeight: 1.6 
          }}>
            Transform your teaching with interactive quizzes and assessments. 
            Track student progress, get instant insights, and make learning 
            more engaging than ever. Your digital classroom awaits!
          </Typography>
        </Box>

        {/* Stats Grid with loading state */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div variants={itemVariants}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2 
                    }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: '12px',
                        bgcolor: `${stat.color}15`
                      }}>
                        {React.cloneElement(stat.icon, { sx: { color: stat.color } })}
                      </Box>
                      <TrendingUpIcon sx={{ color: theme.palette.success.main }} />
                    </Box>
                    <StatNumber variant="h3">
                      {loading ? '...' : stat.value}
                    </StatNumber>
                    <Typography variant="subtitle1" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h5" sx={{ mb: 3 }}>Quick Actions</Typography>
        <Grid container spacing={3}>
          {actionButtons.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div variants={itemVariants}>
                <StyledCard onClick={action.action} sx={{ cursor: 'pointer' }}>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 2 
                    }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: '12px',
                        bgcolor: `${action.color}15`,
                        mr: 2
                      }}>
                        {React.cloneElement(action.icon, { sx: { color: action.color } })}
                      </Box>
                      <Box>
                        <Typography variant="h6">{action.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Dashboard;