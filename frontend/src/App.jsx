import React from 'react'
import Register from './component/register'
import Login from './component/login'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chat from './component/chat';
import { useSelector } from 'react-redux';
import Header from './component/header.jsx';



function App() {
  const accessToken = useSelector(state => state.auth.isLoggedIn)|| sessionStorage.getItem('accessToken');
  return (
    <div>
      <Header/>
      <Routes>
        
        <Route path="/" element={accessToken? <Chat/> : <Login/>} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Registration" element={<Register />} />
      
      </Routes>
      
    </div>
  )
}

export default App
