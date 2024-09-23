import React from 'react';
import { Box, TextField, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography } from '@mui/material';

function UserList({ users, query, setQuery, selectedUser, setSelectedUser, userStatuses }) {
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Box className="h-full p-4 bg-gray-800 rounded-lg shadow-lg">
      <TextField
        variant="outlined"
        placeholder="Search users"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full mb-4"
        InputProps={{
          style: {
            backgroundColor: '#2c2c2c',
            color: '#fff',
          },
        }}
      />
      <Box className="overflow-y-auto h-[calc(100vh-200px)] md:h-[calc(100vh-240px)]">
        {filteredUsers.length > 0 ? (
          <List>
            {filteredUsers.map((user) => (
              <ListItem
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`cursor-pointer transition duration-300 ease-in-out hover:bg-gray-600 ${
                  selectedUser && selectedUser._id === user._id ? 'bg-gray-700' : 'bg-gray-800'
                }`}
              >
                <ListItemAvatar>
                  <Avatar src={user.avatar} alt={`${user.username}'s avatar`} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" className="font-semibold text-gray-100 truncate">
                      {user.username}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" className="text-gray-400">
                      {userStatuses[user._id]
                        ? userStatuses[user._id].status === 'online'
                          ? 'Online'
                          : `Last seen: ${new Date(userStatuses[user._id].lastSeen).toLocaleTimeString()}`
                        : 'Offline'}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography className="text-center text-gray-500">No users found.</Typography>
        )}
      </Box>
    </Box>
  );
}

export default UserList;
