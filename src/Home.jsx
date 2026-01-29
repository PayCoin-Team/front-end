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
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'ko');

  // 실시간 언어 변경 감지
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(localStorage.getItem('appLanguage') || 'ko');
    };
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const t = translations[language] || translations['ko']; 

  const [walletInfo, setWalletInfo] = useState(null); 
  const [convertedAmount, setConvertedAmount] = useState(0); 
  const [selectedCurrency, setSelectedCurrency] = useState('KRW'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 관리자 여부 및 외부 지갑 연동 여부 확인
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

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const response = await api.get('/wallets/users/me', {
            params: { _t: new Date().getTime() } 
        });

        if (response.data) {
          setWalletInfo(response.data);
        }
      } catch (error) {
        console.error("지갑 조회 실패:", error);
        setWalletInfo(null);
      }
    };
    fetchWalletInfo();
  }, []);

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

  // [수정됨] 내부 지갑 주소(publicAddress) 복사 기능
  const handleCopyAddress = () => {
    // publicAddress가 없으면 리턴
    if (!walletInfo?.publicAddress) return; 
    
    const addr = walletInfo.publicAddress; 
    navigator.clipboard.writeText(addr);
    alert(`${t.copyAlert}\n📋 ${addr}`);
  };

  const handleSelectCurrency = (c) => { setSelectedCurrency(c); setIsDropdownOpen(false); };
  
  const handleMenuClick = (path) => {
    if (isConnected) navigate(path);
    else alert(t.alertNeedConnect);
  };

  return (
    <div className={common.layout}>
      <header className={styles.header}>
        <div className={styles.logoRow}>
          <img src={LogoIcon} alt="Logo" className={styles.logoImg} />
          <h1 className={styles.logo}>TsPay</h1>
        </div>
        
        <div className={styles.headerButtons}>
          {/* 지갑 연동 버튼 (외부 지갑 기준 상태 표시) */}
          <button className={`${styles.topBtn} ${styles.greenBtn}`} onClick={() => navigate('/wallet')}>
            <img src={topWalletIcon} alt="Wallet" className={styles.topBtnIcon} />
            {isConnected ? t.walletConnected : t.walletConnect}
          </button>
          
          {/* 차트 및 관리자 버튼 스택 */}
          <div className={styles.buttonStack}>
            <button 
              className={`${styles.topBtn} ${isConnected ? styles.greenBtn : styles.grayBtn}`} 
              onClick={() => isConnected ? navigate('/chart') : alert(t.alertNeedConnectHome)}
            > 
              <img src={chartIcon} alt="Chart" className={styles.topBtnIcon} />
              {t.usdtChart}
            </button>

            {/* 관리자일 때만 노출 */}
            {isAdmin && (
              <button className={`${styles.topBtn} ${styles.greenBtn}`} onClick={() => navigate('/admin')}>
                {t.adminDashboard}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        <section className={`${styles.balanceCard} ${!isConnected ? styles.disabled : ''}`}>
          <div className={styles.cardTop}>
            <div className={styles.walletIcon}><img src={cardIconImg} alt="Wallet" /></div>
            <div className={styles.balanceInfo}>
                <h2 className={styles.usdtAmount}>{walletInfo?.balance || 0} USDT</h2>
                <div className={styles.currencyWrapper}>
                    <div className={styles.convertedAmount} onClick={() => isConnected && setIsDropdownOpen(!isDropdownOpen)} style={{ cursor: isConnected ? 'pointer' : 'default' }}>
                        {isConnected ? (
                          <>
                            <img src={`https://flagcdn.com/w40/${currencyMetadata[selectedCurrency].country}.png`} className={styles.flagImg} alt="flag"/>
                            ≈ {Number(convertedAmount).toLocaleString()} {selectedCurrency} <span className={styles.smallArrow}>⌄</span>
                          </>
                        ) : t.noWalletConnected}
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
          
          {/* [수정됨] 내부 지갑 주소(publicAddress) 표시 및 복사 영역 */}
          <div 
            className={styles.walletAddress} 
            onClick={handleCopyAddress} 
            title={walletInfo?.publicAddress ? t.copyTooltip : ""}
            style={{ cursor: walletInfo?.publicAddress ? 'pointer' : 'default' }}
          >
             <img src={walletAddressIcon} className={styles.addressIconImg} alt="Address" />
             {/* publicAddress가 있으면 보여주고 없으면 연결 필요 메시지 */}
             {walletInfo?.publicAddress 
                ? ` ${walletInfo.publicAddress}` 
                : ` ${t.needConnect}`}
             {walletInfo?.publicAddress && <span className={styles.copyHint}> {t.copyHint}</span>}
          </div>

          <div className={styles.cardBottom} onClick={() => handleMenuClick('/withdraw')}>
            <span>{t.balanceWithdraw}</span><span className={styles.arrowIcon}>→</span>
          </div>
        </section>

        <div className={styles.menuGrid}>
            <div className={styles.column}>
                <div className={`${styles.menuCard} ${styles.largeCard} ${!isConnected ? styles.disabled : ''}`} onClick={() => handleMenuClick('/pay')}>
                    <div className={styles.cardIcon}><img src={menuPayIcon} alt="Pay" /></div>
                    <div className={styles.cardTitleArea}><h3>{t.payBtn}</h3><span className={styles.arrowIcon}>→</span></div>
                </div>
                <div className={`${styles.menuCard} ${!isConnected ? styles.disabled : ''}`} onClick={() => handleMenuClick('/qr')}>
                    <div className={styles.cardIcon}><img src={menuQrIcon} alt="QR" /></div>
                    <h3>{t.createQr}</h3>
                </div>
            </div>
            <div className={styles.column}>
                  <div className={`${styles.menuCard} ${!isConnected ? styles.disabled : ''}`} onClick={() => handleMenuClick('/charge')}>
                    <div className={styles.cardIcon}><img src={menuChargeIcon} alt="Charge" /></div>
                    <h3>{t.charge}</h3>
                </div>
                <div className={`${styles.menuCard} ${!isConnected ? styles.disabled : ''}`} onClick={() => handleMenuClick('/history')}>
                    <div className={styles.cardIcon}><img src={menuHistoryIcon} alt="History" /></div>
                    <h3>{t.history}</h3>
                </div>
            </div>
        </div>

        {!isConnected && (
          <div className={styles.connectAlert}>
            {t.connectAlertTitle} <br/><span>{t.connectAlertSub}</span>
          </div>
        )}
      </div>

      <nav className={common.bottomNav}>
        <div className={`${common.navItem} ${common.active}`}>
            <img src={navHomeIcon} className={common.navImg} alt="Home" /><span className={common.navText}>{t.home}</span>
        </div>
        <div className={common.navItem} onClick={() => handleMenuClick('/pay')}>
            <img src={navPayIcon} className={common.navImg} alt="Pay" /><span className={common.navText}>{t.payNav}</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={common.navImg} alt="MyPage" /><span className={common.navText}>{t.myPage}</span>
        </div>
      </nav>
    </div>
  );
};

export default Home;