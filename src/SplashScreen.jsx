import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css'; // 1. 공통 CSS 임포트
import styles from './SplashScreen.module.css';
import usdtLogoPath from './component/UsdtLogo.svg';

const SplashScreen = () => {
    const [isAppReady, setIsAppReady] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setIsAppReady(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        /* 2. common.layout과 배경색 클래스를 함께 적용 */
        <div className={common.layout}>
            <div className={styles.topSection}>
                <img src={usdtLogoPath} alt="Logo" className={styles.logoImage} />
                <h1 className={styles.title}>CrossPay</h1>
            </div>

            {isAppReady && (
                <div className={`${styles.bottomSection} ${common.fadeIn}`}>
                    <button className={styles.loginButton} onClick={() => navigate('/login')}>
                        로그인
                    </button>
                    <div className={styles.signupLink} onClick={() => navigate('/signup')}>
                        회원가입
                    </div>

                    {/* 신규 추가: 아이디 찾기 및 비밀번호 재설정 영역 */}
                    <div className={styles.findMenu}>
                        <span onClick={() => navigate('/findId')}>아이디 찾기</span>
                        <span onClick={() => navigate('/resetPw')}>비밀번호 재설정</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SplashScreen;