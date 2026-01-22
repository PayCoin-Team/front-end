import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ExternalMonitoring.module.css';
import usdtLogo from '../component/UsdtLogo.svg';

const ExternalMonitoring = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState({ 
    year: today.getFullYear(), 
    month: today.getMonth() + 1 
  });

  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [walletAddress, setWalletAddress] = useState('로딩 중...');
  const [stats, setStats] = useState({ balance: 0, trx: 0, count: 0 });

  const years = [2024, 2025, 2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const yearParam = currentDate.year;
        const monthParam = String(currentDate.month).padStart(2, '0');

        // API 호출
        const txResponse = await axios.get('/admin/transactions', {
          params: { page: 0, pageSize: 20, year: yearParam, month: monthParam }
        });
        const walletResponse = await axios.get('/wallet/external/me');

        // 데이터 처리
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
        } else {
            setWalletAddress("주소 정보 없음");
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
  }, [currentDate]);

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
      {/* 상단 카드 */}
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
          <h3>이번 달 거래 횟수</h3>
          <p>{stats.count} <span>건</span></p>
        </div>
      </div>

      <div className={styles.contentRow}>
        
        {/* 왼쪽: 거래 내역 섹션 */}
        <div className={styles.historySection}>
          
          {/* [디자인 적용] 날짜 네비게이션 */}
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

          <h3 className={styles.sectionTitle}>외부 거래 내역</h3>
          
          {/* 리스트 출력 */}
          <div className={styles.transactionList}>
            {!transactions || transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#bbb' }}>
                거래 내역이 없습니다.
              </div>
            ) : (
              transactions.map((tx, index) => {
                const isDeposit = tx.type === 'DEPOSIT';
                
                return (
                  // [디자인 적용] transactionItem 클래스 사용
                  <div key={tx.transactionId || index} className={styles.transactionItem}>
                    
                    {/* 아이콘 영역 */}
                    <div className={styles.iconWrapper}>
                      <img src={usdtLogo} alt="USDT" />
                    </div>
                    
                    {/* 텍스트 정보 영역 */}
                    <div className={styles.txInfo}>
                      <div className={styles.txTitle}>
                        {tx.username} 님의 {isDeposit ? 'USDT 충전' : 'USDT 출금'}
                      </div>
                      <div className={styles.txTime}>
                         {currentDate.month}.{new Date(tx.createdAt).getDate()} • {formatTime(tx.createdAt)}
                      </div>
                    </div>

                    {/* 금액 영역 */}
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

        {/* 오른쪽: 지갑 주소 */}
        <div className={styles.addressSection}>
          <h3 className={styles.sectionTitle}>외부 지갑 주소</h3>
          <div className={styles.addressBox}>
            <span className={styles.addressText}>{walletAddress}</span>
            <button 
              className={styles.copyBtn}
              onClick={() => {
                if(walletAddress !== '로딩 중...') {
                    navigator.clipboard.writeText(walletAddress);
                    alert('복사되었습니다.');
                }
              }}
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