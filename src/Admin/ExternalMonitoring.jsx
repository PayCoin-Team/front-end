import React, { useState, useEffect } from 'react';
import axios from 'axios'; // [수정] api 대신 axios import
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
  
  // 관리자 실명 상태
  const [adminName, setAdminName] = useState('관리자');

  const years = [2024, 2025, 2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const yearParam = currentDate.year;
        const monthParam = String(currentDate.month).padStart(2, '0');

        // [중요] axios 직접 사용 시 토큰을 헤더에 직접 넣어줘야 합니다.
        // 저장소 키 이름('accessToken')은 실제 프로젝트 설정에 맞게 확인해주세요.
        const token = localStorage.getItem('accessToken'); 
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // 1. 모든 API 동시 호출 (axios로 변경)
        const [txResponse, balanceResponse, userResponse] = await Promise.all([
          // 첫 번째 요청: 파라미터와 헤더를 함께 전달
          axios.get('/admin/transactions', {
            params: { page: 0, pageSize: 20, year: yearParam, month: monthParam },
            ...config // 헤더 추가
          }),
          // 두 번째 요청: 헤더 전달
          axios.get('/server_wallet/balance', config),
          // 세 번째 요청: 헤더 전달
          axios.get('/users/me', config)
        ]);

        // 2. 관리자 정보 처리 (firstName + lastName)
        if (userResponse.data) {
          const { firstName, lastName } = userResponse.data;
          const fullName = `${lastName || ''}${firstName || ''}`.trim();
          setAdminName(fullName || '관리자');
        }

        // 3. 거래 내역 처리
        let txList = [];
        // axios응답 구조 확인 (Spring Pageable의 경우 content에 데이터가 있음)
        if (txResponse.data && Array.isArray(txResponse.data.content)) {
          txList = txResponse.data.content;
        } else if (Array.isArray(txResponse.data)) {
          txList = txResponse.data;
        }
        setTransactions(txList);

        // 4. 서버 지갑 정보 및 통계 처리
        if (balanceResponse.data) {
          const { usdtBalance, trxBalance, serverAddress } = balanceResponse.data;
          setWalletAddress(serverAddress || "주소 정보 없음");

          setStats({
            balance: (usdtBalance || 0).toLocaleString(), 
            trx: (trxBalance || 0).toLocaleString(),
            count: txResponse.data.totalElements || txList.length
          });
        }

      } catch (error) {
        console.error("API Error:", error);
        // 토큰 만료 에러(401) 처리 등을 여기에 추가할 수 있습니다.
        setTransactions([]);
        setWalletAddress("데이터를 불러올 수 없습니다.");
      }
    };
    fetchData();
  }, [currentDate]);

  // ... (handlePrevMonth, handleNextMonth, formatTime 함수 및 return 부분은 기존과 동일) ...
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

          <h3 className={styles.sectionTitle}>외부 거래 내역</h3>
          
          <div className={styles.transactionList}>
            {!transactions || transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#bbb' }}>
                거래 내역이 없습니다.
              </div>
            ) : (
              transactions.map((tx, index) => {
                const isDeposit = tx.type === 'DEPOSIT';
                return (
                  <div key={tx.transactionId || index} className={styles.transactionItem}>
                    <div className={styles.iconWrapper}>
                      <img src={usdtLogo} alt="USDT" />
                    </div>
                    <div className={styles.txInfo}>
                      <div className={styles.txTitle}>
                        {tx.username || adminName} 님의 {isDeposit ? 'USDT 충전' : 'USDT 출금'}
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