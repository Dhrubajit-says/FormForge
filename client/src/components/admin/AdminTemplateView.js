import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent
} from '@mui/material';
import axios from 'axios';

const AdminTemplateView = () => {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      await fetchTemplate();
    };
    fetchData();
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/admin/templates/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setTemplate(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching template');
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!template) return <Alert severity="info">Template not found</Alert>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {template.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Type: {template.type}
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Questions
          </Typography>
          {template.questions.map((question, index) => (
            <Card key={index} sx={{ mb: 3 }}>
              <CardContent>
                {question.image && (
                  <Box sx={{ mb: 2 }}>
                    <img 
                      src={question.image.startsWith('http') 
                        ? question.image 
                        : `http://localhost:5001${question.image}`
                      } 
                      alt={`Question ${index + 1}`}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        borderRadius: '4px',
                        display: 'block',
                        margin: '0 auto'
                      }} 
                    />
                  </Box>
                )}

                <Typography variant="h6" gutterBottom>
                  Question {index + 1}: {question.text}
                </Typography>

                {question.options && (
                  <Box sx={{ pl: 3 }}>
                    {question.options.map((option, optIndex) => (
                      <Typography 
                        key={optIndex}
                        variant="body2"
                        sx={{ 
                          color: 'text.primary'
                        }}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </Typography>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate(`/admin/templates/edit/${template._id}`)}
          >
            Edit Template
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/admin/users')}
          >
            Back to Users
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminTemplateView; 