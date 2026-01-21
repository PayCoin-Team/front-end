import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './InternalMonitoring.module.css';
import usdtLogo from './component/UsdtLogo.svg';

const InternalMonitoring = () => {
  // [1] 날짜 상태 관리 (ExternalMonitoring과 동일)
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
  const [verification, setVerification] = useState({
    userBalance: 0,
    serverBalance: 0,
    difference: 'MATCH',
    createdAt: null
  });
  const [stats, setStats] = useState({ count: 0, volume: 0 });

  // [2] API 호출 (날짜 변경 시 재호출)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const yearParam = currentDate.year;
        const monthParam = String(currentDate.month).padStart(2, '0');

        console.log(`Internal 조회 요청: ${yearParam}-${monthParam}`);

        // 1. 거래 내역 조회 (파라미터 추가)
        const txResponse = await axios.get('/admin/transactions', {
            params: { 
              page: 0, 
              pageSize: 20,
              year: yearParam,
              month: monthParam
            }
        });

        // 2. 자산 검증 조회
        const verifyResponse = await axios.get('/admin/verifications/latest'); 
        
        // --- 데이터 안전 처리 ---
        let txList = [];
        if (txResponse.data && Array.isArray(txResponse.data.content)) {
            txList = txResponse.data.content;
        } else if (Array.isArray(txResponse.data)) {
            txList = txResponse.data;
        } else {
            txList = [];
        }
        setTransactions(txList);

        // --- 검증 데이터 연결 ---
        if (verifyResponse.data) {
          setVerification({
            userBalance: verifyResponse.data.userBalance || 0,
            serverBalance: verifyResponse.data.serverBalance || 0,
            difference: verifyResponse.data.difference || 'MATCH',
            createdAt: verifyResponse.data.createdAt
          });
        }

        // --- 통계 설정 ---
        setStats({
            count: txResponse.data.totalElements || txList.length,
            volume: '2,294,284'
        });

      } catch (error) {
        console.error("API Error:", error);
        setTransactions([]);
      }
    };
    fetchData();
  }, [currentDate]); // [중요] currentDate 변경 감지

  // [3] 날짜 이동 함수
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

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) { return '-'; }
  };

  return (
    <div className={styles.container}>
      {/* 상단 카드 영역 */}
      <div className={styles.topCards}>
        <div className={styles.card} style={{ position: 'relative' }}>
          <h3>유저 지갑 잔고 총 합</h3>
          <p>
            {Number(verification.userBalance).toLocaleString()} <span>USDT</span>
          </p>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            상태: 
            {verification.difference === 'MATCH' ? (
              <span style={{ color: '#28a745', fontWeight: 'bold', marginLeft: '5px' }}>
                ✅ 정상 (일치)
              </span>
            ) : (
              <span style={{ color: '#dc3545', fontWeight: 'bold', marginLeft: '5px' }}>
                ⚠️ 불일치 (실제: {Number(verification.serverBalance).toLocaleString()})
              </span>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <h3>기간 내 서비스 거래 횟수</h3>
          <p>{stats.count} <span>건</span></p>
        </div>
        <div className={styles.card}>
          <h3>기간 내 거래 금액</h3>
          <p>{stats.volume} <span>USDT</span></p>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className={styles.contentRow}>
        <div className={styles.historySection}>
          
          {/* [4] UI 교체: 드롭다운 날짜 네비게이션 */}
          <div className={styles.dateNav}>
            <button className={styles.dateArrow} onClick={handlePrevMonth}>‹</button>
            
            <div className={styles.dateDisplay}>
                {/* 연도 선택 */}
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

                {/* 월 선택 */}
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
          <div className={styles.dateLabel}>
            {String(currentDate.month).padStart(2, '0')}월 상세 내역
          </div>

          <div className={styles.listContainer}>
             {/* 리스트 렌더링 */}
             {!transactions || !Array.isArray(transactions) || transactions.length === 0 ? (
              <div style={{textAlign:'center', padding:'40px', color: '#999'}}>
                  거래 내역이 없습니다.
              </div>
            ) : (
              transactions.map((tx, index) => {
                const isDeposit = tx.type === 'DEPOSIT';
                return (
                  // 스타일 통일을 위해 className 수정 가능 (현재는 기존 유지)
                  <div key={tx.transactionId || index} className={styles.listItem}>
                    <div className={styles.iconWrapper}>
                      <img src={usdtLogo} alt="USDT" />
                    </div>
                    <div className={styles.txInfo}>
                      <div className={styles.txTitle}>
                        {tx.username} (ID:{tx.userId}) 님의 {isDeposit ? '충전' : '출금'}
                      </div>
                      <div className={styles.txTime}>
                        {currentDate.month}.{new Date(tx.createdAt).getDate()} • {formatTime(tx.createdAt)}
                      </div>
                    </div>
                    <div className={`${styles.txAmount} ${isDeposit ? styles.red : styles.blue}`}>
                         {isDeposit ? '+ ' : '- '}
                         {Number(tx.amount || 0).toLocaleString()} USDT
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* 우측 빈 공간 (레이아웃 유지용) */}
        <div className={styles.emptySpace}></div>
      </div>
    </div>
  );
};

export default InternalMonitoring;