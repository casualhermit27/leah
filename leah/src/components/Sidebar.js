import { 
  Box, 
  Button, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import HistoryIcon from '@mui/icons-material/History';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useState } from 'react';

function Sidebar({ chatSessions, currentChatId, onChatSelect, onNewChat }) {
  const [showStats, setShowStats] = useState(true);

  const handleNewChat = () => {
    onNewChat();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        width: '300px',
        height: 'calc(100vh - 32px)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Header with User Profile */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            backgroundColor: '#F3F4F6',
            color: '#4B5563',
            border: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <PersonOutlineIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
            }}
          >
            John Doe
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#9CA3AF',
            }}
          >
            Premium Account
          </Typography>
        </Box>
        <Tooltip title="Settings">
          <IconButton
            sx={{
              width: 36,
              height: 36,
              color: '#6B7280',
              backgroundColor: '#F3F4F6',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              '&:hover': { 
                backgroundColor: '#E5E7EB',
                color: '#374151',
              },
            }}
          >
            <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Enhanced New Chat Button with animation */}
      <Box sx={{ 
        px: 2.5, 
        pt: 3,
        pb: 3,
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ChatIcon sx={{ fontSize: 20 }} />}
          onClick={handleNewChat}
          sx={{
            backgroundColor: '#F3F4F6',
            color: '#374151',
            textTransform: 'none',
            py: 1.5,
            borderRadius: '12px',
            boxShadow: 'none',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: '#E5E7EB',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            },
            '&:active': {
              transform: 'translateY(0)',
            }
          }}
        >
          New Chat
        </Button>
      </Box>

      {/* Chat Statistics */}
      <Box sx={{
        px: 2.5,
        py: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        animation: 'fadeIn 0.3s ease-in-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Typography sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Chat Statistics
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            opacity: 0.7,
            '&:hover': { opacity: 1 },
            transition: 'opacity 0.2s ease'
          }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 3,
                  height: 3,
                  backgroundColor: '#6366F1',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.5)' },
                  }
                }}
              />
            ))}
          </Box>
        </Box>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2 
        }}>
          <StatCard 
            title="Total Chats"
            value={chatSessions.length}
            subtitle="All time"
            color="#818CF8"
          />
          <StatCard 
            title="Active Chats"
            value={chatSessions.filter(chat => 
              chat.messages?.some(msg => 
                new Date(msg.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              )
            ).length}
            subtitle="Last 24h"
            color="#34D399"
          />
        </Box>
      </Box>

      {/* Recent Chats Section */}
      <Box sx={{ 
        px: 2.5, 
        py: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      }}>
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Recent Chats
        </Typography>
      </Box>

      {/* Chat List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 1,
          '&::-webkit-scrollbar': { 
            width: '4px',
            marginRight: '2px',
          },
          '&::-webkit-scrollbar-track': { 
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#E5E7EB',
            borderRadius: '10px',
            '&:hover': {
              background: '#D1D5DB',
            },
          },
        }}
      >
        {chatSessions.map(chat => (
          <Box
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            sx={{
              mb: 0.5,
              '&:last-child': {
                mb: 0,
              },
            }}
          >
            <Button
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                px: 2,
                borderRadius: '10px',
                backgroundColor: chat.id === currentChatId ? '#F9FAFB' : 'transparent',
                color: chat.id === currentChatId ? '#111827' : '#6B7280',
                '&:hover': {
                  backgroundColor: chat.id === currentChatId ? '#F9FAFB' : '#F3F4F6',
                },
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                width: '100%',
              }}>
                <ChatIcon sx={{ 
                  fontSize: 18,
                  color: chat.id === currentChatId ? '#4B5563' : '#9CA3AF',
                }} />
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: chat.id === currentChatId ? 500 : 400,
                    color: 'inherit',
                    flex: 1,
                    textAlign: 'left',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {chat.title}
                </Typography>
              </Box>
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// New StatCard component
function StatCard({ title, value, subtitle, color }) {
  return (
    <Box sx={{
      p: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      borderRadius: '12px',
      border: '1px solid rgba(0, 0, 0, 0.04)',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        transform: 'translateY(-1px)',
      }
    }}>
      <Typography sx={{
        fontSize: '0.75rem',
        color: '#6B7280',
        mb: 0.5
      }}>
        {title}
      </Typography>
      <Typography sx={{
        fontSize: '0.65rem',
        color: '#9CA3AF',
        mb: 1
      }}>
        {subtitle}
      </Typography>
      <Typography sx={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: color,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        {value}
        <Box
          sx={{
            width: 6,
            height: 6,
            backgroundColor: color,
            borderRadius: '50%',
            animation: 'glow 2s ease-in-out infinite',
          }}
        />
      </Typography>
    </Box>
  );
}

export default Sidebar; 