import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  useTheme,
  alpha,
  Paper
} from '@mui/material';
import {
  Quiz as QuizIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  ArrowForward as ArrowForwardIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const sampleTemplates = [
  {
    title: "Mathematics Quiz",
    type: "quiz",
    description: "Test your math skills with this comprehensive quiz covering algebra, geometry, and calculus.",
    icon: <QuizIcon />,
    color: "#2196F3",
    questions: 15,
    time: "30 mins",
    bgColor: "#1565C0",
    bgImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Ctext x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"10\" text-anchor=\"middle\" fill=\"%23ffffff\" opacity=\"0.2\"%3E%3Ctspan x=\"50\" dy=\"0\"%3E∑%3C/tspan%3E%3Ctspan x=\"50\" dy=\"12\"%3Eπ%3C/tspan%3E%3Ctspan x=\"50\" dy=\"12\"%3E√%3C/tspan%3E%3C/text%3E%3C/svg%3E')"
  },
  {
    title: "Student Feedback Form",
    type: "questionnaire",
    description: "Collect detailed feedback from students about course content and teaching methods.",
    icon: <SchoolIcon />,
    color: "#4CAF50",
    questions: 10,
    responses: 250,
    bgColor: "#2E7D32",
    bgImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Ctext x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"10\" text-anchor=\"middle\" fill=\"%23ffffff\" opacity=\"0.2\"%3E%3Ctspan x=\"50\" dy=\"0\"%3E★%3C/tspan%3E%3Ctspan x=\"50\" dy=\"12\"%3E✓%3C/tspan%3E%3Ctspan x=\"50\" dy=\"12\"%3E☆%3C/tspan%3E%3C/text%3E%3C/svg%3E')"
  },
  {
    title: "Programming Test",
    type: "test",
    description: "Evaluate coding skills with practical programming questions and challenges.",
    icon: <AssignmentIcon />,
    color: "#FF4081",
    questions: 8,
    time: "60 mins",
    bgColor: "#C2185B",
    bgImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Ctext x=\"50\" y=\"50\" font-family=\"monospace\" font-size=\"10\" text-anchor=\"middle\" fill=\"%23ffffff\" opacity=\"0.2\"%3E%3Ctspan x=\"50\" dy=\"0\"%3E{%3C/tspan%3E%3Ctspan x=\"50\" dy=\"12\"%3E&lt;/%3E%3C/tspan%3E%3Ctspan x=\"50\" dy=\"12\"%3E}%3C/tspan%3E%3C/text%3E%3C/svg%3E')"
  }
];

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          borderRadius: 0,
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha('#000', 0.1)}, ${alpha('#000', 0.2)})`,
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} sx={{ position: 'relative', zIndex: 2 }}>
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                Create Forms That Matter
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Build quizzes, tests, and questionnaires with our intuitive form builder.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/register')}
                sx={{ mr: 2 }}
              >
                Get Started Free
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/login')}
                sx={{ borderColor: 'white' }}
              >
                Sign In
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="/dashboard-illustration.svg"
                sx={{ 
                  width: '100%',
                  maxWidth: 500,
                  display: { xs: 'none', md: 'block' }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Sample Templates Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Popular Templates
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Get started with our professionally designed templates
        </Typography>

        <Grid container spacing={4}>
          {sampleTemplates.map((template, index) => (
            <Grid item xs={12} md={4} key={template.title}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
              >
                <CardMedia
                  sx={{
                    height: 140,
                    bgcolor: template.bgColor,
                    backgroundImage: template.bgImage,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha(template.bgColor, 0.8)}, ${alpha(template.bgColor, 0.6)})`,
                      backgroundSize: '400% 400%',
                      animation: 'gradient 15s ease infinite',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `repeating-linear-gradient(45deg, ${alpha('#fff', 0.1)} 25%, transparent 25%, transparent 75%, ${alpha('#fff', 0.1)} 75%, ${alpha('#fff', 0.1)}), repeating-linear-gradient(45deg, ${alpha('#fff', 0.1)} 25%, transparent 25%, transparent 75%, ${alpha('#fff', 0.1)} 75%, ${alpha('#fff', 0.1)})`,
                      backgroundPosition: '0 0, 10px 10px',
                      backgroundSize: '20px 20px',
                      opacity: 0.1
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    {React.cloneElement(template.icon, { 
                      sx: { 
                        fontSize: 60, 
                        color: 'white',
                        opacity: 0.9
                      } 
                    })}
                  </Box>
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={template.icon}
                      label={template.type}
                      size="small"
                      sx={{ 
                        bgcolor: alpha(template.color, 0.1),
                        color: template.color,
                        fontWeight: 500
                      }}
                    />
                    {template.time && (
                      <Chip
                        label={template.time}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {template.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Chip 
                      label={`${template.questions} Questions`}
                      size="small"
                      variant="outlined"
                    />
                    {template.responses && (
                      <Chip 
                        label={`${template.responses} Responses`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/register')}
                    sx={{ color: template.color }}
                  >
                    Use This Template
                  </Button>
                </CardActions>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 