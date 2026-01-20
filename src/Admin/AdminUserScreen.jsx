import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminUserScreen.module.css';

// [설정] API 기본 URL
const API_BASE_URL = 'https://api.yourdomain.com';

const AdminUserScreen = () => {
  const navigate = useNavigate();

  // --- 상태 관리 ---
  const [users, setUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [userTransactions, setUserTransactions] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [txFilter, setTxFilter] = useState('ALL');

  // --- [API] 1. 초기 유저 리스트 로딩 ---
  useEffect(() => {
    fetchUserList();
  }, []);

  const fetchUserList = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        params: { page: 0, pageSize: 20 },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // ResponseUserDto 리스트 가져오기
      const userList = response.data.content || response.data.data || response.data;
      setUsers(userList);

      // 리스트가 로드되면 첫 번째 유저 자동 선택 (username 기준)
      if (userList && userList.length > 0) {
        handleUserClick(userList[0].username);
      }
    } catch (error) {
      console.error('유저 목록 로딩 실패:', error);
    }
  };

  // --- [API] 2. 유저 상세 및 거래내역 조회 ---
  // 식별자로 username을 사용합니다.
  const handleUserClick = async (username) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');

      // 2-1. 회원 상세 조회
      // DTO 구조: { username, email, firstName, lastName, balance, publicAddress }
      const userRes = await axios.get(`${API_BASE_URL}/admin/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(userRes.data);

      // 2-2. 거래 내역 조회 (userId 대신 username을 파라미터로 보낸다고 가정)
      const txRes = await axios.get(`${API_BASE_URL}/admin/transactions`, {
        params: { 
            page: 0, 
            pageSize: 20,
            username: username // username으로 필터링
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const txList = txRes.data.content || txRes.data.data || [];
      setUserTransactions(txList);

    } catch (error) {
      console.error('상세 정보 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- [API] 3. 회원 상태 변경 ---
  const toggleUserStatus = async () => {
    if (!selectedUser) return;
    
    try {
        const token = localStorage.getItem('accessToken');
        // URL에 username 사용
        const response = await axios.post(`${API_BASE_URL}/admin/users/${selectedUser.username}/status`, 
            {}, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
            alert('회원 상태가 변경되었습니다.');
            handleUserClick(selectedUser.username);
        }
    } catch (error) {
        console.error('상태 변경 오류:', error);
        alert('상태 변경에 실패했습니다.');
    }
  };

  // --- 헬퍼: 이름 조합 (성 + 이름) ---
  const getFullName = (user) => {
    if (!user) return '';
    return `${user.lastName || ''}${user.firstName || ''}`; // 예: 강 + 대근
  };

  // --- 헬퍼: 날짜 포맷 ---
  const formatDate = (dateString) => {
    if(!dateString) return '-';
    const date = new Date(dateString);
    return `${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoText}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
          CrossPay <span style={{fontSize: '14px', color: '#666', fontWeight:'normal'}}>| Admin</span>
        </div>
      </header>
      
      <div className={styles.topNav}>
        <button className={styles.navItem}>통합개요 및 시스템 헬스</button>
        <button className={`${styles.navItem} ${styles.active}`}>유저 및 지갑 관리</button>
        <button className={styles.navItem}>전체 거래 내역</button>
      </div>

      <div className={styles.mainGrid}>
        
        {/* [Left] 유저 리스트 */}
        <section className={styles.leftPanel}>
          <div className={styles.listHeader}>
            <span>현재 가입된 유저</span>
            <span className={styles.userCount}>{users.length}명</span>
          </div>
          <div className={styles.userList}>
            {users.map((user, idx) => (
              <div 
                key={user.username || idx} 
                className={`${styles.userItem} ${selectedUser && (selectedUser.username === user.username) ? styles.selected : ''}`}
                onClick={() => handleUserClick(user.username)}
              >
                <div className={styles.userInfoMini}>
                  <div className={styles.avatarSmall}></div>
                  <div>
                    {/* [변경] firstName + lastName 조합 */}
                    <div className={styles.userName}>{getFullName(user)}</div>
                  </div>
                </div>
                {/* [변경] publicAddress 표시 */}
                <div className={styles.userIdMini}>
                    {user.publicAddress ? user.publicAddress : user.username}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* [Center] 유저 상세 */}
        <section className={styles.centerPanel}>
          {selectedUser ? (
            <>
              <div className={styles.profileHeader}>
                <div className={styles.profileMain}>
                  <div className={styles.avatarLarge}></div>
                  <div>
                    {/* [변경] 이름 조합 표시 */}
                    <span className={styles.nameLarge}>{getFullName(selectedUser)}</span>
                    {/* Role 정보가 DTO에 없어서 임시 제외하거나 별도 로직 필요 */}
                    {/* {selectedUser.role === 'ADMIN' && <span className={styles.adminBadge}>관리자</span>} */}
                  </div>
                </div>
                <div className={styles.idLarge}>
                    {/* [변경] publicAddress 표시 */}
                    {selectedUser.publicAddress || '지갑 주소 없음'}
                </div>
              </div>

              <div className={styles.balanceCard}>
                <div className={styles.balanceLabel}>유저 지갑 잔고</div>
                <span className={styles.balanceAmount}>
                    {/* [변경] balance 필드 매핑 */}
                    {selectedUser.balance ? Number(selectedUser.balance).toLocaleString() : '0'}
                    <span className={styles.unit}> USDT</span>
                </span>
                
                <div className={styles.dividerGreen}></div>
                
                {/* Status 필드가 DTO에 없으면 버튼 처리가 애매할 수 있음. 일단 기능은 유지 */}
                <button 
                    className={styles.suspendBtn} 
                    onClick={toggleUserStatus}
                    style={{ backgroundColor: selectedUser.status === 'SUSPENDED' ? '#e53935' : '#169279' }}
                >
                    {selectedUser.status === 'SUSPENDED' ? '정지 해제' : '거래 정지'}
                </button>
              </div>
              
              {/* 추가 정보 표시 (이메일 등) */}
              <div style={{marginTop: '20px', width: '100%', textAlign: 'left', color: '#666'}}>
                  <p><strong>ID:</strong> {selectedUser.username}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
              </div>
            </>
          ) : (
            <div style={{marginTop: '100px', color: '#999'}}>유저를 선택해주세요.</div>
          )}
        </section>

        {/* [Right] 거래 내역 */}
        <section className={styles.rightPanel}>
            <div className={styles.dateNav}>
                <button className={styles.arrowBtn}>&lt;</button>
                <span>2026 ⌵ 01 ⌵</span>
                <button className={styles.arrowBtn}>&gt;</button>
            </div>

            <div className={styles.filterGroup}>
                {['ALL', 'CHARGE', 'PAYMENT', 'RECEIVED'].map(type => (
                    <button 
                        key={type}
                        className={`${styles.filterBtn} ${txFilter === type ? styles.active : ''}`}
                        onClick={() => setTxFilter(type)}
                    >
                        {type === 'ALL' ? '전체' : type === 'CHARGE' ? '충전' : type === 'PAYMENT' ? '결제' : '받은 돈'}
                    </button>
                ))}
            </div>

            <div className={styles.txList}>
                {loading ? (
                    <div>Loading...</div>
                ) : userTransactions.length > 0 ? (
                    userTransactions.map((tx, idx) => (
                        <div key={tx.id || idx} className={styles.txItem}>
                            <div className={`${styles.txIcon} ${tx.type === 'DEPOSIT' ? styles.usdt : ''}`}>
                                {tx.type === 'DEPOSIT' ? '충전' : 'Tx'}
                            </div>
                            <div className={styles.txContent}>
                                <div className={styles.txTitle}>
                                    {tx.type === 'DEPOSIT' ? 'USDT 충전' : `거래 | ${tx.counterparty || 'Unknown'}`}
                                </div>
                                <div className={styles.dateLabel}>{formatDate(tx.createdAt)}</div>
                            </div>
                            <div className={`${styles.txAmount} ${tx.type === 'DEPOSIT' || tx.type === 'RECEIVED' ? styles.plus : styles.minus}`}>
                                {tx.type === 'DEPOSIT' || tx.type === 'RECEIVED' ? '+' : '-'} 
                                {Number(tx.amount).toLocaleString()} USDT
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{textAlign:'center', color:'#999', marginTop:'50px'}}>거래 내역이 없습니다.</div>
                )}
            </div>
        </section>
      </div>
    </div>
  );
};

export default AdminUserScreen;