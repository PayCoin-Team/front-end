import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './ResetPassword.module.css';
import eyeIcon from './component/eye.svg';
import UsdtLogo from './component/UsdtLogo.svg';

// ⭐ [수정 1] api 인스턴스 import
import api from './utils/api';
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
    
    // 에러 및 성공 메시지 상태
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

    // [API 1] 이메일 인증번호 발송 (POST /auth/password/send-code)
    // 명세서: email은 (query) 파라미터
    const handleSendEmail = async () => {
        setEmailError("");
        setEmailSuccess("");
        
        if (!email) {
            setEmailError(t.alertEmailRequired);
            return;
        }
        try {
            // ⭐ [수정] query parameter 사용
            await api.post('/auth/password/send-code', null, {
                params: { email: email }
            });
            
            setEmailSuccess(t.alertCodeSent);
            setIsEmailSent(true);
        } catch (error) {
            console.error(error);
            setEmailError(t.errorEmailSendFail || "이메일 발송에 실패했습니다.");
        }
    };

    // [API 2] 인증번호 확인 (POST /auth/password/verify-code)
    // 명세서: email, code 모두 (query) 파라미터
    const handleVerifyCode = async () => {
        setAuthCodeError("");
        
        if (!authCode) {
            setAuthCodeError(t.alertCodeRequired);
            return;
        }
        try {
            // ⭐ [수정] query parameter 사용
            await api.post('/auth/password/verify-code', null, {
                params: { 
                    email: email, // 명세서에 email도 필요하다고 되어 있음
                    code: authCode 
                }
            });
            
            // 200 OK면 성공
            setIsVerified(true);
            setAuthCodeError(""); 
        } catch (error) {
            console.error(error);
            setAuthCodeError(t.errorVerifyFail || "인증번호가 일치하지 않습니다.");
        }
    };

    // [API 3] 비밀번호 재설정 (PATCH /auth/password/reset)
    // 명세서: email, newPassword 모두 (query) 파라미터
    const handleResetPassword = async () => {
        setPasswordError("");
        
        if (!isPasswordValid || !isConfirmValid) return;
        
        try {
            // ⭐ [수정] PATCH 메서드 & query parameter 사용
            await api.patch('/auth/password/reset', null, {
                params: { 
                    email: email,        // 이메일로 식별
                    newPassword: password 
                }
            });
            
            // 성공 시 완료 화면(Step 3)으로
            setStep(3); 
        } catch (error) {
            console.error(error);
            setPasswordError(t.errorResetFail || "비밀번호 변경에 실패했습니다.");
        }
    };

    return (
        <div className={common.layout}>
            {/* 헤더 */}
            <div className={styles.header}>
                {step !== 3 && (
                    <button className={styles.backButton} onClick={() => step === 1 ? navigate(-1) : setStep(1)}>
                        <span className={styles.arrow}></span>
                    </button>
                )}
            </div>

            <div className={`${styles.contentSection} ${common.fadeIn}`}>
                
                {/* STEP 1: 이메일 인증 */}
                {step === 1 && (
                    <>
                        <h2 className={styles.mainTitle}>{t.resetPw}</h2>
                        
                        {/* 이메일 입력 */}
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

                        {/* 인증코드 입력 */}
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

                        {/* 다음 단계 버튼 */}
                        <button 
                            className={`${styles.fullButton1} ${isVerified ? styles.activeFullBtn : ''}`} 
                            onClick={() => isVerified && setStep(2)}
                            disabled={!isVerified}
                        >
                            {t.resetPw}
                        </button>
                    </>
                )}

                {/* STEP 2: 새 비밀번호 입력 */}
                {step === 2 && (
                    <>
                        <h2 className={styles.mainTitle}>{t.resetPw}</h2>
                        
                        {/* 비밀번호 */}
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

                        {/* 비밀번호 확인 */}
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
                            className={`${styles.fullButton2} ${isPasswordValid && isConfirmValid ? styles.activeGreenBtn : ''}`}
                            onClick={handleResetPassword}
                            disabled={!isPasswordValid || !isConfirmValid}
                        >
                            {t.confirm}
                        </button>
                    </>
                )}

                {/* STEP 3: 완료 */}
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