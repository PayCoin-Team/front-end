import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './PayScreen.module.css';

// 바코드, QR코드 임시 이미지
const SAMPLE_BARCODE = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/UPC-A-036000291452.svg/1200px-UPC-A-036000291452.svg.png";
const SAMPLE_QR = "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg";

const PayScreen = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(180);
  const [inputAddress, setInputAddress] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAddressChange = (e) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, '');
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    setInputAddress(value);
  };

  return (
    <div className={common.layout}>
      
      {/* 1. 상단 녹색 영역 */}
      <div className={styles.topSection}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
          <h2 className={styles.title}>매장 결제</h2>
          <div style={{width: 30}}></div>
        </header>

        <div className={styles.paymentInfo}>
            <span className={styles.methodName}>CrossPay 머니</span>
            <span className={styles.balance}>200 USDT</span>
        </div>
      </div>

      {/* 2. 메인 카드 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        <div className={styles.codeCard}>
            
            {/* 탭 버튼 */}
            <div className={styles.tabGroup}>
                <span className={`${styles.tab} ${styles.active}`}>결제</span>
                <span className={styles.tab} onClick={() => navigate('/send')}>송금</span>
            </div>

            {/* 바코드 & QR코드 */}
            <div className={styles.barcodeArea}>
                <img src={SAMPLE_BARCODE} className={styles.barcodeImg} alt="Barcode" />
            </div>
            <div className={styles.qrArea}>
                <img src={SAMPLE_QR} className={styles.qrImg} alt="QR Code" />
            </div>

            
            <div className={styles.addressInputBox}>
                <input 
                    type="text" 
                    placeholder="지갑 주소 (8자리)" 
                    className={styles.addrInput}
                    value={inputAddress}
                    onChange={handleAddressChange} 
                    maxLength={8}
                />
                <button className={styles.checkBtn}>주소 확인</button>
                <button className={styles.goBtn} onClick={() => navigate('/pro')}  >›  </button>
            </div>

            {/* 타이머 */}
            <div className={styles.timerWrapper}>
                <span className={styles.timerText}>남은 시간 {formatTime(timeLeft)}</span>
                <button className={styles.refreshBtn} onClick={() => setTimeLeft(180)}>
                    ⏱ 시간 연장
                </button>
            </div>
        </div>

        {/* 안내 문구 */}
        <p className={styles.guideText}>
            코드를 스캔하거나 지갑주소를 입력하여<br/>결제를 진행합니다.
        </p>

      </div>
    </div>
  );
};

export default PayScreen;