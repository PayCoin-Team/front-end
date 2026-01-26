import React from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './MyPageScreen.module.css';

// [수정 1] API 인스턴스 import
import api from './utils/api'; 

// 하단 네비게이션 아이콘
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import UsdtLogo from './component/UsdtLogo.svg';
import walletAddressIcon from './assets/wallet.svg';

const MyPageScreen = () => {
  const navigate = useNavigate();

  // 사용자 정보 (추후 API 연동 시 set 필요)
  const user = {
    name: "홍길동",
    email: "user@example.com",
    avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png" 
  };
  
  const myWalletAddress = "A1B2-C3D4"; 

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(myWalletAddress);
    alert(`지갑 주소가 복사되었습니다!\n📋 ${myWalletAddress}`);
  };

  const menuItems = [
    { title: "내 정보 수정", icon: "👤" },
    { title: "보안 센터 (비밀번호 변경)", icon: "🔒" },
  ];

const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;

    try {
        // 1. 서버 로그아웃 요청
        await api.post('/auth/logout');
    } catch (error) {
        console.error("로그아웃 요청 에러:", error);
    } finally {
        // 2. 로컬 스토리지 토큰 삭제
        localStorage.removeItem('accessToken');

        // 3. ⭐ [핵심 추가] 쿠키(JSESSIONID 등) 강제 삭제
        // 브라우저에 저장된 모든 쿠키를 만료시켜 삭제합니다.
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });

        // 4. 페이지 강제 새로고침 및 이동
        alert("로그아웃 되었습니다.");
        window.location.href = '/login'; 
    }
  };

  return (
    <div className={common.layout}>
      
      {/* 1. 상단 헤더 */}
      <header className={styles.header}>
        <div className={`${styles.content} ${common.fadeIn}`}>
            <div className={styles.brandLogo}>
                <img src={UsdtLogo} alt="USDT Logo" className={styles.usdtIcon} />
                <h1 className={styles.logoText}>CrossPay</h1>
            </div>
        </div>
      </header>

      {/* 2. 메인 콘텐츠 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        
        {/* 프로필 카드 */}
        <section className={styles.profileCard}>
            <div className={styles.avatarWrapper}>
                <img src={user.avatar} alt="프로필" className={styles.avatarImg} />
            </div>
            <div className={styles.userInfo}>
                <h3 className={styles.userName}>{user.name} 님</h3>
                <p className={styles.userEmail}>{user.email}</p>
                <div className={styles.walletBox} onClick={handleCopyAddress}>
                    <div className={styles.walletIcon}>
                        <img src={walletAddressIcon} alt="wallet" />
                    </div>
                    
                    <span className={styles.walletText}>{myWalletAddress}</span>
                    <span className={styles.copyBtn}>복사</span>
                </div>
            </div>
        </section>

        {/* 메뉴 리스트 */}
        <div className={styles.menuList}>
            {menuItems.map((item, index) => (
                <div key={index} className={styles.menuItem}>
                    <span className={styles.menuIcon}>{item.icon}</span>
                    <span className={styles.menuTitle}>{item.title}</span>
                    <span className={styles.arrowIcon}>›</span>
                </div>
            ))}
        </div>

        {/* 로그아웃 버튼 */}
        <button className={styles.logoutBtn} onClick={handleLogout}>
            로그아웃
        </button>

      </div>

      {/* 3. 하단 네비게이션 */}
      <nav className={styles.bottomNav}>
        <div className={styles.navItem} onClick={() => navigate('/home')}>
            <img src={navHomeIcon} className={styles.navImg} alt="홈" />
            <span className={styles.navText}>홈</span>
        </div>
        <div className={styles.navItem} onClick={() => navigate('/pay')}>
            <img src={navPayIcon} className={styles.navImg} alt="결제" />
            <span className={styles.navText}>결제</span>
        </div>
        <div className={`${styles.navItem} ${styles.active}`}>
            <img src={navUserIcon} className={styles.navImg} alt="마이페이지" />
            <span className={styles.navText}>마이페이지</span>
        </div>
      </nav>

    </div>
  );
};

export default MyPageScreen;