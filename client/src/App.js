import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { lightTheme, darkTheme } from './theme';
import { useDispatch } from 'react-redux';
import { loadUser } from './features/auth/authSlice';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/layout/Navbar';
import Home from './components/home/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import CreateTemplate from './components/templates/CreateTemplate';
import TemplatesList from './components/templates/TemplatesList';
import ViewTemplate from './components/templates/ViewTemplate';
import EditTemplate from './components/templates/EditTemplate';
import AnswerScriptsList from './components/templates/AnswerScriptsList';
import Profile from './components/profile/Profile';
import UsersList from './components/admin/UsersList';
import AdminTemplateView from './components/admin/AdminTemplateView';
import SharedTemplate from './components/templates/SharedTemplate';
import UserTemplatesView from './components/admin/UserTemplatesView';

// Add a wrapper component for content
const ContentWrapper = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(8), // Height of the AppBar
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default
}));

const ThemedApp = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.token) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  return (
    <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <ContentWrapper>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/templates"
                element={
                  <PrivateRoute>
                    <TemplatesList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/templates/new"
                element={
                  <PrivateRoute>
                    <CreateTemplate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/templates/:id"
                element={
                  <PrivateRoute>
                    <ViewTemplate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/templates/edit/:id"
                element={
                  <PrivateRoute>
                    <EditTemplate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/answer-scripts"
                element={
                  <PrivateRoute>
                    <AnswerScriptsList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute>
                    <UsersList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/templates/:id"
                element={
                  <PrivateRoute>
                    <AdminTemplateView />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/templates/edit/:id"
                element={
                  <PrivateRoute>
                    <CreateTemplate isEditing={true} isAdmin={true} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/templates/share/:id"
                element={<SharedTemplate />}
              />
              <Route 
                path="/admin/user-templates/:userId" 
                element={
                  <PrivateRoute>
                    <UserTemplatesView />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </ContentWrapper>
        </Box>
      </Router>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
