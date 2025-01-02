import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const auth = useSelector(state => state.auth);

  if (auth.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!auth.isAuthenticated && !auth.loading) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;