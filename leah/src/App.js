import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import { useState } from 'react';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#818CF8',
      light: '#A5B4FC',
    },
    secondary: {
      main: '#9333EA',
      light: '#A855F7',
    },
    background: {
      default: '#E2E4EA',
      paper: '#D8DCE3',
    },
    text: {
      primary: '#3A4558',
      secondary: '#576174',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      color: '#F9FAFB',
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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#D8DCE3',
        },
      },
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleLoadComplete = () => {
    setIsLoading(false);
    setTimeout(() => setShowContent(true), 100);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        overflow: 'hidden',
        height: '100vh',
        width: '100vw',
      }}>
        {isLoading && <LoadingScreen onLoadComplete={handleLoadComplete} />}
        <Box sx={{ 
          display: 'flex', 
          height: '100%',
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'scale(1)' : 'scale(0.98)',
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          '& > *': {
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          },
          '& > *:nth-of-type(1)': {
            transitionDelay: '0.2s',
          },
          '& > *:nth-of-type(2)': {
            transitionDelay: '0.4s',
          },
        }}>
          <Layout />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
