import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './MyPageScreen.module.css';

// API 인스턴스
import api from './utils/api'; 

// 하단 네비게이션 아이콘
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import UsdtLogo from './component/UsdtLogo.svg';
import walletAddressIcon from './assets/wallet.svg';

const MyPageScreen = () => {
  const navigate = useNavigate();

  // --- [State] 사용자 데이터 및 UI 상태 ---
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png" // 기본 이미지
  });

  // [추가] 지갑 데이터 상태
  const [walletData, setWalletData] = useState({
    publicAddress: 'Loading...', // 내부 지갑 주소
    externalAddress: null,       // 외부 지갑 주소 (필요시 사용)
    balance: 0
  });

  // 모달 상태 (비밀번호 변경, 정보 수정)
  const [showPwModal, setShowPwModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // 입력 폼 상태
  const [pwForm, setPwForm] = useState({ password: '', newPassword: '', checkPassword: '' });
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '' });

  // --- [Effect] 초기 데이터 로딩 ---
  useEffect(() => {
    fetchUserInfo();   // 회원 기본 정보
    fetchUserWallet(); // [추가] 지갑 정보 (주소 포함)
  }, []);

  // 1. 내 정보 조회 API (GET /users/me)
  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/users/me');
      const data = response.data;
      setUserData({
        ...userData,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      // 수정 폼 초기값 세팅
      setEditForm({ firstName: data.firstName, lastName: data.lastName });
    } catch (error) {
      console.error("내 정보 조회 실패:", error);
      if (error.response?.status === 403) {
          alert("로그인이 필요합니다.");
          navigate('/login');
      }
    }
  };

  // 1-2. [추가] 내 지갑 조회 API (GET /wallets/users/me)
  const fetchUserWallet = async () => {
    try {
      const response = await api.get('/wallets/users/me');
      const data = response.data; // ResponseUserWalletDto (userId, balance, publicAddress, externalAddress)
      
      setWalletData({
        publicAddress: data.publicAddress || '생성된 주소 없음',
        externalAddress: data.externalAddress,
        balance: data.balance
      });
    } catch (error) {
      console.error("지갑 정보 조회 실패:", error);
    }
  };

  // 2. 비밀번호 변경 API (PATCH /users/update/password)
  const handleChangePassword = async () => {
    if (!pwForm.password || !pwForm.newPassword || !pwForm.checkPassword) {
      return alert("모든 항목을 입력해주세요.");
    }
    if (pwForm.newPassword !== pwForm.checkPassword) {
      return alert("새 비밀번호가 일치하지 않습니다.");
    }

    try {
      await api.patch('/users/update/password', pwForm);
      alert("비밀번호가 성공적으로 변경되었습니다.");
      setShowPwModal(false);
      setPwForm({ password: '', newPassword: '', checkPassword: '' }); // 초기화
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      alert(error.response?.data?.message || "비밀번호 변경에 실패했습니다.");
    }
  };

  // 3. 정보 수정 API (PATCH /users/update)
  const handleUpdateInfo = async () => {
    try {
      await api.patch('/users/update', editForm);
      alert("정보가 수정되었습니다.");
      setShowEditModal(false);
      fetchUserInfo(); // 변경된 정보 다시 불러오기
    } catch (error) {
      console.error("정보 수정 실패:", error);
      alert("정보 수정 중 오류가 발생했습니다.");
    }
  };

  // 4. 회원 탈퇴 API (DELETE /users/delete)
  const handleWithdraw = async () => {
    const confirmMsg = prompt("탈퇴하시려면 '탈퇴'라고 입력해주세요.\n탈퇴 시 모든 데이터가 삭제됩니다.");
    if (confirmMsg !== '탈퇴') return;

    try {
        await api.delete('/users/delete');
        alert("회원 탈퇴가 완료되었습니다.");
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
    } catch (error) {
        console.error("회원 탈퇴 실패:", error);
        alert("탈퇴 처리에 실패했습니다.");
    }
  };

  // 로그아웃 로직
  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error("로그아웃 요청 에러:", error);
    } finally {
        localStorage.removeItem('accessToken');
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        alert("로그아웃 되었습니다.");
        window.location.href = '/login'; 
    }
  };

  // 지갑 주소 복사
  const handleCopyAddress = () => {
    if (walletData.publicAddress && walletData.publicAddress !== 'Loading...') {
        navigator.clipboard.writeText(walletData.publicAddress);
        alert(`지갑 주소가 복사되었습니다!\n📋 ${walletData.publicAddress}`);
    }
  };

  return (
    <div className={common.layout}>
      
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={`${styles.content} ${common.fadeIn}`}>
            <div className={styles.brandLogo}>
                <img src={UsdtLogo} alt="USDT Logo" className={styles.usdtIcon} />
                <h1 className={styles.logoText}>CrossPay</h1>
            </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        
        {/* 프로필 카드 */}
        <section className={styles.profileCard}>
            <div className={styles.avatarWrapper}>
                <img src={userData.avatar} alt="프로필" className={styles.avatarImg} />
            </div>
            <div className={styles.userInfo}>
                <h3 className={styles.userName}>{userData.lastName}{userData.firstName} 님</h3>
                <p className={styles.userEmail}>{userData.email}</p>
                
                {/* 지갑 주소 표시 영역 */}
                <div className={styles.walletBox} onClick={handleCopyAddress}>
                    <div className={styles.walletIcon}>
                        <img src={walletAddressIcon} alt="wallet" />
                    </div>
                    <span className={styles.walletText}>
                        {/* 지갑 주소 (데이터 로딩 전에는 Loading...) */}
                        {walletData.publicAddress}
                    </span>
                    <span className={styles.copyBtn}>복사</span>
                </div>
            </div>
        </section>

        {/* 메뉴 리스트 */}
        <div className={styles.menuList}>
            {/* 정보 수정 */}
            <div className={styles.menuItem} onClick={() => setShowEditModal(true)}>
                <span className={styles.menuIcon}>👤</span>
                <span className={styles.menuTitle}>내 정보 수정</span>
                <span className={styles.arrowIcon}>›</span>
            </div>
            
            {/* 비밀번호 변경 */}
            <div className={styles.menuItem} onClick={() => setShowPwModal(true)}>
                <span className={styles.menuIcon}>🔒</span>
                <span className={styles.menuTitle}>보안 센터 (비밀번호 변경)</span>
                <span className={styles.arrowIcon}>›</span>
            </div>

            {/* 회원 탈퇴 */}
            <div className={styles.menuItem} onClick={handleWithdraw} style={{color: '#d32f2f'}}>
                <span className={styles.menuIcon}>🗑️</span>
                <span className={styles.menuTitle}>회원 탈퇴</span>
                <span className={styles.arrowIcon}>›</span>
            </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button className={styles.logoutBtn} onClick={handleLogout}>
            로그아웃
        </button>

      </div>

      {/* --- [모달] 정보 수정 --- */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>내 정보 수정</h3>
                <input 
                    type="text" 
                    placeholder="성 (Last Name)"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    className={styles.modalInput}
                />
                <input 
                    type="text" 
                    placeholder="이름 (First Name)"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    className={styles.modalInput}
                />
                <div className={styles.modalActions}>
                    <button onClick={() => setShowEditModal(false)} className={styles.cancelBtn}>취소</button>
                    <button onClick={handleUpdateInfo} className={styles.confirmBtn}>수정</button>
                </div>
            </div>
        </div>
      )}

      {/* --- [모달] 비밀번호 변경 --- */}
      {showPwModal && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>비밀번호 변경</h3>
                <input 
                    type="password" 
                    placeholder="현재 비밀번호"
                    value={pwForm.password}
                    onChange={(e) => setPwForm({...pwForm, password: e.target.value})}
                    className={styles.modalInput}
                />
                <input 
                    type="password" 
                    placeholder="새 비밀번호 (8~20자, 영문/숫자/특수문자)"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})}
                    className={styles.modalInput}
                />
                <input 
                    type="password" 
                    placeholder="새 비밀번호 확인"
                    value={pwForm.checkPassword}
                    onChange={(e) => setPwForm({...pwForm, checkPassword: e.target.value})}
                    className={styles.modalInput}
                />
                <div className={styles.modalActions}>
                    <button onClick={() => setShowPwModal(false)} className={styles.cancelBtn}>취소</button>
                    <button onClick={handleChangePassword} className={styles.confirmBtn}>변경</button>
                </div>
            </div>
        </div>
      )}

      {/* 하단 네비게이션 */}
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