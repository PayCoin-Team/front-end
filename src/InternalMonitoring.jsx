// src/InternalMonitoring.jsx
import React from 'react';
import styles from './InternalMonitoring.module.css';
import usdtLogo from './component/UsdtLogo.svg'; // 로고 경로 확인

const InternalMonitoring = () => {
  // 예시 데이터 (내부 거래용)
  const transactions = [
    { id: 1, type: 'charge', title: 'A1B2-C3D4에서 USDT 충전', amount: '+ 200 USDT', time: '13:14' },
    { id: 2, type: 'charge', title: 'A1C2-C2F4에서 USDT 충전', amount: '+ 500 USDT', time: '14:18' },
    { id: 3, type: 'charge', title: 'A1B2-C3D4에서 USDT 충전', amount: '+ 50 USDT', time: '13:14' },
    { id: 4, type: 'withdraw', title: 'A1B2-C3D4에서 USDT 출금', amount: '- 700 USDT', time: '13:14' },
    { id: 5, type: 'charge', title: 'A1B2-C3D4에서 USDT 충전', amount: '+ 200 USDT', time: '13:14' },
    { id: 6, type: 'withdraw', title: 'A1B2-C3D4에서 USDT 출금', amount: '- 200 USDT', time: '13:14' },
    { id: 7, type: 'charge', title: 'A1B2-C3D4에서 USDT 충전', amount: '+ 200 USDT', time: '13:14' },
    { id: 8, type: 'withdraw', title: 'A1B2-C3D4에서 USDT 출금', amount: '- 200 USDT', time: '13:14' },
  ];

  return (
    <div className={styles.container}>
      {/* 상단 카드 영역 (내부 거래용 텍스트로 변경됨) */}
      <div className={styles.topCards}>
        <div className={styles.card}>
          <h3>유저 지갑 잔고 총 합</h3>
          <p>2294284 <span>USDT</span></p>
        </div>
        <div className={styles.card}>
          <h3>오늘 거래된 서비스 거래 횟수</h3>
          <p>102 <span>건</span></p>
        </div>
        <div className={styles.card}>
          <h3>오늘 거래된 금액</h3>
          <p>2294284 <span>USDT</span></p>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className={styles.contentRow}>
        
        {/* 거래 내역 리스트 (오른쪽 지갑 주소 박스 없음) */}
        <div className={styles.historySection}>
          {/* 날짜 선택기 */}
          <div className={styles.datePicker}>
            <button>&lt;</button>
            <span className={styles.dateText}>2026 <span>∨</span> 01 <span>∨</span></span>
            <button>&gt;</button>
          </div>

          <h3 className={styles.sectionTitle}>내부 거래 내역</h3>
          <div className={styles.dateLabel}>01.13 (화)</div>

          <div className={styles.listContainer}>
            {transactions.map((tx) => (
              <div key={tx.id} className={styles.listItem}>
                <div className={styles.iconWrapper}>
                  <img src={usdtLogo} alt="USDT" />
                </div>
                <div className={styles.txInfo}>
                  <div className={styles.txTitle}>{tx.title}</div>
                  <div className={`${styles.txAmount} ${tx.type === 'withdraw' ? styles.blue : styles.red}`}>
                    {tx.amount}
                  </div>
                </div>
                <div className={styles.txTime}>{tx.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 빈 공간 (디자인상 비워둠) */}
        <div className={styles.emptySpace}></div>

      </div>
    </div>
  );
};

export default InternalMonitoring;