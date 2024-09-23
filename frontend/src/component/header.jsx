import React, { useState } from 'react';
import { logout } from '../store/authslice.js';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accessToken = sessionStorage.getItem('accessToken');
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn) || accessToken;

  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false); // Toggle state for details section

  const handleClick = async () => {
    try {
      const response = await axios.post(
        'https://real-time-chatting-fcs4.onrender.com/api/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        dispatch(logout());
        sessionStorage.removeItem('accessToken');
        console.log(response.data);
        navigate('/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const fetchCurrentUser = async () => {
    if (!showDetails) {  // Fetch user details only if details section is not already open
      try {
        const response = await axios.get(
          'https://real-time-chatting-fcs4.onrender.com/api/auth/current-user',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 200) {
          setCurrentUser(response.data.user);
        }
      } catch (error) {
        setError('Error fetching user details');
        console.error('Error fetching current user:', error);
      }
    }
    setShowDetails(!showDetails); // Toggle the display of user details
  };

  return (
    <div className='h-[50px] w-full absolute top-0 flex justify-between items-center' style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <h1 className='text-3xl text-center text-white'>Chat App</h1>

      {isLoggedIn ? (
        <div className='flex items-center'>
          <button className='h-[50px] w-[100px] bg-white text-black rounded-xl' onClick={handleClick}>
            Logout
          </button>
          <button className='h-[50px] w-[100px] bg-blue-500 text-white rounded-xl ml-2' onClick={fetchCurrentUser}>
            {showDetails ? 'Close Details' : 'My Details'}
          </button>

          {showDetails && currentUser && (
            <div className='absolute top-[60px] left-[80%] w-full max-w-xs bg-gray-800 text-white p-4 rounded-lg shadow-md'>
              <h2 className='text-lg font-semibold'>Current User:</h2>
              <div className='flex items-center'>
                {currentUser.avatar && (
                  <img
                    src={currentUser.avatar}
                    alt={`${currentUser.name}'s avatar`}
                    className='w-12 h-12 mr-2 rounded-full'
                  />
                )}
                <div>
                  <p><strong>Name:</strong> {currentUser.name}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                </div>
              </div>
            </div>
          )}

          {showDetails && error && (
            <div className='absolute top-[60px] left-0 w-full bg-red-500 text-white p-4 rounded-lg'>
              {error}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default Header;
