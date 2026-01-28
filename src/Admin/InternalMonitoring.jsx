import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import styles from './InternalMonitoring.module.css';
import usdtLogo from '../component/UsdtLogo.svg';

const InternalMonitoring = () => {
  // [1] 날짜 상태 관리
  const today = new Date();
  const [currentDate, setCurrentDate] = useState({ 
    year: today.getFullYear(), 
    month: today.getMonth() + 1 
  });

  // 드롭다운 열림/닫힘 상태
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  // 연도/월 데이터
  const years = [2024, 2025, 2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 데이터 상태
  const [transactions, setTransactions] = useState([]); 
  const [userWalletBalance, setUserWalletBalance] = useState(0); 
  const [stats, setStats] = useState({ count: 0, volume: 0 });

  // [2] API 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        const yearParam = currentDate.year;
        const monthParam = String(currentDate.month).padStart(2, '0');

        console.log(`Internal 조회 요청: ${yearParam}-${monthParam}`);

        // 3개의 API 병렬 호출
        const [txResponse, ratesResponse, todayHistoryResponse] = await Promise.all([
            // 1. 거래 내역 조회
            api.get('/admin/histories', {
                params: { 
                    page: 0, 
                    pageSize: 20,
                    year: yearParam,
                    month: monthParam
                }
            }),
            // 2. 유저 지갑 잔고 조회
            api.get('/admin/rates'),
            // 3. 금일 거래 통계 조회
            api.get('/admin/today/history') 
        ]);

        // --- 거래 내역 처리 ---
        let txList = [];
        if (txResponse.data && Array.isArray(txResponse.data.content)) {
            txList = txResponse.data.content;
        } else if (Array.isArray(txResponse.data)) {
            txList = txResponse.data;
        }
        setTransactions(txList);

        // --- 잔고 데이터 처리 ---
        if (ratesResponse.data) {
            setUserWalletBalance(ratesResponse.data.userBalance || 0);
        }

        // --- 금일 통계 데이터 처리 ---
        const todayData = todayHistoryResponse.data || {};
        setStats({
            count: todayData.todayTransferCounts || 0,
            volume: todayData.todayTransferAmount || 0
        });

      } catch (error) {
        console.error("API Error:", error);
        setTransactions([]);
        setUserWalletBalance(0);
        setStats({ count: 0, volume: 0 });
      }
    };
    fetchData();
  }, [currentDate]);

  // [3] 날짜 이동 함수들
  const handlePrevMonth = () => {
    setCurrentDate(prev => {
        if(prev.month === 1) return { year: prev.year - 1, month: 12 };
        return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
        if(prev.month === 12) return { year: prev.year + 1, month: 1 };
        return { ...prev, month: prev.month + 1 };
    });
  };

  // [수정] 날짜 포맷 함수 (초 단위 추가)
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0'); // 초 추가
        
        // 예: 01.28 • 14:30:45
        return `${month}.${day} • ${hours}:${minutes}:${seconds}`;
    } catch (e) { return '-'; }
  };

  return (
    <div className={styles.container}>
      {/* 상단 카드 영역 */}
      <div className={styles.topCards}>
        <div className={styles.card} style={{ position: 'relative' }}>
          <h3>유저 지갑 잔고 총합</h3>
          <p>
            {Number(userWalletBalance).toLocaleString()} <span>USDT</span>
          </p>
        </div>

        <div className={styles.card}>
          <h3>금일 서비스 거래 횟수</h3>
          <p>
            {Number(stats.count).toLocaleString()} <span>건</span>
          </p>
        </div>
        <div className={styles.card}>
          <h3>금일 거래 금액</h3>
          <p>
            {Number(stats.volume).toLocaleString()} <span>USDT</span>
          </p>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className={styles.contentRow}>
        <div className={styles.historySection}>
          
          {/* 날짜 네비게이션 */}
          <div className={styles.dateNav}>
            <button className={styles.dateArrow} onClick={handlePrevMonth}>‹</button>
            
            <div className={styles.dateDisplay}>
                <div className={styles.selectWrapper}>
                    <span 
                        className={styles.dateText} 
                        onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
                    >
                        {currentDate.year} <span className={styles.downArrow}>▼</span>
                    </span>
                    {isYearOpen && (
                        <ul className={styles.dropdownList}>
                            {years.map(y => (
                                <li key={y} onClick={() => { 
                                    setCurrentDate({ ...currentDate, year: y }); 
                                    setIsYearOpen(false); 
                                }}>{y}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <span style={{margin: '0 2px', color: '#169279', fontWeight:'bold'}}>.</span>

                <div className={styles.selectWrapper}>
                    <span 
                        className={styles.dateText} 
                        onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
                    >
                        {String(currentDate.month).padStart(2, '0')} <span className={styles.downArrow}>▼</span>
                    </span>
                    {isMonthOpen && (
                        <ul className={`${styles.dropdownList} ${styles.monthList}`}>
                            {months.map(m => (
                                <li key={m} onClick={() => { 
                                    setCurrentDate({ ...currentDate, month: m }); 
                                    setIsMonthOpen(false); 
                                }}>{m}월</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <button className={styles.dateArrow} onClick={handleNextMonth}>›</button>
          </div>

          <h3 className={styles.sectionTitle}>내부 거래 내역</h3>
        

          <div className={styles.listContainer}>
             {!transactions || !Array.isArray(transactions) || transactions.length === 0 ? (
              <div style={{textAlign:'center', padding:'40px', color: '#999'}}>
                  거래 내역이 없습니다.
              </div>
            ) : (
              transactions.map((tx, index) => {
                // [수정] 보낸사람, 받는사람 이름 조합
                const senderName = `${tx.senderLastName || ''}${tx.senderFirstName || ''}`;
                const receiverName = `${tx.receiverLastName || ''}${tx.receiverFirstName || ''}`;

                return (
                  <div key={tx.historyId || index} className={styles.listItem}>
                    <div className={styles.iconWrapper}>
                      <img src={usdtLogo} alt="USDT" />
                    </div>
                    <div className={styles.txInfo}>
                      <div className={styles.txTitle}>
                        {/* [수정] 보낸사람 -> 받는사람 형식 */}
                        {senderName} 
                        <span style={{color: '#aaa', margin: '0 6px'}}>→</span> 
                        {receiverName}
                      </div>
                      <div className={styles.txTime}>
                        {/* [수정] transactionTime 사용 및 초단위 포맷 */}
                        {formatTime(tx.transactionTime)}
                      </div>
                    </div>
                    {/* [수정] 금액은 단순 표시 (색상은 blue 유지 or 필요시 변경) */}
                    <div className={`${styles.txAmount} ${styles.blue}`}>
                          {Number(tx.amount || 0).toLocaleString()} USDT
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <div className={styles.emptySpace}></div>
      </div>
    </div>
  );
};

export default InternalMonitoring;