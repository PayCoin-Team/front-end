import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ExternalMonitoring.module.css';
import usdtLogo from './component/UsdtLogo.svg';

const ExternalMonitoring = () => {
  // [1] 날짜 및 필터 상태 관리
  const today = new Date();
  // 기본값: 현재 연도, 현재 월
  const [currentDate, setCurrentDate] = useState({ 
    year: today.getFullYear(), 
    month: today.getMonth() + 1 
  });

  // 드롭다운 열림/닫힘 상태
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  // 데이터 상태
  const [transactions, setTransactions] = useState([]);
  const [walletAddress, setWalletAddress] = useState('로딩 중...');
  const [stats, setStats] = useState({ balance: 0, trx: 0, count: 0 });

  // 연도 목록 (필요에 따라 범위 수정)
  const years = [2024, 2025, 2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // [2] API 호출 (날짜가 바뀔 때마다 실행)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 날짜 파라미터 준비 (예: month=01)
        const yearParam = currentDate.year;
        const monthParam = String(currentDate.month).padStart(2, '0');

        console.log(`데이터 조회 요청: ${yearParam}-${monthParam}`);

        // 1. 거래 내역 조회 (파라미터에 year, month 추가)
        const txResponse = await axios.get('/admin/transactions', {
          params: { 
            page: 0, 
            pageSize: 20,
            year: yearParam,   // 서버 스펙에 맞게 키 이름 수정 가능 (예: startDate)
            month: monthParam 
          }
        });

        // 2. 지갑 주소 조회 (한 번만 불러와도 되지만 편의상 같이 호출)
        const walletResponse = await axios.get('/wallet/external/me');

        // --- 데이터 처리 ---
        let txList = [];
        if (txResponse.data && Array.isArray(txResponse.data.content)) {
            txList = txResponse.data.content;
        } else if (Array.isArray(txResponse.data)) {
            txList = txResponse.data;
        } else {
            txList = [];
        }
        setTransactions(txList);

        if (walletResponse.data && walletResponse.data.wallet_address) {
            setWalletAddress(walletResponse.data.wallet_address);
        }

        setStats({
          balance: '2,294,284', 
          trx: '25,000',
          count: txResponse.data.totalElements || txList.length
        });

      } catch (error) {
        console.error("API Error:", error);
        setTransactions([]);
      }
    };

    fetchData();
  }, [currentDate]); // [중요] currentDate가 변경될 때마다 재실행

  // [3] 날짜 조작 함수들
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
      <div className={styles.topCards}>
        <div className={styles.card}>
          <h3>외부 지갑 잔고</h3>
          <p>{stats.balance} <span>USDT</span></p>
        </div>
        <div className={styles.card}>
          <h3>TRX 보유량</h3>
          <p>{stats.trx} <span>TRX</span></p>
        </div>
        <div className={styles.card}>
          <h3>이번 달 외부 거래 횟수</h3>
          <p>{stats.count} <span>건</span></p>
        </div>
      </div>

      <div className={styles.contentRow}>
        <div className={styles.historySection}>
          
          {/* [4] 날짜 네비게이션 UI (HistoryScreen 스타일 적용) */}
          <div className={styles.dateNav}>
            <button className={styles.dateArrow} onClick={handlePrevMonth}>&lt;</button>
            
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

                <span style={{margin: '0 5px', color: '#169279'}}>.</span>

                {/* 월 선택 */}
                <div className={styles.selectWrapper}>
                    <span 
                        className={styles.dateText} 
                        onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
                    >
                        {String(currentDate.month).padStart(2, '0')} <span className={styles.downArrow}>▼</span>
                    </span>
                    {isMonthOpen && (
                        <ul className={styles.dropdownList}>
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

            <button className={styles.dateArrow} onClick={handleNextMonth}>&gt;</button>
          </div>

          <h3 className={styles.sectionTitle}>외부 거래 내역</h3>
          <div className={styles.dateLabel}>
            {String(currentDate.month).padStart(2, '0')}.{new Date().getDate()} (오늘)
          </div>

          <div className={styles.listContainer}>
            {!transactions || transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                거래 내역이 없습니다.
              </div>
            ) : (
              transactions.map((tx, index) => {
                const isDeposit = tx.type === 'DEPOSIT';
                return (
                  <div key={tx.transactionId || index} className={styles.listItem}>
                    <div className={styles.iconWrapper}>
                      <img src={usdtLogo} alt="USDT" />
                    </div>
                    <div className={styles.txInfo}>
                      <div className={styles.txTitle}>
                        {tx.username} 님의 USDT {isDeposit ? '충전' : '출금'}
                      </div>
                      <div className={`${styles.txAmount} ${isDeposit ? styles.red : styles.blue}`}>
                        {isDeposit ? '+ ' : '- '} 
                        {Number(tx.amount || 0).toLocaleString()} USDT
                      </div>
                    </div>
                    <div className={styles.txTime}>{formatTime(tx.createdAt)}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={styles.addressSection}>
          <h3 className={styles.sectionTitle}>외부 지갑 주소</h3>
          <div className={styles.addressBox}>
            <span className={styles.addressText}>{walletAddress}</span>
            <button 
              className={styles.copyBtn}
              onClick={() => navigator.clipboard.writeText(walletAddress)}
            >
              ❐
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalMonitoring;