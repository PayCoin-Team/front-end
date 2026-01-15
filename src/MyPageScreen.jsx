import React from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './MyPageScreen.module.css';

// 하단 네비게이션 아이콘 (Home.jsx와 동일한 경로)
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import UsdtLogo from './component/UsdtLogo.svg';
import walletAddressIcon from './assets/wallet.svg';

const MyPageScreen = () => {
  const navigate = useNavigate();




  // 사용자 정보 (예시)
  const user = {
    name: "홍길동",
    email: "user@example.com",
    avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png" // 임시 프로필 이미지 주소
  };
  
  const myWalletAddress = "A1B2-C3D4"; 

  // ⭐ [추가] 주소 복사 함수
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(myWalletAddress);
    alert(`지갑 주소가 복사되었습니다!\n📋 ${myWalletAddress}`);
  };

  const menuItems = [
    { title: "내 정보 수정", icon: "👤" },
    { title: "보안 센터 (비밀번호 변경)", icon: "🔒" },
    { title: "지갑 주소 관리", icon: "💼" },
    { title: "고객센터 / 도움말", icon: "🎧" },
    { title: "약관 및 정책", icon: "📄" },
  ];

  const handleLogout = () => {
    // 로그아웃 로직 (토큰 삭제 등)
    if(window.confirm("로그아웃 하시겠습니까?")) {
        navigate('/', { replace: true });
    }
  };

  return (
    <div className={common.layout}>
      
      {/* 1. 상단 헤더 */}
      <header className={styles.header}>

        <div className={`${styles.content} ${common.fadeIn}`}>
                        {/* 2. 브랜드 로고 영역 (UsdtLogo + CrossPay) */}
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

      {/* 3. 하단 네비게이션 (마이페이지 Active 상태) */}
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