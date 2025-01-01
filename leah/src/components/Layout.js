import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { useState } from 'react';

function Layout() {
  const [chatSessions, setChatSessions] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('general');

  const loadChat = (chatId) => {
    const chat = chatSessions.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
    }
  };

  const createNewChat = () => {
    setCurrentChatId(null); // This will trigger a new chat in ChatArea
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh' }}>
      <Sidebar 
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onChatSelect={loadChat}
        onNewChat={createNewChat}
        selectedDomain={selectedDomain}
        setSelectedDomain={setSelectedDomain}
      />
      <ChatArea 
        chatSessions={chatSessions}
        setChatSessions={setChatSessions}
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
        selectedDomain={selectedDomain}
      />
    </Box>
  );
}

export default Layout; 