import React, { useState, useEffect } from 'react';
import api from '../utils/api'; 
import styles from './ServiceRevenueMonitoring.module.css';
import usdtLogo from '../component/UsdtLogo.svg';

const ServiceRevenueMonitoring = () => {
  // [1] 날짜 및 드롭다운 상태 관리
  const today = new Date();
  const [currentDate, setCurrentDate] = useState({ 
    year: today.getFullYear(), 
    month: today.getMonth() + 1 
  });

  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  const years = [2024, 2025, 2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // [2] 데이터 상태
  const [revenueList, setRevenueList] = useState([]); 
  const [stats, setStats] = useState({
    accumulatedRevenue: 0, // 누적 수수료
    todayRevenue: 0,       // 금일 수수료
    totalCount: 0          // 전체 건수 (이번 달)
  });

  // [3] 데이터 로딩 (useEffect)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const yearParam = currentDate.year;
        const monthParam = String(currentDate.month).padStart(2, '0');

        console.log(`수익 내역 조회 요청: ${yearParam}-${monthParam}`);

        // API 동시 호출
        const [ratesResponse, feeResponse] = await Promise.all([
            // 1. 통계 데이터 (/admin/rates)
            api.get('/admin/rates'),
            
            // 2. 수수료 거래 내역 리스트 (/admin/find/fee)
            api.get('/admin/find/fee', {
                params: { 
                    page: 0, 
                    pageSize: 20, 
                    year: yearParam, 
                    month: monthParam 
                }
            })
        ]);
        
        // --- 1. 상단 카드 데이터 처리 (금액) ---
        const { totalFees, yesterdayFees } = ratesResponse.data || {};
        
        // --- 2. 리스트 데이터 처리 ---
        let fetchedList = [];
        if (feeResponse.data && Array.isArray(feeResponse.data.content)) {
            fetchedList = feeResponse.data.content;
        } else if (Array.isArray(feeResponse.data)) {
            fetchedList = feeResponse.data;
        }

        // [핵심 수정] totalCount를 API의 totalElements로 설정
        // totalElements: 조건(연/월)에 맞는 '전체' 데이터 개수 (페이지 상관없음)
        const totalElements = feeResponse.data?.totalElements || fetchedList.length;

        setStats({
            accumulatedRevenue: totalFees || 0,
            todayRevenue: yesterdayFees || 0, // '금일' 금액은 rates에서 가져옴
            totalCount: totalElements         // '전체' 건수는 리스트 API에서 가져옴
        });

        // 화면 표시에 맞게 리스트 매핑
        const mappedList = fetchedList.map((item, index) => ({
            id: item.historyId || item.id || `fee-${index}`,
            title: 'USDT 수수료 수익', 
            txId: item.transactionId || item.txHash || `TX-${item.id}`, 
            amount: item.amount,
            createdAt: item.createdAt
        }));
        
        setRevenueList(mappedList);

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        setRevenueList([]);
      }
    };

    fetchData();
  }, [currentDate]);

  // [4] 날짜 이동 핸들러
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

  // [5] 숫자 포맷팅
  const formatNumber = (num) => Number(num || 0).toLocaleString();

  return (
    <div className={styles.container}>
      
      {/* 1. 상단 카드 영역 */}
      <div className={styles.topCards}>
        <div className={styles.card}>
          <h3>누적 수수료 수익</h3>
          <p>
            {formatNumber(stats.accumulatedRevenue)} <span>USDT</span>
          </p>
        </div>

        <div className={styles.card}>
          <h3>금일 발생 수수료</h3>
          <p>
             {formatNumber(stats.todayRevenue)} <span>USDT</span>
          </p>
        </div>

        <div className={styles.card}>
          <h3>수수료 발생 건수</h3>
          <p>
             {/* API에서 받아온 전체 건수 표시 */}
             {formatNumber(stats.totalCount)} <span>건</span>
          </p>
        </div>
      </div>

      {/* 2. 메인 컨텐츠 영역 */}
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

          <div className={styles.dateLabel}>
            {String(currentDate.month).padStart(2, '0')}월 상세 내역
          </div>

          <div className={styles.listContainer}>
             {revenueList.length === 0 ? (
              <div className={styles.emptyState}>
                  수수료 내역이 없습니다.
              </div>
            ) : (
                revenueList.map((item, index) => (
                  <div key={item.id || index} className={styles.listItem}>
                    <div className={styles.iconWrapper}>
                      <img src={usdtLogo} alt="USDT" />
                    </div>
                    <div className={styles.txInfo}>
                      <div className={styles.txTitle}>
                        {item.title} <span className={styles.txHash}>| {item.txId}</span>
                      </div>
                    </div>
                    <div className={styles.feeAmount}>
                          + {formatNumber(item.amount)} USDT
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
        <div className={styles.emptySpace}></div>
      </div>
    </div>
  );
};

export default ServiceRevenueMonitoring;