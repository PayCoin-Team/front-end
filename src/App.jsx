import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styles from './AppLayout.module.css'; 
import { useState, useEffect } from 'react';

// 1. 번역 파일 임포트
import { translations } from './utils/translations';

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

import usdtLogo from './component/UsdtLogo.svg';

function App() {
 // 1. 언어 상태 관리 (기본값: 저장된 값 혹은 'ko')
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'ko');

  useEffect(() => {
    // 언어 변경 시 실행될 함수
    const handleLanguageChange = () => {
      const newLang = localStorage.getItem('appLanguage') || 'ko';
      setLanguage(newLang);
    };

    // 2. 이벤트 리스너 등록: SplashScreen에서 보낼 신호를 감지합니다.
    window.addEventListener('languageChange', handleLanguageChange);
    window.addEventListener('storage', handleLanguageChange); // 다른 탭 대응

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
      window.removeEventListener('storage', handleLanguageChange);
    };
  }, []);

  const t = translations[language];
  return (
    <Router>
      {/* 1. 전체 레이아웃 컨테이너 */}
      <div className={styles.container}>        
        <div className={styles.overSection}>
          <div className={styles.leftSection}>
            <div className={styles.logoArea}>
              <img 
                src={usdtLogo} 
                alt="Logo" 
                className={styles.logoIcon} 
              />
              
              <span className={styles.logoText}>{t.appName}</span>
            </div> 
            
            {/* 3. 슬로건 영역 다국어 적용 */}
            <div className={styles.sloganArea}>
              <h2>{t.sloganPart1}<span>{t.sloganPart2}</span></h2>
              <h1>{t.sloganMain}</h1>
              <p>
                {t.sloganSub1}<br />
                {t.sloganSub2}
              </p>
            </div>
          </div>

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
                  <Route path="*" element={<Home />} />
                </Routes>

              </div>
            </div>
          </div>
        </div>
        <div className={styles.underSection}></div>
      </div>
    </Router>
  );
}

export default App;