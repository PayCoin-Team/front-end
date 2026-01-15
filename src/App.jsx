import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './SplashScreen';
import SignUpScreen from './SignUpScreen'; // 회원가입 컴포넌트 임포트
import LoginScreen from './LoginScreen';
import Home from './Home'; // 일반 사용자 홈 화면 임포트
import ChartScreen from './ChartScreen';  // 차트 컴포넌트 임포트
import ChargeScreen from './ChargeScreen'; // 충전 컴포넌트 임포트
import MyPageScreen from './MyPageScreen'; // 마이페이지 컴포넌트 임포트
import PayScreen from './PayScreen';       // 결제 컴포넌트 임포트
import QrGenerate from './QrGenerate';
import HistoryScreen from'./HistoryScreen';
import SendScreen from './SendScreen';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        {/* 일반 사용자 메인 홈 화면 (추가됨) */}
        <Route path="/home" element={<Home />} />
        <Route path="/chart" element={<ChartScreen />} />
        <Route path="/mypage" element={<MyPageScreen />} />
        <Route path="/charge" element={<ChargeScreen />} />
        <Route path="/pay" element={<PayScreen />} />
        <Route path="/qr" element={<QrGenerate />} />
        {/* 혹시 몰라 추가하는 예외 처리 (잘못된 주소 입력 시 홈으로) */}
        <Route path="/send" element={<SendScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route path="*" element={<Home />} />
        
      </Routes>
    </Router>
  )
}

export default App
