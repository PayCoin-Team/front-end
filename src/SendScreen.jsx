import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './SendScreen.module.css';
import { translations } from './utils/translations'; // 번역 파일

// 이미지 경로 (실제 프로젝트 경로에 맞춤)
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';

const SendScreen = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');

  // ★ [수정됨] Splash에서 저장한 키값('appLanguage')과 똑같이 맞춰줍니다.
  const [language, setLanguage] = useState(() => {
    // 1. Splash에서 저장해둔 언어 설정을 가져옵니다.
    const savedLang = localStorage.getItem('appLanguage'); 
    
    // 2. 저장된 게 있으면 쓰고, 없으면 기본값 'ko' (혹시 모를 오류 방지)
    return savedLang && translations[savedLang] ? savedLang : 'ko';
  });

  // 현재 언어 텍스트 로드
  const t = translations[language];

  const handleSend = () => {
    // 1. 금액 유효성 검사
    if (!amount || Number(amount) <= 0) {
      alert(t.alertValidAmount || '금액을 확인해주세요.');
      return;
    }

    // 2. 언어별 어순에 따른 확인 메시지 생성
    let confirmMessage = '';
    
    // 한국어(ko), 일본어(ja) -> [이름] [조사] [메시지]
    if (language === 'ko' || language === 'ja') {
        confirmMessage = `Hong Gil-dong ${t.sendConfirmMsg}\n(${amount} USDT)`;
    } 
    // 그 외(영어, 중국어 등) -> [메시지] [이름]
    else {
        confirmMessage = `${t.sendConfirmMsg} Hong Gil-dong?\n(${amount} USDT)`;
    }

    if(window.confirm(confirmMessage)) {
        alert(t.sendDone);
        navigate('/home');
    }
  };

  return (
    <div className={common.layout}>
      
      {/* 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <h2 className={styles.title}>{t.sendTitle}</h2>
      </header>

      {/* 메인 콘텐츠 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        
        {/* 받는 사람 정보 */}
        <section className={styles.recipientSection}>
            <h1 className={styles.recipientTitle}>
                {/* 접두사 (To, A 등) */}
                {t.sendToPrefix && <span className={styles.suffix} style={{marginRight:6}}>{t.sendToPrefix}</span>}
                
                <span className={styles.name}>Hong Gil-dong</span> 
                
                {/* 접미사 (님에게, 様へ 등) */}
                {t.sendToSuffix && <span className={styles.suffix} style={{marginLeft:2}}>{t.sendToSuffix}</span>}
            </h1>
            <p className={styles.subText}>{t.recipientCheck}</p>
        </section>

        {/* 금액 입력 */}
        <section className={styles.amountSection}>
            <h3 className={styles.label}>{t.sendAmountLabel}</h3>
            
            <div className={styles.inputWrapper}>
                <input 
                    type="number" 
                    className={styles.amountInput}
                    placeholder={t.amountPlaceholder}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <span className={styles.unit}>USDT</span>
            </div>
        </section>

        {/* 보내기 버튼 */}
        <div className={styles.actionArea}>
            <button className={styles.sendBtn} onClick={handleSend}>
                {t.sendBtn}
            </button>
        </div>

      </div>

      {/* 하단 네비게이션 */}
      <nav className={styles.bottomNav}>
        <div className={styles.navItem} onClick={() => navigate('/home')}>
            <img src={navHomeIcon} className={styles.navImg} alt="home" />
            <span className={styles.navText}>{t.home}</span>
        </div>
        <div className={`${styles.navItem} ${styles.active}`}>
            <img src={navPayIcon} className={styles.navImg} alt="pay" />
            <span className={styles.navText}>{t.payNav}</span>
        </div>
        <div className={styles.navItem} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={styles.navImg} alt="mypage" />
            <span className={styles.navText}>{t.myPage}</span>
        </div>
      </nav>

    </div>
  );
};

export default SendScreen;