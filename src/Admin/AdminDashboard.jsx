import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './AdminDashboard.module.css';
import usdtLogo from '../component/UsdtLogo.svg'; 
// [추가] useNavigate import (Sidebar에서 사용하기 위해)
import { useNavigate } from 'react-router-dom';

import ExternalMonitoring from './ExternalMonitoring';
import InternalMonitoring from './InternalMonitoring';
import ServiceRevenueMonitoring from './ServiceRevenueMonitoring'; 
import UserManagement from './UserManagement'; 

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

// [1] 사이드바 (수정됨)
const Sidebar = ({ activeMenu, setActiveMenu }) => {
  // [추가] 로고 클릭 시 홈으로 이동하기 위한 훅
  const navigate = useNavigate();

  return (
    <aside className={styles.sidebar}>
      {/* [수정] 클릭 이벤트 및 커서 스타일 추가 */}
      <div 
        className={styles.logo} 
        onClick={() => navigate('/home')} 
        style={{ cursor: 'pointer' }}
      >
        <img src={usdtLogo} alt="TsPay" />
        <span>TsPay</span>
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
            <li onClick={() => setActiveMenu('revenue')} style={{ cursor: 'pointer', color: activeMenu === 'revenue' ? '#28a745' : 'inherit', fontWeight: activeMenu === 'revenue' ? 'bold' : 'normal' }}>
              <span>📊</span> 서비스 수익 모니터링
            </li>
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
};

// [2] 상단 카드 (기존 유지)
const TopCards = ({ serviceBalance, externalBalance, userCount }) => {
  const formatNumber = (num) => Number(num || 0).toLocaleString();
  const cards = [
    { title: '서비스 지갑 잔고(수수료 반영)', value: `${formatNumber(serviceBalance)} USDT` },
    { title: '외부 지갑 잔고', value: `${formatNumber(externalBalance)} USDT` },
    { title: '사용자 수(관리자 제외)', value: `${formatNumber(userCount)} 명` },
  ];
  return (
    <div className={styles.cardsContainer}>
      {cards.map((c, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardTitle}>{c.title}</div>
          <div className={styles.cardValue}>{c.value}</div>
        </div>
      ))}
    </div>
  );
};

