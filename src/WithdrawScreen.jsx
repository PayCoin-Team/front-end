import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './ChargeScreen.module.css'; // 스타일 공유

// 아이콘
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import usdtLogo from './component/UsdtLogo.svg';

// 유틸 및 API
import api from './utils/api';
import { translations } from './utils/translations';

const WithdrawScreen = () => {
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

  const [step, setStep] = useState('input');
  const [amount, setAmount] = useState('');
  
  // 지갑 정보 상태
  const [myWallet, setMyWallet] = useState({ 
    balance: 0, 
    externalAddress: null 
  });
  
  // [초기 로드] 지갑 정보(잔액, 외부주소) 조회
  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const res = await api.get('/wallets/users/me');
        console.log("💰 내 지갑 정보 응답:", res.data); 

        if (res.data) {
           let addr = "";
           const ext = res.data.externalAddress;
           if (Array.isArray(ext) && ext.length > 0) addr = ext[0];
           else if (typeof ext === 'string') addr = ext;

           const serverBalance = res.data.amount ?? res.data.balance ?? 0;

           setMyWallet({
             balance: Number(serverBalance), 
             externalAddress: addr
           });

           if (!addr) {
             alert(t.errorNoExternalWallet);
             navigate('/home');
           }
        }
      } catch (err) {
        console.error("지갑 정보 로드 실패:", err);
        navigate('/home');
      }
    };
    fetchWalletInfo();
  }, [navigate, t]);

  // [API] 출금 신청
  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) {
      alert(t.alertInputAmount);
      return;
    }

    if (Number(amount) > myWallet.balance) {
      alert(t.errorInsufficientBalance);
      return;
    }
    
    try {
      setStep('loading');

      const response = await api.post('/transaction/withdraw', {
        amount: Number(amount),
        walletAddress: myWallet.externalAddress
      });

      if (response.status === 201 || response.status === 200) {
        console.log("✅ 출금 요청 성공:", response.data);
        setStep('success');
      } 

    } catch (error) {
      console.error("에러 발생:", error);
      let msg = t.alertErrorGeneral;
      
      if (error.response && error.response.data) {
          msg = JSON.stringify(error.response.data);
          if (typeof error.response.data === 'string') msg = error.response.data;
          if (error.response.data.message) msg = error.response.data.message;
      }

      alert(`${msg}`);
      setStep('input');
    }
  };

  return (
    <div className={common.layout}>
      {step === 'input' && (
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
          <h2 className={styles.title}>{t.withdrawTitle}</h2>
          <div style={{ width: 24 }}></div>
        </header>
      )}

      <div className={`${styles.container} ${common.fadeIn} ${step !== 'input' ? styles.centerMode : ''}`}>
        {step === 'input' && (
          <>
            <div className={styles.mainLabel} style={{marginBottom:'10px'}}>
                {t.withdrawAmountLabel} <span style={{fontSize:'0.9rem', color:'#888', fontWeight:'normal'}}>{t.withdrawBalancePrefix}{myWallet.balance.toLocaleString()} USDT)</span>
            </div>
            
            <div className={styles.inputWrapper}>
              <input 
                type="number" 
                min="0"
                placeholder="0"
                className={styles.chargeInput}
                value={amount}
                onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || Number(val) >= 0) {
                        setAmount(val);
                    }
                }}
              />
              <span className={styles.unit}>USDT</span>
            </div>

            <div className={styles.transferInfoBox}>
                <div className={styles.transferRow}>
                    <span className={styles.transferLabel}>From</span>
                    <span className={styles.transferValue}>My CrossPay</span>
                </div>
                <div className={styles.arrowArea}>↓</div>
                <div className={styles.transferRow}>
                    <span className={styles.transferLabel}>To</span>
                    <span className={styles.transferValue}>
                        {myWallet.externalAddress ? `${myWallet.externalAddress.substring(0,6)}...` : 'Loading...'}
                    </span>
                </div>
            </div>

            <div className={styles.btnWrapper}>
              <button className={styles.submitBtn} onClick={handleWithdraw}>
                {t.btnWithdraw}
              </button>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>{t.statusWithdrawing}<br/><span style={{fontSize:'14px', color:'#999'}}>{t.waitMoment}</span></p>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>{t.statusWithdrawRequestComplete}</p>
            <p className={styles.amountText}>- {Number(amount).toLocaleString()} USDT</p>
            <p className={styles.descText}>
                {t.withdrawStartDesc}
            </p>
            <button className={styles.confirmBtn} onClick={() => navigate('/home')}>{t.confirm}</button>
          </div>
        )}
      </div>

      <nav className={common.bottomNav}>
        <div className={common.navItem} onClick={() => navigate('/home')}>
            <img src={navHomeIcon} className={common.navImg} alt={t.home} />
            <span className={common.navText}>{t.home}</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/pay')}>
            <img src={navPayIcon} className={common.navImg} alt={t.payNav} />
            <span className={common.navText}>{t.payNav}</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={common.navImg} alt={t.myPage} />
            <span className={common.navText}>{t.myPage}</span>
        </div>
      </nav>
    </div>
  );
};

export default WithdrawScreen;