import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // 설정해둔 axios 인스턴스
import styles from './UserManagement.module.css';

const UserManagement = () => {
  // --- State 관리 ---
  const [users, setUsers] = useState([]); // User List
  const [selectedUser, setSelectedUser] = useState(null); // Selected User Detail
  const [history, setHistory] = useState([]); // User History
  const [loading, setLoading] = useState(false);
  
  // [수정] 사용자 수 통계 상태 (todayActiveCount 추가)
  const [userCounts, setUserCounts] = useState({
    userCount: 0,
    withdrawCount: 0,
    todayActiveCount: 0 
  });

  // 날짜 필터
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(1);

  // --- [1] 초기 데이터 로딩 (회원 목록 & 카운트 조회) ---
  useEffect(() => {
    fetchUserList();
    fetchUserCounts(); 
  }, []);

  // --- [2] 선택된 유저나 날짜가 바뀌면 거래 내역 갱신 ---
  useEffect(() => {
    if (selectedUser) {
      const identifier = selectedUser.userId || selectedUser.username;
      fetchUserHistory(identifier);
    }
  }, [selectedUser, currentYear, currentMonth]);

  // [수정] 사용자 수 통계 조회 (전체/탈퇴 + 오늘거래자)
  const fetchUserCounts = async () => {
    try {
        // 두 API를 병렬로 호출 (속도 최적화)
        const [countRes, todayRes] = await Promise.all([
            api.get('/admin/users/count'),    // 전체/탈퇴 유저 수
            api.get('/admin/today/transfer')  // 오늘 거래한 유저 수 (Long 값 반환)
        ]);

        setUserCounts({
            userCount: countRes.data?.userCount || 0,
            withdrawCount: countRes.data?.withdrawCount || 0,
            // Long 타입 값 그대로 사용
            todayActiveCount: todayRes.data 
        });

    } catch (error) {
        console.error("사용자 통계 조회 실패:", error);
    }
  };

  // 1. 회원 목록 조회
  const fetchUserList = async () => {
    try {
      setLoading(true);
      // GET /admin/users?page=0&pageSize=20
      const response = await api.get('/admin/users/find', {
        params: { page: 0, pageSize: 20 }
      });
      
      // Page<ResponseUserDto> 처리
      const userList = response.data?.content || response.data || [];
      setUsers(userList);

      // 첫 번째 유저 자동 선택
      if (userList.length > 0 && !selectedUser) {
        setSelectedUser(userList[0]); 
      }
    } catch (error) {
      console.error("회원 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. 회원 상세 조회 (필요 시 사용)
  const fetchUserDetail = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data); // ResponseUserDto
    } catch (error) {
      console.error("회원 상세 조회 실패:", error);
    }
  };

  // 3. 거래 내역 조회 (ResponseHistoryDto 적용)
  const fetchUserHistory = async (userIdOrUsername) => {
    try {
      // GET /history?year=...&month=...
      const response = await api.get('/history', {
        params: {
          year: currentYear,
          month: String(currentMonth).padStart(2, '0'),
          type: 'ALL',
          page: 0,
          pageSize: 10,
          userId: userIdOrUsername 
        }
      });
      
      // Page<ResponseHistoryDto>
      const historyList = response.data?.content || [];
      setHistory(historyList);
    } catch (error) {
      console.error("거래 내역 조회 실패:", error);
      setHistory([]);
    }
  };

  // 4. 회원 상태 변경
  const handleStatusChange = async () => {
    if (!selectedUser) return;
    
    if (!window.confirm(`${selectedUser.lastName}${selectedUser.firstName} 님의 상태를 변경하시겠습니까?`)) return;

    try {
      const id = selectedUser.userId || selectedUser.username;
      await api.post(`/admin/users/${id}/status`);
      
      alert(`상태가 변경되었습니다.`);
      fetchUserList(); // 목록 갱신
      fetchUserCounts(); // 상태 변경 후 카운트도 갱신
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("오류가 발생했습니다.");
    }
  };

  // --- 헬퍼 함수 ---
  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${month}.${day} (${weekDay})`;
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
          {/* [수정] 받아온 Long 값 표시 */}
          <div className={styles.statValue}>
             {formatNumber(userCounts.todayActiveCount)} <span>명</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>탈퇴한 사용자 수</div>
          <div className={styles.statValue}>
             {formatNumber(userCounts.withdrawCount)} <span>명</span>
          </div>
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
                    <div className={styles.userName}>
                      {user.lastName}{user.firstName}
                    </div>
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
                    <span className={styles.detailName}>
                      {selectedUser.lastName}{selectedUser.firstName}
                    </span>
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
                
                <button className={styles.stopBtn} onClick={handleStatusChange}>
                  상태 변경
                </button>
              </div>
            </div>

            <div className={styles.divider} />

            {/* 날짜 선택기 */}
            <div className={styles.dateSelector}>
              <button onClick={() => setCurrentMonth(m => m > 1 ? m - 1 : 12)}>&lt;</button>
              <span>{currentYear} <small>년</small> {String(currentMonth).padStart(2, '0')} <small>월</small></span>
              <button onClick={() => setCurrentMonth(m => m < 12 ? m + 1 : 1)}>&gt;</button>
            </div>

            {/* [거래 내역 리스트] */}
            <div className={styles.historyList}>
              <div className={styles.dateHeader}>
                {currentMonth}월 거래 내역 ({history.length}건)
              </div>
              
              {history.length > 0 ? (
                history.map((tx) => {
                  let isPlus = false;
                  let title = tx.type;
                  let counterparty = '';

                  if (tx.type === 'CHARGE') {
                    isPlus = true;
                    title = 'USDT 충전';
                  } else if (tx.type === 'SEND') {
                    isPlus = false; 
                    title = '보낸 돈';
                    counterparty = `${tx.receiverName} (${tx.receiverAddress})`;
                  } else if (tx.type === 'RECEIVE') {
                    isPlus = true; 
                    title = '받은 돈';
                    counterparty = `${tx.senderName} (${tx.senderAddress})`;
                  }

                  return (
                    <div key={tx.historyId} className={styles.historyItem}>
                      <div className={`${styles.txIcon} ${isPlus ? styles.iconCharge : styles.iconDefault}`} />
                      
                      <div className={styles.txContent}>
                        <div className={styles.txTitle}>
                          {title}
                          {counterparty && <span className={styles.txHash}> | {counterparty}</span>}
                        </div>
                        <div className={`${styles.txAmount} ${isPlus ? styles.amountPlus : styles.amountMinus}`}>
                          {isPlus ? `+ ${formatNumber(tx.amount)}` : `- ${formatNumber(tx.amount)}`} USDT
                        </div>
                      </div>
                      
                      <div style={{fontSize: '12px', color: '#999', marginLeft: '10px'}}>
                        {formatDate(tx.createdAt)}
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