import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // API 통신을 위해 추가
import common from './Common.module.css';
import styles from './ResetPassword.module.css';
import eyeIcon from './component/eye.svg';
import UsdtLogo from './component/UsdtLogo.svg';
import { translations } from './utils/translations'; // 번역 데이터 가져오기

const ResetPassword = () => {
    const navigate = useNavigate();

    // [언어 설정]
    const lang = localStorage.getItem('appLanguage') || 'ko';
    const t = translations[lang];

    const [step, setStep] = useState(1);

    // [입력 상태 변수]
    const [email, setEmail] = useState("");
    const [authCode, setAuthCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // [상태 관리 (인증 여부 등)]
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // [비밀번호 가리기/보이기]
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,}$/;
    const isPasswordValid = passwordRegex.test(password);
    const isConfirmValid = password === confirmPassword && confirmPassword.length > 0;

    // [API] 1. 이메일 인증코드 전송 (/auth/email/send)
    const handleSendEmail = async () => {
        if (!email) return alert(t.emailPlaceholder || "이메일을 입력해주세요.");
        try {
            await axios.post('/auth/email/send', { email });
            alert("인증번호가 전송되었습니다."); // 필요시 t.alertSent 등으로 교체 가능
            setIsEmailSent(true);
        } catch (error) {
            alert("이메일 전송 실패: " + (error.response?.data?.message || "오류 발생"));
        }
    };

    // [API] 2. 이메일 인증코드 검증 (/auth/email/verify)
    const handleVerifyCode = async () => {
        if (!authCode) return alert(t.codePlaceholder || "인증번호를 입력해주세요.");
        try {
            const response = await axios.post('/auth/email/verify', { emailCode: authCode });
            if (response.data.isVerified) {
                alert("인증에 성공하였습니다.");
                setIsVerified(true);
            } else {
                alert("인증번호가 일치하지 않습니다.");
            }
        } catch (error) {
            alert("인증 확인 중 오류 발생");
        }
    };

    // [API] 3. 비밀번호 재설정 (/auth/password-reset)
    const handleResetPassword = async () => {
        try {
            await axios.patch('/auth/password-reset', { newPassword: password });
            setStep(3); // 성공 시 완료 화면으로
        } catch (error) {
            alert("비밀번호 재설정 실패: " + (error.response?.data?.message || "오류 발생"));
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
                        {/* 1단계: 이메일 인증 */}
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
                                {/* 문맥상 재전송/전송 텍스트 처리 */}
                                {isEmailSent ? (t.resend || "재전송") : t.sendCode}
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
                                {isVerified ? (t.completed || "완료") : t.confirm}
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
                        {/* 2단계: 새 비밀번호 입력 */}
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
                        {/* 3단계: 완료 */}
                        <div className={styles.brandLogoRow}>
                             <img src={UsdtLogo} alt="LogoIcon" className={styles.usdtIcon} />
                             <span className={styles.brandName}>{t.appName || 'CrossPay'}</span>
                        </div>
                        <p className={styles.completeMessage}>{t.pwResetComplete}</p>
                        
                        <button className={styles.homeButton} onClick={() => navigate('/login')}>
                            {/* 비밀번호 변경 후에는 보통 재로그인이 필요하므로 /login으로 이동 */}
                            {t.login || "로그인 하러가기"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;