import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme as useMuiTheme,
  Checkbox,
  CircularProgress
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { templateAPI, adminAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { AddPhotoAlternate as AddPhotoIcon, Cancel as CancelIcon } from '@mui/icons-material';

const ImagePreview = ({ image, onRemove }) => {
  if (!image) return null;

  const imageUrl = image.startsWith('http') 
    ? image 
    : `http://localhost:5001${image}`;

  return (
    <Box sx={{ position: 'relative', mb: 2 }}>
      <img 
        src={imageUrl} 
        alt="Question" 
        style={{ 
          maxWidth: '100%', 
          maxHeight: '200px', 
          borderRadius: '4px' 
        }} 
      />
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }
        }}
        onClick={onRemove}
      >
        <CancelIcon sx={{ color: 'white' }} />
      </IconButton>
    </Box>
  );
};

const CreateTemplate = ({ isEditing = false, initialTemplate = null, templateId = null, isAdmin = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [template, setTemplate] = useState(initialTemplate || {
    title: '',
    description: '',
    type: 'quiz',
    duration: 0,
    questions: []
  });
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const { isDarkMode } = useTheme();
  const muiTheme = useMuiTheme();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      if (isEditing) {
        try {
          let response;
          if (isAdmin) {
            response = await adminAPI.getTemplateAsAdmin(id);
          } else {
            response = await templateAPI.getTemplate(id);
          }
          
          // Set the template data
          setTemplate({
            title: response.data.title || '',
            description: response.data.description || '',
            type: response.data.type || 'quiz',
            duration: response.data.duration || 0,
            questions: response.data.questions.map(q => ({
              text: q.text || '',
              image: q.image || null,
              questionType: q.questionType || 'single',
              options: q.options || ['', ''],
              correctOption: q.correctOption ?? 0,
              correctOptions: q.correctOptions || [],
              marks: q.marks || 1
            }))
          });
        } catch (err) {
          console.error('Error fetching template:', err);
          setError('Failed to load template');
        }
      }
      setLoading(false);
    };

    fetchTemplate();
  }, [isEditing, id, isAdmin]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleQuestionChange = (index, field, value) => {
    setTemplate(prev => {
      const updated = { ...prev };
      updated.questions[index] = {
        ...updated.questions[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...template.questions];
    newQuestions[questionIndex].options[optionIndex] = value || '';
    setTemplate({ ...template, questions: newQuestions });
  };

  const handleCorrectOptionChange = (questionIndex, value) => {
    const newQuestions = [...template.questions];
    newQuestions[questionIndex].correctOption = parseInt(value);
    setTemplate({ ...template, questions: newQuestions });
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...template.questions];
    newQuestions[questionIndex].options.push('');
    setTemplate({ ...template, questions: newQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...template.questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options
      .filter((_, index) => index !== optionIndex);
    setTemplate({ ...template, questions: newQuestions });
  };

  const addQuestion = () => {
    setTemplate({
      ...template,
      questions: [
        ...template.questions,
        {
          text: '',
          image: null,
          questionType: 'single',
          options: ['', ''],
          correctOption: 0,
          correctOptions: [],
          marks: 1
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = template.questions.filter((_, i) => i !== index);
    setTemplate({ ...template, questions: newQuestions });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const templateData = {
        ...template,
        questions: template.questions.map(q => ({
          ...q,
          marks: parseInt(q.marks) || 1
        }))
      };

      if (isEditing) {
        if (isAdmin) {
          await adminAPI.updateTemplateAsAdmin(id, templateData);
          setSnackbar({
            open: true,
            message: 'Template updated successfully',
            severity: 'success'
          });
          // Don't navigate away for admin
        } else {
          await templateAPI.updateTemplate(id, templateData);
          setSnackbar({
            open: true,
            message: 'Template updated successfully',
            severity: 'success'
          });
          setTimeout(() => {
            navigate('/templates');
          }, 1500);
        }
      } else {
        await templateAPI.createTemplate(templateData);
        setSnackbar({
          open: true,
          message: 'Template created successfully',
          severity: 'success'
        });
        setTimeout(() => {
          navigate('/templates');
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving template:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save template',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const isTemplateValid = () => {
    // Basic validation
    if (!template.title) return false;

    // For new templates, require all questions to have text
    if (!isEditing) {
      return !template.questions.some(q => !q.text);
    }

    // For editing, allow partial updates as long as template has a title
    // and at least one question has text
    return template.title && template.questions.some(q => q.text);
  };

  // Custom light green color for correct answers
  const correctAnswerBgColor = 'rgba(129, 199, 132, 0.15)'; // Light green with low opacity

  const handleImageUpload = async (questionIndex, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5001/api/templates/upload-image', {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        },
        body: formData
      });

      const data = await response.json();
      if (data.imageUrl) {
        const newQuestions = [...template.questions];
        newQuestions[questionIndex] = {
          ...newQuestions[questionIndex],
          image: data.imageUrl
        };
        setTemplate({ ...template, questions: newQuestions });
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = async (questionIndex) => {
    const question = template.questions[questionIndex];
    if (!question.image) return;

    try {
      const filename = question.image.split('/').pop();
      await fetch(`http://localhost:5001/api/templates/question-image/${filename}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      const newQuestions = [...template.questions];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        image: null
      };
      setTemplate({ ...template, questions: newQuestions });
    } catch (err) {
      console.error('Error removing image:', err);
      alert('Failed to remove image');
    }
  };

  const handleQuestionTypeChange = (questionIndex, value) => {
    const newQuestions = [...template.questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      questionType: value,
      marks: newQuestions[questionIndex].marks || 1,
      options: value === 'text' ? [] : newQuestions[questionIndex].options,
      correctOption: value === 'text' ? null : 0,
      correctOptions: value === 'multiple' ? [] : undefined
    };
    setTemplate({ ...template, questions: newQuestions });
  };

  const handleMarksChange = (questionIndex, value) => {
    console.log('Setting marks:', value); // Add debug log
    const newQuestions = [...template.questions];
    const marks = Math.max(1, parseInt(value) || 1);
    console.log('Parsed marks:', marks); // Add debug log
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      marks: marks
    };
    setTemplate({ ...template, questions: newQuestions });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Editor Section */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3,
              backgroundColor: isDarkMode ? 'background.paper' : 'background.default',
              color: muiTheme.palette.text.primary 
            }}
          >
            <Typography variant="h5" gutterBottom>
              {isEditing ? 'Edit Template' : 'Create Template'}
            </Typography>
            
            {/* Template Type Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Template Type</InputLabel>
              <Select
                value={template.type}
                label="Template Type"
                onChange={(e) => setTemplate({ ...template, type: e.target.value })}
              >
                <MenuItem value="quiz">Quiz</MenuItem>
                <MenuItem value="test">Test</MenuItem>
                <MenuItem value="questionnaire">Questionnaire</MenuItem>
              </Select>
            </FormControl>

            {/* Timer for Test type */}
            {template.type === 'test' && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={template.duration}
                  onChange={(e) => setTemplate({ ...template, duration: parseInt(e.target.value) })}
                  InputProps={{
                    startAdornment: (
                      <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                    ),
                    inputProps: { min: 1 }
                  }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Template Title"
              value={template.title}
              onChange={(e) => setTemplate({ ...template, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              sx={{ mb: 3 }}
            />
            
            {template.questions.map((question, questionIndex) => (
              <Box
                key={questionIndex}
                sx={{
                  p: 2,
                  mb: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: isDarkMode ? 'background.paper' : 'background.default',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Question {questionIndex + 1}
                  </Typography>
                  
                  {/* Add marks input field */}
                  <TextField
                    label="Marks"
                    type="number"
                    value={question.marks}
                    onChange={(e) => handleQuestionChange(questionIndex, 'marks', parseInt(e.target.value) || 1)}
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                    sx={{ width: 100, mt: 2 }}
                  />
                  
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={question.questionType}
                      onChange={(e) => handleQuestionTypeChange(questionIndex, e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="single">Single Choice</MenuItem>
                      <MenuItem value="multiple">Multiple Choice</MenuItem>
                      <MenuItem value="text">Text Answer</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Image Upload Section */}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    accept="image/*"
                    type="file"
                    id={`image-upload-${questionIndex}`}
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(questionIndex, e)}
                  />
                  <label htmlFor={`image-upload-${questionIndex}`}>
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<AddPhotoIcon />}
                      disabled={imageUploading}
                    >
                      Add Image
                    </Button>
                  </label>
                  {imageUploading && <Typography>Uploading...</Typography>}
                </Box>

                {/* Image Preview */}
                <ImagePreview
                  image={question.image}
                  onRemove={() => handleRemoveImage(questionIndex)}
                />

                {/* Question Text Field */}
                <TextField
                  fullWidth
                  label={`Question ${questionIndex + 1}`}
                  value={question.text}
                  onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                  sx={{ mb: 2 }}
                />

                {/* Options Section - Only show for single/multiple choice */}
                {question.questionType !== 'text' && (
                  <>
                    {question.options.map((option, optionIndex) => (
                      <Box key={optionIndex} sx={{ display: 'flex', mb: 1, gap: 1 }}>
                        <TextField
                          fullWidth
                          label={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                          sx={{
                            backgroundColor: isDarkMode ? 'background.paper' : 'background.default',
                          }}
                        />
                        {question.questionType === 'single' ? (
                          <Radio
                            checked={question.correctOption === optionIndex}
                            onChange={() => handleCorrectOptionChange(questionIndex, optionIndex)}
                          />
                        ) : (
                          <Checkbox
                            checked={question.correctOptions?.includes(optionIndex)}
                            onChange={(e) => {
                              const newQuestions = [...template.questions];
                              const correctOptions = newQuestions[questionIndex].correctOptions || [];
                              if (e.target.checked) {
                                newQuestions[questionIndex].correctOptions = [...correctOptions, optionIndex];
                              } else {
                                newQuestions[questionIndex].correctOptions = correctOptions.filter(i => i !== optionIndex);
                              }
                              setTemplate({ ...template, questions: newQuestions });
                            }}
                          />
                        )}
                        {question.options.length > 2 && (
                          <IconButton 
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}

                    {/* Add Option button - Only for choice questions */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => addOption(questionIndex)}
                        startIcon={<AddCircleOutlineIcon />}
                        size="small"
                      >
                        Add Option
                      </Button>
                      {template.questions.length > 1 && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => removeQuestion(questionIndex)}
                          startIcon={<DeleteOutlineIcon />}
                          size="small"
                        >
                          Remove Question
                        </Button>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={addQuestion}
              sx={{ mr: 2 }}
            >
              Add Question
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!isTemplateValid()}
            >
              Save Template
            </Button>
          </Paper>
        </Grid>

        {/* Preview Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>
              Live Preview
            </Typography>
            <Card sx={{ mb: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  {template.title || 'Template Title'}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {template.description || 'Template Description'}
                </Typography>
                {template.type === 'test' && (
                  <Typography variant="body2" color="text.secondary">
                    Duration: {template.duration} minutes
                  </Typography>
                )}
              </CardContent>
            </Card>

            {template.questions.map((question, questionIndex) => (
              <Card key={questionIndex} sx={{ mb: 2, boxShadow: 2 }}>
                <CardContent>
                  {/* Question Image */}
                  {question.image && (
                    <Box sx={{ mb: 2 }}>
                      <img 
                        src={question.image.startsWith('http') 
                          ? question.image 
                          : `http://localhost:5001${question.image}`
                        } 
                        alt={`Question ${questionIndex + 1}`}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          borderRadius: '4px' 
                        }} 
                      />
                    </Box>
                  )}

                  <Typography variant="h6" gutterBottom>
                    Question {questionIndex + 1}: {question.text || `Question ${questionIndex + 1}`}
                  </Typography>

                  {/* Text Answer Type */}
                  {question.questionType === 'text' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      disabled
                      placeholder="Student's answer will appear here"
                      sx={{ mt: 1 }}
                    />
                  )}

                  {/* Single Choice Type */}
                  {question.questionType === 'single' && (
                    <RadioGroup>
                      {question.options.map((option, optionIndex) => (
                        <FormControlLabel
                          key={optionIndex}
                          value={optionIndex.toString()}
                          control={
                            <Radio 
                              checked={question.correctOption === optionIndex}
                              icon={<RadioButtonUncheckedIcon />}
                              checkedIcon={<CheckCircleIcon color="success" />}
                            />
                          }
                          label={option || `Option ${optionIndex + 1}`}
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            pl: 1,
                            backgroundColor: question.correctOption === optionIndex ? correctAnswerBgColor : 'transparent',
                            '&:hover': {
                              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                              transition: 'background-color 0.2s'
                            },
                            transition: 'background-color 0.2s'
                          }}
                        />
                      ))}
                    </RadioGroup>
                  )}

                  {/* Multiple Choice Type */}
                  {question.questionType === 'multiple' && (
                    <Box>
                      {question.options.map((option, optionIndex) => (
                        <FormControlLabel
                          key={optionIndex}
                          control={
                            <Checkbox
                              checked={question.correctOptions?.includes(optionIndex)}
                              color="primary"
                            />
                          }
                          label={option || `Option ${optionIndex + 1}`}
                          sx={{
                            display: 'block',
                            mb: 1,
                            pl: 1,
                            borderRadius: 2,
                            backgroundColor: question.correctOptions?.includes(optionIndex) 
                              ? correctAnswerBgColor 
                              : 'transparent',
                            '&:hover': {
                              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                            }
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateTemplate; 