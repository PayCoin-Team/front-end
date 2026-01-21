import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import common from './Common.module.css';
import styles from './FindIdScreen.module.css';
import { translations } from './utils/translations'; 

const FindIdScreen = () => {
    const navigate = useNavigate();
    const language = localStorage.getItem('appLanguage') || 'ko';
    const t = translations[language];
    
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isFound, setIsFound] = useState(false);
    const [foundId, setFoundId] = useState(""); 
    
    const [emailError, setEmailError] = useState("");
    const [codeError, setCodeError] = useState("");

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // 1. 이메일 인증코드 전송
    const handleSendCode = async () => {
        setEmailError(""); 
        try {
            const response = await axios.post('/auth/email/send', { email });
            if (response.status === 200) {
                alert(t.alertCodeSent); // 다국어 적용
            }
        } catch (error) {
            setEmailError(t.errorInvalidEmail); // 다국어 적용
        }
    };

    // 2. 이메일 인증코드 검증 및 아이디 찾기
    const handleVerifyAndFindId = async () => {
        setCodeError(""); 
        try {
            const response = await axios.post('/auth/email/verify', { 
                emailCode: verificationCode 
            });

            if (response.data.isVerified) {
                setFoundId(response.data.username || "abcd1234");
                setIsFound(true);
            } else {
                setCodeError(t.errorInvalidCode); // 다국어 적용
            }
        } catch (error) {
            setCodeError(t.errorVerifyFail); // 다국어 적용
        }
    };

    return (
        <div className={common.layout}>
            <div className={styles.header}>
                <button 
                    type="button"
                    className={styles.backButton} 
                    onClick={() => isFound ? setIsFound(false) : navigate(-1)}
                >
                    <span className={styles.arrow} />
                </button>
            </div>

            <div className={`${styles.contentSection} ${common.fadeIn}`}>
                {!isFound ? (
                    <>
                        <h2 className={styles.mainTitle}>{t.findId}</h2>
                        <div className={styles.formContainer}>
                            {/* 이메일 섹션 */}
                            <div className={styles.inputGroup}>
                                <div className={styles.inputBox}>
                                    <input 
                                        type="email" 
                                        placeholder={t.emailPlaceholder} 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={styles.inputField}
                                    />
                                    <button 
                                        className={`${styles.innerButton} ${isEmailValid ? styles.activeInnerButton : ''}`} 
                                        onClick={handleSendCode}
                                        disabled={!isEmailValid}
                                    >
                                        {t.sendCode}
                                    </button>
                                </div>
                                {emailError && <p className={styles.errorMessage}>{emailError}</p>}
                            </div>

                            {/* 인증번호 섹션 */}
                            <div className={styles.inputGroup}>
                                <div className={styles.inputBox}>
                                    <input 
                                        type="text" 
                                        placeholder={t.codePlaceholder} 
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className={styles.inputField}
                                    />
                                    <button 
                                        className={`${styles.innerButton} ${verificationCode.length > 0 ? styles.activeInnerButton : ''}`} 
                                        onClick={handleVerifyAndFindId}
                                        disabled={verificationCode.length === 0}
                                    >
                                        {t.confirm}
                                    </button>
                                </div>
                                {codeError && <p className={styles.errorMessage}>{codeError}</p>}
                            </div>

                            <button 
                                className={`${styles.submitButton} ${(isEmailValid && verificationCode) ? styles.activeButton : ''}`} 
                                onClick={handleVerifyAndFindId}
                                disabled={!isEmailValid || !verificationCode}
                            >
                                {t.findIdBtn}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.resultContainer}>
                        <h2 className={styles.mainTitle}>{t.idResultPrefix}</h2>
                        <div className={styles.idResultBox}>
                            <p className={styles.foundIdText}>{foundId}</p>
                            <div className={styles.underline}></div>
                        </div>
                        <h2 className={styles.mainTitle}>{t.idResultSuffix}</h2>
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