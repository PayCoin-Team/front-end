import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './ChargeScreen.module.css'; // 기존 스타일 파일 사용

import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import usdtLogo from './component/UsdtLogo.svg';

const Processing = () => {
  const navigate = useNavigate();

  // 상태 관리: 시작하자마자 'loading' -> 3초 뒤 'success'
  const [step, setStep] = useState('loading');

  // 화면 진입 시 자동으로 타이머 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('success');
    }, 3000); // 3초 뒤 완료 상태로 전환

    return () => clearTimeout(timer); // 컴포넌트가 사라질 때 타이머 정리
  }, []);

  return (
    <div className={common.layout}>
      
      {/* 메인 콘텐츠 영역 (항상 중앙 정렬 모드 적용) */}
      <div className={`${styles.container} ${common.fadeIn} ${styles.centerMode}`}>
        
        {/* [STEP 1] 로딩 화면 */}
        {step === 'loading' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="CrossPay Logo" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>결제가 진행되는 중입니다.</p>
          </div>
        )}

        {/* [STEP 2] 완료 화면 */}
        {step === 'success' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="CrossPay Logo" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>결제가 완료되었습니다.</p>
            
            <button className={styles.confirmBtn} onClick={() => navigate('/home')}>
              확인
            </button>
          </div>
        )}

      </div>
       
      {/* 3. 하단 네비게이션 */}
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

export default Processing;