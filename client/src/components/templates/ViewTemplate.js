import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  FormControlLabel,
  Radio,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Checkbox,
  TextField,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { templateAPI } from '../../services/api';
import { Edit as EditIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import QuizStartForm from './QuizStartForm';
import AnswerScript from './AnswerScript';
import Timer from './Timer';
import { alpha } from '@mui/material';

const checkAnswer = (question, userAnswer) => {
  if (question.questionType === 'text') {
    // For text questions, any non-empty answer is considered valid
    return userAnswer && userAnswer.trim().length > 0;
  } else if (question.questionType === 'multiple') {
    // For multiple choice, check if arrays are equal
    const userSet = new Set(userAnswer || []);
    const correctSet = new Set(question.correctOptions || []);
    return userSet.size === correctSet.size && 
           [...userSet].every(value => correctSet.has(value));
  } else {
    // For single choice
    return userAnswer === question.correctOption;
  }
};

const ViewTemplate = ({ template: sharedTemplate, studentDetails: sharedStudentDetails, isShared }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(sharedTemplate || null);
  const [loading, setLoading] = useState(!sharedTemplate);
  const [error, setError] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showStartForm, setShowStartForm] = useState(!isShared);
  const [showAnswerScript, setShowAnswerScript] = useState(false);
  const [studentDetails, setStudentDetails] = useState(sharedStudentDetails || null);
  const [timeUp, setTimeUp] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(!isShared);

  useEffect(() => {
    if (!sharedTemplate) {
      const fetchTemplate = async () => {
        try {
          const response = await templateAPI.getTemplate(id);
          setTemplate(response.data);
          const initialAnswers = {};
          response.data.questions.forEach((question, index) => {
            initialAnswers[index] = question.questionType === 'multiple' ? [] : null;
          });
          setUserAnswers(initialAnswers);
          setLoading(false);
        } catch (err) {
          setError('Failed to load template');
          setLoading(false);
        }
      };
      fetchTemplate();
    } else {
      // Initialize answers for shared template
      const initialAnswers = {};
      sharedTemplate.questions.forEach((question, index) => {
        initialAnswers[index] = question.questionType === 'multiple' ? [] : null;
      });
      setUserAnswers(initialAnswers);
    }
  }, [id, sharedTemplate]);

  const handleAnswerChange = (questionIndex, optionIndex) => {
    if (showResults) return;

    const question = template.questions[questionIndex];
    
    if (question.questionType === 'multiple') {
      setUserAnswers(prev => {
        const currentAnswers = prev[questionIndex] || [];
        const newAnswers = currentAnswers.includes(optionIndex)
          ? currentAnswers.filter(a => a !== optionIndex)
          : [...currentAnswers, optionIndex];
        
        return {
          ...prev,
          [questionIndex]: newAnswers
        };
      });
    } else {
      setUserAnswers(prev => ({
        ...prev,
        [questionIndex]: optionIndex
      }));
    }
  };

  const handleTextAnswerChange = (questionIndex, value) => {
    if (showResults) return;
    
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleSubmit = useCallback(async () => {
    try {
      // Add debug logs
      console.log('Submitting answers:', userAnswers);
      console.log('Template questions:', template.questions);

      let score = 0;
      const answers = template.questions.map((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = checkAnswer(question, userAnswer);
        console.log('Question:', question.text);
        console.log('User answer:', userAnswer);
        console.log('Correct answer:', question.correctOption);
        console.log('Is correct:', isCorrect);
        
        if (isCorrect) score++;
        return {
          questionId: question._id,
          answer: userAnswer,
          isCorrect
        };
      });

      // Log the final submission
      console.log('Final submission:', {
        templateId: template._id,
        templateTitle: template.title,
        studentName: studentDetails.name,
        studentId: studentDetails.studentId,
        answers,
        score,
        totalQuestions: template.questions.length
      });

      await templateAPI.submitAnswerScript({
        templateId: template._id,
        templateTitle: template.title,
        studentName: studentDetails.name,
        studentId: studentDetails.studentId,
        answers,
        score,
        totalQuestions: template.questions.length,
        isDummy: !isShared
      });

      setShowResults(true);
    } catch (err) {
      console.error('Error submitting answers:', err);
      setError('Failed to submit answers');
    }
  }, [userAnswers, template, studentDetails, isShared]);

  const handleTryAgain = () => {
    setShowResults(false);
    setUserAnswers({});
  };

  const handleStartQuiz = (details) => {
    setStudentDetails(details);
    setShowStartForm(false);
  };

  const startQuizFlow = () => {
    setIsPreviewMode(false);
    setShowStartForm(true);
  };

  const getQuizData = () => {
    if (!studentDetails || !template || !userAnswers) return null;
    
    return {
      studentDetails,
      template,
      userAnswers,
      score: calculateScore()
    };
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    handleSubmit(); // Automatically submit when time is up
  };

  useEffect(() => {
    if (timeUp) {
      handleSubmit();
    }
  }, [timeUp, handleSubmit]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!template) return null;

  const calculateScore = () => {
    let correct = 0;
    let totalMCQ = 0; // Counter for MCQ/Single choice questions

    Object.entries(userAnswers).forEach(([questionIndex, answer]) => {
      const question = template.questions[questionIndex];
      
      // Skip text questions in score calculation
      if (question.questionType === 'text') {
        return;
      }

      totalMCQ++; // Increment counter for MCQ/Single choice questions

      if (question.questionType === 'multiple') {
        // For multiple choice, check if arrays are equal
        const userSet = new Set(answer || []);
        const correctSet = new Set(question.correctOptions || []);
        if (userSet.size === correctSet.size && 
            [...userSet].every(value => correctSet.has(value))) {
          correct++;
        }
      } else {
        // For single choice
        if (answer === question.correctOption) {
          correct++;
        }
      }
    });

    return `${correct}/${totalMCQ}`; // Return score only for MCQ/Single choice questions
  };

  const calculateTotalMarks = (questions) => {
    console.log('Calculating total marks for questions:', questions); // Add debug log
    return questions.reduce((sum, q) => {
      const marks = parseInt(q.marks) || 1;
      console.log(`Question marks: ${marks}`); // Add debug log
      return sum + marks;
    }, 0);
  };

  const getOptionStyle = (questionIndex, optionIndex, isCorrect = false) => {
    const isSelected = userAnswers[questionIndex] === optionIndex;
    
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {!isShared && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <Typography variant="h4" component="h1">
            {isPreviewMode ? 'Template Preview' : 'Quiz in Progress'}
          </Typography>
          {isPreviewMode && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/templates/edit/${id}`)}
            >
              Edit Template
            </Button>
          )}
        </Box>
      )}

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {template.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {template.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Typography variant="subtitle1" color="primary">
            Total Marks: {calculateTotalMarks(template.questions)}
          </Typography>
          {template.type === 'test' && (
            <>
              <Divider orientation="vertical" flexItem />
              <Typography variant="subtitle1" color="primary">
                Time Limit: {template.duration} minutes
              </Typography>
            </>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Questions Preview/Quiz */}
        {template.questions.map((question, index) => (
          <Box 
            key={index} 
            sx={{ 
              mb: 4,
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              position: 'relative'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Typography variant="h6">
                Question {index + 1}
              </Typography>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'primary.main',
                color: 'black',
                px: 2,
                py: 0.5,
                borderRadius: 16,
                fontSize: '0.875rem',
                fontWeight: 500,
                gap: 1
              }}>
                <span style={{ fontSize: '1.1rem' }}>
                  {parseInt(question.marks) || 1}
                </span>
                <span>
                  {parseInt(question.marks) === 1 ? 'mark' : 'marks'}
                </span>
              </Box>
            </Box>

            <Typography variant="body1" sx={{ mb: 2 }}>
              {question.text}
            </Typography>
            
            {question.image && (
              <Box sx={{ my: 2 }}>
                <img 
                  src={`http://localhost:5001${question.image}`} 
                  alt={`Question ${index + 1}`}
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
                />
              </Box>
            )}

            {question.questionType === 'text' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Type your answer here..."
                value={userAnswers[index] || ''}
                onChange={(e) => handleTextAnswerChange(index, e.target.value)}
                disabled={showResults}
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: '1px',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    }
                  }
                }}
              />
            )}

            {question.questionType === 'single' && (
              <Box>
                {question.options.map((option, optionIndex) => (
                  <FormControlLabel
                    key={optionIndex}
                    control={
                      <Radio 
                        checked={userAnswers[index] === optionIndex}
                        onChange={() => handleAnswerChange(index, optionIndex)}
                        sx={{
                          '&.Mui-checked': {
                            color: '#1976d2',
                          }
                        }}
                      />
                    }
                    label={option}
                    sx={getOptionStyle(index, optionIndex)}
                  />
                ))}
              </Box>
            )}
            {question.questionType === 'multiple' && (
              <Box>
                {question.options.map((option, optionIndex) => (
                  <FormControlLabel
                    key={optionIndex}
                    control={
                      <Checkbox
                        checked={userAnswers[index]?.includes(optionIndex)}
                        onChange={(e) => handleAnswerChange(index, optionIndex)}
                        sx={{
                          '&.Mui-checked': {
                            color: '#1976d2',
                          }
                        }}
                      />
                    }
                    label={option}
                    sx={getOptionStyle(index, optionIndex)}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          {isPreviewMode ? (
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={startQuizFlow}
              startIcon={<PlayArrowIcon />}
            >
              Start {template.type === 'test' ? 'Test' : 'Quiz'}
            </Button>
          ) : (
            showResults ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Score: {calculateScore()}
                </Typography>
                <Box>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => setShowAnswerScript(true)}
                    sx={{ mr: 2 }}
                  >
                    View Answer Script
                  </Button>
                  {!isShared && (
                    <Button 
                      variant="contained"
                      color="primary"
                      onClick={handleTryAgain}
                    >
                      Try Again
                    </Button>
                  )}
                </Box>
              </Box>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit}
                disabled={Object.values(userAnswers).some(answer => answer === null)}
              >
                Submit {template.type === 'test' ? 'Test' : 'Quiz'}
              </Button>
            )
          )}
        </Box>
      </Paper>

      {/* Forms and Modals */}
      <QuizStartForm 
        open={!isPreviewMode && showStartForm} 
        onClose={() => navigate('/templates')}
        onStart={handleStartQuiz}
      />

      {showAnswerScript && (
        <AnswerScript
          open={showAnswerScript}
          onClose={() => setShowAnswerScript(false)}
          quizData={getQuizData()}
        />
      )}

      {template.type === 'test' && !isPreviewMode && !showStartForm && !showResults && (
        <Timer 
          duration={template.duration} 
          onTimeUp={handleTimeUp}
        />
      )}
    </Container>
  );
};

export default ViewTemplate; 