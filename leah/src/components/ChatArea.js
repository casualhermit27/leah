import { Box, TextField, Button, Typography, Grid, CircularProgress, IconButton, Tooltip, Paper, ClickAwayListener, Chip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EmailIcon from '@mui/icons-material/Email';
import ArticleIcon from '@mui/icons-material/Article';
import ChatMessage from './ChatMessage';
import { useState, useEffect, useRef, useCallback } from 'react';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import DescriptionIcon from '@mui/icons-material/Description';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { MODEL_CONFIG, checkModelAvailability } from '../utils/modelConfig';

// Add a consistent width for all content
const CONTENT_WIDTH = 'calc(100% - 96px)';
const MAX_CONTENT_WIDTH = '1000px';

// Add model constants
const MODELS = {
  general: "llama2",
  medical: "pubmedbert",
  financial: "finbert"
};

// Add model metadata
const MODEL_INFO = {
  general: {
    name: "LLaMA 2",
    color: "#4F46E5",
    description: "General purpose AI",
    icon: <SmartToyIcon />
  },
  medical: {
    name: "PubMedBERT",
    color: "#059669",
    description: "Medical research specialist",
    icon: <LocalHospitalIcon />
  },
  financial: {
    name: "FinBERT",
    color: "#0EA5E9",
    description: "Financial Analysis Expert",
    icon: <ShowChartIcon />,
    capabilities: [
      "Financial Analysis",
      "Market Insights",
      "Investment Research",
      "Risk Assessment"
    ]
  }
};

// Add specific financial prompts
const FINANCIAL_CONTEXTS = {
  sentiment: "Analyze the sentiment and implications for financial markets.",
  analysis: "Provide detailed financial analysis with market context.",
  risk: "Assess potential risks and opportunities.",
  metrics: "Analyze key financial metrics and indicators."
};

// Add function to process and highlight important points
const processResponseWithHighlights = async (text, domain) => {
  try {
    const highlightPrompt = `
      Analyze this text and identify the key points that should be highlighted:
      "${text}"
      
      Rules:
      - Identify 2-4 most important phrases or sentences
      - Focus on key insights, numbers, or conclusions
      - Keep original text intact
      - Return JSON format with 'text' and 'highlights' array of {start, end} positions
      
      Example response format:
      {
        "text": "original text here",
        "highlights": [
          {"start": 10, "end": 25},
          {"start": 45, "end": 60}
        ]
      }
    `;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELS[domain || 'general'],
        prompt: highlightPrompt,
        stream: false,
        options: {
          temperature: 0.3
        }
      })
    });

    const data = await response.json();
    try {
      const parsed = JSON.parse(data.response);
      return parsed;
    } catch (e) {
      console.error('Failed to parse highlights:', e);
      return { text, highlights: [] };
    }
  } catch (error) {
    console.error('Error processing highlights:', error);
    return { text, highlights: [] };
  }
};

