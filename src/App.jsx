import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './SplashScreen';
import SignUpScreen from './SignUpScreen'; // 회원가입 컴포넌트 임포트
import LoginScreen from './LoginScreen';
import Home from './Home'; // 일반 사용자 홈 화면 임포트
import MyPageScreen from './MyPageScreen';
import PayScreen from './PayScreen';
import ChartScreen from './ChartScreen';
import ChargeScreen from './ChargeScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        {/* 일반 사용자 메인 홈 화면 (추가됨) */}
        <Route path="/home" element={<Home />} />
        <Route path="/mypage" element={<MyPageScreen />} />
        <Route path="/pay" element={<PayScreen />} />

        <Route path="/chart" element={<ChartScreen />} />

        <Route path="/charge" element={<ChargeScreen />} />
      </Routes>
    </Router>
  )
}

export default App
