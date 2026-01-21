import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Link } from 'react-router-dom';
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


import Dashboard from './Admin/Dashboard';
import AdminUserScreen from './Admin/AdminUserScreen';

const UserLayout = () => {
  return (
    <div className={styles.container}>        
      <div className={styles.overSection}>
        <div className={styles.leftSection}>
          <div className={styles.logoArea}>
            <img src={usdtLogo} alt="Logo" className={styles.logoIcon} />
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
              {/* 여기가 중요! 하위 라우트(Home, Login 등)가 여기에 표시됨 */}
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.underSection}></div>
    </div>
  );
};

// ---------------------------------------------------------
// 2. 관리자용 레이아웃 (PC 전체 화면 + 사이드바 구조)
// ---------------------------------------------------------
const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      {/* (1) 관리자 사이드바 (간단 예시) */}
      <nav style={{ width: '250px', background: '#1e293b', color: 'white', padding: '20px' }}>
        <h2 style={{ marginBottom: '30px' }}>Tpay Admin</h2>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '3' }}>
            <li><Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>대시보드</Link></li>
            <li><Link to="/admin/users" style={{ color: 'white', textDecoration: 'none' }}>회원 관리</Link></li>
            <li><Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>앱으로 돌아가기</Link></li>
        </ul>
      </nav>

      {/* (2) 관리자 컨텐츠 영역 */}
      <main style={{ flex: 1, padding: '30px' }}>
        {/* 하위 라우트(Dashboard, AdminUserScreen)가 여기에 표시됨 */}
        <Outlet />
      </main>
    </div>
  );
};

// ---------------------------------------------------------
// 3. 메인 App 컴포넌트
// ---------------------------------------------------------
function App() {
  return (
    <Router>
      <Routes>
        
        {/* === [A] 관리자 페이지 라우트 그룹 (/admin 으로 시작) === */}
        {/* 전체 화면 레이아웃을 사용하기 위해 UserLayout 밖으로 뺐습니다 */}
        <Route path="/admin" element={<AdminLayout />}>
           <Route index element={<Dashboard />} />          {/* /admin 접속 시 */}
           <Route path="users" element={<AdminUserScreen />} /> {/* /admin/users 접속 시 */}
        </Route>


        {/* === [B] 일반 사용자 앱 라우트 그룹 === */}
        {/* 기존의 모바일 프레임 레이아웃(UserLayout)을 적용 */}
        <Route element={<UserLayout />}>
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
        </Route>

      </Routes>
    </Router>
  );
}

export default App;