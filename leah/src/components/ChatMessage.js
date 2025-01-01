import { Box, Typography, Avatar, IconButton } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import { useState } from 'react';

function ChatMessage({ message, isAi, isError, timestamp, isLoading, highlights = [] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // AI and User colors
  const aiColor = {
    bg: 'rgba(99, 102, 241, 0.08)',
    border: 'rgba(99, 102, 241, 0.15)',
    hover: 'rgba(99, 102, 241, 0.12)',
    text: '#334155'
  };

  const userColor = {
    bg: 'rgba(249, 115, 22, 0.06)',
    border: 'rgba(249, 115, 22, 0.12)',
    hover: 'rgba(249, 115, 22, 0.09)',
    text: '#334155'
  };

  const renderHighlightedText = (text, highlights) => {
    if (!highlights || highlights.length === 0) return text;

    let lastIndex = 0;
    const parts = [];

    highlights.sort((a, b) => a.start - b.start).forEach((highlight, index) => {
      // Add non-highlighted text before this highlight
      if (highlight.start > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, highlight.start)}
          </span>
        );
      }

      // Add highlighted text with box style
      parts.push(
        <Box
          component="span"
          key={`highlight-${index}`}
          sx={{
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '4px',
            px: 1,
            py: 0.5,
            mx: 0.5,
            color: '#111827',
          }}
        >
          {text.slice(highlight.start, highlight.end)}
        </Box>
      );

      lastIndex = highlight.end;
    });

    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  const renderMessage = (text) => {
    if (!isAi) return text;

    // Check if the text starts with "Assistant:"
    if (!text.includes('Assistant:')) {
      return text;
    }

    // Get the first line (heading) and the rest of the content
    const [heading, ...rest] = text.split('\n');

    // Join the rest of the content and split by "Assistant:"
    const points = rest.join('\n')
      .split('Assistant:')
      .map(point => point.trim())
      .filter(point => point.length > 0);

    return (
      <Box>
        <Typography sx={{ 
          mb: 2, 
          color: '#334155'
        }}>
          {heading}
        </Typography>
        <Box component="ul" sx={{ 
          m: 0, 
          pl: 3,
          color: '#334155'
        }}>
          {points.map((point, index) => (
            <Box 
              component="li" 
              key={index}
              sx={{ 
                mb: index < points.length - 1 ? 2 : 0,
                '&::marker': {
                  color: '#6366F1',
                }
              }}
            >
              {point}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: isAi ? 'flex-start' : 'flex-end',
        px: 4,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          maxWidth: '85%',
          flexDirection: isAi ? 'row' : 'row-reverse',
        }}
      >
        {/* Profile Avatar */}
        <Avatar
          sx={{
            width: 32,
            height: 32,
            borderRadius: '10px',
            backgroundColor: isAi ? 'rgba(79, 70, 229, 0.1)' : 'rgba(249, 115, 22, 0.1)',
            border: '1.5px solid',
            borderColor: isAi ? aiColor.border : userColor.border,
            marginTop: '4px',
            flexShrink: 0, // Prevent avatar from shrinking
          }}
        >
          {isAi ? (
            <SmartToyIcon sx={{ color: '#4F46E5', fontSize: 16 }} />
          ) : (
            <PersonIcon sx={{ color: '#F97316', fontSize: 16 }} />
          )}
        </Avatar>

        {/* Message Content */}
        <Box
          sx={{
            display: 'inline-flex',
            minWidth: isAi ? '400px' : 'auto',
            maxWidth: isAi ? '800px' : '600px',
            position: 'relative', // For timestamp positioning
          }}
        >
          <Box
            sx={{
              backgroundColor: isAi ? aiColor.bg : userColor.bg,
              borderRadius: '16px',
              p: 3,
              width: '100%',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: isAi ? aiColor.hover : userColor.hover,
              },
            }}
          >
            {isLoading ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
              }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 3,
                        height: 3,
                        backgroundColor: '#4F46E5',
                        borderRadius: '50%',
                        opacity: 0.8,
                        animation: 'loadingWave 1.4s ease-in-out infinite',
                        animationDelay: `${i * 0.16}s`,
                        '@keyframes loadingWave': {
                          '0%, 100%': {
                            transform: 'translateY(0)',
                          },
                          '50%': {
                            transform: 'translateY(-4px)',
                          }
                        },
                      }}
                    />
                  ))}
                </Box>
                <Typography sx={{ 
                  color: '#4F46E5',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}>
                  thinking...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Typography 
                  component="div"
                  sx={{ 
                    color: isError ? '#EF4444' : (isAi ? '#111827' : '#111827'),
                    lineHeight: 1.7,
                    fontSize: '0.875rem',
                    fontWeight: 450,
                    letterSpacing: '0.01em',
                    whiteSpace: 'pre-wrap',
                    flex: 1,
                  }}
                >
                  {isAi ? renderMessage(message) : message}
                </Typography>

                {/* Always visible Copy Button for AI messages */}
                {isAi && !isLoading && (
                  <IconButton
                    onClick={handleCopy}
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      backgroundColor: copied ? 'rgba(5, 150, 105, 0.1)' : 'rgba(79, 70, 229, 0.04)',
                      border: '1px solid',
                      borderColor: copied ? 'rgba(5, 150, 105, 0.2)' : aiColor.border,
                      borderRadius: '8px',
                      padding: '4px',
                      minWidth: '28px',
                      height: '28px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: copied ? 'rgba(5, 150, 105, 0.15)' : 'rgba(79, 70, 229, 0.08)',
                      },
                    }}
                  >
                    {copied ? (
                      <DoneIcon sx={{ 
                        fontSize: 14,
                        color: '#059669',
                        transition: 'all 0.2s ease',
                      }} />
                    ) : (
                      <ContentCopyIcon sx={{ 
                        fontSize: 14,
                        color: '#4F46E5',
                        transition: 'all 0.2s ease',
                      }} />
                    )}
                  </IconButton>
                )}
              </Box>
            )}
          </Box>

          {/* Timestamp positioned relative to message bubble */}
          {timestamp && !isLoading && (
            <Typography 
              sx={{ 
                fontSize: '0.65rem', 
                color: '#64748B',
                opacity: 0.9,
                position: 'absolute',
                bottom: -20,
                ...(isAi ? {
                  left: 0,
                } : {
                  right: 0,
                }),
              }}
            >
              {new Date(timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function Dot({ delay }) {
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        backgroundColor: '#6B7280',
        borderRadius: '50%',
        animation: 'dotPulse 1.5s infinite',
        animationDelay: `${delay}s`,
        '@keyframes dotPulse': {
          '0%, 100%': {
            transform: 'scale(0.6)',
            opacity: 0.4,
          },
          '50%': {
            transform: 'scale(1)',
            opacity: 1,
          },
        },
      }}
    />
  );
}

export default ChatMessage; 