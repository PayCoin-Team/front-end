import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import common from './Common.module.css';
import styles from './HistoryScreen.module.css';

// 아이콘 및 로고 임포트
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import UsdtLogo from './component/UsdtLogo.svg';

const HistoryScreen = () => {
  const navigate = useNavigate();

  // 1. 필터 정의 (전체, 충전, 출금, 결제)
  const filters = ['전체', '충전', '출금', '결제'];
  const [activeFilter, setActiveFilter] = useState('전체');

  // 2. 날짜 및 드롭다운 상태
  const today = new Date();
  const [currentDate, setCurrentDate] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });
  
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  
  const years = [2024, 2025, 2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 3. 거래 내역 리스트 상태
  const [transactionList, setTransactionList] = useState([]);

  // =========================================================================
  // [Helper] 날짜 포맷 (예: 01.27 (화))
  // =========================================================================
  const formatDate = (dateObj) => {
      if (!dateObj) return '';
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const weekDay = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];
      return `${month}.${day} (${weekDay})`;
  };

  // =========================================================================
  // [Helper] 사용자 이름/주소 포맷팅 (예: 홍길동(B2D4...))
  // =========================================================================
  const formatUserStr = (firstName, lastName, address) => {
      const name = `${lastName}${firstName}`; 
      // 주소가 있으면 앞 9자리만 자르거나, 필요에 따라 조정
      const shortAddr = address ? address.substring(0, 9) : '????'; 
      return `${name}(${shortAddr})`;
  };

  // =========================================================================
  // [API 1] 입출금 내역 조회 (/transaction)
  // =========================================================================
  const fetchTransactions = async (typeFilter) => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = {
        year: currentDate.year,
        month: currentDate.month,
        page: 0,
        size: 50,
      };
      if (typeFilter) params.type = typeFilter;

      const response = await axios.get('http://localhost:8080/transaction', {
        params,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const rawData = response.data.content || response.data || [];
      
      return rawData.map(item => {
        const isDeposit = item.type === 'DEPOSIT';
        const dateObj = new Date(item.createdAt); 

        return {
          id: `tx-${item.transactionId}`,
          sortDate: dateObj,          // 정렬용 Date 객체
          date: formatDate(dateObj),  // 화면 표시용 문자열
          
          title: isDeposit ? 'USDT 충전' : 'USDT 출금',
          amount: `${isDeposit ? '+' : '-'} ${Number(item.amount).toLocaleString()} USDT`,
          isPlus: isDeposit, 
          
          // 출금도 충전과 같은 USDT 로고 사용
          iconType: 'usdt', 
          rawType: item.type
        };
      });
    } catch (e) {
      console.error("Transaction API Error", e);
      return [];
    }
  };

  // =========================================================================
  // [API 2] 결제(내부 거래) 내역 조회 (/history)
  // =========================================================================
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = {
        year: currentDate.year,
        month: currentDate.month,
        page: 0,
        size: 50,
        type: 'ALL'
      };

      const response = await axios.get('http://localhost:8080/history', {
        params,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const rawData = response.data.content || response.data || [];

      return rawData.map(item => {
        const senderStr = formatUserStr(item.senderFirstName, item.senderLastName, item.senderAddress);
        const receiverStr = formatUserStr(item.receiverFirstName, item.receiverLastName, item.receiverAddress);
        
        // [수정 핵심] 실제 API 응답인 'createdAt' 필드 사용
        const rawDate = item.createdAt; 
        const dateObj = rawDate ? new Date(rawDate) : new Date();

        // [수정 핵심] 'type'이 'receiveMoney'면 받은 돈(+)
        const isPlus = item.type === 'receiveMoney'; 

        return {
          id: `hist-${item.historyId}`,
          sortDate: dateObj,         
          date: formatDate(dateObj), 
          
          title: `${senderStr} → ${receiverStr}`,
          amount: `${isPlus ? '+' : '-'} ${Number(item.amount).toLocaleString()} USDT`,
          isPlus: isPlus,
          iconType: 'user', // 결제는 사람 아이콘
          rawType: 'PAYMENT'
        };
      });

    } catch (e) {
      console.error("History API Error", e);
      return [];
    }
  };

  // =========================================================================
  // [Main Effect] 데이터 로드 및 병합 (날짜순 정렬)
  // =========================================================================
  useEffect(() => {
    const loadData = async () => {
      let finalData = [];

      if (activeFilter === '전체') {
        // 두 API 동시 호출 후 병합
        const [txData, histData] = await Promise.all([
           fetchTransactions(null), 
           fetchHistory()           
        ]);
        finalData = [...txData, ...histData];

      } else if (activeFilter === '충전') {
        finalData = await fetchTransactions('DEPOSIT');

      } else if (activeFilter === '출금') {
        finalData = await fetchTransactions('WITHDRAW');

      } else if (activeFilter === '결제') {
        finalData = await fetchHistory();
      }

      // [정렬] 최신순 (내림차순)
      finalData.sort((a, b) => b.sortDate - a.sortDate);

      setTransactionList(finalData);
    };

    loadData();
  }, [currentDate, activeFilter]);


  // =========================================================================
  // UI 핸들러
  // =========================================================================
  let lastDate = ''; // 날짜 헤더 중복 방지용

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

  return (
    <div className={common.layout}>
      {/* 1. 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <h2 className={styles.headerTitle}>내역</h2>
        <div style={{width: 24}}></div>
      </header>

      {/* 2. 메인 콘텐츠 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        
        {/* 날짜 선택 네비게이션 */}
        <div className={styles.dateNav}>
            <button className={styles.dateArrow} onClick={handlePrevMonth}>‹</button>
            <div className={styles.dateDisplay}>
                {/* 연도 */}
                <div className={styles.selectWrapper}>
                    <span className={styles.dateText} onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}>
                        {currentDate.year} <span className={styles.downArrow}>▼</span>
                    </span>
                    {isYearOpen && (
                        <ul className={styles.dropdownList}>
                            {years.map(year => (
                                <li key={year} onClick={() => { setCurrentDate({ ...currentDate, year }); setIsYearOpen(false); }}>{year}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <span style={{color: '#169279', fontWeight: 'bold', margin: '0 2px'}}>.</span>
                {/* 월 */}
                <div className={styles.selectWrapper}>
                    <span className={styles.dateText} onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}>
                        {String(currentDate.month).padStart(2, '0')} <span className={styles.downArrow}>▼</span>
                    </span>
                    {isMonthOpen && (
                        <ul className={`${styles.dropdownList} ${styles.monthList}`}>
                            {months.map(month => (
                                <li key={month} onClick={() => { setCurrentDate({ ...currentDate, month }); setIsMonthOpen(false); }}>{month}월</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <button className={styles.dateArrow} onClick={handleNextMonth}>›</button>
        </div>

        {/* 필터 탭 */}
        <div className={styles.filterTabs}>
            {filters.map((filter) => (
                <button key={filter} className={`${styles.filterBtn} ${activeFilter === filter ? styles.activeFilter : ''}`} onClick={() => setActiveFilter(filter)}>
                    {filter}
                </button>
            ))}
        </div>

        {/* 리스트 출력 영역 */}
        <div className={styles.transactionList}>
            {transactionList.length === 0 ? (
                <div style={{textAlign: 'center', marginTop: '60px', color: '#bbb', fontSize: '14px'}}>
                    거래 내역이 없습니다.
                </div>
            ) : (
                transactionList.map((item) => {
                    // 날짜가 바뀌면 헤더 출력
                    const showDateHeader = item.date !== lastDate;
                    lastDate = item.date;
                    
                    return (
                        <React.Fragment key={item.id}>
                            {showDateHeader && <div className={styles.dateHeader}>{item.date}</div>}
                            <div className={styles.transactionItem}>
                                {/* 아이콘: USDT면 초록배경+로고, 결제면 회색배경+사람 */}
                                <div className={`${styles.iconWrapper} ${item.iconType === 'usdt' ? styles.greenBg : styles.grayBg}`}>
                                    {item.iconType === 'usdt' ? 
                                        <img src={UsdtLogo} alt="USDT" className={styles.tokenIcon} /> 
                                        : <span style={{fontSize: '24px'}}>👤</span> 
                                    }
                                </div>
                                <div className={styles.infoWrapper}>
                                    <div className={styles.title} style={item.rawType === 'PAYMENT' ? { fontSize: '0.9rem', color: '#555'} : {}}>
                                        {item.title}
                                    </div>
                                    <div className={`${styles.amount} ${item.isPlus ? styles.plus : styles.minus}`}>
                                        {item.amount}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })
            )}
        </div>
      </div>

      {/* 3. 하단 네비게이션 */}
      <nav className={styles.bottomNav}>
        <div className={styles.navItem} onClick={() => navigate('/home')}>
            <img src={navHomeIcon} className={styles.navImg} alt="홈" />
            <span className={styles.navText}>홈</span>
        </div>
        <div className={`${styles.navItem} ${common.active}`}>
            <img src={navPayIcon} className={styles.navImg} alt="결제" />
            <span className={styles.navText}>결제</span>
        </div>
        <div className={styles.navItem} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={styles.navImg} alt="마이페이지" />
            <span className={styles.navText}>마이페이지</span>
        </div>
      </nav>
    </div>
  );
};

export default HistoryScreen;