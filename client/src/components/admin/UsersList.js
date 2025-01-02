import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  Collapse,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Block as BlockIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import UserTemplates from './UserTemplates';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [viewTemplateId, setViewTemplateId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.msg || 'Error fetching users');
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminAPI.deleteUser(userToDelete._id);
      setUsers(users.filter(user => user._id !== userToDelete._id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Delete user error:', err);
      setError(err.response?.data?.msg || 'Error deleting user');
    }
  };

  const toggleUserExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const handleBlockUser = async (user) => {
    try {
      await adminAPI.toggleUserBlock(user._id);
      // Refresh user list
      fetchUsers();
    } catch (err) {
      console.error('Block user error:', err);
      setError(err.response?.data?.msg || 'Error blocking user');
    }
  };

  const handleToggleAdmin = async (user) => {
    try {
      await adminAPI.toggleUserRole(user._id);
      // Refresh user list
      fetchUsers();
    } catch (err) {
      console.error('Toggle admin error:', err);
      setError(err.response?.data?.msg || 'Error updating user role');
    }
  };

  const handleEditTemplate = (templateId) => {
    // Navigate to template edit page
    window.location.href = `/admin/templates/${templateId}`;
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await adminAPI.deleteTemplateAsAdmin(templateId);
      setSnackbar({
        open: true,
        message: 'Template deleted successfully',
        severity: 'success'
      });
      fetchUsers(); // Refresh the list
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete template',
        severity: 'error'
      });
    }
  };

  const handleViewTemplates = (user) => {
    setSelectedUser(user);
    setShowTemplates(true);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Manage Users
        </Typography>
        
        {/* Search Box */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
        />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {users.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Templates</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <React.Fragment key={user._id}>
                    <TableRow>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={user.role}
                            color={user.role === 'admin' ? 'primary' : 'default'}
                            size="small"
                          />
                          {user.isBlocked && (
                            <Chip 
                              label="Blocked"
                              color="error"
                              size="small"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {user.templates.length} templates
                          <IconButton
                            size="small"
                            onClick={() => toggleUserExpand(user._id)}
                          >
                            {expandedUser === user._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title={user.isBlocked ? "Unblock User" : "Block User"}>
                            <IconButton
                              color={user.isBlocked ? "error" : "default"}
                              onClick={() => handleBlockUser(user)}
                              disabled={user.role === 'admin'}
                            >
                              <BlockIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.role === 'admin' ? "Remove Admin" : "Make Admin"}>
                            <IconButton
                              color={user.role === 'admin' ? "primary" : "default"}
                              onClick={() => handleToggleAdmin(user)}
                            >
                              <AdminIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(user)}
                              disabled={user.role === 'admin'}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} sx={{ py: 0 }}>
                        <Collapse in={expandedUser === user._id}>
                          <Box sx={{ py: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Templates:
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Title</TableCell>
                                  <TableCell>Type</TableCell>
                                  <TableCell>Questions</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {user.templates.map((template) => (
                                  <TableRow key={template._id}>
                                    <TableCell>{template.title}</TableCell>
                                    <TableCell>{template.type}</TableCell>
                                    <TableCell>{template.questionCount}</TableCell>
                                    <TableCell align="right">
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Tooltip title="Edit Template">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleEditTemplate(template._id)}
                                          >
                                            <EditIcon />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Template">
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteTemplate(template._id)}
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {userToDelete?.username}? This will also delete all their templates.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Templates Dialog */}
      <UserTemplates
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        user={selectedUser}
      />

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

export default UsersList; 