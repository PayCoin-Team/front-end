import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css'; 
import styles from './Home.module.css';

// API 및 리소스
import api from './utils/api'; 
import { translations } from './utils/translations'; 

// 이미지 및 아이콘 import
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

  // --- 상태 관리 ---
  const [walletInfo, setWalletInfo] = useState(null); 
  const [convertedAmount, setConvertedAmount] = useState(0); 
  const [selectedCurrency, setSelectedCurrency] = useState('KRW'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 지갑 연동 여부
  const isConnected = !!walletInfo?.publicAddress;

  const currencyMetadata = {
    KRW: { country: 'kr' },
    USD: { country: 'us' },
    JPY: { country: 'jp' },
    CNY: { country: 'cn' },
    GBP: { country: 'gb' },
    EUR: { country: 'eu' },
    VND: { country: 'vn' },
  };

  // 1. 초기 로드
  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const response = await api.get('/wallets/users/me');
        if (response.data) {
          setWalletInfo(response.data);
        }
      } catch (error) {
        console.warn("지갑 미연동 상태");
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
        console.error("환율 변환 실패:", error);
        setConvertedAmount(0);
      }
    };

    if (isConnected) {
      fetchConversion();
    }
  }, [walletInfo, selectedCurrency, isConnected]);

  // --- 핸들러 ---
  const handleCopyAddress = () => {
    if (!isConnected) return;
    navigator.clipboard.writeText(walletInfo.publicAddress);
    alert(`${t.copyAlert}\n📋 ${walletInfo.publicAddress}`);
  };

  const handleSelectCurrency = (currency) => {
    setSelectedCurrency(currency);
    setIsDropdownOpen(false);
  };

  const handleMenuClick = (path) => {
    if (isConnected) {
      navigate(path);
    } else {
      alert("서비스 이용을 위해 지갑 연동이 필요합니다.");
    }
  };

  return (
    <div className={common.layout}>
      
      {/* 1. 상단 헤더 */}
      <header className={styles.header}>
        <div className={styles.logoRow}>
          <img src={LogoIcon} alt="로고" className={styles.logoImg} />
          <h1 className={styles.logo}>CrossPay</h1>
        </div>
        <div className={styles.headerButtons}>
            {/* [수정] 지갑 연동 버튼: 항상 녹색(활성화) - 연동하러 가야 하니까 */}
            <button 
              className={`${styles.topBtn} ${styles.greenBtn}`} 
              onClick={() => navigate('/wallet')}
            >
              <img src={topWalletIcon} alt="지갑" className={styles.topBtnIcon} />
              {isConnected ? "지갑 연동됨" : t.walletConnect}
            </button>

            {/* [수정] 차트 버튼: 미연동 시 회색(비활성화) */}
            <button 
              className={`${styles.topBtn} ${isConnected ? styles.greenBtn : styles.grayBtn}`}
              onClick={() => isConnected ? navigate('/chart') : alert("지갑 연동 후 이용 가능합니다.")}
            > 
              <img src={chartIcon} alt="차트" className={styles.topBtnIcon} />
              {t.usdtChart}
           </button>
        </div>
      </header>

      {/* 2. 메인 콘텐츠 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        
        {/* 잔고 카드 */}
        <section className={`${styles.balanceCard} ${!isConnected ? styles.disabled : ''}`}>
          <div className={styles.cardTop}>
            <div className={styles.walletIcon}>
                <img src={cardIconImg} alt="지갑 아이콘" />
            </div>

            <div className={styles.balanceInfo}>
                <h2 className={styles.usdtAmount}>
                  {isConnected ? walletInfo.balance : 0} USDT
                </h2>
                
                <div className={styles.currencyWrapper}>
                    <div 
                        className={styles.convertedAmount} 
                        onClick={() => isConnected && setIsDropdownOpen(!isDropdownOpen)}
                        style={{ cursor: isConnected ? 'pointer' : 'default' }}
                    >
                        {isConnected ? (
                          <>
                            <img 
                                src={`https://flagcdn.com/w40/${currencyMetadata[selectedCurrency].country}.png`}
                                alt="flag"
                                className={styles.flagImg}
                            />
                            ≈ {Number(convertedAmount).toLocaleString()} {selectedCurrency} 
                            <span className={styles.smallArrow}>⌄</span>
                          </>
                        ) : (
                          "연동된 지갑 없음"
                        )}
                    </div>

                    {isDropdownOpen && isConnected && (
                        <ul className={styles.dropdownMenu}>
                            {Object.keys(currencyMetadata).map((code) => (
                                <li key={code} 
                                    className={styles.dropdownItem}
                                    onClick={() => handleSelectCurrency(code)}
                                >
                                    <img 
                                        src={`https://flagcdn.com/w40/${currencyMetadata[code].country}.png`} 
                                        alt={code}
                                        className={styles.flagImg} 
                                    />
                                    <span className={styles.code}>{code}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
          </div>
          
          <div 
             className={styles.walletAddress}
             onClick={handleCopyAddress}
             title={isConnected ? t.copyTooltip : ""}
          >
             <img src={walletAddressIcon} alt="주소 아이콘" className={styles.addressIconImg} />
             {isConnected 
                ? ` ${walletInfo.publicAddress.substring(0, 6)}...${walletInfo.publicAddress.slice(-4)}` 
                : " 연결 필요"}
             {isConnected && <span className={styles.copyHint}> (복사)</span>}
          </div>

          <div className={styles.cardBottom} onClick={() => handleMenuClick('/withdraw')}>
            <span>{t.balanceWithdraw}</span>
            <span className={styles.arrowIcon}>→</span>
          </div>
        </section>

        {/* 메뉴 그리드 */}
        <div className={styles.menuGrid}>
            <div className={styles.column}>
                <div 
                  className={`${styles.menuCard} ${styles.largeCard} ${!isConnected ? styles.disabled : ''}`}
                  onClick={() => handleMenuClick('/pay')}
                >
                    <div className={styles.cardIcon}>
                      <img src={menuPayIcon} alt="결제하기" />
                    </div>
                    <div className={styles.cardTitleArea}>
                        <h3>{t.payBtn}</h3>
                        <span className={styles.arrowIcon}>→</span>
                    </div>
                </div>
                <div 
                  className={`${styles.menuCard} ${!isConnected ? styles.disabled : ''}`} 
                  onClick={() => handleMenuClick('/qr')}
                >
                    <div className={styles.cardIcon}>
                      <img src={menuQrIcon} alt="QR생성" />
                    </div>
                    <h3>{t.createQr}</h3>
                </div>
            </div>

            <div className={styles.column}>
                  <div 
                    className={`${styles.menuCard} ${!isConnected ? styles.disabled : ''}`} 
                    onClick={() => handleMenuClick('/charge')}
                  >
                    <div className={styles.cardIcon}>
                      <img src={menuChargeIcon} alt="충전" />
                    </div>
                    <h3>{t.charge}</h3>
                </div>
                <div 
                  className={`${styles.menuCard} ${!isConnected ? styles.disabled : ''}`} 
                  onClick={() => handleMenuClick('/history')}
                >
                    <div className={styles.cardIcon}>
                      <img src={menuHistoryIcon} alt="거래기록" />
                    </div>
                    <h3>{t.history}</h3>
                </div>
            </div>
        </div>

        {/* 미연동 안내 메시지 */}
        {!isConnected && (
          <div className={styles.connectAlert}>
            ❗ 지갑 연동을 해주십시오 <br/>
            <span>서비스 이용을 위해 지갑 연동이 필요합니다</span>
          </div>
        )}

      </div>

      {/* 하단 네비게이션 */}
      <nav className={common.bottomNav}>
        <div className={`${common.navItem} ${common.active}`}>
            <img src={navHomeIcon} className={common.navImg} alt="홈" />
            <span className={common.navText}>{t.home}</span>
        </div>
        <div className={common.navItem} onClick={() => handleMenuClick('/pay')}>
            <img src={navPayIcon} className={common.navImg} alt="결제" />
            <span className={common.navText}>{t.payNav}</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={common.navImg} alt="마이페이지" />
            <span className={common.navText}>{t.myPage}</span>
        </div>
      </nav>
      
    </div>
  );
};

export default Home;