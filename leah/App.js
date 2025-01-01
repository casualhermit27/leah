import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Layout from './src/components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7C3AED',
      light: '#8B5CF6',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Layout />
      </Box>
    </ThemeProvider>
  );
}

export default App; 