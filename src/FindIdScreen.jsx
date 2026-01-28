import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './FindIdScreen.module.css';

// api 및 로고 import
import api from './utils/api'; 
import { translations } from './utils/translations'; 
import LogoIcon from './component/UsdtLogo.svg'; 

const FindIdScreen = () => {
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
    
    const [email, setEmail] = useState("");
    const [isFound, setIsFound] = useState(false); 
    const [emailError, setEmailError] = useState("");

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleFindId = async () => {
        setEmailError(""); 
        
        if (!isEmailValid) {
            setEmailError(t.errorInvalidEmailFormat);
            return;
        }

        try {
            await api.post('/auth/find-id', null, {
                params: { email: email } 
            });
            setIsFound(true); 

        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 404) {
                setEmailError(t.errorUserNotFound);
            } else {
                setEmailError(t.alertErrorGeneral);
            }
        }
    };

    return (
        <div className={common.layout}>
            <div className={styles.header}>
                <button 
                    type="button"
                    className={styles.backButton} 
                    onClick={() => isFound ? navigate('/login') : navigate(-1)}
                >
                    <span className={styles.arrow} />
                </button>
            </div>

            <div className={`${styles.contentSection} ${common.fadeIn}`}>
                {!isFound ? (
                    <>
                        <h2 className={styles.mainTitle}>{t.findId}</h2>
                        
                        <div className={styles.formContainer}>
                            <p className={styles.description}>
                                {t.findIdDesc}
                            </p>

                            <div className={styles.inputGroup}>
                                <div className={styles.inputBox}>
                                    <input 
                                        type="email" 
                                        placeholder={t.emailPlaceholder} 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={styles.inputField}
                                    />
                                </div>
                                {emailError && <p className={styles.errorMessage}>{emailError}</p>}
                            </div>

                            <button 
                                className={`${styles.submitButton} ${isEmailValid ? styles.activeButton : ''}`} 
                                onClick={handleFindId}
                                disabled={!isEmailValid}
                            >
                                {t.findIdBtn}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.resultContainer}>
                        <div className={styles.logoWrapper}>
                            <img src={LogoIcon} alt="CrossPay Logo" className={styles.logoImg} />
                            <h1 className={styles.logoText}>CrossPay</h1>
                        </div>
                        
                        <h2 className={styles.successMessage}>
                            {t.idSentToEmail}
                        </h2>

                        <button className={styles.homeButton} onClick={() => navigate('/login')}>
                            {t.goHome}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindIdScreen;