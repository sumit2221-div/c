import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import InputTab from './input.jsx'; 

function Register() {
  const [formdata, setFormdata] = useState({
    username: '',
    email: '',
    password: '',
    avatar: null
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormdata({
      ...formdata,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormdata({
      ...formdata,
      avatar: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', formdata.username);
    formData.append('email', formdata.email);
    formData.append('password', formdata.password);
    formData.append('avatar', formdata.avatar);

    setLoading(true); // Set loading to true

    try {
      const response = await axios.post('https://real-time-chatting-fcs4.onrender.com/api/auth/register', formData);
      console.log('Registration Successful:', response.data);
      navigate('/login'); // Navigate to login after successful registration
    } catch (error) {
      console.error('Registration Failed:', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <form onSubmit={handleSubmit} className='max-w-md p-6 mx-auto mt-10 rounded-md shadow-md' style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <h1 className='mb-5 text-2xl text-center text-white'>Registration Form</h1>
      <InputTab
        label="Username"
        type="text"
        value={formdata.username}
        onChange={handleChange}
        name="username"
        placeholder="Enter your username"
        required
      />
      <InputTab
        label="Email"
        type="email"
        value={formdata.email}
        onChange={handleChange}
        name="email"
        placeholder="Enter your email"
        required
      />
      <InputTab
        label="Password"
        type="password"
        value={formdata.password}
        onChange={handleChange}
        name="password"
        placeholder="Enter your password"
        required
      />
      <div className="mb-5">
        <label className="block text-white">Avatar</label>
        <input
          type="file"
          onChange={handleFileChange}
          name="avatar"
          accept="image/*"
          className="block w-full px-3 py-2 mt-1 text-white rounded-md bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          required
        />
      </div>
      <div className="flex justify-center">
        <button 
          className={`px-10 py-4 text-center text-white rounded-xl ${loading ? 'bg-gray-400' : 'bg-slate-500'}`} 
          type='submit'
          disabled={loading} // Disable button when loading
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}

export default Register;