import { createTheme } from '@mui/material/styles';

const commonThemeSettings = {
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600
    },
    h2: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600
    },
    h3: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600
    },
    h4: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600
    },
    h5: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600
    },
    h6: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600
    },
    button: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 500
    },
    body1: {
      fontFamily: "'Poppins', sans-serif"
    },
    body2: {
      fontFamily: "'Poppins', sans-serif"
    }
  }
};

export const lightTheme = createTheme({
  ...commonThemeSettings,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  }
});

export const darkTheme = createTheme({
  ...commonThemeSettings,
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e'
    }
  }
});