import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Avatar,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Divider,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
  Button,
  styled
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  QuestionAnswer as QuizIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { templateAPI, authAPI } from '../../services/api';

const TextField = styled(MuiTextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
  }
}));

const Profile = () => {
  const auth = useSelector(state => state.auth);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [templates, setTemplates] = useState([]);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await templateAPI.getTemplates();
        const userTemplates = response.data.filter(
          template => template.creator === auth.user._id
        );
        setTemplates(userTemplates);
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    };

    fetchTemplates();
  }, [auth.user._id]);

  // Function to get initials from username
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Function to get random pastel color
  const getRandomPastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 85%)`;
  };

  const handleViewTemplate = (id) => {
    navigate(`/templates/${id}`);
  };

  const handleEditTemplate = (id) => {
    navigate(`/templates/edit/${id}`);
  };

  const handleDeleteTemplate = async (id) => {
    try {
      if (window.confirm('Are you sure you want to delete this template?')) {
        await templateAPI.deleteTemplate(id);
        
        // Update the templates list after deletion
        setTemplates(templates.filter(template => template._id !== id));
        
        // You could also refetch the templates if you prefer
        // const response = await templateAPI.getTemplates();
        // const userTemplates = response.data.filter(
        //   template => template.creator === auth.user._id
        // );
        // setTemplates(userTemplates);
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      // You might want to show an error message to the user
      alert('Failed to delete template');
    }
  };

  const handleChangePassword = async () => {
    try {
      setPasswordError('');
      setPasswordSuccess('');

      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters long');
        return;
      }

      // Call API to change password
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      console.log('Password change response:', response);

      setPasswordSuccess('Password changed successfully');
      setTimeout(() => {
        setOpenPasswordDialog(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }, 1500);
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(err.response?.data?.msg || 'Failed to change password');
    }
  };

  const renderChangePasswordDialog = () => (
    <Dialog 
      open={openPasswordDialog} 
      onClose={() => setOpenPasswordDialog(false)}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({
              ...prev,
              currentPassword: e.target.value
            }))}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({
              ...prev,
              newPassword: e.target.value
            }))}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({
              ...prev,
              confirmPassword: e.target.value
            }))}
            margin="normal"
          />
          {passwordError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {passwordError}
            </Typography>
          )}
          {passwordSuccess && (
            <Typography color="success.main" variant="body2" sx={{ mt: 1 }}>
              {passwordSuccess}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenPasswordDialog(false)}>
          Cancel
        </Button>
        <Button 
          onClick={handleChangePassword}
          variant="contained"
          disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
        >
          Change Password
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper 
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          textAlign: 'center',
          borderRadius: 2,
          background: isDarkMode 
            ? 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {auth.user.email}
          </Typography>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              margin: '0 auto',
              fontSize: '2.5rem',
              backgroundColor: getRandomPastelColor(),
              color: '#000000',
              border: '4px solid',
              borderColor: isDarkMode ? 'grey.800' : 'grey.200'
            }}
          >
            {getInitials(auth.user.username)}
          </Avatar>
        </Box>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            background: isDarkMode 
              ? 'linear-gradient(45deg, #fff 30%, #f5f5f5 90%)'
              : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: isDarkMode ? 'white' : 'transparent',
          }}
        >
          {auth.user.username}
        </Typography>
        <Chip 
          label={`Role: ${auth.user.role}`}
          color={auth.user.role === 'admin' ? 'primary' : 'default'}
          sx={{ mt: 1 }}
        />
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={() => setOpenPasswordDialog(true)}
            size="small"
          >
            Change Password
          </Button>
        </Box>
      </Paper>

      {/* Templates Grid */}
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          mb: 3,
          pl: 1,
          borderLeft: '4px solid',
          borderColor: 'primary.main'
        }}
      >
        My Templates
      </Typography>
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template._id}>
            <Card 
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                  {template.title}
                </Typography>
                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    size="small"
                    icon={<QuizIcon />}
                    label={template.type}
                    color="primary"
                    variant="outlined"
                  />
                  {template.type === 'test' && (
                    <Chip
                      size="small"
                      icon={<TimeIcon />}
                      label={`${template.duration} min`}
                      variant="outlined"
                    />
                  )}
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 1
                  }}
                >
                  {template.description || 'No description provided'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Questions: {template.questions?.length || 0}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                <Tooltip title="View">
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewTemplate(template._id)}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton 
                    size="small"
                    onClick={() => handleEditTemplate(template._id)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    size="small"
                    color="error"
                    onClick={() => handleDeleteTemplate(template._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {templates.length === 0 && (
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                backgroundColor: isDarkMode ? 'background.paper' : 'grey.50'
              }}
            >
              <Typography color="text.secondary">
                No templates created yet
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      {renderChangePasswordDialog()}
    </Container>
  );
};

export default Profile; 