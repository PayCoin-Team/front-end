import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './HistoryScreen.module.css';

// 아이콘 임포트
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import UsdtLogo from './component/UsdtLogo.svg';

const HistoryScreen = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('전체');
  const [currentDate, setCurrentDate] = useState({ year: 2026, month: 1 });

  // ⭐ [추가] 드롭다운 열림/닫힘 상태 관리
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  // ⭐ [추가] 선택 가능한 연도/월 데이터
  const years = [2024, 2025, 2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // 1~12월

  const filters = ['전체', '충전', '결제', '받은 돈'];

  // 더미 데이터 (기존 유지)
  const allTransactions = [
    { id: 1, date: '01.13 (화)', type: 'charge', title: 'USDT 충전', amount: '+ 200 USDT', isPlus: true, iconType: 'usdt' },
    { id: 2, date: '01.14 (수)', type: 'pay', title: '결제 | B2D4... -> N2N3...', amount: '- 10 USDT', isPlus: false, iconType: 'user' },
    { id: 3, date: '01.14 (수)', type: 'pay', title: '결제 | B2D4... -> N2N3...', amount: '- 45 USDT', isPlus: false, iconType: 'user' },
    { id: 4, date: '01.16 (금)', type: 'receive', title: '받은 돈 | B2D4... -> N2N3...', amount: '+ 60 USDT', isPlus: true, iconType: 'user' },
    { id: 5, date: '01.16 (금)', type: 'pay', title: '결제 | B2D4... -> N2N3...', amount: '- 15 USDT', isPlus: false, iconType: 'user' },
    { id: 6, date: '01.17 (토)', type: 'withdraw', title: 'USDT 출금', amount: '- 45 USDT', isPlus: false, iconType: 'usdt' },
  ];

  const getFilteredData = () => {
    if (activeFilter === '전체') return allTransactions;
    if (activeFilter === '충전') return allTransactions.filter(item => item.type === 'charge');
    if (activeFilter === '결제') return allTransactions.filter(item => item.type === 'pay' || item.type === 'withdraw');
    if (activeFilter === '받은 돈') return allTransactions.filter(item => item.type === 'receive');
    return allTransactions;
  };

  const filteredData = getFilteredData();
  let lastDate = '';

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
        
        {/* ⭐ [수정] 날짜 네비게이션 (드롭다운 기능 적용) */}
        <div className={styles.dateNav}>
            <button className={styles.dateArrow} onClick={() => setCurrentDate({...currentDate, month: currentDate.month > 1 ? currentDate.month - 1 : 12})}>‹</button>
            
            <div className={styles.dateDisplay}>
                
                {/* [연도 선택 영역] */}
                <div className={styles.selectWrapper}>
                    <span 
                        className={styles.dateText} 
                        onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
                    >
                        {currentDate.year} <span className={styles.downArrow}>∨</span>
                    </span>
                    
                    {/* 연도 드롭다운 메뉴 */}
                    {isYearOpen && (
                        <ul className={styles.dropdownList}>
                            {years.map(year => (
                                <li key={year} onClick={() => {
                                    setCurrentDate({ ...currentDate, year });
                                    setIsYearOpen(false);
                                }}>
                                    {year}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* [월 선택 영역] */}
                <div className={styles.selectWrapper}>
                    <span 
                        className={styles.dateText} 
                        onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
                    >
                        {String(currentDate.month).padStart(2, '0')} <span className={styles.downArrow}>∨</span>
                    </span>

                    {/* 월 드롭다운 메뉴 */}
                    {isMonthOpen && (
                        <ul className={`${styles.dropdownList} ${styles.monthList}`}>
                            {months.map(month => (
                                <li key={month} onClick={() => {
                                    setCurrentDate({ ...currentDate, month });
                                    setIsMonthOpen(false);
                                }}>
                                    {month}월
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>

            <button className={styles.dateArrow} onClick={() => setCurrentDate({...currentDate, month: currentDate.month < 12 ? currentDate.month + 1 : 1})}>›</button>
        </div>

        {/* 필터 탭 */}
        <div className={styles.filterTabs}>
            {filters.map((filter) => (
                <button 
                    key={filter}
                    className={`${styles.filterBtn} ${activeFilter === filter ? styles.activeFilter : ''}`}
                    onClick={() => setActiveFilter(filter)}
                >
                    {filter}
                </button>
            ))}
        </div>

        {/* 거래 내역 리스트 (유지) */}
        <div className={styles.transactionList}>
            {filteredData.map((item) => {
                const showDateHeader = item.date !== lastDate;
                lastDate = item.date;
                return (
                    <React.Fragment key={item.id}>
                        {showDateHeader && <div className={styles.dateHeader}>{item.date}</div>}
                        <div className={styles.transactionItem}>
                            <div className={`${styles.iconWrapper} ${item.iconType === 'usdt' ? styles.greenBg : styles.grayBg}`}>
                                {item.iconType === 'usdt' ? <img src={UsdtLogo} alt="USDT" className={styles.tokenIcon} /> : <div className={styles.userIcon}>👤</div>}
                            </div>
                            <div className={styles.infoWrapper}>
                                <div className={styles.title}>{item.title}</div>
                                <div className={`${styles.amount} ${item.isPlus ? styles.plus : styles.minus}`}>{item.amount}</div>
                            </div>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>

      </div>

      {/* 3. 하단 네비게이션 (유지) */}
      <nav className={styles.bottomNav}>
        {/* ... (기존 코드와 동일) ... */}
        <div className={styles.navItem} onClick={() => navigate('/home')}><img src={navHomeIcon} className={styles.navImg} alt="홈" /><span className={styles.navText}>홈</span></div>
        <div className={styles.navItem} onClick={() => navigate('/pay')}><img src={navPayIcon} className={styles.navImg} alt="결제" /><span className={styles.navText}>결제</span></div>
        <div className={styles.navItem} onClick={() => navigate('/mypage')}><img src={navUserIcon} className={styles.navImg} alt="마이페이지" /><span className={styles.navText}>마이페이지</span></div>
      </nav>

    </div>
  );
};

export default HistoryScreen;