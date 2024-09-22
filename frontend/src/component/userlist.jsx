import React from 'react';

function UserList({ users, query, setQuery, selectedUser, setSelectedUser, userStatuses }) {
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="h-full p-4 bg-gray-800 rounded-lg shadow-lg">
      <input
        type="text"
        placeholder="Search users"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-3 mb-4 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="overflow-y-auto h-[calc(100vh-160px)]">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center p-3 mb-2 space-x-4 rounded-lg cursor-pointer transition duration-300 ease-in-out hover:bg-gray-600 ${
                selectedUser && selectedUser._id === user._id ? 'bg-gray-700 border-l-4 border-blue-500' : 'bg-gray-800'
              }`}
            >
              <img
                src={user.avatar}
                alt={`${user.username}'s avatar`}
                className="object-cover w-12 h-12 border-2 border-gray-500 rounded-full"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-gray-100">{user.username}</span>
                <span className="text-sm text-gray-400">
                  {userStatuses[user._id]
                    ? userStatuses[user._id].status === 'online'
                      ? 'Online'
                      : `Last seen: ${new Date(
                          userStatuses[user._id].lastSeen
                        ).toLocaleTimeString()}`
                    : 'Offline'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  );
}

export default UserList;
