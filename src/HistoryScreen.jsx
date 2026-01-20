import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import common from './Common.module.css';
import styles from './HistoryScreen.module.css';

// 아이콘 임포트 (경로는 본인 프로젝트에 맞게 유지)
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import UsdtLogo from './component/UsdtLogo.svg';

const HistoryScreen = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('전체');
  const today = new Date();
  const [currentDate, setCurrentDate] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });

  // 드롭다운 상태
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  // 연도/월 데이터
  const years = [2024, 2025, 2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const filters = ['전체', '충전', '결제', '받은 돈'];

  const [transactionList, setTransactionList] = useState([]);

  // 날짜 포맷 함수
  const formatDate = (isoString) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
      return `${month}.${day} (${weekDay})`;
  };

  // API 호출
  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            
            const params = {
                year: currentDate.year,
                month: String(currentDate.month).padStart(2, '0'),
                type: 'ALL', 
                page: 0,
                pageSize: 50
            };

            const response = await axios.get('https://api.yourdomain.com/transaction', {
                params: params,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 200) {
                const mappedData = response.data.content.map((item) => { 
                    
                    let uiType = 'pay';
                    let isPlus = false;
                    let iconType = 'user';
                    let title = '거래 내역';

                    const typeStr = item.type || '';

                    if (typeStr === 'CHARGE') { 
                        uiType = 'charge'; isPlus = true; iconType = 'usdt';
                        title = 'USDT 충전';
                    } else if (typeStr === 'RECEIVE') {
                        uiType = 'receive'; isPlus = true; iconType = 'user';
                        title = `받은 돈 (From: ${item.sendUser})`; 
                    } else if (typeStr === 'WITHDRAW') {
                        uiType = 'withdraw'; isPlus = false; iconType = 'usdt';
                        title = 'USDT 출금';
                    } else { 
                        uiType = 'pay'; isPlus = false; iconType = 'user';
                        title = `결제 (${item.sendUser})`; 
                    }

                    return {
                        id: item.historyId,
                        date: formatDate(item.createdAt),
                        type: uiType,
                        title: title,
                        amount: `${isPlus ? '+' : '-'} ${item.amount.toLocaleString()} USDT`,
                        isPlus: isPlus,
                        iconType: iconType,
                        rawType: item.type 
                    };
                });
                setTransactionList(mappedData);
            }
        } catch (error) {
            console.error("내역 조회 실패:", error);
            // 테스트용 더미 데이터 (API 실패시 확인용)
            /*
            setTransactionList([
                { id: 1, date: '01.13 (화)', type: 'charge', title: 'USDT 충전', amount: '+ 1,000 USDT', isPlus: true, iconType: 'usdt' },
                { id: 2, date: '01.13 (화)', type: 'pay', title: '친구 송금', amount: '- 50 USDT', isPlus: false, iconType: 'user' },
            ]);
            */
        }
    };

    fetchHistory();
  }, [currentDate]);

  // 필터링 로직
  const getFilteredData = () => {
    if (activeFilter === '전체') return transactionList;
    if (activeFilter === '충전') return transactionList.filter(item => item.type === 'charge');
    if (activeFilter === '결제') return transactionList.filter(item => item.type === 'pay' || item.type === 'withdraw');
    if (activeFilter === '받은 돈') return transactionList.filter(item => item.type === 'receive');
    return transactionList;
  };

  const filteredData = getFilteredData();
  let lastDate = '';

  // 월 이동 핸들러
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
      {/* 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <h2 className={styles.headerTitle}>내역</h2>
        <div style={{width: 24}}></div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        
        {/* --- [수정된 부분] 날짜 네비게이션 --- */}
        <div className={styles.dateNav}>
            {/* 왼쪽 화살표 */}
            <button className={styles.dateArrow} onClick={handlePrevMonth}>‹</button>
            
            {/* 연도와 월을 가로로 묶어주는 래퍼 */}
            <div className={styles.dateDisplay}>
                
                {/* 연도 선택 */}
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

                {/* 중간 점 (장식용) */}
                <span style={{color: '#169279', fontWeight: 'bold', margin: '0 2px'}}>.</span>

                {/* 월 선택 */}
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

            {/* 오른쪽 화살표 */}
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

        {/* 리스트 출력 */}
        <div className={styles.transactionList}>
            {filteredData.length === 0 ? (
                <div style={{textAlign: 'center', marginTop: '60px', color: '#bbb', fontSize: '14px'}}>
                    거래 내역이 없습니다.
                </div>
            ) : (
                filteredData.map((item) => {
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
                                    <div className={styles.title}>{item.title}</div>
                                    <div className={`${styles.amount} ${item.isPlus ? styles.plus : styles.minus}`}>{item.amount}</div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })
            )}
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <nav className={styles.bottomNav}>
        <div className={styles.navItem} onClick={() => navigate('/home')}>
            <img src={navHomeIcon} className={styles.navImg} alt="홈" />
            <span className={styles.navText}>홈</span>
        </div>
        <div className={styles.navItem} onClick={() => navigate('/pay')}>
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