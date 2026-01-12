import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './SplashScreen';
import SignUpScreen from './SignUpScreen'; // 회원가입 컴포넌트 임포트
import LoginScreen from './LoginScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
    </Router>
  )
}

export default App
