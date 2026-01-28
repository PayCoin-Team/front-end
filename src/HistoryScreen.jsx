import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './HistoryScreen.module.css';

// 유틸 및 API
import api from './utils/api'; 
import { translations } from './utils/translations';

// 아이콘 및 로고 임포트
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import UsdtLogo from './component/UsdtLogo.svg';

const HistoryScreen = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'ko');

  // 실시간 언어 변경 감지
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(localStorage.getItem('appLanguage') || 'ko');
    };
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const t = translations[language] || translations['ko'];

  // 1. 필터 정의
  const filters = [t.filterAll, t.filterCharge, t.filterWithdraw, t.filterPay];
  const [activeFilter, setActiveFilter] = useState(t.filterAll);

  // 2. 날짜 및 드롭다운 상태
  const today = new Date();
  const [currentDate, setCurrentDate] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });
  
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  
  const years = [2024, 2025, 2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 3. 거래 내역 리스트 상태
  const [transactionList, setTransactionList] = useState([]);

  // 요일 및 날짜 포맷
  const formatDate = (dateObj) => {
      if (!dateObj) return '';
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const weekDay = t.days[dateObj.getDay()];
      return `${month}.${day} (${weekDay})`;
  };

  const formatUserStr = (firstName, lastName, address) => {
      const name = language === 'ko' ? `${lastName}${firstName}` : `${firstName} ${lastName}`; 
      const shortAddr = address ? address.substring(0, 9) : '????'; 
      return `${name}(${shortAddr})`;
  };

  // [API 1] 입출금 내역 조회
  const fetchTransactions = async (typeFilter) => {
    try {
      const params = {
        year: currentDate.year,
        month: currentDate.month,
        page: 0,
        size: 50,
      };
      if (typeFilter) params.type = typeFilter;

      const response = await api.get('/transaction', { params });
      const rawData = response.data.content || response.data || [];
      
      return rawData.map(item => {
        const isDeposit = item.type === 'DEPOSIT';
        const dateObj = new Date(item.createdAt); 

        return {
          id: `tx-${item.transactionId}`,
          sortDate: dateObj,
          date: formatDate(dateObj),
          title: isDeposit ? t.usdtChargeTitle : t.usdtWithdrawTitle,
          amount: `${isDeposit ? '+' : '-'} ${Number(item.amount).toLocaleString()} USDT`,
          isPlus: isDeposit, 
          iconType: 'usdt', 
          rawType: item.type
        };
      });
    } catch (e) {
      console.error("Transaction API Error", e);
      return [];
    }
  };

  // [API 2] 결제 내역 조회
  const fetchHistory = async () => {
    try {
      const params = {
        year: currentDate.year,
        month: currentDate.month,
        page: 0,
        size: 50,
        type: 'ALL'
      };

      const response = await api.get('/history', { params });
      const rawData = response.data.content || response.data || [];

      return rawData.map(item => {
        const senderStr = formatUserStr(item.senderFirstName, item.senderLastName, item.senderAddress);
        const receiverStr = formatUserStr(item.receiverFirstName, item.receiverLastName, item.receiverAddress);
        const dateObj = item.createdAt ? new Date(item.createdAt) : new Date();
        const isPlus = item.type === 'receiveMoney'; 

        return {
          id: `hist-${item.historyId}`,
          sortDate: dateObj,
          date: formatDate(dateObj), 
          title: `${senderStr} → ${receiverStr}`,
          amount: `${isPlus ? '+' : '-'} ${Number(item.amount).toLocaleString()} USDT`,
          isPlus: isPlus,
          iconType: 'user',
          rawType: 'PAYMENT'
        };
      });

    } catch (e) {
      console.error("History API Error", e);
      return [];
    }
  };

  // 데이터 로드 및 병합
  useEffect(() => {
    const loadData = async () => {
      let finalData = [];

      if (activeFilter === t.filterAll) {
        const [txData, histData] = await Promise.all([
           fetchTransactions(null), 
           fetchHistory()
        ]);
        finalData = [...txData, ...histData];
      } else if (activeFilter === t.filterCharge) {
        finalData = await fetchTransactions('DEPOSIT');
      } else if (activeFilter === t.filterWithdraw) {
        finalData = await fetchTransactions('WITHDRAW');
      } else if (activeFilter === t.filterPay) {
        finalData = await fetchHistory();
      }

      finalData.sort((a, b) => b.sortDate - a.sortDate);
      setTransactionList(finalData);
    };

    loadData();
  }, [currentDate, activeFilter, t]);

  let lastDate = ''; 

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
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <h2 className={styles.headerTitle}>{t.historyTitle}</h2>
        <div style={{width: 24}}></div>
      </header>

      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        <div className={styles.dateNav}>
            <button className={styles.dateArrow} onClick={handlePrevMonth}>‹</button>
            <div className={styles.dateDisplay}>
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
                <div className={styles.selectWrapper}>
                    <span className={styles.dateText} onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}>
                        {String(currentDate.month).padStart(2, '0')} <span className={styles.downArrow}>▼</span>
                    </span>
                    {isMonthOpen && (
                        <ul className={`${styles.dropdownList} ${styles.monthList}`}>
                            {months.map(month => (
                                <li key={month} onClick={() => { setCurrentDate({ ...currentDate, month }); setIsMonthOpen(false); }}>{month}{t.monthUnit}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <button className={styles.dateArrow} onClick={handleNextMonth}>›</button>
        </div>

        <div className={styles.filterTabs}>
            {filters.map((filter) => (
                <button key={filter} className={`${styles.filterBtn} ${activeFilter === filter ? styles.activeFilter : ''}`} onClick={() => setActiveFilter(filter)}>
                    {filter}
                </button>
            ))}
        </div>

        <div className={styles.transactionList}>
            {transactionList.length === 0 ? (
                <div style={{textAlign: 'center', marginTop: '60px', color: '#bbb', fontSize: '14px'}}>
                    {t.noHistory}
                </div>
            ) : (
                transactionList.map((item) => {
                    const showDateHeader = item.date !== lastDate;
                    lastDate = item.date;
                    
                    return (
                        <React.Fragment key={item.id}>
                            {showDateHeader && <div className={styles.dateHeader}>{item.date}</div>}
                            <div className={styles.transactionItem}>
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

      <nav className={styles.bottomNav}>
        <div className={styles.navItem} onClick={() => navigate('/home')}>
            <img src={navHomeIcon} className={styles.navImg} alt={t.home} />
            <span className={styles.navText}>{t.home}</span>
        </div>
        <div className={`${styles.navItem} ${common.active}`}>
            <img src={navPayIcon} className={styles.navImg} alt={t.payNav} />
            <span className={common.navText}>{t.payNav}</span>
        </div>
        <div className={styles.navItem} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={styles.navImg} alt={t.myPage} />
            <span className={styles.navText}>{t.myPage}</span>
        </div>
      </nav>
    </div>
  );
};

export default HistoryScreen;