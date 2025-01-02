import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, CircularProgress, Alert } from '@mui/material';
import { adminAPI } from '../../services/api';
import TemplatesList from '../templates/TemplatesList';

const UserTemplatesView = () => {
  const { userId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserTemplates = async () => {
      try {
        const response = await adminAPI.getUserTemplates(userId);
        setTemplates(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user templates:', err);
        setError('Failed to load templates');
        setLoading(false);
      }
    };

    fetchUserTemplates();
  }, [userId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        User Templates
      </Typography>
      <TemplatesList templates={templates} viewOnly={true} />
    </Container>
  );
};

export default UserTemplatesView; 