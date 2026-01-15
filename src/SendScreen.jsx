import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './SendScreen.module.css';

// 하단 네비게이션 아이콘
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';

const SendScreen = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');

  // '보내기' 버튼 클릭 시 실행
  const handleSend = () => {
    // 1. 유효성 검사
    if (!amount || Number(amount) <= 0) {
      alert("보낼 금액을 정확히 입력해주세요.");
      return;
    }

    // 2. 송금 확인 (실제 앱에서는 비밀번호 입력 등으로 이어짐)
    if(window.confirm(`홍길동 님에게 ${amount} USDT를 보내시겠습니까?`)) {
        alert("송금이 완료되었습니다.");
        navigate('/home'); // 완료 후 홈으로 이동
    }
  };

  return (
    <div className={common.layout}>
      
      {/* 1. 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <h2 className={styles.title}>송금</h2>
        <div style={{ width: 24 }}></div> {/* 우측 여백 맞춤용 */}
      </header>

      {/* 2. 메인 콘텐츠 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        
        {/* 받는 사람 정보 섹션 */}
        <section className={styles.recipientSection}>
            <h1 className={styles.recipientTitle}>
                <span className={styles.name}>홍길동</span> 
                <span className={styles.suffix}>님에게</span>
            </h1>
            <p className={styles.subText}>받는 사람이 홍길동 님이 맞으십니까?</p>
        </section>

        {/* 보낼 금액 입력 섹션 */}
        <section className={styles.amountSection}>
            <h3 className={styles.label}>보낼 금액</h3>
            
            <div className={styles.inputWrapper}>
                <input 
                    type="number" 
                    className={styles.amountInput}
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <span className={styles.unit}>USDT</span>
            </div>
        </section>

        {/* 보내기 버튼 (오른쪽 정렬) */}
        <div className={styles.actionArea}>
            <button className={styles.sendBtn} onClick={handleSend}>
                보내기
            </button>
        </div>

      </div>

      {/* 3. 하단 네비게이션 (결제 탭 Active 상태 유지) */}
      <nav className={styles.bottomNav}>
        <div className={styles.navItem} onClick={() => navigate('/home')}>
            <img src={navHomeIcon} className={styles.navImg} alt="홈" />
            <span className={styles.navText}>홈</span>
        </div>
        <div className={`${styles.navItem} ${styles.active}`}>
            <img src={navPayIcon} className={styles.navImg} alt="결제" />
            <span className={styles.navText}>결제</span>
        </div>
        <div className={styles.navItem} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={styles.navImg} alt="마이페이지" />
            <span className={styles.navText}>마이페이지</span>
        </div>
      </nav>

    </div>
  );
};

export default SendScreen;