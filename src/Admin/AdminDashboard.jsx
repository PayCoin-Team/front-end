import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './AdminDashboard.module.css';
// [수정] 경로 에러 방지를 위해 상위 폴더(..)로 나갑니다.
import usdtLogo from '../component/UsdtLogo.svg'; 

import ExternalMonitoring from './ExternalMonitoring';
import InternalMonitoring from './InternalMonitoring';
import ServiceRevenueMonitoring from './ServiceRevenueMonitoring'; // [추가] 1. 컴포넌트 import
import UserManagement from './UserManagement'; 

// [1] 사이드바 컴포넌트
const Sidebar = ({ activeMenu, setActiveMenu }) => (
  <aside className={styles.sidebar}>
    <div className={styles.logo}>
      <img src={usdtLogo} alt="CrossPay" />
      <span>CrossPay</span>
    </div>
    <nav className={styles.menu}>
      <div 
        className={`${styles.menuItem} ${activeMenu === 'dashboard' ? styles.active : ''}`}
        onClick={() => setActiveMenu('dashboard')}
      >
        <span className={styles.icon}>⊞</span> 대시보드
      </div>

      <div className={styles.menuGroup}>
        <h3>모니터링</h3>
        <ul>
          <li 
            onClick={() => setActiveMenu('external')} 
            style={{ 
              cursor: 'pointer', 
              color: activeMenu === 'external' ? '#28a745' : 'inherit', 
              fontWeight: activeMenu === 'external' ? 'bold' : 'normal' 
            }}
          >
            <span>Ⓑ</span> 외부 거래 모니터링
          </li>
          <li 
            onClick={() => setActiveMenu('internal')} 
            style={{ 
              cursor: 'pointer', 
              color: activeMenu === 'internal' ? '#28a745' : 'inherit', 
              fontWeight: activeMenu === 'internal' ? 'bold' : 'normal' 
            }}
          >
            <span>Ⓢ</span> 내부 거래 모니터링
          </li>
          {/* [추가] 2. 메뉴 클릭 이벤트 및 스타일 추가 */}
          <li 
            onClick={() => setActiveMenu('revenue')} 
            style={{ 
              cursor: 'pointer', 
              color: activeMenu === 'revenue' ? '#28a745' : 'inherit', 
              fontWeight: activeMenu === 'revenue' ? 'bold' : 'normal' 
            }}
          >
            <span>📊</span> 서비스 수익 모니터링
          </li>
        </ul>
      </div>
      
      <div className={styles.menuGroup}>
        <h3>관리</h3>
        <ul>
          <li 
            onClick={() => setActiveMenu('user')} 
            style={{ 
              cursor: 'pointer', 
              color: activeMenu === 'user' ? '#28a745' : 'inherit', 
              fontWeight: activeMenu === 'user' ? 'bold' : 'normal' 
            }}
          >
            <span>👤</span> 사용자 관리
          </li>
        </ul>
      </div>
    </nav>
  </aside>
);

// [2] 상단 카드 컴포넌트
const TopCards = ({ serviceBalance, externalBalance, userCount }) => {
  const formatNumber = (num) => Number(num || 0).toLocaleString();
  
  const cards = [
    { 
      title: '서비스 지갑 잔고(수수료 반영)', 
      value: `${formatNumber(serviceBalance)} USDT` 
      
    },
    { 
      title: '외부 지갑 잔고', 
      value: `${formatNumber(externalBalance)} USDT` 
      
    },
    { 
      title: '사용자 수(관리자 제외)', 
      value: `${formatNumber(userCount)} 명` 
      
    },
  ];

  return (
    <div className={styles.cardsContainer}>
      {cards.map((c, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardTitle}>{c.title}</div>
          <div className={styles.cardValue}>{c.value}</div>
          {/* 화살표 아이콘 렌더링 부분 삭제 */}
        </div>
      ))}
    </div>
  );
};

