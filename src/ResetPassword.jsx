import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import common from './Common.module.css';
import styles from './ResetPassword.module.css';
import eyeIcon from './component/eye.svg';
import UsdtLogo from './component/UsdtLogo.svg';
import { translations } from './utils/translations'; 

const ResetPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const language = localStorage.getItem('appLanguage') || 'ko';
    const t = translations[language];

    // 입력 상태 변수
    const [email, setEmail] = useState("");
    const [authCode, setAuthCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // 에러 및 성공 메시지 상태 추가
    const [emailError, setEmailError] = useState("");
    const [emailSuccess, setEmailSuccess] = useState("");
    const [authCodeError, setAuthCodeError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,}$/;
    const isPasswordValid = passwordRegex.test(password);
    const isConfirmValid = password === confirmPassword && confirmPassword.length > 0;

    // [API] 1. 이메일 인증코드 전송
    const handleSendEmail = async () => {
        setEmailError("");
        setEmailSuccess("");
        if (!email) {
            setEmailError(t.alertEmailRequired);
            return;
        }
        try {
            await axios.post('/api/auth/email/send', { email });
            setEmailSuccess(t.alertCodeSent);
            setIsEmailSent(true);
        } catch (error) {
            setEmailError(t.errorEmailSendFail);
        }
    };

    // [API] 2. 이메일 인증코드 검증
    const handleVerifyCode = async () => {
        setAuthCodeError("");
        if (!authCode) {
            setAuthCodeError(t.alertCodeRequired);
            return;
        }
        try {
            const response = await axios.post('/api/auth/email/verify', { emailCode: authCode });
            if (response.data.isVerified) {
                setIsVerified(true);
                setAuthCodeError(""); // 에러 초기화
            } else {
                setAuthCodeError(t.errorInvalidCode);
            }
        } catch (error) {
            setAuthCodeError(t.errorVerifyFail);
        }
    };

    // [API] 3. 비밀번호 재설정
    const handleResetPassword = async () => {
        setPasswordError("");
        if (!isPasswordValid || !isConfirmValid) return;
        try {
            await axios.patch('/api/auth/password-reset', { newPassword: password });
            setStep(3);
        } catch (error) {
            setPasswordError(t.errorResetFail);
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
                        <div className={styles.inputGroup}>
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
                            {emailError && <p className={styles.errorMessage}>{emailError}</p>}
                            {emailSuccess && <p className={styles.successMessage}>{emailSuccess}</p>}
                        </div>

                        <div className={styles.inputGroup}>
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
                                    {t.confirm}
                                </button>
                            </div>
                            {authCodeError && <p className={styles.errorMessage}>{authCodeError}</p>}
                        </div>

                        <button 
                            className={`${styles.fullButton} ${isVerified ? styles.activeFullBtn : ''}`} 
                            onClick={() => isVerified && setStep(2)}
                            disabled={!isVerified}
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
                            {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
                        </div>

                        <button 
                            className={`${styles.fullButton} ${isPasswordValid && isConfirmValid ? styles.activeGreenBtn : ''}`}
                            onClick={handleResetPassword}
                            disabled={!isPasswordValid || !isConfirmValid}
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