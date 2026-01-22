import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styles from './AppLayout.module.css'; 

// 1. 번역 파일 및 로고 임포트
import { translations } from './utils/translations';
import usdtLogo from './component/UsdtLogo.svg';

// 2. 관리자 페이지 임포트
import AdminDashboard from './Admin/AdminDashboard';

// 3. 사용자 페이지 임포트
import SplashScreen from './SplashScreen';
import SignUpScreen from './SignUpScreen';
import LoginScreen from './LoginScreen';
import Home from './Home';
import ChartScreen from './ChartScreen';
import ChargeScreen from './ChargeScreen';
import MyPageScreen from './MyPageScreen';
import PayScreen from './PayScreen';
import QrGenerate from './QrGenerate';
import HistoryScreen from './HistoryScreen';
import FindIdScreen from './FindIdScreen';
import ResetPassword from './ResetPassword';
import SendScreen from './SendScreen';
import Processing from './Processing';
import Withdraw from './WithdrawScreen';
import WalletConnect from './WalletConnect';

function App() {
  // [언어 상태 관리] - 앱 전체 공통
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'ko');

  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = localStorage.getItem('appLanguage') || 'ko';
      setLanguage(newLang);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    window.addEventListener('storage', handleLanguageChange); 

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
      window.removeEventListener('storage', handleLanguageChange);
    };
  }, []);

  const t = translations[language];

  return (
    <Router>
      <Routes>
        {/* ✅ 1. 관리자 페이지 (모바일 프레임 바깥, 전체 화면 사용) */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* ✅ 2. 일반 사용자 앱 (모바일 프레임 안쪽) */}
        <Route path="/*" element={<UserLayout t={t} />} />
      </Routes>
    </Router>
  );
}

// ▼ [내부 컴포넌트] 사용자용 모바일 레이아웃 (핸드폰 모양)
const UserLayout = ({ t }) => {
  return (
    <div className={styles.container}>        
      <div className={styles.overSection}>
        {/* 왼쪽 소개 섹션 */}
        <div className={styles.leftSection}>
          <div className={styles.logoArea}>
            <img src={usdtLogo} alt="Logo" className={styles.logoIcon} />
            <span className={styles.logoText}>{t.appName}</span>
          </div> 
          
          <div className={styles.sloganArea}>
            <h2>{t.sloganPart1}<span>{t.sloganPart2}</span></h2>
            <h1>{t.sloganMain}</h1>
            <p>
              {t.sloganSub1}<br />
              {t.sloganSub2}
            </p>
          </div>
        </div>

        {/* 오른쪽 모바일 프레임 섹션 */}
        <div className={styles.rightSection}>
          <div className={styles.mobileFrame}>
            <div className={styles.appContent}>
              <Routes>
                <Route path="/" element={<SplashScreen />} />
                <Route path="/signup" element={<SignUpScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/findId" element={<FindIdScreen />} />
                <Route path="/resetPw" element={<ResetPassword />} />
                <Route path="/home" element={<Home />} />
                <Route path="/chart" element={<ChartScreen />} />
                <Route path="/mypage" element={<MyPageScreen />} />
                <Route path="/charge" element={<ChargeScreen />} />
                <Route path="/pay" element={<PayScreen />} />
                <Route path="/qr" element={<QrGenerate />} />
                <Route path="/withdraw" element={<Withdraw />} />
                <Route path="/send" element={<SendScreen />} />
                <Route path="/history" element={<HistoryScreen />} />
                <Route path="/pro" element={<Processing />} />
                <Route path="/wallet" element={<WalletConnect />} />
                
                {/* 알 수 없는 경로는 Home으로 리다이렉트 */}
                <Route path="*" element={<Home />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.underSection}></div>
    </div>
  );
};

export default App;