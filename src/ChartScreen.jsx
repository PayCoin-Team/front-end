import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  // ⭐ [추가 1] 선택된 화폐 상태 관리
  const [selectedCurrency, setSelectedCurrency] = useState('KRW');

  // ⭐ [추가 2] 환율 데이터 (1 USDT 기준)
  const exchangeRates = {
    KRW: { flag: '🇰🇷' }, // KRW는 차트 데이터를 따름
    USD: { rate: 1.00, flag: '🇺🇸' },
    JPY: { rate: 152.4, flag: '🇯🇵' },
    CNY: { rate: 7.23, flag: '🇨🇳' },
    GBP: { rate: 0.79, flag: '🇬🇧' },
    EUR: { rate: 0.92, flag: '🇪🇺' },
  };

  // --- 기존 차트 데이터 로직 유지 ---
  const generateData = () => {
    const data = [];
    let price = 1450;
    for (let i = 0; i < 30; i++) {
      price = price + Math.floor(Math.random() * 10 - 4); 
      data.push({
        time: `${i}분`,
        price: price,
      });
    }
    return data;
  };

  const chartData = generateData();
  const currentPrice = chartData[chartData.length - 1].price;
  // ---------------------------------

  // ⭐ [추가 3] 화면에 표시할 가격 계산
  // KRW면 차트의 currentPrice를 쓰고, 아니면 고정 환율 테이블 값을 사용
  const displayPrice = selectedCurrency === 'KRW' 
    ? currentPrice 
    : exchangeRates[selectedCurrency].rate;

  return (
    <div className={common.layout}>
      
      {/* 1. 상단 헤더 (유지) */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <div className={styles.headerTitle}>
            <span className={styles.coinName}>USDT</span>
            <span className={styles.currency}>/KRW</span>
        </div>
      </header>

      {/* 2. 메인 콘텐츠 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        
        {/* 가격 정보 (유지 - KRW 기준) */}
        <div className={styles.priceSection}>
            <h1 className={styles.currentPrice}>{currentPrice.toLocaleString()}<span>KRW</span></h1>
            <div className={styles.priceChange}>
                <span className={styles.plus}>+0.85%</span>
                <span className={styles.amount}>▲ 12.00</span>
            </div>
        </div>

        {/* 차트 영역 (유지) */}
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
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#169279" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#169279" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide={true} />
                  <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value) => [`${value.toLocaleString()} KRW`]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#ae1717"
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* ⭐ [변경] 하단 변환 카드 (국가 선택 기능 추가) */}
        <div className={styles.conversionCard}>
            <div className={styles.conversionHeader}>환산 가치 확인</div>
            <div className={styles.conversionBody}>
                
                {/* 왼쪽: 1 USDT 고정 */}
                <div className={styles.currencyBox}>
                    <span className={styles.icon}>🇺🇸</span>
                    <span className={styles.unit}>1 USDT</span>
                </div>
                
                <div className={styles.equalIcon}>=</div>
                
                {/* 오른쪽: 국가 선택 및 값 표시 */}
                <div className={`${styles.currencyBox} ${styles.selectBox}`}>
                    {/* 선택된 국가 국기 */}
                    <span className={styles.icon}>{exchangeRates[selectedCurrency].flag}</span>
                    
                    {/* 숨겨진 Select 태그 */}
                    <select 
                        className={styles.currencySelect}
                        value={selectedCurrency} 
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                    >
                        <option value="KRW">KRW</option>
                        <option value="USD">USD</option>
                        <option value="JPY">JPY</option>
                        <option value="CNY">CNY</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>

                    {/* 보여지는 텍스트 */}
                    <div className={styles.valueDisplay}>
                        <span className={styles.val}>{displayPrice.toLocaleString()}</span>
                        <span className={styles.unitSmall}>{selectedCurrency}</span>
                    </div>
                </div>

            </div>
            <p className={styles.infoText}>선택한 통화 기준의 대략적인 환산 금액입니다.</p>
        </div>
      </div>
    </div>
  );
};

export default ChartScreen;