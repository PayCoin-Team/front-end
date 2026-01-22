import React, { useState } from 'react';
import styles from './AdminDashboard.module.css';
// [수정] 경로 에러 방지를 위해 상위 폴더(..)로 나갑니다.
import usdtLogo from '../component/UsdtLogo.svg'; 

import ExternalMonitoring from './ExternalMonitoring';
import InternalMonitoring from './InternalMonitoring';
import UserManagement from './UserManagement'; 


// [1] 사이드바 컴포넌트
const Sidebar = ({ activeMenu, setActiveMenu }) => (
  <aside className={styles.sidebar}>
    <div className={styles.logo}>
      <img src={usdtLogo} alt="CrossPay" />
      <span>CrossPay</span>
    </div>
    <nav className={styles.menu}>
      {/* 대시보드 메뉴 */}
      <div 
        className={`${styles.menuItem} ${activeMenu === 'dashboard' ? styles.active : ''}`}
        onClick={() => setActiveMenu('dashboard')}
      >
        <span className={styles.icon}>⊞</span> 대시보드
      </div>

      <div className={styles.menuGroup}>
        <h3>모니터링</h3>
        <ul>
          {/* 외부 거래 모니터링 */}
          <li 
            onClick={() => setActiveMenu('external')}
            style={{ 
              color: activeMenu === 'external' ? '#28a745' : 'inherit',
              fontWeight: activeMenu === 'external' ? 'bold' : 'normal',
              cursor: 'pointer' 
            }}
          >
            <span>Ⓑ</span> 외부 거래 모니터링
          </li>

          {/* 내부 거래 모니터링 */}
          <li 
            onClick={() => setActiveMenu('internal')}
            style={{ 
              color: activeMenu === 'internal' ? '#28a745' : 'inherit',
              fontWeight: activeMenu === 'internal' ? 'bold' : 'normal',
              cursor: 'pointer' 
            }}
          >
            <span>Ⓢ</span> 내부 거래 모니터링
          </li>

          <li><span>📊</span> 투자 모니터링</li>
        </ul>
      </div>
      
      <div className={styles.menuGroup}>
        <h3>관리</h3>
        <ul>
          {/* [수정] 사용자 관리 메뉴 클릭 이벤트 추가 */}
          <li
            onClick={() => setActiveMenu('user')}
            style={{ 
              color: activeMenu === 'user' ? '#28a745' : 'inherit',
              fontWeight: activeMenu === 'user' ? 'bold' : 'normal',
              cursor: 'pointer' 
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
const TopCards = () => {
  const cards = [
    { title: '서비스 지갑 잔고', value: '2,294,284 USDT', icon: '→' },
    { title: '외부 지갑 잔고', value: '2,294,284 USDT', icon: '→' },
    { title: '사용자 수', value: '284 명', icon: '→' },
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

// [3] AI 비서 컴포넌트
const AiAssistant = () => (
  <div className={styles.aiContainer}>
    <div className={styles.aiHeader}>
      <span>🤖</span> CrossPay AI 비서
    </div>
    <div className={styles.chatWindow}>
      <div className={`${styles.message} ${styles.user}`}>
        어제 비해 USDT 가격은 얼마나 올랐어?
      </div>
      <div className={`${styles.message} ${styles.ai}`}>
        현재 USDT/KRW 가격은 1,483.50원입니다.<br />
        어제 같은 시간(1,481.20원)과 비교했을 때 약 0.16%(+2.3원) 상승했습니다.
      </div>
    </div>
    <div className={styles.suggestions}>
      <button>100 USDT 은 얼마야?</button>
      <button>가입된 사용자 수 총 명 몇이야</button>
      <button>총 거래 횟수는 얼마야?</button>
    </div>
    <div className={styles.inputArea}>
      <input type="text" placeholder="궁금한 내용을 입력해주세요" />
      <button className={styles.sendBtn}>✓</button>
    </div>
  </div>
);

// [메인] 관리자 대시보드
const AdminDashboard = () => {
  // 현재 보고 있는 메뉴 상태 관리
  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <div className={styles.dashboardContainer}>
      {/* 사이드바에 상태 전달 */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>환영합니다 홍길동 님!</h1>
        </header>

        {/* 1. 대시보드 화면 */}
        {activeMenu === 'dashboard' && (
          <>
            <TopCards />
            <div className={styles.contentGrid}>
              <div className={styles.chartsColumn}>
                <div className={styles.chartContainer}>
                  <h2>USDT 차트</h2>
                  <div className={styles.placeholderText}>Chart Area</div>
                </div>
                <div className={styles.chartContainer}>
                  <h2>채권 차트</h2>
                  <div className={styles.placeholderText}>Chart Area</div>
                </div>
              </div>

              <div className={styles.aiColumn}>
                <AiAssistant />
              </div>
            </div>
          </>
        )}

        {/* 2. 외부 거래 모니터링 화면 */}
        {activeMenu === 'external' && <ExternalMonitoring />}

        {/* 3. 내부 거래 모니터링 화면 */}
        {activeMenu === 'internal' && <InternalMonitoring />}

        {/* 4. [추가] 사용자 관리 화면 */}
        {activeMenu === 'user' && <UserManagement />}

      </main>
    </div>
  );
};

export default AdminDashboard;