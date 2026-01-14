import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './SplashScreen';
import SignUpScreen from './SignUpScreen'; // 회원가입 컴포넌트 임포트
import LoginScreen from './LoginScreen';
import ResetPassword from './ResetPassword';
import FindIdScreen from './FindIdScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/FindIdScreen" element={<FindIdScreen />} />
      </Routes>
    </Router>
  )
}

export default App
