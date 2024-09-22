import React, { useState } from 'react';
import { login as authLogin } from '../store/authslice.js';
import { useDispatch } from 'react-redux';
import InputTab from './input.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false); // Add loading state
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when the request starts

    try {
      const response = await axios.post('https://real-time-chatting-fcs4.onrender.com/api/auth/login', formData);
      if (response.status === 200) {
        const { accessToken, user } = response.data; // Extract userId from response
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('userId', user._id); // Store userId in sessionStorage
        dispatch(authLogin({ email: formData.email, password: formData.password }));
        console.log(response.data);
        console.log(user._id);
        navigate('/');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    } finally {
      setLoading(false); // Reset loading state after the request is complete
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md p-6 mx-auto mt-40 rounded-md shadow-md"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <h1 className="text-2xl text-center text-white">Login</h1>

      <InputTab
        label="email"
        type="text"
        value={formData.email}
        onChange={handleChange}
        name="email"
        placeholder="Enter email"
        required
      />
      <InputTab
        label="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        name="password"
        placeholder="Enter password"
        required
      />
      <div className="flex justify-center">
        <button
          className={`px-10 py-4 text-center text-white rounded-xl ${loading ? 'bg-gray-400' : 'bg-slate-500'}`}
          type="submit"
          disabled={loading} // Disable the button while loading
        >
          {loading ? 'Logging in...' : 'Submit'}
        </button>
      </div>
      <p className="mt-2 text-base text-center text-white">
        New user?{' '}
        <Link to="/Registration" className="font-medium hover:underline">
          Sign up here
        </Link>
      </p>
    </form>
  );
}

export default Login;