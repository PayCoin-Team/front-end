import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import common from './Common.module.css';
import styles from './ResetPassword.module.css';
import eyeIcon from './component/eye.svg';
import UsdtLogo from './component/UsdtLogo.svg';
// 1. 번역 파일 임포트
import { translations } from './utils/translations'; 

const ResetPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // 2. 언어 설정 및 번역 객체 t 정의
    const language = localStorage.getItem('appLanguage') || 'ko';
    const t = translations[language];

    // 입력 상태 변수
    const [email, setEmail] = useState("");
    const [authCode, setAuthCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // 상태 관리 (인증 여부 등)
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // 비밀번호 가리기/보이기
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,}$/;
    const isPasswordValid = passwordRegex.test(password);
    const isConfirmValid = password === confirmPassword && confirmPassword.length > 0;

    // [API] 1. 이메일 인증코드 전송
    const handleSendEmail = async () => {
        if (!email) return alert(t.alertEmailRequired);
        try {
            await axios.post('/auth/email/send', { email });
            alert(t.alertCodeSent);
            setIsEmailSent(true);
        } catch (error) {
            alert(t.errorEmailSendFail + (error.response?.data?.message || "Error"));
        }
    };

    // [API] 2. 이메일 인증코드 검증
    const handleVerifyCode = async () => {
        if (!authCode) return alert(t.alertCodeRequired);
        try {
            const response = await axios.post('/auth/email/verify', { emailCode: authCode });
            if (response.data.isVerified) {
                alert(t.alertVerifySuccess);
                setIsVerified(true);
            } else {
                alert(t.errorInvalidCode);
            }
        } catch (error) {
            alert(t.errorVerifyFail);
        }
    };

    // [API] 3. 비밀번호 재설정
    const handleResetPassword = async () => {
        try {
            await axios.patch('/auth/password-reset', { newPassword: password });
            setStep(3);
        } catch (error) {
            alert(t.errorResetFail + (error.response?.data?.message || "Error"));
        }
    };

    return (
        <div className={common.layout}>
            <div className={styles.header}>
                {step !== 3 && (
                    <button className={styles.backButton} onClick={() => step === 1 ? navigate(-1) : setStep(1)}>
                        <span className={styles.arrow}></span>
                    </button>
                )}
            </div>

            <div className={`${styles.contentSection} ${common.fadeIn}`}>
                {step === 1 && (
                    <>
                        <h2 className={styles.mainTitle}>{t.resetPw}</h2>
                        <div className={styles.inputBox}>
                            <input 
                                type="email" 
                                placeholder={t.emailPlaceholder} 
                                className={styles.inputField} 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                disabled={isVerified}
                            />
                            <button 
                                className={`${styles.inlineButton} ${email.length > 0 ? styles.activeInlineBtn : ''}`}
                                onClick={handleSendEmail}
                                disabled={isVerified}
                            >
                                {isEmailSent ? t.resend : t.sendCode}
                            </button>
                        </div>
                        <div className={styles.inputBox}>
                            <input 
                                type="text" 
                                placeholder={t.codePlaceholder} 
                                className={styles.inputField} 
                                value={authCode} 
                                onChange={(e) => setAuthCode(e.target.value)} 
                                disabled={isVerified}
                            />
                            <button 
                                className={`${styles.inlineButton} ${authCode.length > 0 ? styles.activeInlineBtn : ''}`}
                                onClick={handleVerifyCode}
                                disabled={isVerified}
                            >
                                {isVerified ? t.confirm : t.confirm}
                            </button>
                        </div>
                        <button 
                            className={`${styles.fullButton} ${isVerified ? styles.activeFullBtn : ''}`} 
                            onClick={() => isVerified && setStep(2)}
                        >
                            {t.resetPw}
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className={styles.mainTitle}>{t.resetPw}</h2>
                        <div className={styles.inputGroup}>
                            <div className={styles.inputLabel}>{t.newPwLabel}</div>
                            <div className={styles.underlineInput}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className={styles.inputField} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                                <button type="button" className={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
                                    <img src={eyeIcon} alt="view" className={`${styles.eyeIconImage} ${showPassword ? styles.eyeActive : styles.eyeInactive}`} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.inputLabel}>{t.newPwConfirmLabel}</div>
                            <div className={styles.underlineInput}>
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    className={styles.inputField} 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                />
                                <button type="button" className={styles.eyeButton} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <img src={eyeIcon} alt="view" className={`${styles.eyeIconImage} ${showConfirmPassword ? styles.eyeActive : styles.eyeInactive}`} />
                                </button>
                            </div>
                        </div>

                        <button 
                            className={`${styles.fullButton} ${isPasswordValid && isConfirmValid ? styles.activeGreenBtn : ''}`}
                            onClick={handleResetPassword}
                        >
                            {t.confirm}
                        </button>
                    </>
                )}

                {step === 3 && (
                    <div className={styles.completeContainer}>
                        <div className={styles.brandLogoRow}>
                             <img src={UsdtLogo} alt="LogoIcon" className={styles.usdtIcon} />
                             <span className={styles.brandName}>{t.appName}</span>
                        </div>
                        <p className={styles.completeMessage}>{t.pwResetComplete}</p>
                        <button className={styles.homeButton} onClick={() => navigate('/login')}>{t.loginGo}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;