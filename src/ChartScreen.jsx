import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import common from './Common.module.css';
import styles from './ChartScreen.module.css';

const ChartScreen = () => {
  const navigate = useNavigate();

  // 🔑 API 키
  const CRYPTOCOMPARE_API_KEY = 'ef6a8399b16ac4f8b9459453a4608472c259ad794c28a999b2700ef995e19dc7';
  const TWELVEDATA_API_KEY = '0afb94f7ca964f9dbbd39ddeaaf69fb0'; // 사진 속 키 적용
  
  const timeOptions = { '1D': '1D', '1W': '1W', '1M': '1M', '1Y': '1Y' };
  const [activeTime, setActiveTime] = useState('1D'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('KRW');
  const [usdtAmount, setUsdtAmount] = useState(1);

  const [chartData, setChartData] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const [currentRate, setCurrentRate] = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(0);

  // 🧠 [핵심] 데이터 캐싱 저장소 (API 호출 절약용)
  // 구조: { 'CNY-1D': { rate: ..., chart: [...], timestamp: 12345678 } }
  const dataCache = useRef({});

  const currencyInfo = {
    KRW: { country: 'kr', name: 'South Korea', code: 'KRW', source: 'CRYPTO' },
    USD: { country: 'us', name: 'USA', code: 'USD', source: 'CRYPTO' },
    JPY: { country: 'jp', name: 'Japan', code: 'JPY', source: 'CRYPTO' },
    CNY: { country: 'cn', name: 'China', code: 'CNY', source: 'FOREX', symbol: 'USD/CNY' },
    VND: { country: 'vn', name: 'Vietnam', code: 'VND', source: 'FOREX', symbol: 'USD/VND' },
  };

  const currentInfo = currencyInfo[selectedCurrency] || currencyInfo['KRW'];

  // =========================================================
  // 🔄 [초기화] 통화 변경 시
  // =========================================================
  useEffect(() => {
      // 탭을 바꿀 때 캐시가 있으면 로딩 없이 즉시 보여줌
      const cacheKey = `${selectedCurrency}-${activeTime}`;
      const cached = dataCache.current[cacheKey];
      const now = Date.now();

      // 캐시가 유효하면(1분 이내) 초기화하지 않고 유지
      if (cached && (now - cached.timestamp < 60000)) {
          return; 
      }

      setChartData([]);
      setCurrentRate(0);
      setPriceChange24h(0);
      setLoading(true);
  }, [selectedCurrency]);


  // =========================================================
  // 📡 [API] 데이터 통합 조회 (캐싱 로직 포함)
  // =========================================================
  useEffect(() => {
      const fetchData = async () => {
          const cacheKey = `${selectedCurrency}-${activeTime}`;
          const now = Date.now();

          // 1. 캐시 확인 (Twelve Data의 호출 제한을 피하기 위해 필수)
          if (dataCache.current[cacheKey]) {
              const cached = dataCache.current[cacheKey];
              // 1분(60,000ms) 지나지 않았으면 저장된 데이터 사용
              if (now - cached.timestamp < 60000) {
                  setCurrentRate(cached.rate);
                  setPriceChange24h(cached.change);
                  setChartData(cached.chart);
                  setLoading(false);
                  console.log(`[Cache Used] ${cacheKey}`); // 디버깅용
                  return; 
              }
          }

          setLoading(true);
          try {
              let newRate = 0;
              let newChange = 0;
              let newChartData = [];

              // 🅰️ 그룹 A: CryptoCompare (KRW, USD, JPY)
              if (currentInfo.source === 'CRYPTO') {
                  const targetCode = currentInfo.code;
                  
                  // 차트 설정
                  let endpoint = 'histohour';
                  let limit = 24;
                  if (activeTime === '1D') { endpoint = 'histominute'; limit = 144; }
                  else if (activeTime === '1W') { endpoint = 'histohour'; limit = 168; }
                  else if (activeTime === '1M') { endpoint = 'histoday'; limit = 30; }
                  else if (activeTime === '1Y') { endpoint = 'histoday'; limit = 365; }

                  const chartUrl = `https://min-api.cryptocompare.com/data/v2/${endpoint}?fsym=USDT&tsym=${targetCode}&limit=${limit}&api_key=${CRYPTOCOMPARE_API_KEY}`;
                  const priceUrl = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=USDT&tsyms=${targetCode}&api_key=${CRYPTOCOMPARE_API_KEY}`;

                  const [chartRes, priceRes] = await Promise.all([fetch(chartUrl), fetch(priceUrl)]);
                  const chartJson = await chartRes.json();
                  const priceJson = await priceRes.json();

                  if (priceJson.RAW?.USDT?.[targetCode]) {
                      const data = priceJson.RAW.USDT[targetCode];
                      newRate = data.PRICE;
                      newChange = data.CHANGEPCT24HOUR;
                  }

                  if (chartJson.Data?.Data) {
                      newChartData = chartJson.Data.Data.map(item => {
                          const dateObj = new Date(item.time * 1000);
                          let timeLabel = '';
                          if (activeTime === '1D') timeLabel = `${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}`;
                          else timeLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
                          return { time: timeLabel, price: item.close };
                      });
                  }
              } 
              // 🅱️ 그룹 B: Twelve Data (CNY, VND)
              else {
                  const symbol = currentInfo.symbol;
                  let interval = '5min';
                  let outputsize = 288;

                  if (activeTime === '1W') { interval = '1h'; outputsize = 168; }
                  if (activeTime === '1M') { interval = '2h'; outputsize = 360; }
                  if (activeTime === '1Y') { interval = '1day'; outputsize = 365; }

                  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVEDATA_API_KEY}`;
                  
                  const response = await fetch(url);
                  const json = await response.json();

                  // 에러 체크 (429 Rate Limit 등)
                  if (json.status === 'error') {
                      console.warn(`API Error (${symbol}):`, json.message);
                      // 에러가 났는데 캐시에 옛날 데이터라도 있으면 그거라도 보여줌 (UX 방어)
                      if (dataCache.current[cacheKey]) {
                          const stale = dataCache.current[cacheKey];
                          setCurrentRate(stale.rate);
                          setPriceChange24h(stale.change);
                          setChartData(stale.chart);
                          setLoading(false);
                          return;
                      }
                      throw new Error(json.message);
                  }

                  if (json.values && json.values.length > 0) {
                      const rawData = json.values.reverse();
                      const latestPrice = parseFloat(rawData[rawData.length - 1].close);
                      const startPrice = parseFloat(rawData[0].open);
                      
                      newRate = latestPrice;
                      newChange = ((latestPrice - startPrice) / startPrice) * 100;

                      newChartData = rawData.map(item => {
                          const dateObj = new Date(item.datetime.replace(/-/g, '/'));
                          let timeLabel = '';
                          if (activeTime === '1D') timeLabel = `${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}`;
                          else if (activeTime === '1W' || activeTime === '1M') timeLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
                          else timeLabel = `${String(dateObj.getFullYear()).slice(-2)}/${dateObj.getMonth() + 1}`;
                          return { time: timeLabel, price: parseFloat(item.close) };
                      });
                  }
              }

              // 데이터 상태 업데이트
              setCurrentRate(newRate);
              setPriceChange24h(newChange);
              setChartData(newChartData);

              // 2. 캐시에 저장 (중요: 성공했을 때만 저장)
              if (newRate > 0) {
                  dataCache.current[cacheKey] = {
                      timestamp: Date.now(),
                      rate: newRate,
                      change: newChange,
                      chart: newChartData
                  };
              }

          } catch (error) {
              console.error("데이터 로드 실패:", error);
          } finally {
              setLoading(false);
          }
      };

      fetchData();
      
      // 자동 갱신 주기를 1분으로 늘려서 API 보호
      const interval = setInterval(fetchData, 60000); 
      return () => clearInterval(interval);

  }, [activeTime, selectedCurrency]); 


  // =========================================================
  // 🧮 UI 렌더링
  // =========================================================
  const convertedValue = usdtAmount * currentRate;
  const isPositive = priceChange24h >= 0;

  const handleAmountChange = (e) => {
      const val = e.target.value;
      if (val === '') setUsdtAmount(''); 
      else setUsdtAmount(parseFloat(val));
  };

  const handleSelectCurrency = (currencyCode) => {
      setSelectedCurrency(currencyCode);
      setIsDropdownOpen(false);
  };

  return (
    <div className={common.layout}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <div className={styles.headerTitle}>
            <span className={styles.coinName}>USDT</span>
            <span className={styles.currencyDivider}>/</span>
            <div className={styles.currencyWrapper}>
                <div className={styles.dropdownTrigger} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <img src={`https://flagcdn.com/w40/${currentInfo.country}.png`} alt={selectedCurrency} className={styles.selectedFlag}/>
                    <span className={styles.selectedCode}>{selectedCurrency}</span>
                    <span className={styles.arrowIcon}>▼</span>
                </div>
                {isDropdownOpen && (
                    <ul className={styles.dropdownMenu}>
                        {Object.keys(currencyInfo).map((code) => (
                            <li key={code} className={styles.dropdownItem} onClick={() => handleSelectCurrency(code)}>
                                <img src={`https://flagcdn.com/w40/${currencyInfo[code].country}.png`} alt={code} className={styles.itemFlag}/>
                                <span className={styles.itemCode}>{code}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
      </header>

      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        <div className={styles.priceSection}>
            <h1 className={styles.currentPrice}>
                {loading && currentRate === 0 
                    ? <span style={{color:'#ccc', fontSize:'1.5rem'}}>Loading...</span>
                    : (selectedCurrency === 'USD' 
                        ? currentRate.toFixed(4)
                        : Math.floor(currentRate).toLocaleString() 
                      )
                }
                <span>{selectedCurrency}</span>
            </h1>
            <div className={styles.priceChange}>
                <span className={isPositive ? styles.plus : styles.minus}>
                    {isPositive ? '+' : ''}{priceChange24h ? Math.abs(priceChange24h).toFixed(2) : '0.00'}%
                </span>
                <span style={{fontSize:'0.8rem', color:'#888', marginLeft:'5px'}}>
                    (기간 변동)
                </span>
            </div>
        </div>

        <div className={styles.chartContainer}>
            <div className={styles.timeTab}>
                {Object.keys(timeOptions).map((timeKey) => (
                    <span key={timeKey} className={activeTime === timeKey ? styles.active : ''} onClick={() => setActiveTime(timeKey)}>
                        {timeKey}
                    </span>
                ))}
            </div>
            <div className={styles.chartWrapper}>
              {loading && chartData.length === 0 ? (
                  <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', fontSize:'0.9rem'}}>
                      데이터 로딩 중...
                  </div>
              ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isPositive ? "#d32f2f" : "#1976d2"} stopOpacity={0.1}/>
                          <stop offset="95%" stopColor={isPositive ? "#d32f2f" : "#1976d2"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide={true} />
                      <YAxis hide={true} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                        labelStyle={{ color: '#888', marginBottom: '5px' }}
                        formatter={(value) => [`${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${selectedCurrency}`, 'Price']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={isPositive ? "#d32f2f" : "#1976d2"}
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPrice)"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
              ) : (
                  <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', fontSize:'0.8rem'}}>
                      데이터를 불러올 수 없습니다.<br/>(잠시 후 다시 시도해주세요)
                  </div>
              )}
            </div>
        </div>

        <div className={styles.conversionCard}>
            <div className={styles.conversionBody}>
                <div className={styles.currencyBox}>
                    <input type="number" className={styles.amountInput} value={usdtAmount} onChange={handleAmountChange} placeholder="0"/>
                    <span className={styles.unitText}>USDT</span>
                </div>
                <div className={styles.selectBox}>
                    <div className={styles.valueDisplay}>
                        <span className={styles.amountInput} style={{textAlign: 'left'}}>
                             {(usdtAmount && currentRate > 0) ? convertedValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}
                        </span>
                        <span className={styles.unitText}>{selectedCurrency}</span>
                    </div>
                </div>
            </div>
            <p className={styles.infoText}>
                {currentInfo.source === 'CRYPTO' ? '실시간 코인 시세 (CryptoCompare)' : '실시간 외환 시세 (Twelve Data)'}
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChartScreen;