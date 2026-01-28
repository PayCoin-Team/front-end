import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css'; 
import styles from './Home.module.css';

// API 및 리소스
import api from './utils/api'; 
import { translations } from './utils/translations'; 

// 이미지 및 아이콘
import cardIconImg from './assets/Shopping_Bag_01.svg'; 
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import menuPayIcon from './assets/menu_pay.svg';
import menuQrIcon from './assets/menu_qr.svg';
import menuChargeIcon from './assets/menu_charge.svg';
import menuHistoryIcon from './assets/menu_history.svg';
import walletAddressIcon from './assets/wallet.svg';
import topWalletIcon from './assets/top_wallet.svg';
import chartIcon from './assets/Chart.svg';
import LogoIcon from './component/UsdtLogo.svg';

const Home = () => {
  const navigate = useNavigate();
  const language = localStorage.getItem('appLanguage') || 'ko';
  const t = translations[language] || translations['ko']; 

  const [walletInfo, setWalletInfo] = useState(null); 
  const [convertedAmount, setConvertedAmount] = useState(0); 
  const [selectedCurrency, setSelectedCurrency] = useState('KRW'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ⭐ [최종 완성 로직]
  // 백엔드가 externalAddress 필드를 주므로, 이것만 믿으면 됩니다!
  // 값이 있으면(null이 아니면) 연동된 것입니다.
  const isAdmin = walletInfo?.role === 'ROLE_ADMIN';
  const isConnected = !!walletInfo?.externalAddress;
  

  const currencyMetadata = {
    KRW: { country: 'kr' },
    USD: { country: 'us' },
    JPY: { country: 'jp' },
    CNY: { country: 'cn' },
    GBP: { country: 'gb' },
    EUR: { country: 'eu' },
    VND: { country: 'vn' },
  };

  // 1. 지갑 정보 조회
  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        console.log("🚀 [Home] 지갑 정보 조회 중...");
        
        // 캐싱 방지용 타임스탬프
        const response = await api.get('/wallets/users/me', {
            params: { _t: new Date().getTime() } 
        });

        console.log("📡 서버 응답:", response.data);

        if (response.data) {
          setWalletInfo(response.data);
          
          if (response.data.externalAddress) {
             console.log("✅ 연동된 외부 지갑:", response.data.externalAddress);
          } else {
             console.log("❌ 연동된 외부 지갑 없음 (internal만 존재)");
          }
        }
      } catch (error) {
        console.error("지갑 조회 실패:", error);
        setWalletInfo(null);
      }
    };
    fetchWalletInfo();
  }, []);

  // 2. 환율 계산
  useEffect(() => {
    const fetchConversion = async () => {
      if (!walletInfo?.balance) {
        setConvertedAmount(0);
        return;
      }
      try {
        const response = await api.get('/exchange/convert', {
          params: { amount: walletInfo.balance, target: selectedCurrency }
        });
        setConvertedAmount(response.data); 
      } catch (error) {
        setConvertedAmount(0);
      }
    };
    
    if (walletInfo?.balance) fetchConversion();
  }, [walletInfo, selectedCurrency]);

  const handleCopyAddress = () => {
    if (!isConnected) return;
    // ⭐ 복사할 때도 진짜 지갑 주소(externalAddress)를 복사
    const addr = walletInfo.externalAddress;
    navigator.clipboard.writeText(addr);
    alert(`${t.copyAlert}\n📋 ${addr}`);
  };

  const handleSelectCurrency = (c) => { setSelectedCurrency(c); setIsDropdownOpen(false); };
  
  const handleMenuClick = (path) => {
    if (isConnected) navigate(path);
    else alert("서비스 이용을 위해 지갑 연동이 필요합니다.");
  };

  return (
    <div className={common.layout}>
      {/* 헤더 */}
      <header className={styles.header}>
  <div className={styles.logoRow}>
    <img src={LogoIcon} alt="로고" className={styles.logoImg} />
    <h1 className={styles.logo}>CrossPay</h1>
  </div>
  
  <div className={styles.headerButtons}>
    {/* 1. 왼쪽: 지갑 연동 버튼 */}
    <button className={`${styles.topBtn} ${styles.greenBtn}`} onClick={() => navigate('/wallet')}>
      <img src={topWalletIcon} alt="지갑" className={styles.topBtnIcon} />
      {isConnected ? "지갑 연동됨" : t.walletConnect}
    </button>
    
    {/* 2. 오른쪽: 차트 버튼과 관리자 버튼을 세로로 정렬 */}
    <div className={styles.buttonStack}>
      <button 
        className={`${styles.topBtn} ${isConnected ? styles.greenBtn : styles.grayBtn}`} 
        onClick={() => isConnected ? navigate('/chart') : alert("지갑 연동 후 이용 가능합니다.")}
      > 
        <img src={chartIcon} alt="차트" className={styles.topBtnIcon} />
        {t.usdtChart}
      </button>

      {/* 관리자일 때만 차트 버튼 바로 아래에 렌더링 */}
      {isAdmin && (
        <button className={`${styles.topBtn} ${styles.greenBtn}`} onClick={() => navigate('/admin')}>
          관리자 대시보드
        </button>
      )}
    </div>
  </div>
</header>

      {/* 메인 콘텐츠 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        <section className={`${styles.balanceCard} ${!isConnected ? styles.disabled : ''}`}>
          <div className={styles.cardTop}>
            <div className={styles.walletIcon}><img src={cardIconImg} alt="지갑" /></div>
            <div className={styles.balanceInfo}>
                <h2 className={styles.usdtAmount}>{walletInfo?.balance || 0} USDT</h2>
                <div className={styles.currencyWrapper}>
                    <div className={styles.convertedAmount} onClick={() => isConnected && setIsDropdownOpen(!isDropdownOpen)} style={{ cursor: isConnected ? 'pointer' : 'default' }}>
                        {isConnected ? (
                          <>
                            <img src={`https://flagcdn.com/w40/${currencyMetadata[selectedCurrency].country}.png`} className={styles.flagImg} alt="flag"/>
                            ≈ {Number(convertedAmount).toLocaleString()} {selectedCurrency} <span className={styles.smallArrow}>⌄</span>
                          </>
                        ) : "연동된 지갑 없음"}
                    </div>
                    {isDropdownOpen && isConnected && (
                        <ul className={styles.dropdownMenu}>
                            {Object.keys(currencyMetadata).map((code) => (
                                <li key={code} className={styles.dropdownItem} onClick={() => handleSelectCurrency(code)}>
                                    <img src={`https://flagcdn.com/w40/${currencyMetadata[code].country}.png`} className={styles.flagImg} alt={code}/>
                                    <span className={styles.code}>{code}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
          </div>
          
          <div className={styles.walletAddress} onClick={handleCopyAddress} title={isConnected ? t.copyTooltip : ""}>
             <img src={walletAddressIcon} className={styles.addressIconImg} alt="주소" />
             {/* ⭐ 화면 표시: 연동되었으면 외부 지갑 주소, 아니면 연결 필요 */}
             {isConnected 
                ? ` ${walletInfo.externalAddress.substring(0, 6)}...${walletInfo.externalAddress.slice(-4)}` 
                : " 연결 필요"}
             {isConnected && <span className={styles.copyHint}> (복사)</span>}
          </div>

          <div className={styles.cardBottom} onClick={() => handleMenuClick('/withdraw')}>
            <span>{t.balanceWithdraw}</span><span className={styles.arrowIcon}>→</span>
          </div>
        </section>

        {/* 메뉴 그리드 */}
        <div className={styles.menuGrid}>
            <div className={styles.column}>
                <div className={`${styles.menuCard} ${styles.largeCard} ${!isConnected ? styles.disabled : ''}`} onClick={() => handleMenuClick('/pay')}>
                    <div className={styles.cardIcon}><img src={menuPayIcon} alt="결제" /></div>
                    <div className={styles.cardTitleArea}><h3>{t.payBtn}</h3><span className={styles.arrowIcon}>→</span></div>
                </div>
                <div className={`${styles.menuCard} ${!isConnected ? styles.disabled : ''}`} onClick={() => handleMenuClick('/qr')}>
                    <div className={styles.cardIcon}><img src={menuQrIcon} alt="QR" /></div>
                    <h3>{t.createQr}</h3>
                </div>
            </div>
            <div className={styles.column}>
                  <div className={`${styles.menuCard} ${!isConnected ? styles.disabled : ''}`} onClick={() => handleMenuClick('/charge')}>
                    <div className={styles.cardIcon}><img src={menuChargeIcon} alt="충전" /></div>
                    <h3>{t.charge}</h3>
                </div>
                <div className={`${styles.menuCard} ${!isConnected ? styles.disabled : ''}`} onClick={() => handleMenuClick('/history')}>
                    <div className={styles.cardIcon}><img src={menuHistoryIcon} alt="기록" /></div>
                    <h3>{t.history}</h3>
                </div>
            </div>
        </div>

        {/* 미연동 알림 */}
        {!isConnected && (
          <div className={styles.connectAlert}>
            ❗ 지갑 연동을 해주십시오 <br/><span>서비스 이용을 위해 지갑 연동이 필요합니다</span>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <nav className={common.bottomNav}>
        <div className={`${common.navItem} ${common.active}`}>
            <img src={navHomeIcon} className={common.navImg} alt="홈" /><span className={common.navText}>{t.home}</span>
        </div>
        <div className={common.navItem} onClick={() => handleMenuClick('/pay')}>
            <img src={navPayIcon} className={common.navImg} alt="결제" /><span className={common.navText}>{t.payNav}</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={common.navImg} alt="마이페이지" /><span className={common.navText}>{t.myPage}</span>
        </div>
      </nav>
    </div>
  );
};

export default Home;