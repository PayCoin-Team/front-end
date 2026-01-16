import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import common from './Common.module.css';
import styles from './ChartScreen.module.css';

import useExchangeRate from './hooks/useExchangeRate'; 

const ChartScreen = () => {
  const navigate = useNavigate();
  const [activeTime, setActiveTime] = useState('1H');
  
  // 기본 선택 통화
  const [selectedCurrency, setSelectedCurrency] = useState('KRW');

  const [usdtAmount, setUsdtAmount] = useState(1);

  // 실시간 KRW 환율 가져오기
  const { rate: krwRealTimeRate, loading } = useExchangeRate();

  const exchangeRates = {
    KRW: { rate: krwRealTimeRate > 0 ? krwRealTimeRate : 1450, flag: '🇰🇷' },
    USD: { rate: 1.00, flag: '🇺🇸' },
    JPY: { rate: 152.4, flag: '🇯🇵' },
    CNY: { rate: 7.23, flag: '🇨🇳' },
    GBP: { rate: 0.79, flag: '🇬🇧' },
    EUR: { rate: 0.92, flag: '🇪🇺' },
  };

  // 현재 선택된 통화의 1 USDT 당 가격
  const currentRate = exchangeRates[selectedCurrency].rate;
  const convertedValue = usdtAmount * currentRate;
  const chartData = useMemo(() => {
    const data = [];
    let price = currentRate;
    
    for (let i = 0; i < 30; i++) {
      const percentChange = (Math.random() * 0.004) - 0.002; 
      price = price * (1 + percentChange); 
      
      data.push({
        time: `${i}분`,
        price: price,
      });
    }
    return data;
  }, [currentRate]); 

  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : currentRate;


  const handleAmountChange = (e) => {
      const val = e.target.value;
      // 빈 값일 때는 비워두고, 아니면 실수형으로 변환
      if (val === '') {
          setUsdtAmount(''); 
      } else {
          setUsdtAmount(parseFloat(val));
      }
  };

  return (
    <div className={common.layout}>
      
      {/* 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <div className={styles.headerTitle}>
            <span className={styles.coinName}>USDT</span>
            <span className={styles.currency}>/{selectedCurrency}</span>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        

        <div className={styles.priceSection}>
            {loading && selectedCurrency === 'KRW' && krwRealTimeRate === 0 ? (
                <h1 className={styles.currentPrice} style={{color: '#999', fontSize: '24px'}}>불러오는 중...</h1>
            ) : (
                <h1 className={styles.currentPrice}>
                    {selectedCurrency === 'USD' || selectedCurrency === 'EUR' || selectedCurrency === 'GBP'
                        ? lastPrice.toFixed(4)
                        : Math.floor(lastPrice).toLocaleString() 
                    }
                    <span>{selectedCurrency}</span>
                </h1>
            )}
            
            <div className={styles.priceChange}>
                <span className={styles.plus}>+0.85%</span>
                <span className={styles.amount}>▲ {(lastPrice * 0.0085).toFixed(2)}</span> 
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
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#169279" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#169279" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide={true} />
                  <YAxis hide={true} domain={['dataMin', 'dataMax']} />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value) => [`${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${selectedCurrency}`]}
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

     
        <div className={styles.conversionCard}>
            <div className={styles.conversionHeader}>통화 설정 및 환산</div>
            <div className={styles.conversionBody}>
                
                {/* 왼쪽 박스: 사용자 입력 (Input) */}
                <div className={styles.currencyBox}>
                    <input 
                        type="number" 
                        className={styles.amountInput} 
                        value={usdtAmount}
                        onChange={handleAmountChange}
                        placeholder="0"
                    />
                    <span className={styles.unitText}>USDT</span>
                </div>
                
                {/* 등호(=)는 CSS에서 hidden 처리됨 */}
                <div className={styles.equalIcon}>=</div>
                
                {/* 오른쪽 박스: 결과 표시 (Select) */}
                <div className={styles.selectBox}>
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

                    <div className={styles.valueDisplay}>
                        <span className={styles.val}>
                            {/* 값이 없거나 NaN이면 0 표시 */}
                            {(usdtAmount && !isNaN(convertedValue)) 
                                ? convertedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                : '0'
                            }
                        </span>
                        <span className={styles.unitText}>{selectedCurrency}</span>
                    </div>
                </div>

            </div>
            <p className={styles.infoText}>
                {loading ? '환율 정보를 불러오는 중...' : '입력한 수량에 따른 실시간 환산 금액입니다.'}
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChartScreen;