import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import usdtLogo from './component/UsdtLogo.svg'; // 로고 경로 확인 필요

// [1] 사이드바 컴포넌트 (내부 정의)
const Sidebar = () => (
  <aside className={styles.sidebar}>
    <div className={styles.logo}>
      <img src={usdtLogo} alt="CrossPay" />
      <span>CrossPay</span>
    </div>
    <nav className={styles.menu}>
      <div className={`${styles.menuItem} ${styles.active}`}>
        <span className={styles.icon}>⊞</span> 대시보드
      </div>
      <div className={styles.menuGroup}>
        <h3>모니터링</h3>
        <ul>
          <li><span>Ⓑ</span> 외부 거래 모니터링</li>
          <li><span>Ⓢ</span> 내부 거래 모니터링</li>
          <li><span>📊</span> 투자 모니터링</li>
        </ul>
      </div>
      <div className={styles.menuGroup}>
        <h3>관리</h3>
        <ul>
          <li><span>👤</span> 사용자 관리</li>
        </ul>
      </div>
    </nav>
  </aside>
);

// [2] 상단 카드 컴포넌트 (내부 정의)
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

// [3] AI 비서 컴포넌트 (내부 정의)
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
  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>환영합니다 홍길동 님!</h1>
        </header>
        
        <TopCards />
        
        <div className={styles.contentGrid}>
          {/* 차트 영역 (왼쪽) */}
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
          
          {/* AI 비서 영역 (오른쪽) */}
          <div className={styles.aiColumn}>
            <AiAssistant />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;