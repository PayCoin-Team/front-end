import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import common from './Common.module.css';
import styles from './ChargeScreen.module.css';

import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import usdtLogo from './component/UsdtLogo.svg';

const ChargeScreen = () => {
  const navigate = useNavigate();

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

  // [API] 2. 상태 확인 함수 (Enum 값 반영: PENDING, PROCESSING, COMPLETED, FAILED)
  const pollTransactionStatus = async (txId) => {
    try {
        const token = localStorage.getItem('accessToken');
        
        const response = await axios.get(`https://api.yourdomain.com/transaction/deposit/${txId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // 서버에서 받은 Enum 값 (String)
        const status = response.data.status; 
        const type = response.data.type; // 'DEPOSIT' 확인용 (필요시 사용)

        console.log(`[Polling] ID: ${txId}, Type: ${type}, Status: ${status}`);

        // ⭐ Enum 로직 처리
        if (status === 'COMPLETED') {
            // 1. 완료 (성공)
            setStep('success');

        } else if (status === 'PENDING' || status === 'PROCESSING') {
            // 2. 진행 중 (대기 or 처리 중) -> 2초 뒤 재요청
            pollingRef.current = setTimeout(() => pollTransactionStatus(txId), 2000);

        } else if (status === 'FAILED') {
            // 3. 실패
            alert('충전 처리에 실패했습니다. (관리자 문의 요망)');
            setStep('input');
        } else {
            // 그 외 알 수 없는 상태
            alert(`알 수 없는 상태입니다: ${status}`);
            setStep('input');
        }

    } catch (error) {
        console.error("상태 확인 중 오류:", error);
        // 네트워크 에러 등이 나도 잠시 후 다시 시도하게 할지, 멈출지 결정.
        // 여기서는 안전하게 멈추고 유저에게 알림
        alert('상태 확인 중 통신 오류가 발생했습니다.');
        setStep('input');
    }
  };

  // [API] 1. 충전 신청 함수
  const handleCharge = async () => {
    if (!amount || Number(amount) <= 0) return alert("올바른 금액을 입력해주세요.");

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
                alert('응답에 Transaction ID가 없습니다.');
                setStep('input');
            }
        } else {
            alert('충전 요청 실패');
            setStep('input');
        }

    } catch (error) {
        console.error("충전 요청 오류:", error);
        alert('서버 통신 오류');
        setStep('input');
    }
  };

  return (
    <div className={common.layout}>
      
      {/* 헤더 */}
      {step === 'input' && (
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
          <h2 className={styles.title}>충전</h2>
          <div style={{ width: 24 }}></div>
        </header>
      )}

      {/* 메인 콘텐츠 */}
      <div className={`${styles.container} ${common.fadeIn} ${step !== 'input' ? styles.centerMode : ''}`}>
        
        {/* STEP 1: 입력 */}
        {step === 'input' && (
          <>
            <h1 className={styles.mainLabel}>잔고에 충전할 금액</h1>
            <div className={styles.inputWrapper}>
              <input 
                type="number" 
                placeholder="금액 입력" 
                className={styles.chargeInput}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className={styles.unit}>USDT</span>
            </div>
            <div className={styles.btnWrapper}>
              <button className={styles.submitBtn} onClick={handleCharge}>
                충전
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
               충전 진행 중입니다...<br/>
               <span style={{fontSize: '14px', color: '#999', fontWeight: 'normal'}}>
                 잠시만 기다려주세요.
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
            <p className={styles.statusText}>충전이 완료되었습니다!</p>
            <p className={styles.amountText}>+ {Number(amount).toLocaleString()} USDT</p>
            
            <button className={styles.confirmBtn} onClick={() => navigate('/home')}>
              확인
            </button>
          </div>
        )}

      </div>
       
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
        <div className={`${styles.navItem} ${styles.active}`} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={styles.navImg} alt="마이페이지" />
            <span className={styles.navText}>마이페이지</span>
        </div>
      </nav>
       
    </div>
  );
};

export default ChargeScreen;