// [3] AI 비서 (기존 유지)
const AiAssistant = () => {
  const [messages, setMessages] = useState([{ type: 'ai', text: '안녕하세요! TsPay AI 비서입니다. 무엇을 도와드릴까요?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'text/plain' }
      });
      setMessages(prev => [...prev, { type: 'ai', text: response.data }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'ai', text: '오류가 발생했습니다.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !isLoading) handleSendMessage(); };
  const handleSuggestionClick = (text) => { setInput(text); };

  return (
    <div className={styles.aiContainer}>
      <div className={styles.aiHeader}><span>🤖</span> TsPay AI 비서</div>
      <div className={styles.chatWindow} ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${msg.type === 'user' ? styles.user : styles.ai}`}>
            {msg.text.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i !== msg.text.split('\n').length - 1 && <br />}</React.Fragment>)}
          </div>
        ))}
        {isLoading && <div className={`${styles.message} ${styles.ai}`}>... 답변 생성 중 ...</div>}
      </div>
      <div className={styles.suggestions}>
        <button onClick={() => handleSuggestionClick('100 USDT는 얼마야?')}>100 USDT는 얼마야?</button>
        <button onClick={() => handleSuggestionClick('가입된 사용자 수는 몇 명이야?')}>가입된 사용자 수는 몇 명이야?</button>
        <button onClick={() => handleSuggestionClick('총 거래 횟수는 얼마야?')}>총 거래 횟수는 얼마야?</button>
      </div>
      <div className={styles.inputArea}>
        <input type="text" placeholder="궁금한 내용을 입력해주세요" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} disabled={isLoading} />
        <button className={styles.sendBtn} onClick={handleSendMessage} disabled={isLoading}>{isLoading ? '...' : '✓'}</button>
      </div>
    </div>
  );
};

// [메인] 관리자 대시보드
const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [adminName, setAdminName] = useState('관리자');
  const [dashboardData, setDashboardData] = useState({ serviceWalletBalance: 0, externalWalletBalance: 0, totalUserCount: 0 });

  // 차트 관련 상태
  const [chartData, setChartData] = useState([]);
  const [currentRate, setCurrentRate] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [chartLoading, setChartLoading] = useState(true);
  const CRYPTOCOMPARE_API_KEY = 'ef6a8399b16ac4f8b9459453a4608472c259ad794c28a999b2700ef995e19dc7';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
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

  // 차트 데이터 조회 (1주, KRW 고정)
  useEffect(() => {
    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        const targetCode = 'KRW';
        const limit = 168; // 1주일

        const chartUrl = `https://min-api.cryptocompare.com/data/v2/histohour?fsym=USDT&tsym=${targetCode}&limit=${limit}&api_key=${CRYPTOCOMPARE_API_KEY}`;
        const priceUrl = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=USDT&tsyms=${targetCode}&api_key=${CRYPTOCOMPARE_API_KEY}`;

        const [chartRes, priceRes] = await Promise.all([fetch(chartUrl), fetch(priceUrl)]);
        const chartJson = await chartRes.json();
        const priceJson = await priceRes.json();

        if (priceJson.RAW?.USDT?.[targetCode]) {
            const data = priceJson.RAW.USDT[targetCode];
            setCurrentRate(data.PRICE);
            setPriceChange(data.CHANGEPCT24HOUR);
        }

        if (chartJson.Data?.Data) {
            const formattedData = chartJson.Data.Data.map(item => {
                const dateObj = new Date(item.time * 1000);
                const timeLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.getHours()}h`;
                return { time: timeLabel, price: item.close };
            });
            setChartData(formattedData);
        }
      } catch (error) {
        console.error("차트 로딩 실패:", error);
      } finally {
        setChartLoading(false);
      }
    };

    if (activeMenu === 'dashboard') {
        fetchChartData();
    }
  }, [activeMenu]);

  const isPositive = priceChange >= 0;

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
                  {/* 차트 헤더: 가격 정보 */}
                  <div className={styles.chartHeader}>
                    <div className={styles.priceWrapper}>
                        <h2 className={styles.currentPrice}>
                            {currentRate ? currentRate.toLocaleString() : 'Loading...'}
                            <span>KRW</span>
                        </h2>
                        <div className={styles.priceChange}>
                            <span className={isPositive ? styles.plus : styles.minus}>
                                {isPositive ? '+' : ''}{priceChange ? priceChange.toFixed(2) : '0.00'}%
                            </span>
                            <span className={styles.periodText}>(24시간 변동)</span>
                        </div>
                    </div>
                  </div>

                  {/* 탭: 1W만 남김 */}
                  <div className={styles.timeTab}>
                    <span className={`${styles.tabItem} ${styles.active}`}>1W</span>
                  </div>

                  {/* 실제 차트 */}
                  <div className={styles.chartWrapper}>
                    {chartLoading ? (
                        <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc'}}>
                            차트 데이터 로딩 중...
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? "#d32f2f" : "#1976d2"} stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor={isPositive ? "#d32f2f" : "#1976d2"} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide={true} />
                                <YAxis domain={['auto', 'auto']} hide={true} />
                                <Tooltip 
                                    contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`₩${value.toLocaleString()}`, '가격']}
                                    labelStyle={{ color: '#888', marginBottom: '5px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="price" 
                                    stroke={isPositive ? "#d32f2f" : "#1976d2"}
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorPrice)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.aiColumn}>
                <AiAssistant />
              </div>
            </div>
          </>
        )}

        {activeMenu === 'external' && <ExternalMonitoring />}
        {activeMenu === 'internal' && <InternalMonitoring />}
        {activeMenu === 'revenue' && <ServiceRevenueMonitoring />}
        {activeMenu === 'user' && <UserManagement />}

      </main>
    </div>
  );
};

export default AdminDashboard;