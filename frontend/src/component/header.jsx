import React from 'react';
import { logout } from '../store/authslice.js';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accessToken = sessionStorage.getItem('accessToken');
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn)|| sessionStorage.getItem('accessToken');

  const handleClick = async () => {
    try {
      const response = await axios.post(
        'http://localhost:4000/api/auth/logout',
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

  return (
    <div className='h-[50px] w-full absolute top-0 flex justify-between items-center' style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <h1 className='text-3xl text-center text-white'>Chat App</h1>

      {isLoggedIn ?(
       <button className='h-50px] w-[100px] bg-white text-black rounded-xl relative' onClick={handleClick}>
       Logout
     </button>) : null
}
     
    </div>
  );
}

export default Header;
