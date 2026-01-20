import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import common from './Common.module.css';
import styles from './ChargeScreen.module.css';

import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import usdtLogo from './component/UsdtLogo.svg';

// [변경 1] 번역 파일 Import (경로가 다르다면 맞춰주세요)
import { translations } from './utils/translations';

const ChargeScreen = () => {
  const navigate = useNavigate();

  // [변경 2] 현재 언어 설정 가져오기 (기본값 'ko')
  const language = localStorage.getItem('appLanguage') || 'ko';
  const t = translations[language];

  // 상태 관리
  const [step, setStep] = useState('input');
  const [amount, setAmount] = useState('');
  
  // 폴링 제어용 Ref
  const pollingRef = useRef(null);

  useEffect(() => {
      return () => {
          if (pollingRef.current) clearTimeout(pollingRef.current);
      };
  }, []);

  // [API] 2. 상태 확인 함수
  const pollTransactionStatus = async (txId) => {
    try {
        const token = localStorage.getItem('accessToken');
        
        const response = await axios.get(`https://api.yourdomain.com/transaction/deposit/${txId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const status = response.data.status; 
        const type = response.data.type; 

        console.log(`[Polling] ID: ${txId}, Type: ${type}, Status: ${status}`);

        if (status === 'COMPLETED') {
            // 1. 완료 (성공)
            setStep('success');

        } else if (status === 'PENDING' || status === 'PROCESSING') {
            // 2. 진행 중 -> 2초 뒤 재요청
            pollingRef.current = setTimeout(() => pollTransactionStatus(txId), 2000);

        } else if (status === 'FAILED') {
            // 3. 실패 -> [변경] 다국어 알림
            alert(t.alertFail); 
            setStep('input');
        } else {
            // 그 외 알 수 없는 상태
            alert(`Unknown Status: ${status}`);
            setStep('input');
        }

    } catch (error) {
        console.error("상태 확인 중 오류:", error);
        // [변경] 다국어 알림
        alert(t.alertError);
        setStep('input');
    }
  };

  // [API] 1. 충전 신청 함수
  const handleCharge = async () => {
    // [변경] 다국어 알림
    if (!amount || Number(amount) <= 0) return alert(t.alertValidAmount);

    try {
        const token = localStorage.getItem('accessToken');
        setStep('loading');

        const response = await axios.post('https://api.yourdomain.com/transaction/deposit', 
            { amount: Number(amount) }, 
            { headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
              } 
            }
        );

        if (response.status === 201 || response.status === 200) {
            const txId = response.data.transactionId;
            if (txId) {
                // 신청 성공 -> 상태 확인 시작
                pollTransactionStatus(txId);
            } else {
                alert('No Transaction ID in response.');
                setStep('input');
            }
        } else {
            alert('Charge Request Failed');
            setStep('input');
        }

    } catch (error) {
        console.error("충전 요청 오류:", error);
        // [변경] 다국어 알림
        alert(t.alertError);
        setStep('input');
    }
  };

  return (
    <div className={common.layout}>
      
      {/* 헤더 */}
      {step === 'input' && (
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
          {/* [변경] 타이틀 번역 */}
          <h2 className={styles.title}>{t.chargeTitle}</h2>
          <div style={{ width: 24 }}></div>
        </header>
      )}

      {/* 메인 콘텐츠 */}
      <div className={`${styles.container} ${common.fadeIn} ${step !== 'input' ? styles.centerMode : ''}`}>
        
        {/* STEP 1: 입력 */}
        {step === 'input' && (
          <>
            {/* [변경] 라벨 번역 */}
            <h1 className={styles.mainLabel}>{t.chargeLabel}</h1>
            <div className={styles.inputWrapper}>
              <input 
                type="number" 
                // [변경] Placeholder 번역
                placeholder={t.amountPlaceholder}
                className={styles.chargeInput}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className={styles.unit}>USDT</span>
            </div>
            <div className={styles.btnWrapper}>
              <button className={styles.submitBtn} onClick={handleCharge}>
                {/* [변경] 버튼 텍스트 번역 */}
                {t.chargeBtn}
              </button>
            </div>
          </>
        )}

        {/* STEP 2: 로딩 (PENDING or PROCESSING) */}
        {step === 'loading' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="USDT Logo" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>
               {/* [변경] 로딩 멘트 번역 */}
               {t.chargingProgress}<br/>
               <span style={{fontSize: '14px', color: '#999', fontWeight: 'normal'}}>
                 {t.waitMoment}
               </span>
            </p>
          </div>
        )}

        {/* STEP 3: 완료 (COMPLETED) */}
        {step === 'success' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="USDT Logo" className={styles.logoImg} />
            </div>
            {/* [변경] 완료 멘트 번역 */}
            <p className={styles.statusText}>{t.chargeComplete}</p>
            <p className={styles.amountText}>+ {Number(amount).toLocaleString()} USDT</p>
            
            <button className={styles.confirmBtn} onClick={() => navigate('/home')}>
              {/* [변경] 확인 버튼 번역 */}
              {t.confirm}
            </button>
          </div>
        )}

      </div>
       
      {/* 하단 네비게이션 */}
      <nav className={styles.bottomNav}>
        <div className={styles.navItem} onClick={() => navigate('/home')}>
            <img src={navHomeIcon} className={styles.navImg} alt="Home" />
            {/* [변경] 네비 텍스트 번역 */}
            <span className={styles.navText}>{t.home}</span>
        </div>
        <div className={styles.navItem} onClick={() => navigate('/pay')}>
            <img src={navPayIcon} className={styles.navImg} alt="Pay" />
            <span className={styles.navText}>{t.payNav}</span>
        </div>
        <div className={`${styles.navItem} ${styles.active}`} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={styles.navImg} alt="MyPage" />
            <span className={styles.navText}>{t.myPage}</span>
        </div>
      </nav>
       
    </div>
  );
};

export default ChargeScreen;