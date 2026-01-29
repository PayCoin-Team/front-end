import React, { useState, useEffect } from 'react';
import api from '../utils/api'; 
import styles from './UserManagement.module.css';
import usdtLogo from '../component/UsdtLogo.svg'; 

const UserManagement = () => {
  // --- State 관리 ---
  const [users, setUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [history, setHistory] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const [userCounts, setUserCounts] = useState({
    userCount: 0, withdrawCount: 0, todayActiveCount: 0 
  });

  // 날짜 및 드롭다운 상태
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  // 드롭다운 데이터
  const years = [2024, 2025, 2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // --- [1] 초기 데이터 로딩 ---
  useEffect(() => {
    fetchUserList();
    fetchUserCounts(); 
  }, []);

  // --- [2] 선택된 유저 변경 및 날짜 변경 시 데이터 조회 (핵심 수정 부분) ---
  useEffect(() => {
    // selectedUser가 존재할 때만 실행
    if (selectedUser) {
      // API 호출 시 사용할 ID 결정 (userId가 있으면 우선 사용, 없으면 username)
      const idToUse = selectedUser.userId || selectedUser.username;
      
      fetchUserDetail(idToUse);
      fetchUserHistory(idToUse);
    }
    
    // [중요] 의존성 배열에서 변하는 값(userId)을 제거하고, 
    // 유저 고유 식별자(username)와 날짜만 넣어서 무한 호출 방지
  }, [selectedUser?.username, currentYear, currentMonth]);


  // 날짜 이동 핸들러
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
        setCurrentYear(prev => prev - 1);
        setCurrentMonth(12);
    } else {
        setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
        setCurrentYear(prev => prev + 1);
        setCurrentMonth(1);
    } else {
        setCurrentMonth(prev => prev + 1);
    }
  };

  // 상세 정보 조회
  const fetchUserDetail = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      if (response.data) {
          // 기존 정보 유지하면서 새로운 정보(balance 등) 업데이트
          setSelectedUser(prev => ({
              ...prev,
              ...response.data
          }));
      }
    } catch (error) {
      console.error("상세 정보 조회 실패:", error);
    }
  };

  // 통계 조회
  const fetchUserCounts = async () => {
    try {
        const [countRes, todayRes] = await Promise.all([
            api.get('/admin/users/count'),
            api.get('/admin/today/transfer')
        ]);
        setUserCounts({
            userCount: countRes.data?.userCount || 0,
            withdrawCount: countRes.data?.withdrawCount || 0,
            todayActiveCount: todayRes.data 
        });
    } catch (error) {
        console.error("사용자 통계 조회 실패:", error);
    }
  };

  // 목록 조회
  const fetchUserList = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users/find', {
        params: { page: 0, pageSize: 20 }
      });
      const userList = response.data?.content || response.data || [];
      setUsers(userList);
      
      // 목록 로딩 후 선택된 유저가 없다면 첫 번째 유저 자동 선택
      if (userList.length > 0 && !selectedUser) {
        setSelectedUser(userList[0]); 
      }
    } catch (error) {
      console.error("회원 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 거래 내역 조회
  const fetchUserHistory = async (userId) => {
    try {
      const response = await api.get(`/admin/transfer/${userId}`, {
        params: {
          page: 0,
          pageSize: 20,
          year: currentYear,
          month: String(currentMonth).padStart(2, '0')
        }
      });
      
      let historyList = [];
      if (response.data && Array.isArray(response.data.content)) {
          historyList = response.data.content;
      } else if (Array.isArray(response.data)) {
          historyList = response.data;
      }
      setHistory(historyList);
    } catch (error) {
      console.error("거래 내역 조회 실패:", error);
      setHistory([]);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`${selectedUser.lastName}${selectedUser.firstName} 님의 상태를 변경하시겠습니까?`)) return;

    try {
      const id = selectedUser.userId || selectedUser.username;
      await api.patch(`/admin/users/${id}/status`);
      alert(`상태가 변경되었습니다.`);
      
      // 상태 변경 후 데이터 갱신
      fetchUserList();
      fetchUserCounts();
      fetchUserDetail(id);
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);
  
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const weekDay = ['일','월','화','수','목','금','토'][date.getDay()];
        return `${month}.${day} (${weekDay}) ${hours}:${minutes}:${seconds}`;
    } catch (e) { return '-'; }
  };

  return (
    <div className={styles.container}>
      {/* 상단 통계 */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>전체 사용자(관리자 제외)</div>
          <div className={styles.statValue}>{formatNumber(userCounts.userCount)} <span>명</span></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>오늘 거래한 사용자 수</div>
          <div className={styles.statValue}>{formatNumber(userCounts.todayActiveCount)} <span>명</span></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>탈퇴한 사용자 수</div>
          <div className={styles.statValue}>{formatNumber(userCounts.withdrawCount)} <span>명</span></div>
        </div>
      </div>

      <div className={styles.contentArea}>
        {/* [좌측] 사용자 리스트 */}
        <div className={styles.userListPanel}>
          <div className={styles.scrollArea}>
            {loading ? (
              <div style={{padding: 20, textAlign: 'center'}}>Loading...</div>
            ) : (
              users.map((user, index) => (
                <div 
                  key={user.userId || user.username || index} 
                  className={`${styles.userItem} ${selectedUser && (selectedUser.username === user.username) ? styles.activeUser : ''}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className={styles.avatarPlaceholder} />
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{user.lastName}{user.firstName}</div>
                    <div className={styles.userUuid}>{user.publicAddress}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* [우측] 상세 정보 */}
        {selectedUser ? (
          <div className={styles.userDetailPanel}>
            <div className={styles.detailHeader}>
              <div className={styles.headerLeft}>
                <div className={`${styles.avatarPlaceholder} ${styles.largeAvatar}`} />
                <div className={styles.headerText}>
                  <div className={styles.nameRow}>
                    <span className={styles.detailName}>{selectedUser.lastName}{selectedUser.firstName}</span>
                  </div>
                  <div style={{fontSize:'13px', color:'#666', marginTop:'4px'}}>
                    {selectedUser.username} ({selectedUser.email})
                  </div>
                </div>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.detailUuid}>{selectedUser.publicAddress}</div>
                <div className={styles.balanceArea}>
                  <span className={styles.balanceValue}>{formatNumber(selectedUser.balance)}</span>
                  <span className={styles.balanceUnit}> USDT</span>
                </div>
                <button className={styles.stopBtn} onClick={handleStatusChange}>상태 변경</button>
              </div>
            </div>

            <div className={styles.divider} />

            {/* 날짜 드롭다운 바 */}
            <div className={styles.dateNav}>
                <button className={styles.dateArrow} onClick={handlePrevMonth}>‹</button>
                
                <div className={styles.dateDisplay}>
                    {/* 연도 드롭다운 */}
                    <div className={styles.selectWrapper}>
                        <span 
                            className={styles.dateText} 
                            onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
                        >
                            {currentYear} <span className={styles.downArrow}>▼</span>
                        </span>
                        {isYearOpen && (
                            <ul className={styles.dropdownList}>
                                {years.map(y => (
                                    <li key={y} onClick={() => { 
                                        setCurrentYear(y); 
                                        setIsYearOpen(false); 
                                    }}>{y}</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <span style={{margin: '0 2px', color: '#169279', fontWeight:'bold'}}>.</span>

                    {/* 월 드롭다운 */}
                    <div className={styles.selectWrapper}>
                        <span 
                            className={styles.dateText} 
                            onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
                        >
                            {String(currentMonth).padStart(2, '0')} <span className={styles.downArrow}>▼</span>
                        </span>
                        {isMonthOpen && (
                            <ul className={`${styles.dropdownList} ${styles.monthList}`}>
                                {months.map(m => (
                                    <li key={m} onClick={() => { 
                                        setCurrentMonth(m); 
                                        setIsMonthOpen(false); 
                                    }}>{m}월</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <button className={styles.dateArrow} onClick={handleNextMonth}>›</button>
            </div>

            {/* 거래 내역 리스트 */}
            <div className={styles.historyList}>
              <div className={styles.dateHeader}>
                {currentMonth}월 거래 내역 ({history.length}건)
              </div>
              
              {history.length > 0 ? (
                history.map((tx, index) => {
                  const isReceive = tx.type === '받기' || tx.type === 'DEPOSIT'; // 타입 체크 로직 보강
                  
                  return (
                    <div key={tx.historyId || tx.txId || index} className={styles.historyItem}>
                      
                      <div className={styles.txIcon} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef7f5'}}>
                        <img src={usdtLogo} alt="USDT" style={{width: '24px', height: '24px'}} />
                      </div>
                      
                      <div className={styles.txContent}>
                        <div className={styles.txTitle}>
                          {tx.counterparty || '알 수 없음'}
                        </div>
                        <div className={`${styles.txAmount} ${isReceive ? styles.amountPlus : styles.amountMinus}`}>
                          {isReceive ? `+ ${formatNumber(tx.amount)}` : `- ${formatNumber(tx.amount)}`} USDT
                        </div>
                      </div>
                      
                      <div style={{fontSize: '12px', color: '#999', marginLeft: '10px'}}>
                        {formatTime(tx.time || tx.createdAt)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{textAlign:'center', padding:'20px', color:'#999'}}>
                  거래 내역이 없습니다.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.userDetailPanel} style={{justifyContent:'center', alignItems:'center', color:'#888'}}>
            사용자를 선택해주세요.
          </div>
        )}

      </div>
    </div>
  );
};

export default UserManagement;