// [3] AI 비서 컴포넌트
const AiAssistant = () => {
  const [messages, setMessages] = useState([
    { type: 'ai', text: '안녕하세요! CrossPay AI 비서입니다. 무엇을 도와드릴까요?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('/admin/chat', userMessage, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      });

      const aiResponse = response.data; 
      setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);

    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { type: 'ai', text: '죄송합니다. 오류가 발생하여 답변할 수 없습니다.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (text) => {
    setInput(text);
  };

  return (
    <div className={styles.aiContainer}>
      <div className={styles.aiHeader}>
        <span>🤖</span> CrossPay AI 비서
      </div>
      
      <div className={styles.chatWindow} ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${msg.type === 'user' ? styles.user : styles.ai}`}>
            {msg.text.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i !== msg.text.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.ai}`}>
            ... 답변을 생성 중입니다 ...
          </div>
        )}
      </div>

      <div className={styles.suggestions}>
        <button onClick={() => handleSuggestionClick('100 USDT는 얼마야?')}>100 USDT는 얼마야?</button>
        <button onClick={() => handleSuggestionClick('가입된 사용자 수는 몇 명이야?')}>가입된 사용자 수는 몇 명이야?</button>
        <button onClick={() => handleSuggestionClick('총 거래 횟수는 얼마야?')}>총 거래 횟수는 얼마야?</button>
      </div>
      
      <div className={styles.inputArea}>
        <input 
          type="text" 
          placeholder="궁금한 내용을 입력해주세요" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button 
          className={styles.sendBtn} 
          onClick={handleSendMessage}
          disabled={isLoading}
        >
          {isLoading ? '...' : '✓'}
        </button>
      </div>
    </div>
  );
};

// [메인] 관리자 대시보드
const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  const [adminName, setAdminName] = useState('관리자');

  const [dashboardData, setDashboardData] = useState({
    serviceWalletBalance: 0, 
    externalWalletBalance: 0, 
    totalUserCount: 0 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const [userRes, ratesRes, countRes] = await Promise.all([
            axios.get('/users/me', config),       
            axios.get('/admin/rates', config),    
            axios.get('/admin/users/count', config) 
        ]);

        if (userRes.data) {
           const { firstName, lastName } = userRes.data;
           setAdminName(`${lastName || ''}${firstName || ''}`.trim());
        }

        const ratesData = ratesRes.data || {};
        const countData = countRes.data || {};

        setDashboardData({
            serviceWalletBalance: (ratesData.userBalance || 0) + (ratesData.totalFees || 0),
            externalWalletBalance: ratesData.serverBalance || 0,
            totalUserCount: countData.userCount || 0
        });

      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>환영합니다 {adminName} 님!</h1>
        </header>

        {/* 1. 대시보드 화면 */}
        {activeMenu === 'dashboard' && (
          <>
            <TopCards 
                serviceBalance={dashboardData.serviceWalletBalance}
                externalBalance={dashboardData.externalWalletBalance}
                userCount={dashboardData.totalUserCount}
            />
            
            <div className={styles.contentGrid}>
              <div className={styles.chartsColumn}>
                <div className={styles.chartContainer}>
                  <h2>USDT 차트</h2>
                  <div className={styles.placeholderText}>Chart Area</div>
                </div>
              </div>

              <div className={styles.aiColumn}>
                <AiAssistant />
              </div>
            </div>
          </>
        )}

        {/* 2. 외부 거래 모니터링 */}
        {activeMenu === 'external' && <ExternalMonitoring />}

        {/* 3. 내부 거래 모니터링 */}
        {activeMenu === 'internal' && <InternalMonitoring />}
        
        {/* [추가] 4. 서비스 수익 모니터링 */}
        {activeMenu === 'revenue' && <ServiceRevenueMonitoring />}

        {/* 5. 사용자 관리 */}
        {activeMenu === 'user' && <UserManagement />}

      </main>
    </div>
  );
};

export default AdminDashboard;