import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControlLabel,
  Radio,
  Checkbox
} from '@mui/material';
import { templateAPI } from '../../services/api';
import ViewTemplate from './ViewTemplate';
import { alpha } from '@mui/material';

const SharedTemplate = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    studentId: ''
  });
  const [showTemplate, setShowTemplate] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await templateAPI.getSharedTemplate(id);
        setTemplate(response.data);
        setLoading(false);
      } catch (err) {
        setError('Template not found or has expired');
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id]);

  const handleStart = () => {
    if (!studentDetails.name || !studentDetails.studentId) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setShowTemplate(true);
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = optionIndex;
      return newAnswers;
    });
  };

  const handleMultipleAnswerChange = (questionIndex, optionIndex, event) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      if (event.target.checked) {
        newAnswers[questionIndex] = [...newAnswers[questionIndex], optionIndex];
      } else {
        newAnswers[questionIndex] = newAnswers[questionIndex].filter(index => index !== optionIndex);
      }
      return newAnswers;
    });
  };

  const handleTextAnswerChange = (questionIndex, value) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = value;
      return newAnswers;
    });
  };

  const getOptionStyle = (questionIndex, optionIndex) => {
    const isSelected = answers[questionIndex] === optionIndex;
    
    return {
      display: 'block',
      mb: 1,
      pl: 1,
      py: 1,
      borderRadius: 2,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      bgcolor: isSelected ? alpha('#1976d2', 0.1) : 'transparent',
      border: isSelected ? `1px solid ${alpha('#1976d2', 0.3)}` : '1px solid transparent',
      '&:hover': {
        bgcolor: alpha('#1976d2', 0.05),
        border: `1px solid ${alpha('#1976d2', 0.2)}`
      }
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Thank you for your submission!
            </Typography>
            <Typography color="text.secondary">
              Your response has been recorded successfully.
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (showTemplate) {
    return (
      <ViewTemplate 
        template={template} 
        studentDetails={studentDetails}
        isShared={true}
        onSubmit={() => setSubmitted(true)}
        answers={answers}
        handleAnswerChange={handleAnswerChange}
        handleMultipleAnswerChange={handleMultipleAnswerChange}
        handleTextAnswerChange={handleTextAnswerChange}
      />
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            {template.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {template.description}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Type: {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
            {template.type === 'test' && ` • Duration: ${template.duration} minutes`}
          </Typography>
          
          <Box component="form" sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Your Name"
              value={studentDetails.name}
              onChange={(e) => setStudentDetails(prev => ({ ...prev, name: e.target.value }))}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Student ID"
              value={studentDetails.studentId}
              onChange={(e) => setStudentDetails(prev => ({ ...prev, studentId: e.target.value }))}
              margin="normal"
              required
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleStart}
            >
              Start {template.type === 'test' ? 'Test' : 'Quiz'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SharedTemplate; 