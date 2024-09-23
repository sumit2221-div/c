import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Typography,
} from '@mui/material';
import UserList from "./userlist.jsx";

const socket = io('https://real-time-chatting-fcs4.onrender.com', {
  auth: {
    token: sessionStorage.getItem('accessToken'),
  },
});

function Chat() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [typing, setTyping] = useState(false);
  const [userStatuses, setUserStatuses] = useState({});
  const [error, setError] = useState('');
  const accessToken = sessionStorage.getItem('accessToken');
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://real-time-chatting-fcs4.onrender.com/api/auth/users', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.status === 200) {
          setUsers(response.data);
        }
      } catch (error) {
        setError('Error fetching users. Please try again later.');
      }
    };

    fetchUsers();
  }, [accessToken]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('chat message', (msg) => {
      setChatHistory((prevChatHistory) => [...prevChatHistory, msg]);
      setMessage('');
      scrollToBottom();
    });

    return () => {
      socket.off('connect');
      socket.off('chat message');
    };
  }, []);

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  };

  const sendMessage = () => {
    if (selectedUser && message) {
      const msg = {
        sender: sessionStorage.getItem('userId'),
        receiver: selectedUser._id,
        content: message,
      };
      socket.emit('chat message', msg);
      setChatHistory((prevChatHistory) => [...prevChatHistory, msg]);
      setMessage('');
      scrollToBottom();
    } else {
      setError('Message content cannot be empty');
    }
  };

  useEffect(() => {
    if (selectedUser) {
      const fetchUserDetails = async () => {
        try {
          const response = await axios.get(`https://real-time-chatting-fcs4.onrender.com/api/auth/u/${selectedUser._id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (response.status === 200) {
            setSelectedUserDetails(response.data.user);
          }
        } catch (error) {
          setError('Error fetching user details.');
        }
      };
      fetchUserDetails();
    }
  }, [selectedUser, accessToken]);
  useEffect(() => {
    if (selectedUser) {
      // Fetch the chat history when a user is selected
      const fetchChatHistory = async () => {
        try {
          const response = await axios.get(`https://real-time-chatting-fcs4.onrender.com/api/auth/c/${selectedUser._id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (response.status === 200) {
            // Update the chat history with fetched data
            setChatHistory(response.data.messages|| []); // Assuming 'history' is the correct field
            console.log(response.messages)
          }
        } catch (error) {
          setError('Error fetching chat history. Please try again later.');
        }
      };
  
      fetchChatHistory();
    }
  }, [selectedUser, accessToken]);

  return (
    <Box className="flex flex-col max-w-full max-h-full p-6 mx-auto mt-10 bg-gray-800 rounded-lg shadow-lg md:flex-row">
      <Box className="w-full h-screen md:w-1/5">
        <UserList
          users={users}
          query={query}
          setQuery={setQuery}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          userStatuses={userStatuses}
        />
      </Box>
      <Box className="w-full p-4 bg-gray-900 rounded-r-lg md:w-4/5">
        {error && (
          <Typography color="error" variant="body1" align="center">
            {error}
          </Typography>
        )}
        {selectedUser ? (
          <Box className="flex flex-col h-[650px] md:h-auto">
            {selectedUserDetails && (
              <Box className="flex items-center p-3 mb-4 space-x-4 bg-gray-700 rounded-lg">
                <Avatar src={selectedUserDetails.avatar} alt={`${selectedUserDetails.username}'s avatar`} />
                <Box>
                  <Typography variant="h6">{selectedUserDetails.username}</Typography>
                  <Typography variant="body2">
  {userStatuses[selectedUser._id]?.status === 'online'
    ? 'Online'
    : 'Offline'}
</Typography>

                </Box>
              </Box>
            )}
          <Box ref={chatHistoryRef} className="flex-1 p-1 mb-2 overflow-y-auto bg-gray-800 rounded-lg h-[400px]">
  {chatHistory.length > 0 ? (
    <List>
      {chatHistory.map((msg, idx) => {
        const isCurrentUser = msg.sender === sessionStorage.getItem('userId');
        return (
          <ListItem
            key={idx}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <Box
              className={`p-3 rounded-lg max-w-xs break-words ${
                isCurrentUser ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-600 text-gray-100'
              }`}
            >
              <ListItemText primary={msg.content} />
            </Box>
          </ListItem>
        );
      })}
    </List>
  ) : (
    <Typography className="text-center text-gray-400">No messages yet.</Typography>
  )}
</Box>

            <Box className="flex items-center">
              <TextField
                variant="outlined"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow"
                placeholder="Type your message..."
                size="small"
                InputProps={{
                  style: {
                    backgroundColor: '#2c2c2c',
                    color: '#fff',
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={sendMessage} className="ml-2">
                Send
              </Button>
            </Box>
          </Box>
        ) : (
          <Box className="flex items-center justify-center h-full">
            <Typography className="text-gray-400">Select a user to start chatting</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Chat;
