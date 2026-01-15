import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css'; 
import styles from './Home.module.css';

// 👇 1. 카드 아이콘 SVG 가져오기 
import cardIconImg from './assets/Shopping_Bag_01.svg'; 
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';

// 👇 2. 메인 메뉴 아이콘 4개 불러오기 (새로 추가됨)
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

  // 1. 드롭다운 열림/닫힘 상태 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 2. 현재 선택된 통화 (기본값: KRW)
  const [selectedCurrency, setSelectedCurrency] = useState('KRW');

  // 보유 USDT (예시 데이터)
  const usdtAmount = 200; 

  // ⭐ [수정 1] 지갑 주소 고유번호 변수 설정
  // 나중에 서버에서 받아온 데이터로 바꾸기 쉽습니다.
  const myWalletAddress = " A1B2-C3D4"; 

  // ⭐ [수정 2] 지갑 주소 복사 기능 함수
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(myWalletAddress);
    alert(`지갑 주소가 복사되었습니다!\n📋 ${myWalletAddress}`);
  };

  // 3. 환율 정보
  const currencyRates = {
    KRW: { rate: 1458.57, country: 'kr' },
    USD: { rate: 1.00,    country: 'us' },
    JPY: { rate: 150.23,  country: 'jp' },
    CNY: { rate: 7.25,    country: 'cn' },
    GBP: { rate: 0.79,    country: 'gb' },
    EUR: { rate: 0.95,    country: 'eu' },
    VND: { rate: 25300,   country: 'vn' },
  };

  // 현재 선택된 통화로 금액 계산
  const convertedAmount = (usdtAmount * currencyRates[selectedCurrency].rate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // 드롭다운 토글 함수
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 통화 선택 함수
  const handleSelectCurrency = (currency) => {
    setSelectedCurrency(currency);
    setIsDropdownOpen(false); 
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
            <button className={`${styles.topBtn} ${styles.greenBtn}`}>
              <img src={topWalletIcon} alt="지갑" className={styles.topBtnIcon} />
                  지갑 연동
            </button>
            <button className={`${styles.topBtn} ${styles.greenBtn}`}
                onClick={() => navigate('/chart')}
            > <img src={chartIcon} alt="차트" className={styles.topBtnIcon} />
              USDT 차트
           </button>
        </div>
      </header>

      {/* 2. 메인 콘텐츠 */}
      <div className={`${styles.mainContent} ${common.fadeIn}`}>
        
        {/* 잔고 카드 */}
        <section className={styles.balanceCard}>
          <div className={styles.cardTop}>
            
            {/* 👇 2. 기존 이모지(👜)를 삭제하고 img 태그로 교체 */}
            <div className={styles.walletIcon}>
                <img src={cardIconImg} alt="지갑 아이콘" />
            </div>

            <div className={styles.balanceInfo}>
                <h2 className={styles.usdtAmount}>{usdtAmount} USDT</h2>
                
                {/* 환산 금액 및 드롭다운 영역 */}
                <div className={styles.currencyWrapper}>
                    <p 
                        className={styles.convertedAmount} 
                        onClick={toggleDropdown}
                    >
                        <img 
                            src={`https://flagcdn.com/w40/${currencyRates[selectedCurrency].country}.png`}
                            alt="flag"
                            className={styles.flagImg}
                        />
                        ≈ {convertedAmount} {selectedCurrency} <span className={styles.smallArrow}>⌄</span>
                    </p>

                    {/* 드롭다운 메뉴 */}
                    {isDropdownOpen && (
                        <ul className={styles.dropdownMenu}>
                            {Object.keys(currencyRates).map((code) => (
                                <li 
                                    key={code} 
                                    className={styles.dropdownItem}
                                    onClick={() => handleSelectCurrency(code)}
                                >
                                    <img 
                                        src={`https://flagcdn.com/w40/${currencyRates[code].country}.png`} 
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
          
          <div className={styles.walletAddress}
             onClick={handleCopyAddress}
            title="클릭해서 주소 복사"
          >
             <img src={walletAddressIcon} alt="주소 아이콘" className={styles.addressIconImg} />
             {myWalletAddress}
             <span className={styles.copyHint}></span>
          </div>

          <div className={styles.cardBottom}>
            <span>잔고 및 출금</span>
            <span className={styles.arrowIcon}>→</span>
          </div>
        </section>

        {/* 메뉴 그리드 */}
        <div className={styles.menuGrid}>
            <div className={styles.column}>
                <div className={`${styles.menuCard} ${styles.largeCard}`}
                     onClick={() => navigate('/pay')}>
                    <div className={styles.cardIcon}>
                      <img src={menuPayIcon} alt="결제하기" />
                    </div>
                    <div className={styles.cardTitleArea}>
                        <h3>결제하기</h3>
                        <span className={styles.arrowIcon}>→</span>
                    </div>
                </div>
                <div className={styles.menuCard} onClick={() => navigate('/qr')}>
                    <div className={styles.cardIcon} >
                      <img src={menuQrIcon} alt="QR생성" />
                      </div>
                    <h3>QR 생성</h3>
                </div>
            </div>

            <div className={styles.column}>
                  <div className={styles.menuCard} onClick={() => navigate('/charge')}>
                    <div className={styles.cardIcon}>
                      <img src={menuChargeIcon} alt="충전" />
                    </div>
                    <h3>충전</h3>
                </div>
                <div className={styles.menuCard} onClick={() => navigate('/history')}>
                    <div className={styles.cardIcon}>
                      <img src={menuHistoryIcon} alt="거래기록" />
                    </div>
                    <h3>거래 기록</h3>
                </div>
            </div>
        </div>
      </div>

      {/* 3. 하단 네비게이션 바 */}
      <nav className={common.bottomNav}>
        <div className={`${common.navItem} ${common.active}`}>
            <img src={navHomeIcon} className={common.navImg} alt="홈" />
            <span className={common.navText}>홈</span>
        </div>
        <div className={common.navItem} 
                onClick={() => navigate('/pay')}
        >
            <img src={navPayIcon} className={common.navImg} alt="결제" />
            <span className={common.navText}>결제</span>
        </div>
        <div className={common.navItem}
             onClick={() => navigate('/mypage')}
        >
            <img src={navUserIcon} className={common.navImg} alt="마이페이지" />
            <span className={common.navText}>마이페이지</span>
        </div>
      </nav>
    </div>
  );
};

export default Home;