import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

function LoadingScreen({ onLoadComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(prev => Math.min(prev + 0.8, 100));
      } else {
        setTimeout(onLoadComplete, 800);
      }
    }, 30);

    return () => clearTimeout(timer);
  }, [progress, onLoadComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        opacity: progress === 100 ? 0 : 1,
        transform: progress === 100 ? 'scale(1.1)' : 'scale(1)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        zIndex: 9999,
      }}
    >
      {/* Wave Animation Container */}
      <Box sx={{
        position: 'relative',
        width: '160px',
        height: '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 4,
      }}>
        {/* Enhanced Animated Waves */}
        {[...Array(4)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: '1.5px solid #4F46E5',
              borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
              animation: 'waveMorph 8s ease-in-out infinite',
              animationDelay: `${i * 0.4}s`,
              opacity: 0.15 + (i * 0.1),
              filter: 'blur(0.3px)',
              '@keyframes waveMorph': {
                '0%, 100%': {
                  borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                  transform: 'rotate(0deg) scale(1)',
                },
                '25%': {
                  borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                  transform: 'rotate(90deg) scale(1.1)',
                },
                '50%': {
                  borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
                  transform: 'rotate(180deg) scale(1)',
                },
                '75%': {
                  borderRadius: '60% 40% 30% 70% / 40% 50% 60% 50%',
                  transform: 'rotate(270deg) scale(1.1)',
                }
              }
            }}
          />
        ))}
      </Box>

      {/* LEAH Text with Gradient */}
      <Typography
        sx={{
          fontSize: '1.8rem',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #4F46E5, #818CF8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.15em',
          animation: 'fadeInUp 0.5s ease-out',
          '@keyframes fadeInUp': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        LEAH
      </Typography>

      {/* Progress Bar with Gradient Glow */}
      <Box
        sx={{
          width: '200px',
          height: '4px',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
          mt: 2,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
            borderRadius: '4px',
            transition: 'width 0.3s ease-out',
            boxShadow: '0 0 10px rgba(79, 70, 229, 0.4)',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
              animation: 'shimmer 2s infinite',
            },
            '@keyframes shimmer': {
              '0%': { transform: 'translateX(-200%)' },
              '100%': { transform: 'translateX(200%)' }
            }
          }}
        />
      </Box>
    </Box>
  );
}

export default LoadingScreen; 