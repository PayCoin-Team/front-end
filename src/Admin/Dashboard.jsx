import React, { useState, useEffect } from 'react';
import './Dashboard.css'; // 아까 만들어드린 CSS 파일
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalAmount: 0,
    verificationStatus: 'UNKNOWN', // 검증 상태 (MATCH / CONFLICT)
    serviceWallet: { usdt: 0, trx: 0 },
    externalWallet: { usdt: 0, trx: 0 },
    nodeStatus: { status: 'success', latency: 96 }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [usersRes, balanceRes] = await Promise.all([
          fetch('/admin/users?page=0&pageSize=1'),
          fetch('/admin/total-balance?page=0&pageSize=1'),
        ]);

        if (usersRes.ok && balanceRes.ok) {
          const usersData = await usersRes.json();
          const balanceData = await balanceRes.json();
          
          // Page<ResponseVerificationDto> 구조에서 첫 번째(최신) 데이터 추출
          const latestVerification = balanceData.content && balanceData.content.length > 0 
            ? balanceData.content[0] 
            : null;

          /* [데이터 매핑 포인트]
             DTO: { verificationId, userBalance, serverBalance, difference, createdAt }
             
             - serverBalance -> 서비스 지갑 (Service Wallet)
             - userBalance   -> 외부 지갑 (External/User Wallet)
             - difference    -> 검증 상태 (MATCH / CONFLICT)
             
             * 참고: 현재 DTO에는 통화 구분(USDT/TRX)이 없으므로, 
               일단 USDT 칸에 매핑하고 TRX는 0으로 두거나 
               동일한 값을 보여주도록 설정했습니다.
          */

          setDashboardData(prev => ({
            ...prev,
            totalUsers: usersData.totalElements || 0,
            
            // 누적 거래액은 서버 잔고 기준
            totalAmount: latestVerification ? latestVerification.serverBalance : 0,
            
            // 검증 상태 (MATCH or CONFLICT)
            verificationStatus: latestVerification ? latestVerification.difference : 'UNKNOWN',

            serviceWallet: {
              usdt: latestVerification ? latestVerification.serverBalance : 0,
              trx: 0 // DTO에 TRX 필드가 추가되면 여기에 매핑
            },
            externalWallet: {
              usdt: latestVerification ? latestVerification.userBalance : 0,
              trx: 0 
            }
          }));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const chartData = [
    { name: '1월', value: 100000 },
    { name: '2월', value: 450000 },
    { name: '3월', value: 500000 },
    { name: '4월', value: 900000 },
    { name: '5월', value: 1200000 },
    { name: '6월', value: 1500000 },
    { name: '7월', value: dashboardData.totalAmount || 2294284 },
  ];

  const formatNumber = (num) => num ? num.toLocaleString() : '0';

  // 검증 상태에 따른 배지 스타일
  const getStatusBadgeStyle = (status) => {
    if (status === 'MATCH') return { backgroundColor: '#d1fae5', color: '#059669' }; // Green
    if (status === 'CONFLICT') return { backgroundColor: '#fee2e2', color: '#dc2626' }; // Red
    return { backgroundColor: '#f3f4f6', color: '#6b7280' }; // Gray
  };

  if (loading) {
    return <div className="loading-screen">데이터를 불러오는 중...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="header-section">
        <div className="brand-wrapper">
          <div className="brand-logo">T</div>
          <h1 className="brand-title">CrossPay</h1>
        </div>
        <nav className="nav-tabs">
          {['통합개요', '유저 및 지갑 관리', '전체 거래 내역'].map((tab, idx) => {
            const tabKey = ['overview', 'users', 'transactions'][idx];
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`tab-button ${activeTab === tabKey ? 'active' : 'inactive'}`}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Grid Layout */}
      <div className="main-grid">
        
        {/* Left Column */}
        <div className="left-column">
          <div className="metrics-row">
            <div className="card">
              <h3 className="metric-title">
                서비스 내 누적 거래액
                <span className="badge-red">+12%</span>
              </h3>
              <div className="metric-value-wrapper">
                <span className="metric-number">{formatNumber(dashboardData.totalAmount)}</span>
                <span className="metric-unit">USDT</span>
              </div>
            </div>

            <div className="card">
              <h3 className="metric-title">현재 가입된 유저</h3>
              <div className="metric-value-wrapper">
                <span className="metric-number">{formatNumber(dashboardData.totalUsers)}</span>
                <span className="metric-unit">명</span>
              </div>
            </div>
          </div>

          <div className="card chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis hide={true} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="card wallet-section">
            
            {/* 검증 상태 표시 배지 추가 */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#374151' }}>지갑 정합성 검증</span>
                <span style={{ 
                    ...getStatusBadgeStyle(dashboardData.verificationStatus),
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                }}>
                    {dashboardData.verificationStatus}
                </span>
            </div>

            {/* Service Wallet -> serverBalance */}
            <div className="wallet-group">
              <h3 className="metric-title">현재 서비스 지갑 잔고</h3>
              <div className="wallet-row">
                <span className="wallet-number">{formatNumber(dashboardData.serviceWallet.usdt)}</span>
                <span className="metric-unit">USDT</span>
              </div>
              <div className="wallet-row" style={{ opacity: 0.5 }}> 
                {/* TRX 데이터가 없어서 흐리게 처리 */}
                <span className="wallet-number">{formatNumber(dashboardData.serviceWallet.trx)}</span>
                <span className="metric-unit">TRX</span>
              </div>
            </div>

            {/* External Wallet -> userBalance */}
            <div className="wallet-group">
              <h3 className="metric-title">외부 지갑 잔고</h3>
              <div className="wallet-row">
                <span className="wallet-number">{formatNumber(dashboardData.externalWallet.usdt)}</span>
                <span className="metric-unit">USDT</span>
              </div>
              <div className="wallet-row" style={{ opacity: 0.5 }}>
                <span className="wallet-number">{formatNumber(dashboardData.externalWallet.trx)}</span>
                <span className="metric-unit">TRX</span>
              </div>
            </div>

            {/* Node Status */}
            <div className="node-status-area">
              <div className="metric-title">트론 노드와의 연결 상태</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>현재 상태 :</span>
                <span className="status-badge">
                  <span className="pulse-dot"></span>
                  쾌적
                </span>
                <span className="latency-text">{dashboardData.nodeStatus.latency} ms</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;