import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Alert, Box, TextField } from '@mui/material';
import CreateTemplate from './CreateTemplate';
import { templateAPI } from '../../services/api';

const EditTemplate = ({ isAdmin = false }) => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await templateAPI.getTemplate(id);
        const template = response.data;
        
        setTemplate(template);
        setQuestions(template.questions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching template:', err);
        setError(err.response?.data?.msg || 'Error fetching template');
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const handleQuestionAdd = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        questionType: 'single',
        options: [''],
        correctOption: 0,
        marks: 1,
        image: null
      }
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const handleMarksChange = (index, value) => {
    const marks = parseInt(value) || 1;
    handleQuestionChange(index, 'marks', marks);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <CreateTemplate 
      isEditing={true}
      initialTemplate={template}
      templateId={id}
    >
      {questions.map((question, index) => (
        <Box key={index}>
          <TextField
            label="Marks"
            type="number"
            value={question.marks || 1}
            onChange={(e) => handleMarksChange(index, e.target.value)}
            InputProps={{
              inputProps: { min: 1 }
            }}
            sx={{ width: 100, mt: 2 }}
          />
        </Box>
      ))}
    </CreateTemplate>
  );
};

export default EditTemplate; 