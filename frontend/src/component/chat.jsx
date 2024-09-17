import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

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
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [typing, setTyping] = useState(false);
  const [userStatuses, setUserStatuses] = useState({});
  const [error, setError] = useState(''); // Error state
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
        setError('Error fetching users');
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      setChatHistory((prevChatHistory) => [...prevChatHistory, msg]);
      setMessage('');
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    });

    socket.on('user status', ({ userId, status, lastSeen }) => {
      setUserStatuses((prevStatuses) => ({
        ...prevStatuses,
        [userId]: { status, lastSeen },
      }));
    });

    socket.on('typing', ({ userId, isTyping }) => {
      if (selectedUser && selectedUser._id === userId) {
        setTyping(isTyping);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socket.off('connect');
      socket.off('chat message');
      socket.off('user status');
      socket.off('typing');
      socket.off('disconnect');
    };
  }, [selectedUser]);

  const registerUser = (userId) => {
    socket.emit('register', userId);
  };

  useEffect(() => {
    if (selectedUser) {
      registerUser(selectedUser._id);
      fetchUserDetails(selectedUser._id);
      fetchChatHistory(selectedUser._id);
    }
  }, [selectedUser]);

  const fetchChatHistory = async (userId) => {
    try {
      const response = await axios.get(`https://real-time-chatting-fcs4.onrender.com/api/auth/c/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.status === 200) {
        setChatHistory(response.data.messages);
      }
    } catch (error) {
      setError('Error fetching chat history');
      console.error('Error fetching chat history:', error);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`https://real-time-chatting-fcs4.onrender.com/api/auth/u/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.status === 200) {
        setSelectedUserDetails(response.data.user);
      }
    } catch (error) {
      setError('Error fetching user details');
      console.error('Error fetching user details:', error);
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
      setMessages((prevMessages) => [...prevMessages, msg]);
      setMessage('');
      setChatHistory((prevChatHistory) => [...prevChatHistory, msg]);
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    } else {
      setError('Message content cannot be empty');
    }
  };

  const handleTyping = () => {
    if (selectedUser) {
      socket.emit('typing', { userId: selectedUser._id, isTyping: true });
      setTimeout(() => {
        socket.emit('typing', { userId: selectedUser._id, isTyping: false });
      }, 2000);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex max-w-full max-h-full p-6 mx-auto mt-10 text-gray-100 bg-gray-800 rounded-lg shadow-lg">
      <div className="w-1/4 p-4 overflow-y-auto bg-gray-700 rounded-l-lg">
        <input
          type="text"
          placeholder="Search users"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full p-3 mb-4 text-gray-100 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div
              key={user._id}
              onClick={() => {
                setError(''); // Clear error when selecting a user
                setSelectedUser(user);
              }}
              className={`flex items-center p-3 mb-4 space-x-4 rounded-lg cursor-pointer transition duration-200 ease-in-out hover:bg-gray-600 ${
                selectedUser && selectedUser._id === user._id ? 'bg-gray-600' : 'bg-gray-700'
              }`}
            >
              <img
                src={user.avatar}
                alt={`${user.username}'s avatar`}
                className="object-cover rounded-full w-14 h-14"
              />
              <div className="flex flex-col">
                <span className="font-medium">{user.username}</span>
                <span className="text-sm">
                  {userStatuses[user._id] ? (
                    userStatuses[user._id].status === 'online' ? 'Online' : `Last seen: ${new Date(userStatuses[user._id].lastSeen).toLocaleTimeString()}`
                  ) : 'Offline'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No users found.</p>
        )}
      </div>
      <div className="w-3/4 p-4 bg-gray-900 rounded-r-lg ">
        {error && (
          <div className="p-4 mb-4 text-red-500 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        {selectedUser ? (
          <div className="flex flex-col h-[650px]">
            {selectedUserDetails && (
              <div className="flex items-center p-3 mb-4 space-x-4 bg-gray-700 rounded-lg">
                <img
                  src={selectedUserDetails.avatar}
                  alt={`${selectedUserDetails.username}'s avatar`}
                  className="object-cover rounded-full w-14 h-14"
                />
                <div className="flex flex-col">
                  <span className="font-medium">{selectedUserDetails.username}</span>
                  <span className="text-sm">
                    {userStatuses[selectedUser._id] ? (
                      userStatuses[selectedUser._id].status === 'online' ? 'Online' : `Last seen: ${new Date(userStatuses[selectedUser._id].lastSeen).toLocaleTimeString()}`
                    ) : 'Offline'}
                  </span>
                </div>
              </div>
            )}
            <div ref={chatHistoryRef} className="flex-1 p-1 mb-2 overflow-y-auto bg-gray-800 rounded-lg">
              {chatHistory.length > 0 ? (
                chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === sessionStorage.getItem('userId') ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div className={`p-3 rounded-lg text-sm max-w-xs break-words ${msg.sender === sessionStorage.getItem('userId') ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-100'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">No chat history found.</p>
              )}
            </div>
            {typing && (
              <div className="text-center text-gray-400">
                {selectedUser.username} is typing...
              </div>
            )}
            <div className="flex">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleTyping}
                className="flex-grow p-3 mb-2 mr-2 text-gray-100 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 mb-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400">Select a user to start chatting.</p>
        )}
      </div>
    </div>
  );
}

export default Chat;
