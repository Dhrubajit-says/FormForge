import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  styled
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useTheme } from '../../context/ThemeContext';

// Add styled component for the logo
const LogoText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 700,
  letterSpacing: '1px',
  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  fontFamily: "'Poppins', sans-serif",
  fontSize: '1.8rem',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&:hover': {
    transform: 'scale(1.02)',
    transition: 'transform 0.3s ease'
  }
}));

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode, toggleTheme } = useTheme();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const auth = useSelector(state => state.auth);
  const isAdmin = auth.user?.role === 'admin';
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const [anchorEl, setAnchorEl] = useState(null);

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: 'linear-gradient(45deg, #003366 30%, #0f52ba 90%)', // Deeper blue gradient
        boxShadow: '0 3px 5px 2px rgba(26, 35, 126, .3)'
      }}
    >
      <Toolbar>
        <LogoText 
          component={RouterLink} 
          to={isAuthenticated ? '/dashboard' : '/'}
          sx={{ flexGrow: 1, textDecoration: 'none' }}
        >
          Form<span style={{ color: '#4fc3f7' }}>Forge</span>
        </LogoText>
        <Box>
          {isAuthenticated ? (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/profile"
              >
                Profile
              </Button>
              {isAdmin && (
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/admin/users"
                >
                  Admin Dashboard
                </Button>
              )}
              <IconButton
                color="inherit"
                onClick={handleSettingsClick}
              >
                <SettingsIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={toggleTheme}>
                  <ListItemIcon>
                    {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </ListItemIcon>
                  <ListItemText>
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={isHomePage ? {
                  border: '1px solid white',
                  mr: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                } : {}}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/register"
                sx={isHomePage ? {
                  border: '1px solid white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                } : {}}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
