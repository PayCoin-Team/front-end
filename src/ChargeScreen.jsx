import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './ChargeScreen.module.css';

import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import usdtLogo from './component/UsdtLogo.svg';

const ChargeScreen = () => {
  const navigate = useNavigate();

  // 상태 관리: 'input' (입력) -> 'loading' (로딩) -> 'success' (완료)
  const [step, setStep] = useState('input');
  const [amount, setAmount] = useState('');

  // 충전 버튼 클릭 핸들러
  const handleCharge = () => {
    if (!amount) return alert("금액을 입력해주세요.");

    // 1. 로딩 단계로 전환
    setStep('loading');

    // 2. 2초 뒤 완료 단계로 자동 전환 (API 통신 시뮬레이션)
    setTimeout(() => {
      setStep('success');
    }, 3000);
  };

  return (
    <div className={common.layout}>
      
      {/* 1. 상단 헤더 (입력 단계에서만 표시) */}
      {step === 'input' && (
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
          <h2 className={styles.title}>충전</h2>
          <div style={{ width: 24 }}></div>
        </header>
      )}

      {/* 2. 메인 콘텐츠 영역 */}
      <div className={`${styles.container} ${common.fadeIn} ${step !== 'input' ? styles.centerMode : ''}`}>
        
        {/* [STEP 1] 금액 입력 화면 */}
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

        {/* [STEP 2] 로딩 화면 */}
        {step === 'loading' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="CrossPay Logo" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>충전이 진행되는 중입니다.</p>
          </div>
        )}

        {/* [STEP 3] 완료 화면 */}
        {step === 'success' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="CrossPay Logo" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>충전이 완료되었습니다.</p>
            
            <button className={styles.confirmBtn} onClick={() => navigate(-1)}>
              확인
            </button>
          </div>
        )}

      </div>
       
      {/* 3. 하단 네비게이션 (구조 유지) */}
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