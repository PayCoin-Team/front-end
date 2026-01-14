import React from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './ChargeScreen.module.css';

import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';


const ChargeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className={common.layout}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <h2 className={styles.title}>충전</h2>
        <div style={{width: 24}}></div>
      </header>

      <div className={`${styles.container} ${common.fadeIn}`}>
        <h1 className={styles.mainLabel}>잔고에 충전할 금액</h1>
        
        <div className={styles.inputWrapper}>
          <input type="number" placeholder="금액 입력" className={styles.chargeInput} />
          <span className={styles.unit}>USDT</span>
        </div>

        <div className={styles.btnWrapper}>
          <button className={styles.submitBtn}>충전</button>
        </div>
      </div>
       
       {/* 3. 하단 네비게이션 (마이페이지 Active 상태) */}
             <nav className={styles.bottomNav}>
               <div className={styles.navItem} onClick={() => navigate('/home')}>
                   <img src={navHomeIcon} className={styles.navImg} alt="홈" />
                   <span className={styles.navText}>홈</span>
               </div>
               <div className={styles.navItem} onClick={() => navigate('/pay')}>
                   <img src={navPayIcon} className={styles.navImg} alt="결제" />
                   <span className={styles.navText}>결제</span>
               </div>
               <div className={`${styles.navItem} ${styles.active}`}        
                            onClick={() => navigate('/mypage')}>
                   <img src={navUserIcon} className={styles.navImg} alt="마이페이지" />
                   <span className={styles.navText}>마이페이지</span>
               </div>
             </nav>
       
           </div>

  );
};

export default ChargeScreen;