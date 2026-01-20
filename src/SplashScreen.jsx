import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './SplashScreen.module.css';
import usdtLogoPath from './component/UsdtLogo.svg';
import { translations, flags } from './utils/translations.jsx';

const SplashScreen = () => {
    const [isAppReady, setIsAppReady] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState('en'); 
    
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // (기존의 긴 translations 객체와 flags 객체는 삭제됨)

    useEffect(() => {
        const timer = setTimeout(() => setIsAppReady(true), 1500);

        const checkLanguage = () => {
            const savedLang = localStorage.getItem('appLanguage');
            
            // translations 객체에 해당 언어가 있는지 확인
            if (savedLang && translations[savedLang]) {
                setSelectedLang(savedLang);
            } else {
                const browserLang = (navigator.language || navigator.userLanguage).substring(0, 2).toLowerCase();
                if (translations[browserLang]) {
                    setSelectedLang(browserLang);
                    localStorage.setItem('appLanguage', browserLang);
                } else {
                    setSelectedLang('en');
                    localStorage.setItem('appLanguage', 'en');
                }
            }
        };
        checkLanguage();
        return () => clearTimeout(timer);
    }, []);

    // 외부 클릭 감지
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
    };

    // [2] 현재 언어에 맞는 텍스트 묶음 가져오기
    const t = translations[selectedLang];

    return (
        <div className={common.layout} style={{ position: 'relative' }}> 
            
            {isAppReady && (
                <div className={`${styles.topRightLang} ${common.fadeIn}`} ref={dropdownRef}>
                    <div 
                        className={styles.selectedLangBox} 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <img 
                            src={`https://flagcdn.com/w40/${flags[selectedLang]}.png`} 
                            alt="flag" 
                            className={styles.flagImg} 
                        />
                        {/* translations 파일에서 언어 이름(langLabel) 가져오기 */}
                        <span className={styles.langText}>{t.langLabel}</span>
                        <span className={styles.arrowIcon}>▾</span>
                    </div>

                    {isDropdownOpen && (
                        <ul className={styles.dropdownMenu}>
                            {/* translations 객체의 키(ko, en 등)를 순회 */}
                            {Object.keys(translations).map((code) => (
                                <li 
                                    key={code} 
                                    className={styles.dropdownItem} 
                                    onClick={() => handleSelectLanguage(code)}
                                >
                                    <img 
                                        src={`https://flagcdn.com/w40/${flags[code]}.png`} 
                                        alt={code} 
                                        className={styles.flagImg} 
                                    />
                                    {/* 각 언어별 langLabel 표시 (한국어, English...) */}
                                    <span>{translations[code].langLabel}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <div className={styles.topSection}>
                <img src={usdtLogoPath} alt="Logo" className={styles.logoImage} />
                <h1 className={styles.title}>CrossPay</h1>
            </div>

            {isAppReady && (
                <div className={`${styles.bottomSection} ${common.fadeIn}`}>
                    
                    <button className={styles.loginButton} onClick={() => navigate('/login')}>
                        {t.login} {/* t 객체 사용 */}
                    </button>
                    
                    <div className={styles.signupLink} onClick={() => navigate('/signup')}>
                        {t.signup}
                    </div>

                    <div className={styles.findMenu}>
                        <span onClick={() => navigate('/findId')}>{t.findId}</span>
                        <span onClick={() => navigate('/resetPw')}>{t.resetPw}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SplashScreen;