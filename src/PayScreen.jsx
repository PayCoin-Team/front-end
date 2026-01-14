import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './PayScreen.module.css';

// 바코드, QR코드 임시 이미지 (나중에 assets 파일로 교체하세요)
const SAMPLE_BARCODE = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/UPC-A-036000291452.svg/1200px-UPC-A-036000291452.svg.png";
const SAMPLE_QR = "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg";

const PayScreen = () => {
  const navigate = useNavigate();
  
  // 3분(180초) 타이머 설정
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 시간 포맷 (03:00 형태로 변환)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };


  return (
    <div className={common.layout}>
      
      {/* 1. 상단 녹색 영역 */}
      <div className={styles.topSection}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← {/* 뒤로가기 화살표 */}
          </button>
          <h2 className={styles.title}>매장 결제</h2>
          <div style={{width: 30}}></div> {/* 자리맞춤용 공백 */}
        </header>

        {/* 결제 수단 정보 */}
        <div className={styles.paymentInfo}>
            <span className={styles.methodName}>CrossPay 머니</span>
            <span className={styles.balance}>200 USDT</span>
        </div>
      </div>

      {/* 2. 메인 카드 (바코드/QR) */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        <div className={styles.codeCard}>
            
            {/* 탭 버튼 */}
            <div className={styles.tabGroup}>
                <span className={`${styles.tab} ${styles.active}`}>결제</span>
                <span className={styles.tab}>멤버십</span>
            </div>

            {/* 바코드 */}
            <div className={styles.barcodeArea}>
                <img src={SAMPLE_BARCODE} className={styles.barcodeImg} alt="Barcode" />
            </div>

            {/* QR코드 */}
            <div className={styles.qrArea}>
                <img src={SAMPLE_QR} className={styles.qrImg} alt="QR Code" />
            </div>

            {/* 타이머 */}
            <div className={styles.timerWrapper}>
                <span className={styles.timerText}>남은 시간 {formatTime(timeLeft)}</span>
                <button className={styles.refreshBtn} onClick={() => setTimeLeft(180)}>
                    ⏱ 시간 연장
                </button>
            </div>
        </div>

        <p className={styles.guideText}>
            매장 직원에게 바코드 또는<br/>QR코드를 보여주세요.
        </p>

      </div>

    </div>
  );
};

export default PayScreen;