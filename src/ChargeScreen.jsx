import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './ChargeScreen.module.css';

// 아이콘
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import usdtLogo from './component/UsdtLogo.svg';

// 유틸 및 API
import api from './utils/api';
import { translations } from './utils/translations';

// 1. USDT 컨트랙트 (Base58 포맷)
const USDT_CONTRACT_ADDRESS = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf";
// 2. 서버 지갑 주소 (Hex 포맷)
const SERVER_WALLET_ADDRESS = "410d9dc139bfb641d58517da42876ec4022cce7865";

const ChargeScreen = () => {
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
  const [myExternalAddress, setMyExternalAddress] = useState(null); 
  
  const pollingTimerRef = useRef(null);
  const startTimeRef = useRef(null); 

  useEffect(() => {
      return () => {
          if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
      };
  }, []);

  // [초기 로드]
  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const res = await api.get('/wallets/users/me');
        if (res.data) {
           let addr = "";
           const ext = res.data.externalAddress;
           if (Array.isArray(ext) && ext.length > 0) addr = ext[0];
           else if (typeof ext === 'string') addr = ext;

           if (addr) {
             setMyExternalAddress(addr);
           } else {
             alert(t.alertConnectFirst);
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

  // [API] 상태 확인
  const pollTransactionStatus = async (transactionId, txHash) => {
    const now = Date.now();
    
    // 60초 타임아웃
    if (now - startTimeRef.current > 60000) {
        alert(t.alertDepositDelay);
        setStep('input'); 
        return;
    }

    try {
        const response = await api.get(`/transaction/deposit/${transactionId}/${txHash}`);
        const { status } = response.data;

        if (status === 'COMPLETED') {
            setStep('success');
        } else if (status === 'FAILED') {
            alert(t.alertDepositFail);
            setStep('input');
        } else {
            pollingTimerRef.current = setTimeout(() => {
                pollTransactionStatus(transactionId, txHash);
            }, 3000);
        }
    } catch (error) {
        console.error("Polling Error:", error);
        pollingTimerRef.current = setTimeout(() => {
            pollTransactionStatus(transactionId, txHash);
        }, 3000);
    }
  };

  const handleCharge = async () => {
    if (!amount || Number(amount) <= 0) {
      alert(t.alertInputAmount);
      return;
    }
    
    if (!window.tronWeb || !window.tronWeb.ready) {
        alert(t.alertTronLinkNotConnected);
        return;
    }

    try {
      setStep('loading');

      // 📡 [STEP 1] 서버에 입금 신청
      const initResponse = await api.post('/transaction/deposit', {
        amount: Number(amount),
        walletAddress: myExternalAddress
      });

      const transactionId = initResponse.data.transactionId;

      if (!transactionId) {
        throw new Error(t.errorNoTxId);
      }

      // 🚀 [STEP 2] 블록체인 전송
      const amountInSun = BigInt(Math.floor(Number(amount) * 1_000_000)).toString();
      const issuerBase58 = window.tronWeb.defaultAddress.base58;

      const transactionObj = await window.tronWeb.transactionBuilder.triggerSmartContract(
        USDT_CONTRACT_ADDRESS, 
        "transfer(address,uint256)", 
        { feeLimit: 100_000_000 }, 
        [
          { type: 'address', value: SERVER_WALLET_ADDRESS }, 
          { type: 'uint256', value: amountInSun }
        ],
        issuerBase58 
      );

      if (!transactionObj.result || !transactionObj.result.result) {
        throw new Error(t.errorBlockchainFail);
      }

      const signedTx = await window.tronWeb.trx.sign(transactionObj.transaction);
      if (!signedTx.signature) throw new Error("cancelled");

      const broadcast = await window.tronWeb.trx.sendRawTransaction(signedTx);
      if (!broadcast.result) throw new Error(t.errorBroadcastFail);

      const txHash = broadcast.txid; 

      // 📡 [STEP 3] 입금 확인 요청
      startTimeRef.current = Date.now();
      pollTransactionStatus(transactionId, txHash);

    } catch (error) {
      console.error("에러 발생:", error);
      let msg = t.alertErrorGeneral;
      
      if (error.response && error.response.data) {
          msg = JSON.stringify(error.response.data);
      } else if (typeof error === 'string') {
          msg = error;
      } else if (error.message) {
          msg = error.message;
      }

      if (msg.includes('cancelled') || msg.includes('취소')) {
          alert(t.alertCancelTx);
      } else {
          alert(`${msg}`);
      }
      setStep('input');
    }
  };

  return (
    <div className={common.layout}>
      {step === 'input' && (
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
          <h2 className={styles.title}>{t.chargeTitle}</h2>
          <div style={{ width: 24 }}></div>
        </header>
      )}

      <div className={`${styles.container} ${common.fadeIn} ${step !== 'input' ? styles.centerMode : ''}`}>
        {step === 'input' && (
          <>
            <h1 className={styles.mainLabel}>{t.chargeLabel}</h1>
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
                    <span className={styles.transferValue}>
                        {myExternalAddress ? `${myExternalAddress.substring(0,6)}...` : 'Loading...'}
                    </span>
                </div>
                <div className={styles.arrowArea}>↓</div>
                <div className={styles.transferRow}>
                    <span className={styles.transferLabel}>To</span>
                    <span className={styles.transferValue}>Server Wallet</span>
                </div>
            </div>

            <div className={styles.btnWrapper}>
              <button className={styles.submitBtn} onClick={handleCharge}>
                {t.chargeBtn}
              </button>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>{t.statusCharging}<br/><span style={{fontSize:'14px', color:'#999'}}>{t.statusSignWallet}</span></p>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>{t.statusChargeComplete}</p>
            <p className={styles.amountText}>{Number(amount).toLocaleString()} USDT</p>
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

export default ChargeScreen;