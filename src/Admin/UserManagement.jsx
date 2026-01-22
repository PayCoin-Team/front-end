import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // 설정해둔 axios 인스턴스
import styles from './UserManagement.module.css';

const UserManagement = () => {
  // --- State 관리 ---
  const [users, setUsers] = useState([]); // User List
  const [selectedUser, setSelectedUser] = useState(null); // Selected User Detail
  const [history, setHistory] = useState([]); // User History
  const [loading, setLoading] = useState(false);
  
  // 날짜 필터
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(1);

  // --- [1] 초기 데이터 로딩 (회원 목록 조회) ---
  useEffect(() => {
    fetchUserList();
  }, []);

  // --- [2] 선택된 유저나 날짜가 바뀌면 거래 내역 갱신 ---
  useEffect(() => {
    if (selectedUser) {
      // DTO에 userId가 명시적으로 없었으나, API 호출을 위해 userId 혹은 username 사용
      // 보통 DB의 PK인 userId가 필요하지만, 없다면 username을 식별자로 사용해야 함.
      // 여기서는 user 객체에 userId가 있다고 가정하거나, 필요한 경우 수정하세요.
      const identifier = selectedUser.userId || selectedUser.username;
      fetchUserHistory(identifier);
    }
  }, [selectedUser, currentYear, currentMonth]);

  // 1. 회원 목록 조회
  const fetchUserList = async () => {
    try {
      setLoading(true);
      // GET /admin/users?page=0&pageSize=20
      const response = await api.get('/admin/users', {
        params: { page: 0, pageSize: 20 }
      });
      
      // Page<ResponseUserDto> 처리
      const userList = response.data?.content || response.data || [];
      setUsers(userList);

      // 첫 번째 유저 자동 선택
      if (userList.length > 0 && !selectedUser) {
        // 상세 조회를 위해 ID가 필요. DTO에 ID가 없다면 리스트의 객체를 바로 set 하거나 username으로 조회
        // 여기서는 리스트의 객체를 우선 사용하고, 상세 조회 API가 별도로 있다면 호출
        // fetchUserDetail(userList[0].userId); 
        setSelectedUser(userList[0]); 
      }
    } catch (error) {
      console.error("회원 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. 회원 상세 조회 (필요 시 사용, 리스트 정보로 충분하면 생략 가능)
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
          // API 명세에 따라 userId 혹은 username 전달
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

  // 4. 회원 상태 변경 (DTO에 status 필드가 없어 가상의 로직으로 처리)
  const handleStatusChange = async () => {
    if (!selectedUser) return;
    
    // ResponseUserDto에 status가 없으므로 일단 버튼을 누르면 요청을 보내는 것으로 처리
    if (!window.confirm(`${selectedUser.lastName}${selectedUser.firstName} 님의 상태를 변경하시겠습니까?`)) return;

    try {
      // 식별자 (userId가 없다면 username 등 사용)
      const id = selectedUser.userId || selectedUser.username;
      await api.post(`/admin/users/${id}/status`);
      
      alert(`상태가 변경되었습니다.`);
      fetchUserList(); // 목록 갱신
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("오류가 발생했습니다.");
    }
  };

  // --- 헬퍼 함수 ---
  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);
  
  // 날짜 포맷팅 (2026-01-13T... -> 01.13 (화))
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
      
      {/* 상단 통계 (DTO에 정보가 없으므로 목록 개수로 대체) */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>전체 사용자</div>
          <div className={styles.statValue}>{users.length} <span>명</span></div>
        </div>
        {/* status 필드가 DTO에 없으므로 나머지 통계는 생략하거나 가짜 데이터 사용 */}
        <div className={styles.statCard}>
          <div className={styles.statLabel}>이번 달 가입자</div>
          <div className={styles.statValue}>- <span>명</span></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>총 예치금</div>
          <div className={styles.statValue}>
            {/* 전체 유저 balance 합계 예시 */}
            {formatNumber(users.reduce((acc, cur) => acc + (cur.balance || 0), 0))} <span>USDT</span>
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
                  // key는 userId가 없으면 username이나 index 사용
                  key={user.userId || user.username || index} 
                  className={`${styles.userItem} ${selectedUser && (selectedUser.username === user.username) ? styles.activeUser : ''}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className={styles.avatarPlaceholder} />
                  <div className={styles.userInfo}>
                    {/* ResponseUserDto: lastName + firstName */}
                    <div className={styles.userName}>
                      {user.lastName}{user.firstName}
                    </div>
                    {/* ResponseUserDto: publicAddress */}
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
                    {/* Role 정보가 DTO에 없어서 주석 처리 혹은 하드코딩 */}
                    {/* <span className={styles.adminBadge}>User</span> */}
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

            {/* [거래 내역 리스트] ResponseHistoryDto 매핑 */}
            <div className={styles.historyList}>
              <div className={styles.dateHeader}>
                {currentMonth}월 거래 내역 ({history.length}건)
              </div>
              
              {history.length > 0 ? (
                history.map((tx) => {
                  // 거래 타입에 따른 UI 처리 로직
                  // type: "CHARGE" | "SEND" | "RECEIVE" (예시)
                  let isPlus = false;
                  let title = tx.type;
                  let counterparty = '';

                  // 타입별 분기 처리
                  if (tx.type === 'CHARGE') {
                    isPlus = true;
                    title = 'USDT 충전';
                  } else if (tx.type === 'SEND') {
                    isPlus = false; // 보냈으니 차감
                    title = '보낸 돈';
                    counterparty = `${tx.receiverName} (${tx.receiverAddress})`;
                  } else if (tx.type === 'RECEIVE') {
                    isPlus = true; // 받았으니 증가
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
                      
                      {/* 날짜 (ResponseHistoryDto.createdAt) */}
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