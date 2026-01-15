import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ⭐ [추가] Recharts 라이브러리 임포트
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import common from './Common.module.css';
import styles from './ChartScreen.module.css';

const ChartScreen = () => {
  const navigate = useNavigate();
  const [activeTime, setActiveTime] = useState('1H'); 

  // ⭐ [변경] 선 그래프용 임시 데이터 생성
  // 실제로는 서버에서 받아온 시간(time)과 가격(price) 데이터가 들어갑니다.
  const generateData = () => {
    const data = [];
    let price = 1450;
    for (let i = 0; i < 30; i++) {
      // 가격이 조금씩 랜덤하게 변하도록 설정
      price = price + Math.floor(Math.random() * 10 - 4); 
      data.push({
        time: `${i}분`,
        price: price,
      });
    }
    return data;
  };

  const chartData = generateData();

  return (
    <div className={common.layout}>
      
      {/* 1. 상단 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <div className={styles.headerTitle}>
            <span className={styles.coinName}>USDT</span>
            <span className={styles.currency}>/KRW</span>
        </div>
      </header>

      {/* 2. 메인 콘텐츠 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        {/* 가격 정보 */}
        <div className={styles.priceSection}>
            <h1 className={styles.currentPrice}>1,458<span>KRW</span></h1>
            <div className={styles.priceChange}>
                <span className={styles.plus}>+0.85%</span>
                <span className={styles.amount}>▲ 12.00</span>
            </div>
        </div>

        {/* 차트 영역 */}
        <div className={styles.chartContainer}>
            <div className={styles.timeTab}>
                {['15m', '1H', '4H', '1D', '1W'].map((time) => (
                    <span 
                        key={time} 
                        className={activeTime === time ? styles.active : ''}
                        onClick={() => setActiveTime(time)}
                    >
                        {time}
                    </span>
                ))}
            </div>

            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    {/* 그래프 아래 채워지는 그라데이션 효과 */}
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#169279" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#169279" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  {/* 축(Axis)은 깔끔하게 숨김 처리 */}
                  <XAxis dataKey="time" hide={true} />
                  <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value) => [`${value.toLocaleString()} KRW`]}
                  />
                  {/* 실제 선과 영역을 그리는 부분 (type="monotone"이 부드러운 곡선) */}
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#ae1717" /* 선 색상 (테마색) */
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPrice)" /* 그라데이션 적용 */
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* 호가 정보 (그대로 유지) */}
        <div className={styles.orderBook}>
            <div className={styles.orderRow}>
                <span className={styles.sellPrice}>1,460</span>
                <span className={styles.vol}>0.452</span>
            </div>
            <div className={styles.orderRow}>
                <span className={styles.sellPrice}>1,459</span>
                <span className={styles.vol}>1.200</span>
            </div>
            <div className={`${styles.orderRow} ${styles.current}`}>
                <span className={styles.mainPrice}>1,458</span>
                <span className={styles.vol}>5.120</span>
            </div>
            <div className={styles.orderRow}>
                <span className={styles.buyPrice}>1,457</span>
                <span className={styles.vol}>2.441</span>
            </div>
            <div className={styles.orderRow}>
                <span className={styles.buyPrice}>1,456</span>
                <span className={styles.vol}>0.899</span>
            </div>
        </div>
      </div>

    </div>
  );
};

export default ChartScreen;