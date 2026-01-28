import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './PayScreen.module.css';
import api from './utils/api'; 
import { translations } from './utils/translations';

// 아이콘
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';

// 로고 파일
import usdtLogo from './component/UsdtLogo.svg';

const PayScreen = () => {
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
  
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  
  const [receiverName, setReceiverName] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const checkAddress = async () => {
    if (address.length < 8) {
      alert(t.alertInputWalletAddr);
      return;
    }

    try {
      const response = await api.get(`/wallets/verify`, {
        params: { address: address }
      });

      const name = response.data; 
      setReceiverName(name);
      setIsVerified(true);
      alert(`'${name}' ${t.alertUserVerified}`);
      
    } catch (error) {
      console.error("주소 확인 실패:", error);
      setIsVerified(false);
      setReceiverName('');
      
      if (error.response && error.response.status === 404) {
        alert(t.errorUserNotFoundPay);
      } else {
        alert(t.errorVerifyAddrFail);
      }
    }
  };

  const goNextStep = () => {
    if (!isVerified || !receiverName) {
      alert(t.alertNeedVerifyFirst);
      return;
    }
    setStep(2);
  };

  const handleSend = async () => {
    if (!amount || Number(amount) <= 0) {
      alert(t.alertInputAmountPay);
      return;
    }

    setStep(3);

    try {
      const response = await api.post('/history/transfer', {
        targetAddress: address,
        amount: Number(amount)
      });

      if (response.status === 201 || response.status === 200) {
        setTimeout(() => {
            setStep(4);
        }, 2000);
      }

    } catch (error) {
      console.error("송금 실패:", error);
      setStep(2);

      let msg = t.errorSendFail;
      if (error.response) {
          if (error.response.status === 400) msg = t.errorInsuffientOrSelf;
          else if (error.response.status === 404) msg = t.errorTargetAddrNotFound;
          else if (error.response.data && error.response.data.message) msg = error.response.data.message;
      }
      alert(msg);
    }
  };

  const handleInputChange = (e) => {
      setAddress(e.target.value);
      setIsVerified(false);
  };

  return (
    <div className={common.layout}>
      
      {step === 1 && (
        <div className={styles.container}>
          <header className={styles.header}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
            <h2 className={styles.title}>{t.payNav}</h2>
          </header>

          <div className={styles.content}>
            <div className={styles.scannerPlaceholder}>
                <div className={styles.scanIcon}>📸</div>
                <p className={styles.scanMsg}>
                    {t.webScannerMsg}
                </p>
                <p className={styles.scanSubMsg}>
                    {t.webScannerSubMsg}
                </p>
            </div>
            
            <div className={styles.inputCapsule}>
                <input 
                  type="text" 
                  placeholder={t.placeholderWalletAddr} 
                  className={styles.inputField}
                  value={address}
                  onChange={handleInputChange}
                />
                <button className={styles.miniCheckBtn} onClick={checkAddress}>{t.btnVerifyAddr}</button>
                <button className={styles.circleNextBtn} onClick={goNextStep}>›</button>
            </div>

            <p className={styles.guideText}>
              {t.payGuide}
            </p>
          </div>
          
          <BottomNav navigate={navigate} t={t} />
        </div>
      )}

      {step === 2 && (
        <div className={styles.container}>
          <header className={styles.header}>
            <button className={styles.backBtn} onClick={() => setStep(1)}>←</button>
            <h2 className={styles.title}>{t.payNav}</h2>
          </header>

          <div className={styles.content} style={{alignItems: 'flex-start', textAlign: 'left'}}>
            <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '10px'}}>
              <span style={{color: '#169279'}}>{receiverName}</span> {t.sendToSuffix}<br/>
              <span style={{fontSize:'0.9rem', color:'#888', fontWeight:'normal'}}>{t.recipientCheck}</span>
            </h1>

            <div style={{height: 40}}></div>

            <h2 style={{fontSize: '1.2rem', color: '#169279', fontWeight: 'bold', marginBottom: '10px'}}>{t.sendAmountLabel}</h2>
            
            <div style={{display:'flex', alignItems:'center', borderBottom: '2px solid #169279', width:'100%', paddingBottom: '5px'}}>
              <input 
                type="number" 
                placeholder="0"
                style={{flex:1, border:'none', fontSize:'2rem', fontWeight:'bold', color:'#169279', outline:'none', background:'transparent'}}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span style={{fontSize:'1.2rem', fontWeight:'bold', color:'#169279'}}>USDT</span>
            </div>

            <button 
                style={{width:'100%', backgroundColor:'#169279', color:'white', padding:'15px', borderRadius:'12px', border:'none', fontSize:'1.1rem', fontWeight:'bold', marginTop:'30px', cursor:'pointer'}}
                onClick={handleSend}
            >
              {t.sendBtn}
            </button>
          </div>

          <BottomNav navigate={navigate} t={t} />
        </div>
      )}

      {(step === 3 || step === 4) && (
        <div className={styles.container}>
          <div className={styles.centerContent}>
            <div className={styles.logoArea}>
               <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
               <span className={styles.brandName}>CrossPay</span>
            </div>

            <h2 className={styles.statusMessage}>
                {step === 3 ? t.paymentProgress : t.paymentComplete}
            </h2>

            <button 
                className={`${styles.confirmBtn} ${step === 3 ? styles.hiddenBtn : ''}`} 
                onClick={() => navigate('/home')}
                disabled={step === 3} 
            >
              {t.confirm}
            </button>
          </div>

          <BottomNav navigate={navigate} t={t} />
        </div>
      )}

    </div>
  );
};

const BottomNav = ({ navigate, t }) => (
  <nav className={common.bottomNav}>
    <div className={common.navItem} onClick={() => navigate('/home')}>
        <img src={navHomeIcon} className={common.navImg} alt={t.home} />
        <span className={common.navText}>{t.home}</span>
    </div>
    <div className={`${common.navItem} ${common.active}`}>
        <img src={navPayIcon} className={common.navImg} alt={t.payNav} />
        <span className={common.navText}>{t.payNav}</span>
    </div>
    <div className={common.navItem} onClick={() => navigate('/mypage')}>
        <img src={navUserIcon} className={common.navImg} alt={t.myPage} />
        <span className={common.navText}>{t.myPage}</span>
    </div>
  </nav>
);

export default PayScreen;