import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './MyPageScreen.module.css';

// API 인스턴스 및 번역 유틸
import api from './utils/api'; 
import { translations } from './utils/translations';

// 하단 네비게이션 아이콘
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import UsdtLogo from './component/UsdtLogo.svg';
import walletAddressIcon from './assets/wallet.svg';

const MyPageScreen = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'ko');

  // 실시간 언어 변경 감지
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(localStorage.getItem('appLanguage') || 'ko');
    };
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const t = translations[language] || translations['ko'];

  // --- [State] 사용자 데이터 및 UI 상태 ---
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png" 
  });

  const [walletData, setWalletData] = useState({
    publicAddress: 'Loading...', 
    externalAddress: null, 
    balance: 0
  });

  const [showPwModal, setShowPwModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [pwForm, setPwForm] = useState({ password: '', newPassword: '', checkPassword: '' });
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '' });

  useEffect(() => {
    fetchUserInfo();
    fetchUserWallet();
  }, []);

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
      setEditForm({ firstName: data.firstName, lastName: data.lastName });
    } catch (error) {
      console.error("내 정보 조회 실패:", error);
      if (error.response?.status === 403) {
          alert(t.errorSessionExpired);
          navigate('/login');
      }
    }
  };

  const fetchUserWallet = async () => {
    try {
      const response = await api.get('/wallets/users/me');
      const data = response.data; 
      
      setWalletData({
        publicAddress: data.publicAddress || t.errorNoInternalWallet,
        externalAddress: data.externalAddress,
        balance: data.balance
      });
    } catch (error) {
      console.error("지갑 정보 조회 실패:", error);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.password || !pwForm.newPassword || !pwForm.checkPassword) {
      return alert(t.allFieldsRequired);
    }
    if (pwForm.newPassword !== pwForm.checkPassword) {
      return alert(t.pwNotMatch);
    }

    try {
      await api.patch('/users/update/password', pwForm);
      alert(t.pwChangeSuccess);
      setShowPwModal(false);
      setPwForm({ password: '', newPassword: '', checkPassword: '' });
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      alert(error.response?.data?.message || t.pwChangeFail);
    }
  };

  const handleUpdateInfo = async () => {
    try {
      await api.patch('/users/update', editForm);
      alert(t.infoUpdateSuccess);
      setShowEditModal(false);
      fetchUserInfo();
    } catch (error) {
      console.error("정보 수정 실패:", error);
      alert(t.infoUpdateFail);
    }
  };

  const handleWithdraw = async () => {
    const confirmMsg = prompt(t.withdrawConfirmPrompt);
    if (confirmMsg !== t.withdrawKeyword) return;

    try {
        await api.delete('/users/delete');
        alert(t.withdrawComplete);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
    } catch (error) {
        console.error("회원 탈퇴 실패:", error);
        alert(t.withdrawFail);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm(t.logoutConfirm)) return;
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error("로그아웃 요청 에러:", error);
    } finally {
        localStorage.removeItem('accessToken');
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        alert(t.logoutSuccess);
        window.location.href = '/login'; 
    }
  };

  const handleCopyAddress = () => {
    if (walletData.publicAddress && walletData.publicAddress !== 'Loading...') {
        navigator.clipboard.writeText(walletData.publicAddress);
        alert(`${t.copyInternalAddrSuccess}\n📋 ${walletData.publicAddress}`);
    }
  };

  return (
    <div className={common.layout}>
      
      <header className={styles.header}>
        <div className={`${styles.content} ${common.fadeIn}`}>
            <div className={styles.brandLogo}>
                <img src={UsdtLogo} alt="USDT Logo" className={styles.usdtIcon} />
                <h1 className={styles.logoText}>TsPay</h1>
            </div>
        </div>
      </header>

      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        
        <section className={styles.profileCard}>
            <div className={styles.avatarWrapper}>
                <img src={userData.avatar} alt="Profile" className={styles.avatarImg} />
            </div>
            <div className={styles.userInfo}>
                <h3 className={styles.userName}>
                    {language === 'ko' ? `${userData.lastName}${userData.firstName}` : `${userData.firstName} ${userData.lastName}`} {t.sendToSuffix}
                </h3>
                <p className={styles.userEmail}>{userData.email}</p>
                
                <div className={styles.walletBox} onClick={handleCopyAddress}>
                    <div className={styles.walletIcon}>
                        <img src={walletAddressIcon} alt="wallet" />
                    </div>
                    <span className={styles.walletText}>
                        {walletData.publicAddress}
                    </span>
                    <span className={styles.copyBtn}>{t.copyAddrBtn}</span>
                </div>
            </div>
        </section>

        <div className={styles.menuList}>
            <div className={styles.menuItem} onClick={() => setShowEditModal(true)}>
                <span className={styles.menuIcon}>👤</span>
                <span className={styles.menuTitle}>{t.myInfoEdit}</span>
                <span className={styles.arrowIcon}>›</span>
            </div>
            
            <div className={styles.menuItem} onClick={() => setShowPwModal(true)}>
                <span className={styles.menuIcon}>🔒</span>
                <span className={styles.menuTitle}>{t.securityCenter}</span>
                <span className={styles.arrowIcon}>›</span>
            </div>

            <div className={styles.menuItem} onClick={handleWithdraw} style={{color: '#d32f2f'}}>
                <span className={styles.menuIcon}>🗑️</span>
                <span className={styles.menuTitle}>{t.withdrawMember}</span>
                <span className={styles.arrowIcon}>›</span>
            </div>
        </div>

        <button className={styles.logoutBtn} onClick={handleLogout}>
            {t.logout}
        </button>

      </div>

      {showEditModal && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>{t.myInfoEdit}</h3>
                <input 
                    type="text" 
                    placeholder={t.lastNameLabel}
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    className={styles.modalInput}
                />
                <input 
                    type="text" 
                    placeholder={t.firstNameLabel}
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    className={styles.modalInput}
                />
                <div className={styles.modalActions}>
                    <button onClick={() => setShowEditModal(false)} className={styles.cancelBtn}>{t.cancel}</button>
                    <button onClick={handleUpdateInfo} className={styles.confirmBtn}>{t.confirm}</button>
                </div>
            </div>
        </div>
      )}

      {showPwModal && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>{t.resetPw}</h3>
                <input 
                    type="password" 
                    placeholder={t.currentPw}
                    value={pwForm.password}
                    onChange={(e) => setPwForm({...pwForm, password: e.target.value})}
                    className={styles.modalInput}
                />
                <input 
                    type="password" 
                    placeholder={t.newPwPlaceholder}
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})}
                    className={styles.modalInput}
                />
                <input 
                    type="password" 
                    placeholder={t.newPwConfirmPlaceholder}
                    value={pwForm.checkPassword}
                    onChange={(e) => setPwForm({...pwForm, checkPassword: e.target.value})}
                    className={styles.modalInput}
                />
                <div className={styles.modalActions}>
                    <button onClick={() => setShowPwModal(false)} className={styles.cancelBtn}>{t.cancel}</button>
                    <button onClick={handleChangePassword} className={styles.confirmBtn}>{t.confirm}</button>
                </div>
            </div>
        </div>
      )}

      <nav className={styles.bottomNav}>
        <div className={styles.navItem} onClick={() => navigate('/home')}>
            <img src={navHomeIcon} className={styles.navImg} alt={t.home} />
            <span className={styles.navText}>{t.home}</span>
        </div>
        <div className={styles.navItem} onClick={() => navigate('/pay')}>
            <img src={navPayIcon} className={styles.navImg} alt={t.payNav} />
            <span className={styles.navText}>{t.payNav}</span>
        </div>
        <div className={`${styles.navItem} ${styles.active}`}>
            <img src={navUserIcon} className={styles.navImg} alt={t.myPage} />
            <span className={styles.navText}>{t.myPage}</span>
        </div>
      </nav>

    </div>
  );
};

export default MyPageScreen;