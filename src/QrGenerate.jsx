import React from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './QrGenerate.module.css';

// 아이콘 및 QR 이미지 가져오기
import UsdtLogo from './component/UsdtLogo.svg';
import QrCodeImg from './component/Qrcode.svg';
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';

const QrGenerate = () => {
    const navigate = useNavigate();

    return (
        <div className={common.layout}>
            {/* 1. 상단 헤더: 뒤로가기 버튼 */}
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    <span className={styles.arrow}></span>
                </button>
            </header>

            <div className={`${styles.content} ${common.fadeIn}`}>
                {/* 2. 브랜드 로고 영역 (UsdtLogo + CrossPay) */}
                <div className={styles.brandLogo}>
                    <img src={UsdtLogo} alt="USDT Logo" className={styles.usdtIcon} />
                    <h1 className={styles.logoText}>CrossPay</h1>
                </div>

                {/* 3. QR 코드 영역, 당장은 기존의 figma이미지 사용, 추후 백엔드 완성시 변경*/}
                <div className={styles.qrContainer}>
                    <img src={QrCodeImg} alt="Qr Code" className={styles.qrImage} />
                </div>

                {/* 4. 지갑 주소 텍스트 */}
                <p className={styles.walletAddress}>A1B2-C3D4</p>
            </div>

            {/* 5. 하단 네비게이션 바 (홈 화면과 동일 유지) */}
            <nav className={styles.bottomNav}>
                <div className={styles.navItem} onClick={() => navigate('/home')}>
                    <img src={navHomeIcon} className={styles.navImg} alt="홈" />
                    <span className={styles.navText}>홈</span>
                </div>
                <div className={`${styles.navItem} ${styles.active}`}>
                    <img src={navPayIcon} className={styles.navImg} alt="결제" />
                    <span className={styles.navText}>결제</span>
                </div>
                <div className={styles.navItem}>
                    <img src={navUserIcon} className={styles.navImg} alt="마이페이지" />
                    <span className={styles.navText}>마이페이지</span>
                </div>
            </nav>
        </div>
    );
};

export default QrGenerate;
