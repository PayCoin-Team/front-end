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
  const language = localStorage.getItem('appLanguage') || 'ko';
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
        console.log("💰 내 지갑 정보 응답:", res.data); // 데이터 확인용

        if (res.data) {
           let addr = "";
           const ext = res.data.externalAddress;
           if (Array.isArray(ext) && ext.length > 0) addr = ext[0];
           else if (typeof ext === 'string') addr = ext;

           // 서버에서 주는 이름이 amount 일수도, balance 일수도 있어서 둘 다 체크
           const serverBalance = res.data.amount ?? res.data.balance ?? 0;

           setMyWallet({
             balance: Number(serverBalance), 
             externalAddress: addr
           });

           if (!addr) {
             alert("연동된 외부 지갑이 없습니다.");
             navigate('/home');
           }
        }
      } catch (err) {
        console.error("지갑 정보 로드 실패:", err);
        navigate('/home');
      }
    };
    fetchWalletInfo();
  }, [navigate]);

  // [API] 출금 신청 (Polling 없이 즉시 완료 처리)
  const handleWithdraw = async () => {
    // 1. 유효성 검사
    if (!amount || Number(amount) <= 0) {
      alert("올바른 금액을 입력해주세요.");
      return;
    }

    if (Number(amount) > myWallet.balance) {
      alert("잔액이 부족합니다.");
      return;
    }
    
    try {
      setStep('loading');

      // 2. 출금 요청 (POST)
      const response = await api.post('/transaction/withdraw', {
        amount: Number(amount),
        walletAddress: myWallet.externalAddress
      });

      // 3. 응답 처리 (Polling 제거됨)
      // 서버가 200(OK)이나 201(Created)을 주면 무조건 성공으로 간주
      if (response.status === 201 || response.status === 200) {
        console.log("✅ 출금 요청 성공:", response.data);
        
        // 기다리지 않고 바로 성공 화면으로 전환!
        setStep('success');
      } 

    } catch (error) {
      console.error("에러 발생:", error);
      let msg = "오류가 발생했습니다.";
      
      if (error.response && error.response.data) {
          msg = JSON.stringify(error.response.data);
          // 에러 메시지 파싱
          if (typeof error.response.data === 'string') msg = error.response.data;
          if (error.response.data.message) msg = error.response.data.message;
      }

      alert(`오류: ${msg}`);
      setStep('input');
    }
  };

  return (
    <div className={common.layout}>
      {step === 'input' && (
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
          <h2 className={styles.title}>출금하기</h2>
          <div style={{ width: 24 }}></div>
        </header>
      )}

      <div className={`${styles.container} ${common.fadeIn} ${step !== 'input' ? styles.centerMode : ''}`}>
        {step === 'input' && (
          <>
            <div className={styles.mainLabel} style={{marginBottom:'10px'}}>
                출금할 금액 <span style={{fontSize:'0.9rem', color:'#888', fontWeight:'normal'}}>(잔액: {myWallet.balance.toLocaleString()} USDT)</span>
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
                출금하기
              </button>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>출금 요청 중입니다...<br/><span style={{fontSize:'14px', color:'#999'}}>잠시만 기다려주세요.</span></p>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>출금 신청 완료!</p>
            <p className={styles.amountText}>- {Number(amount).toLocaleString()} USDT</p>
            <p className={styles.descText}>
                외부 지갑으로 전송이 시작되었습니다.<br/>
                잠시 후 지갑을 확인해주세요.
            </p>
            <button className={styles.confirmBtn} onClick={() => navigate('/home')}>확인</button>
          </div>
        )}
      </div>

      <nav className={common.bottomNav}>
        <div className={common.navItem} onClick={() => navigate('/home')}>
            <img src={navHomeIcon} className={common.navImg} alt="Home" />
            <span className={common.navText}>{t.home}</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/pay')}>
            <img src={navPayIcon} className={common.navImg} alt="Pay" />
            <span className={common.navText}>{t.payNav}</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={common.navImg} alt="MyPage" />
            <span className={common.navText}>{t.myPage}</span>
        </div>
      </nav>
    </div>
  );
};

export default WithdrawScreen;