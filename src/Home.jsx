import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './SplashScreen.module.css';
import usdtLogoPath from './component/UsdtLogo.svg';

const SplashScreen = () => {
    const [isAppReady, setIsAppReady] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 열림 여부
    const [selectedLang, setSelectedLang] = useState('ko'); // 기본 언어
    const navigate = useNavigate();
    
    // 드롭다운 외부 클릭 감지용 Ref
    const dropdownRef = useRef(null);

    // 언어 데이터 (flagcdn용 국가 코드를 별도로 추가)
    const languages = {
        ko: { label: '한국어', country: 'kr' },
        en: { label: 'English', country: 'us' },
        zh: { label: '中文', country: 'cn' },
        es: { label: 'Español', country: 'es' },
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsAppReady(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectLanguage = (code) => {
        setSelectedLang(code);
        setIsDropdownOpen(false);
        localStorage.setItem('appLanguage', code);
        
        // 언어 선택 후 페이지 이동 (필요하면 주석 해제)
        // navigate('/login');
    };

    return (
        <div className={common.layout} style={{ position: 'relative' }}> 
            
            {/* 오른쪽 상단 커스텀 드롭다운 */}
            {isAppReady && (
                <div 
                    className={`${styles.topRightLang} ${common.fadeIn}`} 
                    ref={dropdownRef}
                >
                    {/* 1. 선택된 언어 표시 (버튼 역할) */}
                    <div 
                        className={styles.selectedLangBox} 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <img 
                            src={`https://flagcdn.com/w40/${languages[selectedLang].country}.png`} 
                            alt="flag" 
                            className={styles.flagImg} 
                        />
                        <span className={styles.langText}>{languages[selectedLang].label}</span>
                        <span className={styles.arrowIcon}>▾</span>
                    </div>

                    {/* 2. 드롭다운 메뉴 리스트 */}
                    {isDropdownOpen && (
                        <ul className={styles.dropdownMenu}>
                            {Object.keys(languages).map((code) => (
                                <li 
                                    key={code} 
                                    className={styles.dropdownItem} 
                                    onClick={() => handleSelectLanguage(code)}
                                >
                                    <img 
                                        src={`https://flagcdn.com/w40/${languages[code].country}.png`} 
                                        alt={code} 
                                        className={styles.flagImg} 
                                    />
                                    <span>{languages[code].label}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* 메인 로고 영역 */}
            <div className={styles.topSection}>
                <img src={usdtLogoPath} alt="Logo" className={styles.logoImage} />
                <h1 className={styles.title}>CrossPay</h1>
            </div>

            {/* 하단 버튼 영역 */}
            {isAppReady && (
                <div className={`${styles.bottomSection} ${common.fadeIn}`}>
                    <button className={styles.loginButton} onClick={() => navigate('/login')}>
                        로그인
                    </button>
                    <div className={styles.signupLink} onClick={() => navigate('/signup')}>
                        회원가입
                    </div>

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