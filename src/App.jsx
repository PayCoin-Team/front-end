import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './SplashScreen';
import SignUpScreen from './SignUpScreen'; // 회원가입 컴포넌트 임포트
import LoginScreen from './LoginScreen';
import Home from './Home'; // 일반 사용자 홈 화면 임포트

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        {/* 일반 사용자 메인 홈 화면 (추가됨) */}
        <Route path="/home" element={<Home />} />
        
      </Routes>
    </Router>
  )
}

export default App
