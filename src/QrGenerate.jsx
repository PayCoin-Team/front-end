import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; 

import common from './Common.module.css';
import styles from './QrGenerate.module.css';
import api from './utils/api'; 

// 아이콘 및 이미지
import UsdtLogo from './component/UsdtLogo.svg';
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';

const QrGenerate = () => {
    const navigate = useNavigate();
    
    // 상태 관리
    const [walletAddress, setWalletAddress] = useState('');
    const [loading, setLoading] = useState(true);

    // 1. 초기 로드: 지갑 정보 조회
    useEffect(() => {
        const fetchWalletAddress = async () => {
            try {
                // ✅ 내부 지갑 정보를 주는 API 호출
                const response = await api.get('/wallets/users/me', {
                    params: { _t: new Date().getTime() }
                });

                if (response.data && response.data.publicAddress) {
                    // ⭐ [수정됨] 무조건 '내부 지갑 주소(publicAddress)'만 사용합니다.
                    // 외부 지갑(externalAddress)이 있든 말든 신경 쓰지 않습니다.
                    console.log("✅ QR용 내부 지갑 주소:", response.data.publicAddress);
                    setWalletAddress(response.data.publicAddress);
                } else {
                    alert("내부 지갑 정보를 찾을 수 없습니다.");
                    navigate('/home'); 
                }
            } catch (error) {
                console.error("지갑 주소 조회 실패:", error);
                alert("지갑 정보를 불러오는데 실패했습니다.");
                navigate('/home');
            } finally {
                setLoading(false);
            }
        };

        fetchWalletAddress();
    }, [navigate]);

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
                        <div className={styles.loadingText}>QR 생성 중...</div>
                    ) : (
                        <QRCodeCanvas 
                            value={walletAddress} // 내부 지갑 주소가 들어갑니다.
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
                        // 주소가 너무 길면 중간 생략, 짧으면 그대로 표시
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
                            alert("내부 지갑 주소가 복사되었습니다.");
                        }}
                    >
                        주소 복사
                    </button>
                )}
            </div>

            {/* 5. 하단 네비게이션 바 */}
            <nav className={common.bottomNav}>
                <div className={common.navItem} onClick={() => navigate('/home')}>
                    <img src={navHomeIcon} className={common.navImg} alt="홈" />
                    <span className={common.navText}>홈</span>
                </div>
                <div className={`${common.navItem} ${common.active}`}>
                    <img src={navPayIcon} className={common.navImg} alt="결제" />
                    <span className={common.navText}>결제</span>
                </div>
                <div className={common.navItem} onClick={() => navigate('/mypage')}>
                    <img src={navUserIcon} className={common.navImg} alt="마이페이지" />
                    <span className={common.navText}>마이페이지</span>
                </div>
            </nav>
        </div>
    );
};

export default QrGenerate;