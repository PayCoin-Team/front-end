import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './AdminDashboard.module.css';
// [수정] 경로 에러 방지를 위해 상위 폴더(..)로 나갑니다.
import usdtLogo from '../component/UsdtLogo.svg'; 

import ExternalMonitoring from './ExternalMonitoring';
import InternalMonitoring from './InternalMonitoring';
import UserManagement from './UserManagement'; 

// [1] 사이드바 컴포넌트 (변경 없음)
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
          <li onClick={() => setActiveMenu('external')} style={{ cursor: 'pointer', color: activeMenu === 'external' ? '#28a745' : 'inherit', fontWeight: activeMenu === 'external' ? 'bold' : 'normal' }}>
            <span>Ⓑ</span> 외부 거래 모니터링
          </li>
          <li onClick={() => setActiveMenu('internal')} style={{ cursor: 'pointer', color: activeMenu === 'internal' ? '#28a745' : 'inherit', fontWeight: activeMenu === 'internal' ? 'bold' : 'normal' }}>
            <span>Ⓢ</span> 내부 거래 모니터링
          </li>
          <li><span>📊</span> 서비스 수익 모니터링</li>
        </ul>
      </div>
      
      <div className={styles.menuGroup}>
        <h3>관리</h3>
        <ul>
          <li onClick={() => setActiveMenu('user')} style={{ cursor: 'pointer', color: activeMenu === 'user' ? '#28a745' : 'inherit', fontWeight: activeMenu === 'user' ? 'bold' : 'normal' }}>
            <span>👤</span> 사용자 관리
          </li>
        </ul>
      </div>
    </nav>
  </aside>
);

// [2] 상단 카드 컴포넌트 (변경 없음)
const TopCards = ({ serviceBalance, externalBalance, userCount }) => {
  const formatNumber = (num) => Number(num || 0).toLocaleString();
  const cards = [
    { title: '서비스 지갑 잔고(수수료 반영)', value: `${formatNumber(serviceBalance)} USDT`, icon: '→' },
    { title: '외부 지갑 잔고', value: `${formatNumber(externalBalance)} USDT`, icon: '→' },
    { title: '사용자 수(관리자 제외)', value: `${formatNumber(userCount)} 명`, icon: '→' },
  ];
  return (
    <div className={styles.cardsContainer}>
      {cards.map((c, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardTitle}>{c.title}</div>
          <div className={styles.cardValue}>{c.value}</div>
          <div className={styles.cardIcon}>{c.icon}</div>
        </div>
      ))}
    </div>
  );
};

// [3] AI 비서 컴포넌트 (대폭 수정됨)
const AiAssistant = () => {
  // 채팅 메시지 목록 (기본 환영 메시지 포함)
  const [messages, setMessages] = useState([
    { type: 'ai', text: '안녕하세요! CrossPay AI 비서입니다. 무엇을 도와드릴까요?' }
  ]);
  // 입력창 상태
  const [input, setInput] = useState('');
  // 로딩 상태 (답변 기다리는 중)
  const [isLoading, setIsLoading] = useState(false);
  
  // 스크롤 자동 이동을 위한 ref
  const chatWindowRef = useRef(null);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송 함수
  const handleSendMessage = async () => {
    if (!input.trim()) return; // 빈 입력 방지

    // 1. 사용자 메시지 화면에 즉시 추가
    const userMessage = input;
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInput(''); // 입력창 초기화
    setIsLoading(true); // 로딩 시작

    try {
      const token = localStorage.getItem('accessToken');
      
      // 2. API 호출 (POST /admin/chat)
      // Request Body를 단순 String으로 보냅니다.
      const response = await axios.post('/admin/chat', userMessage, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain' // [중요] String으로 보낼 때 설정
          // 만약 백엔드가 JSON({ "prompt": "..." })을 원하면 'application/json'으로 변경하고 body를 객체로 보내야 함
        }
      });

      // 3. AI 응답 화면에 추가
      // 백엔드가 String으로 답을 준다고 가정 (response.data)
      const aiResponse = response.data; 
      setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);

    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { type: 'ai', text: '죄송합니다. 오류가 발생하여 답변할 수 없습니다.' }]);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  // 엔터키 입력 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  // 추천 질문 클릭 처리
  const handleSuggestionClick = (text) => {
    setInput(text);
    // 상태 업데이트가 비동기라 input이 바로 안 바뀌는 걸 대비해 텍스트를 직접 넘김
    // 하지만 여기선 input 상태만 바꾸고 사용자가 전송 누르게 하거나, 
    // 아래처럼 바로 전송 로직을 태울 수도 있습니다. (여기선 입력창에만 넣음)
  };

  return (
    <div className={styles.aiContainer}>
      <div className={styles.aiHeader}>
        <span>🤖</span> CrossPay AI 비서
      </div>
      
      {/* 채팅 내역 표시 영역 */}
      <div className={styles.chatWindow} ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${msg.type === 'user' ? styles.user : styles.ai}`}>
            {/* 줄바꿈 문자(\n) 처리 */}
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
  
  // 관리자 이름 상태
  const [adminName, setAdminName] = useState('관리자');

  // 대시보드 데이터 상태 관리
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
                {/* AI 비서 컴포넌트 사용 */}
                <AiAssistant />
              </div>
            </div>
          </>
        )}

        {activeMenu === 'external' && <ExternalMonitoring />}
        {activeMenu === 'internal' && <InternalMonitoring />}
        {activeMenu === 'user' && <UserManagement />}

      </main>
    </div>
  );
};

export default AdminDashboard;