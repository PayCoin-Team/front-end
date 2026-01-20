import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styles from './AppLayout.module.css'; 



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
              
              <span className={styles.logoText}>CrossPay</span>
            </div> 
            
            <div className={styles.sloganArea}>
              <h2>스캔 한 번<span>으로</span></h2>
              <h1>끝나는 맞춤형 USDT 결제 플랫폼</h1>
              <p>
                국경 없는 결제, 지연 없는 정산<br />
                소상공인과 글로벌 유저를 잇는 실시간 USDT 결제 인프라
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