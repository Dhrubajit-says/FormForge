import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Box,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon, 
  Quiz as QuizIcon, 
  Timer as TimerIcon, 
  Assignment as QuestionnaireIcon,
  Add as AddIcon,
  Search as SearchIcon 
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { templateAPI } from '../../services/api';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const TemplatesList = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateAPI.getTemplates();
      setTemplates(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to fetch templates');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await templateAPI.deleteTemplate(id);
        setSnackbar({
          open: true,
          message: 'Template deleted successfully',
          severity: 'success'
        });
        fetchTemplates();
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete template',
          severity: 'error'
        });
      }
    }
  };

  const getTypeInfo = (type) => {
    switch (type) {
      case 'quiz':
        return {
          label: 'Quiz',
          icon: <QuizIcon sx={{ ml: 1 }} />,
          color: 'primary.main'
        };
      case 'test':
        return {
          label: 'Test',
          icon: <TimerIcon sx={{ ml: 1 }} />,
          color: 'warning.main'
        };
      case 'questionnaire':
        return {
          label: 'Questionnaire',
          icon: <QuestionnaireIcon sx={{ ml: 1 }} />,
          color: 'success.main'
        };
      default:
        return {
          label: 'Quiz',
          icon: <QuizIcon sx={{ ml: 1 }} />,
          color: 'primary.main'
        };
    }
  };

  const handleShare = (template) => {
    setSelectedTemplate(template);
    setShareDialogOpen(true);
  };

  const getShareableLink = (templateId) => {
    return `${window.location.origin}/templates/share/${templateId}`;
  };

  const handleCopyLink = async () => {
    const link = getShareableLink(selectedTemplate._id);
    try {
      await navigator.clipboard.writeText(link);
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to copy link',
        severity: 'error'
      });
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Your Templates</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/templates/new"
            startIcon={<AddIcon />}
          >
            Create New Template
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : filteredTemplates.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {searchQuery ? 'No templates found matching your search' : 'No templates found. Create your first template!'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredTemplates.map((template) => (
            <Grid item xs={12} md={6} lg={4} key={template._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {template.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {template.description}
                  </Typography>
                  <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`${template.questions.length} Questions`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {template.type === 'test' && (
                      <Chip 
                        label={`${template.duration} mins`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                    <Chip 
                      label={new Date(template.createdAt).toLocaleDateString()}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: getTypeInfo(template.type).color 
                  }}>
                    <Typography variant="subtitle2">
                      Type: {getTypeInfo(template.type).label}
                    </Typography>
                    {getTypeInfo(template.type).icon}
                  </Box>
                  {template.type === 'test' && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Duration: {template.duration} minutes
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => navigate(`/templates/${template._id}`)}
                    title="View Template"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => navigate(`/templates/edit/${template._id}`)}
                    title="Edit Template"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete(template._id)}
                    title="Delete Template"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Tooltip title="Share Template">
                    <IconButton 
                      size="small"
                      onClick={() => handleShare(template)}
                    >
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Template</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={selectedTemplate ? getShareableLink(selectedTemplate._id) : ''}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={handleCopyLink}>
                    <ContentCopyIcon />
                  </IconButton>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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
    </Container>
  );
};

export default TemplatesList; 