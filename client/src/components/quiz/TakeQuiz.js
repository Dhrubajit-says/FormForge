import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  TextField,
  Checkbox,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { templateAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const auth = useSelector(state => state.auth);
  
  const [template, setTemplate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await templateAPI.getTemplate(id);
        setTemplate(response.data);
        if (response.data.type === 'test') {
          setTimeLeft(response.data.duration * 60);
        }
      } catch (err) {
        setError('Failed to load quiz');
      }
    };
    fetchTemplate();
  }, [id]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && template?.type === 'test') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, template]);

  const handleAnswer = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
  };

  const handleMultipleAnswer = (optionIndex) => {
    const currentAnswers = answers[currentQuestion] || [];
    const newAnswers = currentAnswers.includes(optionIndex)
      ? currentAnswers.filter(i => i !== optionIndex)
      : [...currentAnswers, optionIndex];
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: newAnswers
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await templateAPI.submitQuiz(id, {
        answers,
        studentDetails: {
          name: auth.user.username,
          studentId: auth.user._id
        }
      });
      navigate(`/quiz/${id}/result/${response.data._id}`);
    } catch (err) {
      setError('Failed to submit quiz');
    }
  };

  if (!template) return null;

  const question = template.questions[currentQuestion];
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {template.type === 'test' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="error" align="right">
            Time Left: {formatTime(timeLeft)}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(timeLeft / (template.duration * 60)) * 100} 
            sx={{ mt: 1 }}
          />
        </Box>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Question Image */}
        {question.image && (
          <Box sx={{ mb: 2 }}>
            <img
              src={question.image}
              alt={`Question ${currentQuestion + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: '8px'
              }}
            />
          </Box>
        )}

        <Typography variant="h6" gutterBottom>
          Question {currentQuestion + 1} of {template.questions.length}
        </Typography>
        <Typography paragraph>{question.text}</Typography>

        {/* Text Answer Type */}
        {question.questionType === 'text' && (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answers[currentQuestion] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer here..."
            variant="outlined"
            sx={{ mt: 2 }}
          />
        )}

        {/* Single Choice Type */}
        {question.questionType === 'single' && (
          <RadioGroup
            value={answers[currentQuestion]?.toString() || ''}
            onChange={(e) => handleAnswer(parseInt(e.target.value))}
          >
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index.toString()}
                control={<Radio />}
                label={option}
                sx={{
                  display: 'block',
                  p: 1,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: isDarkMode 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              />
            ))}
          </RadioGroup>
        )}

        {/* Multiple Choice Type */}
        {question.questionType === 'multiple' && (
          <Box>
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={answers[currentQuestion]?.includes(index) || false}
                    onChange={() => handleMultipleAnswer(index)}
                  />
                }
                label={option}
                sx={{
                  display: 'block',
                  p: 1,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: isDarkMode 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              />
            ))}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          {currentQuestion === template.questions.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowConfirm(true)}
            >
              Submit
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => setCurrentQuestion(prev => prev + 1)}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your answers? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TakeQuiz; 