function ChatArea({ chatSessions, setChatSessions, currentChatId, setCurrentChatId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('general');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsList, setSuggestionsList] = useState([]);
  const suggestionTimeout = useRef(null);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isModelAvailable, setIsModelAvailable] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);

  // Load messages when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      const chat = chatSessions.find(c => c.id === currentChatId);
      if (chat) {
        setMessages(chat.messages);
      }
    } else {
      setMessages([]); // Clear messages for new chat
    }
  }, [currentChatId, chatSessions]);

  // Generate title for chat
  const generateChatTitle = async (firstMessage, domain) => {
    try {
      let promptTemplate = '';
      
      switch(domain) {
        case 'medical':
          promptTemplate = `Create a concise medical topic title from this conversation: "${firstMessage}"
          Rules:
          - Use 2-4 words only
          - Be specific to the medical topic
          - Don't use generic words like "Discussion" or "Analysis"
          - Don't include any prefix or "Title:"
          
          Examples:
          - "Migraine Treatment Options"
          - "Diabetes Management Plan"
          - "Heart Health Assessment"`;
          break;
          
        case 'financial':
          promptTemplate = `Create a concise financial topic title from this conversation: "${firstMessage}"
          Rules:
          - Use 2-4 words only
          - Focus on the specific financial topic
          - Don't use generic words like "Analysis" or "Review"
          - Don't include any prefix or "Title:"
          
          Examples:
          - "Stock Portfolio Strategy"
          - "Retirement Fund Planning"
          - "Market Risk Evaluation"`;
          break;
          
        default:
          promptTemplate = `Create a concise topic title from this conversation: "${firstMessage}"
          Rules:
          - Use 2-4 words only
          - Be specific to the main topic
          - Make it clear and direct
          - Don't include any prefix or "Title:"
          
          Examples:
          - "Email Writing Tips"
          - "Python Code Review"
          - "Travel Itinerary Help"`;
      }

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODELS[domain || 'general'],
          prompt: promptTemplate,
          stream: false,
          options: {
            temperature: 0.7,
            max_tokens: 20
          }
        })
      });

      const data = await response.json();
      return data.response.trim().replace(/^[^a-zA-Z]+/, ''); // Remove any non-letter prefix
    } catch (error) {
      console.error('Error generating title:', error);
      return `New ${domain.charAt(0).toUpperCase() + domain.slice(1)} Chat`;
    }
  };

  // Add useEffect to check model availability
  useEffect(() => {
    const checkModel = async () => {
      if (selectedDomain) {
        const modelName = MODELS[selectedDomain];
        const available = await checkModelAvailability(modelName);
        setIsModelAvailable(available);
        if (!available) {
          console.error(`${modelName} model is not available`);
        }
      }
    };
    
    checkModel();
  }, [selectedDomain]);

  // Update the LoadingAnimation component
  function LoadingAnimation({ type = 'thinking' }) {
    const messages = {
      thinking: 'Analyzing your request',
      processing: 'Processing your input',
      typing: 'Composing response'
    };

  return (
      <Box sx={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: '16px',
        border: '1px solid rgba(79, 70, 229, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        px: 3,
        py: 1.5,
      }}>
        {/* Modern Wave Animation */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1.5,
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            height: '20px',
          }}>
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
      sx={{
                  width: '3px',
        height: '100%',
                  backgroundColor: '#4F46E5',
                  borderRadius: '3px',
                  animation: 'wave 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                  '@keyframes wave': {
                    '0%, 100%': {
                      transform: 'scaleY(0.5)',
                    },
                    '50%': {
                      transform: 'scaleY(1)',
                    },
                  },
                }}
              />
            ))}
          </Box>

          <Typography sx={{ 
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -2,
              left: 0,
              width: '100%',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(79, 70, 229, 0) 0%, rgba(79, 70, 229, 0.5) 50%, rgba(79, 70, 229, 0) 100%)',
              animation: 'shimmer 2s infinite',
              '@keyframes shimmer': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' }
              }
            }
          }}>
            {messages[type]}
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                overflow: 'hidden',
                animation: 'blink 1.5s steps(3) infinite',
                '@keyframes blink': {
                  '0%, 100%': { width: '4px' },
                  '50%': { width: '12px' }
                }
              }}
            >
              ...
            </Box>
        </Typography>
      </Box>
      </Box>
    );
  }

  // Then update the handleSendMessage function to show loading state immediately
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);

    // Add user message immediately
    const userMessage = {
      text: input,
      isAi: false,
      timestamp: new Date()
    };

    // Add loading message immediately
    const loadingMessage = {
      text: '',
      isAi: true,
      isLoading: true,
      timestamp: new Date()
    };

    // Update messages immediately to show loading state
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');

    let currentModel = MODELS[selectedDomain || 'general'];
    console.log('Using model:', currentModel);

    // Create new chat if none exists
    let chatId = currentChatId;
    if (!currentChatId) {
      chatId = Date.now().toString();
      const newChat = {
        id: chatId,
        title: 'New Chat',
        messages: [userMessage, loadingMessage], // Include loading message in new chat
        timestamp: new Date()
      };
      setChatSessions(prev => [newChat, ...prev]);
      setCurrentChatId(chatId);
    } else {
      // Update existing chat with loading state
      setChatSessions(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, userMessage, loadingMessage]
          };
        }
        return chat;
      }));
    }

    try {
      const modelConfig = MODEL_CONFIG[currentModel];
      if (!modelConfig) {
        throw new Error(`Configuration not found for model: ${currentModel}`);
      }

      const response = await fetch(`${modelConfig.baseUrl}/api/generate`, {
        method: 'POST',
        headers: modelConfig.headers,
        body: JSON.stringify({
          model: currentModel,
          prompt: getContextBasedOnDomain(),
          stream: false,
          options: {
            ...modelConfig.defaultParams
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const processedResponse = await processResponseWithHighlights(data.response, selectedDomain);
      
      const aiResponse = {
        text: processedResponse.text,
        highlights: processedResponse.highlights,
        isAi: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev.slice(0, -1), aiResponse]);

      // Generate title immediately after first exchange
      let chatTitle = 'New Chat';
      if (!currentChatId || messages.length === 0) {
        chatTitle = await generateChatTitle(userMessage.text, selectedDomain);
      }

      // Update chat session with new title
      setChatSessions(prev => prev.map(chat => {
        if (chat.id === chatId) {
          const updatedMessages = [...chat.messages.slice(0, -1), aiResponse];
          return {
            ...chat,
            messages: updatedMessages,
            title: chatTitle // Use the generated title
          };
        }
        return chat;
      }));

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        text: "I apologize, but I'm having trouble connecting to Ollama. Please make sure the Ollama service is running.",
        isAi: true,
        isError: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      
      // Update chat session with error
      setChatSessions(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages.slice(0, -1), errorMessage]
          };
        }
        return chat;
      }));
    }

    setIsLoading(false);
  };

  // Add domain-specific context generation
  const getContextBasedOnDomain = () => {
    const lastMessages = messages.slice(-3);
    const context = lastMessages
      .map(msg => `${msg.isAi ? 'Assistant' : 'User'}: ${msg.text}`)
      .join('\n');
    
    switch(selectedDomain) {
      case 'medical':
        return `You are a medical AI assistant. Be concise.
                Previous conversation:
                ${context}
                User: ${input}
                Assistant: Let me provide a brief medical analysis:`;
      
      case 'financial':
        return `You are a financial AI assistant. Be concise.
                Previous conversation:
                ${context}
                User: ${input}
                Assistant: Here's a brief financial analysis:`;
      
      default:
        return `Be concise.\n${context}\nUser: ${input}\nAssistant:`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSend = () => {
    handleSendMessage();
  };

  const handleFileAttach = (event) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setAttachments(prev => [...prev, ...files.map(file => ({
        type: 'file',
        file,
        name: file.name
      }))]);
    }
  };

  const handleImageAttach = (event) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments(prev => [...prev, {
            type: 'image',
            file,
            preview: reader.result,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Add this helper function for common search patterns
  const getCommonSearchPatterns = (text) => {
    const patterns = {
      'how': [
        'does', 'to', 'can', 'do', 'much', 'many', 'long', 'often', 'works'
      ],
      'what': [
        'is', 'are', 'if', 'happens', 'means', 'causes', 'should', 'would', 'could'
      ],
      'why': [
        'is', 'do', 'does', 'are', 'should', 'would', 'cant', "isn't", 'would'
      ],
      'can': [
        'you', 'i', 'we', 'they', 'it', 'someone', 'anyone', 'people', 'machines'
      ],
      'where': [
        'is', 'can', 'should', 'do', 'does', 'are', 'would', 'might', 'could'
      ]
    };

    // Get word patterns
    const words = text.toLowerCase().split(' ');
    const lastWord = words[words.length - 1];
    const firstWord = words[0];

    return { firstWord, lastWord, patterns };
  };

  // Update the getAISuggestions function
  const getAISuggestions = useCallback(async (text) => {
    try {
      const currentModel = MODELS[selectedDomain || 'general'];
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: currentModel,
          prompt: getDomainSpecificSuggestionPrompt(text),
          stream: false,
          options: {
            temperature: 0.2,
            max_tokens: 100,
          }
        })
      });

      const data = await response.json();
      let cleanedResponse = data.response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/[\r\n]/g, '')
        .trim();

      if (!cleanedResponse.startsWith('[')) {
        const match = cleanedResponse.match(/\[.*\]/);
        if (match) {
          cleanedResponse = match[0];
        }
      }

      const suggestions = JSON.parse(cleanedResponse);
      if (!Array.isArray(suggestions)) {
        throw new Error('Invalid suggestions format');
      }

      return suggestions.slice(0, 6);
    } catch (error) {
      console.error('Suggestion error:', error);
      return [];
    }
  }, [selectedDomain]);

  // Add domain-specific suggestion prompts
  const getDomainSpecificSuggestionPrompt = (text) => {
    switch(selectedDomain) {
      case 'medical':
        return `As a medical AI using PubMedBERT, generate 6 relevant medical search suggestions for: "${text}".
                Focus on medical terminology and healthcare-related queries.
                Return as JSON array.`;
      
      case 'financial':
        return `As a financial AI using FinBERT, generate 6 relevant financial search suggestions for: "${text}".
                Focus on financial terminology and market-related queries.
                Return as JSON array.`;
      
      default:
        return `Generate a JSON array of 6 search suggestions for: "${text}".
                Make them specific and contextual.`;
    }
  };

  // Update the useEffect to handle suggestions better
  useEffect(() => {
    const getSuggestions = async () => {
      if (!input || input.length < 3) {
        setSuggestionsList([]);
        setShowSuggestions(false);
        return;
      }

      setIsSuggestionsLoading(true);
      setShowSuggestions(true);

      try {
        const suggestions = await getAISuggestions(input);
        if (suggestions.length > 0) {
          setSuggestionsList(suggestions);
        } else {
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setShowSuggestions(false);
      } finally {
        setIsSuggestionsLoading(false);
      }
    };

    const timeoutId = setTimeout(getSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [input, getAISuggestions]);

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  // Update input handling
  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Show typing animation
    setIsTyping(true);
    
    // Clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    // Set new timeout
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleBack = () => {
    setCurrentChatId(null); // This will clear current chat
    setMessages([]); // Clear messages
    setSelectedDomain('general'); // Reset to general domain
  };

  // Add click away handler to close attachment menu when clicking outside
  const handleClickAway = () => {
    setIsOpen(false);
  };

  return (
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      height: 'calc(100vh - 32px)',
      position: 'relative',
      backgroundColor: '#FAF6F1',
      overflow: 'hidden',
      ml: '332px',
      mr: '16px',
      my: '16px',
      borderRadius: '24px',
    }}>
      {/* Add new wrapper Box with dark border and rounded corners */}
      <Box sx={{
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Main gradient blob */}
        <Box
          sx={{
            position: 'absolute',
            top: '5%',
            right: '10%',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle at center, rgba(255, 99, 132, 0.08) 0%, rgba(255, 99, 132, 0.05) 25%, rgba(255, 192, 203, 0.02) 50%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            transform: 'translate(10%, -10%)',
            animation: 'float 20s ease-in-out infinite',
            zIndex: 0,
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translate(10%, -10%) scale(1)',
              },
              '50%': {
                transform: 'translate(5%, -15%) scale(1.1)',
              }
            }
          }}
        />

        {/* Secondary softer gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle at center, rgba(255, 182, 193, 0.1) 0%, rgba(255, 192, 203, 0.05) 40%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'floatReverse 25s ease-in-out infinite',
            zIndex: 0,
            '@keyframes floatReverse': {
              '0%, 100%': {
                transform: 'translate(0, 0) scale(1)',
              },
              '50%': {
                transform: 'translate(-5%, 5%) scale(1.05)',
              }
            }
          }}
        />

        {/* Only show back button when there are messages */}
        {messages.length > 0 && (
          <Tooltip title="Back to Main" placement="right">
            <IconButton
              onClick={handleBack}
              sx={{
                backgroundColor: 'white',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: '#F9FAFB',
                },
                position: 'absolute',
                left: 0,
                top: 0,
                m: 2,
                width: 36,
                height: 36,
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 20, color: '#6B7280' }} />
            </IconButton>
          </Tooltip>
        )}

        {/* Your existing animated gradient orbs */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Primary Gradient */}
          <Box
            sx={{
              position: 'fixed',
              top: '20%',
              right: '15%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, rgba(99, 102, 241, 0) 70%)',
              filter: 'blur(60px)',
              animation: 'moveGradient1 20s ease infinite',
              zIndex: 0,
              '@keyframes moveGradient1': {
                '0%': {
                  transform: 'translate(0, 0) scale(1)',
                },
                '50%': {
                  transform: 'translate(-5%, 5%) scale(1.1)',
                },
                '100%': {
                  transform: 'translate(0, 0) scale(1)',
                },
              },
            }}
          />

          {/* Secondary Gradient */}
          <Box
            sx={{
              position: 'fixed',
              bottom: '30%',
              left: '10%',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, rgba(236, 72, 153, 0) 70%)',
              filter: 'blur(50px)',
              animation: 'moveGradient2 18s ease infinite',
              zIndex: 0,
              '@keyframes moveGradient2': {
                '0%': {
                  transform: 'translate(0, 0) scale(1)',
                },
                '50%': {
                  transform: 'translate(5%, -5%) scale(1.15)',
                },
                '100%': {
                  transform: 'translate(0, 0) scale(1)',
                },
              },
            }}
          />

          {/* Tertiary Gradient */}
          <Box
            sx={{
              position: 'fixed',
              top: '40%',
              left: '35%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(5, 150, 105, 0.05) 0%, rgba(5, 150, 105, 0) 70%)',
              filter: 'blur(45px)',
              animation: 'moveGradient3 22s ease infinite',
              zIndex: 0,
              '@keyframes moveGradient3': {
                '0%': {
                  transform: 'translate(0, 0) scale(1)',
                },
                '50%': {
                  transform: 'translate(-3%, 3%) scale(1.12)',
                },
                '100%': {
                  transform: 'translate(0, 0) scale(1)',
                },
              },
            }}
          />
        </Box>

        {/* Welcome Screen */}
        {messages.length === 0 && (
          <Box sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: CONTENT_WIDTH,
            maxWidth: MAX_CONTENT_WIDTH,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
            zIndex: 1,  // Added zIndex
        }}>
          <Typography sx={{ 
            fontSize: '2rem', 
            fontWeight: 600, 
              mb: 4,
              color: '#111827',
              width: '100%',
              textAlign: 'center',
            }}>
              Your AI Assistant <span style={{ color: '#9333EA' }}>Awaits</span>
          </Typography>

            {/* Domain Selection Pills with Icons */}
            <Box sx={{ 
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              mb: 6,
            }}>
              {/* General Domain Card */}
              <Box
                onClick={() => setSelectedDomain('general')}
                sx={{
                  width: 200,
                  height: 200,
                  backgroundColor: selectedDomain === 'general' ? 'rgba(99, 102, 241, 0.1)' : '#FFFFFF',
                  borderRadius: '16px',
                  border: '2px solid rgba(0, 0, 0, 0.2)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    borderColor: '#4F46E5',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '14px',
                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 28, color: '#4F46E5' }} />
                </Box>
          <Typography sx={{ 
                  fontSize: '1.1rem', 
            fontWeight: 600, 
                  color: '#111827',
          }}>
                  General Chat
          </Typography>
                <Typography sx={{ 
                  fontSize: '0.875rem',
              color: '#6B7280',
              textAlign: 'center',
                  px: 3,
                }}>
                  For everyday conversations and tasks
                </Typography>
              </Box>

              {/* Medical Domain Card */}
              <Box
                onClick={() => setSelectedDomain('medical')}
                sx={{
                  width: 200,
                  height: 200,
                  backgroundColor: selectedDomain === 'medical' ? 'rgba(5, 150, 105, 0.04)' : 'white',
                  borderRadius: '16px',
                  border: '2px solid rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    borderColor: '#059669',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '14px',
                    backgroundColor: 'rgba(5, 150, 105, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LocalHospitalIcon sx={{ fontSize: 28, color: '#059669' }} />
                </Box>
                <Typography sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  color: '#111827',
                }}>
                  Medical Model
                </Typography>
                <Typography sx={{ 
              fontSize: '0.875rem',
                  color: '#6B7280',
                  textAlign: 'center',
                  px: 3,
                }}>
                  For healthcare and medical topics
                </Typography>
              </Box>

              {/* Financial Domain Card */}
              <Box
                onClick={() => setSelectedDomain('financial')}
                sx={{
                  width: 200,
                  height: 200,
                  backgroundColor: selectedDomain === 'financial' ? 'rgba(14, 165, 233, 0.04)' : 'white',
                  borderRadius: '16px',
                  border: '2px solid rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    borderColor: '#0EA5E9',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '14px',
                    backgroundColor: 'rgba(14, 165, 233, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShowChartIcon sx={{ fontSize: 28, color: '#0EA5E9' }} />
                </Box>
                <Typography sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  color: '#111827',
                }}>
                  Finance Model
                </Typography>
                <Typography sx={{ 
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  textAlign: 'center',
                  px: 3,
                }}>
                  For finance and investment help
                </Typography>
              </Box>
            </Box>

            {/* Prompt Cards based on selected domain */}
            {selectedDomain && (
              <>
                <Typography sx={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  color: '#111827',
                  textAlign: 'center',
                  mb: 4,
                }}>
                  What would you like to do?
                </Typography>

                <Grid container spacing={2} sx={{ width: '100%' }}>
                  {selectedDomain === 'general' ? (
                    <>
                      <Grid item xs={6}>
              <PromptCard 
                          icon={<EmailIcon sx={{ color: '#4F46E5' }} />}
                          text="Help me write an email about..."
                          onClick={() => setInput("Help me write an email about ")}
              />
            </Grid>
                      <Grid item xs={6}>
              <PromptCard 
                          icon={<ArticleIcon sx={{ color: '#4F46E5' }} />}
                          text="Help me write an article about..."
                          onClick={() => setInput("Help me write an article about ")}
              />
            </Grid>
                    </>
                  ) : selectedDomain === 'medical' ? (
                    <>
                      <Grid item xs={6}>
              <PromptCard 
                          icon={<DescriptionIcon sx={{ color: '#059669' }} />}
                          text="Validate medical content..."
                          onClick={() => setInput("Validate this medical content: ")}
              />
            </Grid>
                      <Grid item xs={6}>
              <PromptCard 
                          icon={<FactCheckIcon sx={{ color: '#059669' }} />}
                          text="Check medical guidelines..."
                          onClick={() => setInput("Check these medical guidelines: ")}
              />
            </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={6}>
                        <PromptCard
                          icon={<AssessmentIcon sx={{ color: '#0EA5E9' }} />}
                          text="Analyze financial report..."
                          onClick={() => setInput("Analyze this financial report: ")}
                        />
          </Grid>
                      <Grid item xs={6}>
                        <PromptCard
                          icon={<TrendingUpIcon sx={{ color: '#0EA5E9' }} />}
                          text="Check market sentiment..."
                          onClick={() => setInput("Check market sentiment for: ")}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </>
            )}
          </Box>
        )}

        {/* Messages Container */}
        <Box
            sx={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: 4,
            pb: 2,
            gap: 3,  // Consistent spacing between messages
            borderRadius: '24px',
          }}
        >
              <Box sx={{
              width: CONTENT_WIDTH,
              maxWidth: MAX_CONTENT_WIDTH,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,  // Match the gap of the input area
            }}>
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message.text}
                  isAi={message.isAi}
                  isError={message.isError}
                  isLoading={message.isLoading}
                  timestamp={message.timestamp}
                  contentWidth={CONTENT_WIDTH}
                />
              ))}

              {/* Show different loading states */}
              {isLoading && <LoadingAnimation type="thinking" />}
              {isTyping && !isLoading && <LoadingAnimation type="processing" />}
              {messages.length > 0 && messages[messages.length - 1].isLoading && (
                <LoadingAnimation type="typing" />
              )}
            </Box>
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            position: 'relative',
            mt: 'auto',
            mb: 4,
            px: 4,
            py: 3,
            display: 'flex',
            justifyContent: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-140px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '1200px',
              height: '280px',
              background: `radial-gradient(
                50% 100% at 50% 100%, 
                rgba(99, 102, 241, 0.35) 0%,
                rgba(236, 72, 153, 0.25) 30%,
                rgba(99, 102, 241, 0.15) 50%,
                rgba(236, 72, 153, 0.08) 70%,
                transparent 100%
              )`,
              pointerEvents: 'none',
              zIndex: 0,
              animation: 'pulseSpotlight 4s ease-in-out infinite',
            },
            '@keyframes pulseSpotlight': {
              '0%, 100%': {
                opacity: 0.95,
                transform: 'translateX(-50%) scale(1)',
              },
              '50%': {
                opacity: 1,
                transform: 'translateX(-50%) scale(1.02)',
              },
            },
          }}
        >
          <ClickAwayListener onClickAway={handleClickAway}>
            <Box sx={{ 
              position: 'relative',
              width: '1000px',
              zIndex: 1,
            }}>
              <TextField
                fullWidth
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                multiline
                maxRows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    pr: 11,
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4F46E5',
                      borderWidth: '2px',
                    },
                  },
                }}
              />

              <AttachmentMenu
                onFileAttach={handleFileAttach}
                onImageAttach={handleImageAttach}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />

              <IconButton
                onClick={handleSend}
                disabled={!input.trim() && attachments.length === 0}
                sx={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#4F46E5',
                  '&:hover': {
                    backgroundColor: '#4338CA',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#E5E7EB',
                  },
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                }}
              >
                <SendIcon sx={{ color: 'white', fontSize: 20 }} />
              </IconButton>
            </Box>
          </ClickAwayListener>
        </Box>
      </Box>
    </Box>
  );
}

