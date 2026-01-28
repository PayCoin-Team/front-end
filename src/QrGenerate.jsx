import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; 

import common from './Common.module.css';
import styles from './QrGenerate.module.css';
import api from './utils/api'; 
import { translations } from './utils/translations';

// 아이콘 및 이미지
import UsdtLogo from './component/UsdtLogo.svg';
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';

const QrGenerate = () => {
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

    const t = translations[language];
    
    // 상태 관리
    const [walletAddress, setWalletAddress] = useState('');
    const [loading, setLoading] = useState(true);

    // 1. 초기 로드: 지갑 정보 조회
    useEffect(() => {
        const fetchWalletAddress = async () => {
            try {
                const response = await api.get('/wallets/users/me', {
                    params: { _t: new Date().getTime() }
                });

                if (response.data && response.data.publicAddress) {
                    setWalletAddress(response.data.publicAddress);
                } else {
                    alert(t.errorNoInternalWallet);
                    navigate('/home'); 
                }
            } catch (error) {
                console.error("지갑 주소 조회 실패:", error);
                alert(t.errorWalletFetchFail);
                navigate('/home');
            } finally {
                setLoading(false);
            }
        };

        fetchWalletAddress();
    }, [navigate, t]);

    return (
        <div className={common.layout}>
            {/* 1. 상단 헤더 */}
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    <span className={styles.arrow}></span>
                </button>
            </header>

            <div className={`${styles.content} ${common.fadeIn}`}>
                {/* 2. 브랜드 로고 영역 */}
                <div className={styles.brandLogo}>
                    <img src={UsdtLogo} alt="USDT Logo" className={styles.usdtIcon} />
                    <h1 className={styles.logoText}>CrossPay</h1>
                </div>

                {/* 3. QR 코드 영역 */}
                <div className={styles.qrContainer}>
                    {loading ? (
                        <div className={styles.loadingText}>{t.generatingQr}</div>
                    ) : (
                        <QRCodeCanvas 
                            value={walletAddress} 
                            size={240}             
                            level={"H"}           
                            bgColor={"#ffffff"}   
                            fgColor={"#000000"}   
                            includeMargin={true}  
                        />
                    )}
                </div>

                {/* 4. 지갑 주소 텍스트 */}
                <p className={styles.walletAddress}>
                    {loading ? "Loading..." : 
                        walletAddress.length > 20 
                        ? `${walletAddress.substring(0, 8)}...${walletAddress.slice(-8)}`
                        : walletAddress
                    }
                </p>
                
                {/* 주소 복사 버튼 */}
                {!loading && walletAddress && (
                    <button 
                        className={styles.copyBtn}
                        onClick={() => {
                            navigator.clipboard.writeText(walletAddress);
                            alert(t.copyInternalAddrSuccess);
                        }}
                    >
                        {t.copyAddrBtn}
                    </button>
                )}
            </div>

            {/* 5. 하단 네비게이션 바 */}
            <nav className={common.bottomNav}>
                <div className={common.navItem} onClick={() => navigate('/home')}>
                    <img src={navHomeIcon} className={common.navImg} alt={t.home} />
                    <span className={common.navText}>{t.home}</span>
                </div>
                <div className={`${common.navItem} ${common.active}`}>
                    <img src={navPayIcon} className={common.navImg} alt={t.payNav} />
                    <span className={common.navText}>{t.payNav}</span>
                </div>
                <div className={common.navItem} onClick={() => navigate('/mypage')}>
                    <img src={navUserIcon} className={common.navImg} alt={t.myPage} />
                    <span className={common.navText}>{t.myPage}</span>
                </div>
            </nav>
        </div>
    );
};

export default QrGenerate;