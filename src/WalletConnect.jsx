import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Key, ShieldCheck, RefreshCw, Home, Settings, ChevronLeft } from 'lucide-react';

import common from './Common.module.css';
import styles from './WalletConnect.module.css';
import api from './utils/api'; 
import { translations } from './utils/translations';

const WalletConnect = () => {
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

  const t = translations[language];
  
  // Step 0:로딩, 1:연동시작, 2:서명대기, 3:완료
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 데이터 상태
  const [walletAddress, setWalletAddress] = useState('');
  const [nonce, setNonce] = useState('');
  
  // 지갑 정보 상태
  const [myWalletInfo, setMyWalletInfo] = useState(null); 
  const [connectedAddress, setConnectedAddress] = useState(''); 

  // --- 1. 초기 로드 ---
  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wallets/users/me', {
          params: { _t: new Date().getTime() } 
      });
      setMyWalletInfo(res.data);

      if (res.data && res.data.externalAddress) {
          setConnectedAddress(res.data.externalAddress);
          setStep(3);
      } else {
          setStep(1);
      }

    } catch (err) {
      console.error("초기 로드 실패:", err);
      if (err.response && err.response.status === 401) {
        alert(t.errorSessionExpired);
        navigate('/login');
        return;
      }
      setStep(1); 
    } finally {
      setLoading(false);
    }
  };

  // --- 2. TronLink 연결 및 Nonce 요청 ---
  const handleConnectAndRequestNonce = async () => {
    setError('');
    setLoading(true);

    try {
      let tron = window.tronWeb;
      
      if (!tron) {
          for (let i = 0; i < 3; i++) {
              await new Promise(resolve => setTimeout(resolve, 500));
              if (window.tronWeb) {
                  tron = window.tronWeb;
                  break;
              }
          }
      }

      if (window.tronLink) {
          try {
              const res = await window.tronLink.request({ method: 'tron_requestAccounts' });
              if (res.code === 200) tron = window.tronWeb; 
              else if (res.code === 4001) throw new Error(t.errorRejectConnect);
          } catch (e) {
              if (!tron || !tron.defaultAddress) throw new Error(t.errorCheckPopup);
          }
      }

      if (!tron || !tron.defaultAddress || !tron.defaultAddress.base58) {
        throw new Error(t.errorNoWallet);
      }

      const base58Address = tron.defaultAddress.base58;
      setWalletAddress(base58Address);

      const response = await api.post('/wallets/nonce', { address: base58Address });
      
      if (response.data && response.data.nonce) {
        setNonce(response.data.nonce);
        setStep(2); 
      } else {
        throw new Error(t.errorNonceFail);
      }

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || t.alertErrorGeneral;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. 서명 및 서버 검증 ---
  const handleSignAndVerify = async () => {
    setError('');
    setLoading(true);

    try {
      const tron = window.tronWeb;
      if (!tron || !tron.defaultAddress) throw new Error(t.errorNoTronLink);

      const currentAddress = tron.defaultAddress.base58;
      if (currentAddress !== walletAddress) {
          throw new Error(t.errorAddrChanged);
      }

      const signature = await tron.trx.signMessageV2(nonce);
      await api.post('/wallets/verify', {
        address: walletAddress, 
        nonce: nonce, 
        signature: signature
      });

      setConnectedAddress(walletAddress);
      setStep(3); 

    } catch (err) {
      console.error("서명 검증 에러:", err);
      if (err.response) {
          const status = err.response.status;
          const msg = err.response.data.message || JSON.stringify(err.response.data);
          if (status === 409) setError(t.errorAlreadyRegistered);
          else setError(`[Error ${status}] ${msg}`);
      } else {
          setError(err.message || t.errorSignCancel);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={common.layout}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ChevronLeft size={28} color="#333" />
        </button>
        <h1 className={styles.headerTitle} style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{t.walletConnectTitle}</h1>
        <div style={{ width: 28 }}></div>
      </div>

      <div className={styles.content}>
        
        {step === 1 && (
          <div className={`${styles.whiteCard} ${common.fadeIn}`}>
            <div className={styles.iconCircle}><Wallet size={28} /></div>
            <h2 className={styles.title}>{t.tronLinkConnect}</h2>
            <p className={styles.subtitle}>{t.connectStartDesc}</p>
            <button className={styles.button} onClick={handleConnectAndRequestNonce} disabled={loading}>
              {loading ? t.checking : t.btnConnectTronLink}
            </button>
            {error && <p className={styles.errorMsg} style={{color: '#ff4d4f', marginTop: '10px'}}>{error}</p>}
          </div>
        )}

        {step === 2 && (
          <div className={`${styles.greenCard} ${common.fadeIn}`}>
            <div className={styles.iconCircle}><Key size={28} /></div>
            <h2 className={styles.title}>{t.signRequest}</h2>
            <p className={styles.subtitle}>{t.signDesc}</p>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t.walletAddressLabel}</label>
              <input type="text" className={styles.input} value={walletAddress} readOnly />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nonce</label>
              <div className={styles.nonceBox}>{nonce}</div>
            </div>

            <button className={styles.button} onClick={handleSignAndVerify} disabled={loading}>
              {loading ? t.verifying : t.btnShowSignPopup}
            </button>
            
            {error && <div className={styles.errorBox}>{error}</div>}
          </div>
        )}

        {step === 3 && (
          <div className={`${styles.greenCard} ${common.fadeIn}`}>
            <div className={styles.iconCircle}><ShieldCheck size={32} /></div>
            <h2 className={styles.title}>{t.connectComplete}</h2>
            <p className={styles.subtitle}>{t.connectSuccessDesc}</p>
            
            <div className={styles.infoList}>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>{t.serviceBalance}</span>
                    <span className={styles.infoValue}>
                         {myWalletInfo?.totalBalance || myWalletInfo?.balance || '0'} USDT
                    </span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>{t.linkedWallet}</span>
                    <span className={styles.infoValue}>
                        {connectedAddress ? connectedAddress.slice(0,6) + '...' + connectedAddress.slice(-4) : ''}
                    </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>{t.status}</span>
                  <span className={styles.infoValue} style={{color: '#81E6D9'}}>{t.active}</span>
                </div>
            </div>

            <button className={styles.button} onClick={() => { setStep(1); setWalletAddress(''); setNonce(''); }}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <RefreshCw size={16} style={{marginRight:8}}/> {t.reconnect}
            </button>
          </div>
        )}
      </div>
      
      <nav className={common.bottomNav}>
         <div className={common.navItem} onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
          <Home className={common.navImg} />
          <span className={common.navText}>{t.home}</span>
        </div>
        <div className={`${common.navItem} ${common.active}`}>
          <Wallet className={common.navImg} />
          <span className={common.navText}>{t.wallet}</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
          <Settings className={common.navImg} />
          <span className={common.navText}>{t.myPage}</span>
        </div>
      </nav>
    </div>
  );
};

export default WalletConnect;