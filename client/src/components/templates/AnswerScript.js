import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
  TextField,
  Alert,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { templateAPI } from '../../services/api';

const checkAnswer = (question, userAnswer) => {
  if (question.questionType === 'text') {
    return userAnswer && userAnswer.trim().length > 0;
  } else if (question.questionType === 'multiple') {
    const userSet = new Set(userAnswer || []);
    const correctSet = new Set(question.correctOptions || []);
    return userSet.size === correctSet.size && 
           [...userSet].every(value => correctSet.has(value));
  } else {
    return userAnswer === question.correctOption;
  }
};

const AnswerScript = ({ open, onClose, quizData, onUpdateScore }) => {
  const [textScores, setTextScores] = useState(() => {
    return quizData.textScores || {};
  });
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [wasScoreUpdated, setWasScoreUpdated] = useState(false);

  // Debug logging
  console.log('AnswerScript quizData:', quizData);

  // Data validation
  if (!quizData || !quizData.template) {
    console.error('Missing required data in AnswerScript:', quizData);
    return null;
  }

  const { studentDetails, template, userAnswers } = quizData;

  const handlePrint = () => {
    window.print();
  };

  const handleTextScoreChange = (questionIndex, value) => {
    const score = Math.min(
      Math.max(parseInt(value) || 0, 0), 
      template.questions[questionIndex].marks || 1
    );
    setTextScores(prev => ({
      ...prev,
      [questionIndex]: score
    }));
  };

  const formatAnswer = (answer, question) => {
    if (question.questionType === 'text') {
      return answer || 'No answer provided';
    } else if (Array.isArray(answer)) {
      return answer.map(idx => question.options[idx]).join(', ') || 'No answer provided';
    } else {
      return answer !== null && answer !== undefined ? 
        question.options[answer] : 'No answer provided';
    }
  };

  const isAnswerCorrect = (question, answer) => {
    if (question.questionType === 'text') {
      return true; // Text answers are manually scored
    } else if (question.questionType === 'multiple') {
      const userSet = new Set(answer || []);
      const correctSet = new Set(question.correctOptions || []);
      return userSet.size === correctSet.size && 
             [...userSet].every(value => correctSet.has(value));
    } else {
      return answer === question.correctOption;
    }
  };

  const getCorrectAnswer = (question) => {
    if (question.questionType === 'text') {
      return null;
    } else if (question.questionType === 'multiple') {
      return question.correctOptions.map(idx => question.options[idx]).join(', ');
    } else {
      return question.options[question.correctOption];
    }
  };

  const handleUpdateScore = async () => {
    // If score was already updated, show confirmation
    if (wasScoreUpdated) {
      const confirmUpdate = window.confirm(
        'This score has already been updated. Are you sure you want to update it again?'
      );
      if (!confirmUpdate) return;
    }

    try {
      setUpdating(true);
      const { obtainedMarks, totalMarks } = calculateScore();
      
      const response = await templateAPI.updateAnswerScript(quizData._id, {
        score: `${obtainedMarks}/${totalMarks}`,
        textScores
      });

      if (response.data) {
        setUpdateMessage({ type: 'success', text: 'Score updated successfully' });
        setWasScoreUpdated(true);
        if (onUpdateScore) {
          onUpdateScore(
            quizData._id, 
            `${obtainedMarks}/${totalMarks}`,
            textScores
          );
        }
      }
    } catch (err) {
      console.error('Error updating score:', err);
      setUpdateMessage({ 
        type: 'error', 
        text: err.response?.data?.msg || 'Failed to update score. Please try again.'
      });
    } finally {
      setUpdating(false);
    }
  };

  const calculateScore = () => {
    let obtainedMarks = 0;
    let totalMarks = 0;

    template.questions.forEach((question, index) => {
      const questionMarks = parseInt(question.marks) || 1;
      totalMarks += questionMarks;

      if (question.questionType === 'text') {
        // For text questions, use the manually assigned score
        obtainedMarks += parseInt(textScores[index]) || 0;
      } else {
        // For MCQ questions, check if answer is correct
        const isCorrect = checkAnswer(question, userAnswers[index]);
        if (isCorrect) {
          obtainedMarks += questionMarks;
        }
      }
    });

    return { obtainedMarks, totalMarks };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Answer Script: {quizData.template.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleUpdateScore}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Score'}
            </Button>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {updateMessage && (
          <Alert 
            severity={updateMessage.type} 
            sx={{ mb: 2 }}
            onClose={() => setUpdateMessage(null)}
          >
            {updateMessage.text}
          </Alert>
        )}

        {/* Student Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Student Details
          </Typography>
          <Typography variant="body1">
            Name: {quizData.studentDetails.name}
          </Typography>
          <Typography variant="body1">
            ID: {quizData.studentDetails.studentId}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
            Score: {calculateScore().obtainedMarks}/{calculateScore().totalMarks}
            {wasScoreUpdated && (
              <Chip
                label="Updated"
                size="small"
                color="success"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>

        {/* Questions and Answers */}
        {quizData.template.questions.map((question, index) => (
          <Box 
            key={index} 
            sx={{ 
              mb: 4,
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                Question {index + 1} ({question.marks} {question.marks === 1 ? 'mark' : 'marks'})
              </Typography>
              {question.questionType === 'text' && (
                <TextField
                  label="Score"
                  type="number"
                  value={textScores[index] || 0}
                  onChange={(e) => handleTextScoreChange(index, e.target.value)}
                  InputProps={{
                    inputProps: { 
                      min: 0, 
                      max: question.marks || 1
                    }
                  }}
                  sx={{ width: 100 }}
                />
              )}
            </Box>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              {question.text}
            </Typography>

            <Box sx={{ pl: 2, borderLeft: '3px solid' }}>
              {/* Student's Answer */}
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 1,
                  color: isAnswerCorrect(question, userAnswers[index]) ? 'success.main' : 'error.main',
                  fontWeight: 500
                }}
              >
                Student's Answer: {formatAnswer(userAnswers[index], question)}
              </Typography>

              {/* Show Correct Answer if wrong */}
              {!isAnswerCorrect(question, userAnswers[index]) && question.questionType !== 'text' && (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'success.main',
                    fontWeight: 500
                  }}
                >
                  Correct Answer: {getCorrectAnswer(question)}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default AnswerScript; 