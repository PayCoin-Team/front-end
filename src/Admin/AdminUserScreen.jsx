import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminUserScreen.module.css';

// --- [SVG 아이콘 컴포넌트들] (라이브러리 설치 불필요) ---
const IconUser = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const IconLogo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
);
const IconArrowUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
);
const IconArrowDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
);
const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const AdminUserScreen = () => {
  const navigate = useNavigate();

  // --- 상태 관리 ---
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 거래 내역 상태
  const [transactions, setTransactions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 필터 상태
  const [filterType, setFilterType] = useState('ALL'); // API 파라미터: type=ALL
  const [year, setYear] = useState(2026); // API 파라미터: year
  const [month, setMonth] = useState(1);  // API 파라미터: month

  // --- 1. 유저 목록 API 호출 ---
  const fetchUsers = async () => {
    try {
      const response = await fetch(`/admin/users?page=0&pageSize=20`);
      if (response.ok) {
        const data = await response.json();
        const userList = data.content || [];
        setUsers(userList);

        // 로딩 시 첫 번째 유저 자동 선택
        if (userList.length > 0) {
          setSelectedUser(userList[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- 2. 특정 유저 거래 내역 조회 (API 연동) ---
  const fetchHistory = async () => {
    if (!selectedUser) return;

    setHistoryLoading(true);
    try {
      // API 명세에 따른 파라미터 구성
      // 주의: 관리자가 '특정 회원'을 보는 것이므로 userId가 필요합니다.
      // 명세서에는 /history 라고 되어있지만, 관리자용이라면 식별자가 필요하여 userId를 쿼리에 추가했습니다.
      const formattedMonth = String(month).padStart(2, '0'); // 1 -> "01"
      
      // 실제 호출 URL: /history?year=2026&month=01&type=ALL&page=0&pageSize=20&userId=...
      const queryParams = new URLSearchParams({
        year: year,
        month: formattedMonth,
        type: filterType,
        page: 0,
        pageSize: 50, // 한 번에 많이 가져오기
        userId: selectedUser.username // 혹은 selectedUser.id (백엔드 명세에 따라 맞춤)
      });

      const response = await fetch(`/history?${queryParams.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        // data.content가 ResponseHistoryDto 배열이라고 가정
        const rawList = data.content || [];
        
        // DTO 데이터를 UI에 맞게 변환 (매핑)
        const mappedList = rawList.map(item => ({
          date: formatDate(item.createdAt), // 예: item.createdAt (서버 필드명 확인 필요)
          type: item.type, // CHARGE, PAY, RECEIVE 등
          title: item.description || getDefaultTitle(item.type),
          amount: item.amount,
          isPlus: item.type === 'CHARGE' || item.type === 'RECEIVE' // 입금 성격인지 확인
        }));
        
        setTransactions(mappedList);
      } else {
        console.error("거래내역 조회 실패");
        setTransactions([]);
      }
    } catch (error) {
      console.error("API Error:", error);
      setTransactions([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 조건(유저, 날짜, 필터) 변경 시 재조회
  useEffect(() => {
    if (selectedUser) {
      fetchHistory();
    }
  }, [selectedUser, year, month, filterType]);

  // 유저 클릭 핸들러
  const handleUserClick = (user) => {
    setSelectedUser(user);
    // 상태가 바뀌면 useEffect가 트리거되어 fetchHistory가 실행됨
  };

  // --- Helper Functions ---
  const formatNumber = (num) => num ? num.toLocaleString() : '0';
  
  const formatId = (addr) => {
    if (!addr) return 'UNKNOWN';
    const clean = addr.replace(/-/g, '');
    if (clean.length < 8) return clean;
    return `${clean.substring(0,4)}-${clean.substring(4,8)}`.toUpperCase();
  };

  // 날짜 포맷팅 (YYYY-MM-DDTHH:mm:ss -> MM.DD (요일))
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = days[date.getDay()];
    return `${mm}.${dd} (${dayName})`;
  };

  // 설명이 없을 경우 기본 타이틀 제공
  const getDefaultTitle = (type) => {
    switch(type) {
      case 'CHARGE': return 'USDT 충전';
      case 'PAY': return '결제';
      case 'RECEIVE': return '입금';
      default: return '거래';
    }
  };

  return (
    <div className={styles.container}>
      
      {/* 1. 왼쪽: 유저 리스트 패널 */}
      <div className={styles.leftPanel}>
        <div className={styles.leftHeader}>
          <div className={styles.titleRow}>
            <span className={styles.mainTitle}>현재 가입된 유저</span>
            <span className={styles.userCount}>{users.length}명</span>
          </div>
        </div>

        <div className={styles.userListContainer}>
          {loading ? (
            <div style={{padding:'20px', textAlign:'center', color:'#999'}}>Loading...</div>
          ) : (
            users.map((user, idx) => {
              const isActive = selectedUser && selectedUser.username === user.username;
              return (
                <div 
                  key={idx} 
                  className={`${styles.userItem} ${isActive ? styles.active : ''}`}
                  onClick={() => handleUserClick(user)}
                >
                  <div className={`${styles.avatar} ${isActive ? styles.active : ''}`}>
                    <IconUser />
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.lastName}{user.firstName}</span>
                    <span className={styles.userId}>{formatId(user.publicAddress || user.username)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. 오른쪽: 메인 패널 */}
      <div className={styles.mainPanel}>
        {selectedUser ? (
          <>
            {/* 2-1. 중앙: 프로필 및 잔고 */}
            <div className={styles.centerSection}>
              <div className={styles.profileHeader}>
                <div className={styles.largeAvatar}>
                  <IconUser />
                </div>
                <div className={styles.profileTexts}>
                  <div className={styles.profileNameRow}>
                    <span className={styles.bigName}>{selectedUser.lastName}{selectedUser.firstName}</span>
                    <span className={styles.roleBadge}>관리자</span>
                  </div>
                  <span className={styles.fullId}>{formatId(selectedUser.publicAddress || selectedUser.username)}</span>
                </div>
              </div>

              <div className={styles.balanceWrapper}>
                <div className={styles.balanceTitle}>유저 지갑 잔고</div>
                <div className={styles.balanceRow}>
                  <span className={styles.balanceAmount}>{formatNumber(selectedUser.balance)}</span>
                  <span className={styles.currencyUnit}>USDT</span>
                </div>
                <button className={styles.suspendBtn} onClick={()=>alert('거래 정지 기능')}>
                  거래 정지
                </button>
              </div>
            </div>

            {/* 2-2. 우측 끝: 거래 내역 */}
            <div className={styles.historySection}>
              
              {/* 상단 로고 */}
              <div className={styles.brandLogoArea}>
                <div className={styles.brandText}>
                  <IconLogo /> CrossPay
                </div>
              </div>

              {/* 날짜 네비게이션 */}
              <div className={styles.historyHeader}>
                <button className={styles.arrowBtn} onClick={()=>setMonth(m=>m>1?m-1:12)}>&lt;</button>
                <div className={styles.dateControl}>
                  {year} <span style={{color:'#334155'}}>{String(month).padStart(2,'0')}</span>
                </div>
                <button className={styles.arrowBtn} onClick={()=>setMonth(m=>m<12?m+1:1)}>&gt;</button>
              </div>

              {/* 필터 탭 */}
              <div className={styles.filterRow}>
                {['ALL', 'CHARGE', 'PAY', 'RECEIVE'].map(type => (
                  <button
                    key={type}
                    className={`${styles.filterBtn} ${filterType === type ? styles.activeFilter : ''}`}
                    onClick={() => setFilterType(type)}
                  >
                    {type === 'ALL' ? '전체' : type === 'CHARGE' ? '충전' : type === 'PAY' ? '결제' : '받은 돈'}
                  </button>
                ))}
              </div>

              {/* 타임라인 */}
              <div className={styles.timeline}>
                {historyLoading ? (
                  <div style={{textAlign:'center', color:'#aaa', marginTop:'20px'}}>내역 불러오는 중...</div>
                ) : transactions.length === 0 ? (
                  <div style={{textAlign:'center', color:'#aaa', marginTop:'20px'}}>거래 내역이 없습니다.</div>
                ) : (
                  transactions.map((tx, idx) => (
                    <div key={idx}>
                      {/* 날짜 그룹핑 헤더 */}
                      {(idx === 0 || transactions[idx-1].date !== tx.date) && (
                        <div style={{marginBottom:'10px'}}>
                          <span className={styles.dateGroupLabel}>{tx.date}</span>
                        </div>
                      )}

                      <div className={styles.txItem}>
                        <div className={`${styles.txIconBox} ${
                          tx.type === 'CHARGE' ? styles.charge : 
                          tx.type === 'RECEIVE' ? styles.receive : styles.pay
                        }`}>
                          {tx.type === 'CHARGE' ? <IconPlus /> : 
                           tx.type === 'RECEIVE' ? <IconArrowDown /> : <IconArrowUp />}
                        </div>

                        <div className={styles.txContent}>
                          <div className={styles.txTitle}>{tx.title}</div>
                          <span className={`${styles.txAmount} ${tx.isPlus ? styles.plus : styles.minus}`}>
                            {tx.isPlus ? '+ ' : '- '}{formatNumber(tx.amount)} USDT
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </>
        ) : (
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', width:'100%', color:'#ccc'}}>
            좌측 목록에서 유저를 선택해주세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserScreen;