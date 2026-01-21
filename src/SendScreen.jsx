import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // API 요청을 위해 추가
import common from './Common.module.css';
import styles from './SendScreen.module.css';
import { translations } from './utils/translations';

// 이미지 경로
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';

const SendScreen = () => {
  const navigate = useNavigate();
  
  // API 명세에 맞춘 State 관리
  const [targetAddress, setTargetAddress] = useState(''); // 받는 사람 주소/ID
  const [amount, setAmount] = useState('');             // 보낼 금액
  const [loading, setLoading] = useState(false);        // 로딩 상태 (중복 클릭 방지)

  // 언어 설정
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('appLanguage'); 
    return savedLang && translations[savedLang] ? savedLang : 'ko';
  });

  const t = translations[language];

  // 송금 버튼 핸들러
  const handleSend = async () => {
    // 1. 유효성 검사
    if (!targetAddress) {
      alert(t.idPlaceholder || '받는 사람 정보를 입력해주세요.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert(t.alertValidAmount || '금액을 확인해주세요.');
      return;
    }

    // 2. 언어별 어순에 따른 확인 메시지 생성
    let confirmMessage = '';
    if (language === 'ko' || language === 'ja') {
        confirmMessage = `${targetAddress} ${t.sendConfirmMsg}\n(${amount} USDT)`;
    } else {
        confirmMessage = `${t.sendConfirmMsg} ${targetAddress}?\n(${amount} USDT)`;
    }

    // 3. 사용자 확인 후 API 호출
    if(window.confirm(confirmMessage)) {
      try {
        setLoading(true); // 로딩 시작

        const requestBody = {
            targetAddress: targetAddress,
            amount: Number(amount)
        };

        // axios 설정이 되어 있다면 axiosInstance.post(...)를 쓰셔도 됩니다.
        const response = await axios.post('/history/transfer', requestBody);


        if (response.status === 200 || response.status === 201) {
            const { remainBalance } = response.data;
            
            // 성공 메시지 + 남은 잔액 표시
            alert(`${t.sendDone}\n(Balance: ${remainBalance} USDT)`);
            navigate('/home');
        }

      } catch (error) {
        console.error("Transfer Error:", error);
        
        // 에러 메시지 처리 (서버에서 주는 메시지 or 기본 메시지)
        const errorMsg = error.response?.data?.message || 'Transfer failed. Please try again.';
        alert(errorMsg);
      } finally {
        setLoading(false); // 로딩 끝
      }
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
        
        {/* 1. 받는 사람 정보 입력 (API targetAddress 매핑) */}
        <section className={styles.recipientSection}>
            <h3 className={styles.label} style={{marginBottom: '10px'}}>
                {/* 수정됨: t.recipient 사용하여 다국어 적용 */}
                {t.sendToPrefix ? `${t.sendToPrefix}${t.recipient}` : t.recipient}
            </h3>
            
            <div className={styles.inputWrapper}>
                {/* 기존의 고정 텍스트 대신 input으로 변경하여 targetAddress 입력 받음 */}
                <input 
                    type="text"
                    className={styles.amountInput} // 스타일 재활용 (필요시 recipientInput 클래스 생성 추천)
                    style={{ textAlign: 'left', fontSize: '18px' }}
                    // 수정됨: t.idAddress 사용하여 다국어 적용
                    placeholder={t.idAddress}
                    value={targetAddress}
                    onChange={(e) => setTargetAddress(e.target.value)}
                />
            </div>
            <p className={styles.subText} style={{marginTop: '5px'}}>{t.recipientCheck}</p>
        </section>

        {/* 2. 금액 입력 (API amount 매핑) */}
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
            <button 
                className={styles.sendBtn} 
                onClick={handleSend}
                disabled={loading} // 로딩 중 클릭 방지
                style={{ opacity: loading ? 0.7 : 1 }}
            >
                {loading ? 'Processing...' : t.sendBtn}
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