// Add the PromptCard component
function PromptCard({ icon, text, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2.5,
        backgroundColor: 'white',
        borderRadius: '12px',
        cursor: 'pointer',
        border: '2px solid rgba(0, 0, 0, 0.2)',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#F9FAFB',
          borderColor: 'rgba(0, 0, 0, 0.3)',
          transform: 'translateY(-1px)',
        },
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
      }}
    >
      {icon}
      <Typography sx={{ color: '#111827', fontSize: '0.875rem', lineHeight: 1.5 }}>
        {text}
      </Typography>
    </Box>
  );
}

// Add the DomainCard component
function DomainCard({ icon, title, description, onClick, color, capabilities }) {
  const domainKey = title.toLowerCase();
  const model = MODEL_INFO[domainKey] || MODEL_INFO.general;
  
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 3,
        backgroundColor: 'white',
        borderRadius: '16px',
        cursor: 'pointer',
        border: '2px solid rgba(0, 0, 0, 0.2)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        textAlign: 'center',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          border: `2px solid ${color}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <Box sx={{
        width: 64,
        height: 64,
        borderRadius: '16px',
        backgroundColor: `${color}10`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </Box>
      <Typography sx={{ 
        color: '#111827', 
        fontSize: '1.125rem',
        fontWeight: 600,
      }}>
        {title}
      </Typography>
      <Typography sx={{ 
        color: '#6B7280',
        fontSize: '0.875rem',
        lineHeight: 1.5,
        mb: 1,
      }}>
        {description}
      </Typography>
      {capabilities && (
        <Box sx={{ 
          display: 'flex', 
          gap: 0.5, 
          mt: 1,
          flexWrap: 'wrap'
        }}>
          {capabilities.map((cap, index) => (
            <Chip
              key={index}
              label={cap}
              size="small"
              sx={{
                backgroundColor: `${color}10`,
                color: color,
                fontSize: '0.65rem',
                height: '20px',
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

// Add this new component for the attachment menu
function AttachmentMenu({ onFileAttach, onImageAttach, isOpen, setIsOpen }) {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  return (
    <Box
      sx={{
        position: 'absolute',
        right: 76,
        bottom: '50%',
        transform: 'translateY(50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        zIndex: 1,
      }}
    >
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileAttach}
        style={{ display: 'none' }}
        multiple
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={onImageAttach}
        accept="image/*"
        style={{ display: 'none' }}
        multiple
      />

      {/* Attachment options with animation */}
      <Box sx={{
        display: 'flex',
        gap: 1,
        transition: 'all 0.3s ease',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateX(0)' : 'translateX(20px)',
        visibility: isOpen ? 'visible' : 'hidden',
      }}>
        <Tooltip title="Add Files" placement="top">
          <IconButton
            onClick={() => fileInputRef.current.click()}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: 'white',
              border: '2px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: '#F9FAFB',
                border: '2px solid rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            <AttachFileIcon sx={{ fontSize: 20, color: '#6B7280' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Add Images" placement="top">
          <IconButton
            onClick={() => imageInputRef.current.click()}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: 'white',
              border: '2px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: '#F9FAFB',
                border: '2px solid rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            <ImageIcon sx={{ fontSize: 20, color: '#6B7280' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Toggle button */}
      <Tooltip title={isOpen ? "Close" : "Add Attachments"} placement="top">
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            width: 36,
            height: 36,
            backgroundColor: 'white',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(45deg)' : 'none',
            '&:hover': {
              backgroundColor: '#F9FAFB',
              border: '2px solid rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <AddIcon sx={{ fontSize: 20, color: '#6B7280' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// Update the SuggestionsList component to show loading state
function SuggestionsList({ suggestions, onSelect, show, isLoading }) {
  if (!show) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        mb: 1,
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white',
        border: '1px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      {isLoading ? (
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          gap: 2 
        }}>
          <CircularProgress size={16} sx={{ color: '#6B7280' }} />
          <Typography sx={{ 
            fontSize: '0.875rem',
            color: '#6B7280',
          }}>
            Generating suggestions...
          </Typography>
        </Box>
      ) : suggestions.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography sx={{ 
            fontSize: '0.875rem',
            color: '#6B7280',
          }}>
            Type to get AI-powered suggestions
          </Typography>
        </Box>
      ) : (
        suggestions.map((suggestion, index) => (
          <Box
            key={index}
            onClick={() => onSelect(suggestion)}
            sx={{
              px: 2,
              py: 1.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#F4F3FF',
              },
            }}
          >
            <SmartToyIcon sx={{ fontSize: 18, color: '#6B7280' }} />
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: '#374151',
                fontWeight: 400,
              }}
            >
              {suggestion}
            </Typography>
          </Box>
        ))
      )}
    </Paper>
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

export default ChatArea; 