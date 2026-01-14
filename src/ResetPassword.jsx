import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './ResetPassword.module.css';
import eyeIcon from './component/eye.svg';
import UsdtLogo from './component/UsdtLogo.svg'; // 로고 아이콘으로 사용

const ResetPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // 입력 상태 변수들
    const [email, setEmail] = useState("");
    const [authCode, setAuthCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // 비밀번호 가리기/보이기 상태
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,}$/;
    const isPasswordValid = passwordRegex.test(password);
    const isConfirmValid = password === confirmPassword && confirmPassword.length > 0;

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
                {/* 1단계와 2단계 로직은 유지됩니다 */}
                {step === 1 && (
                    <>
                        <h2 className={styles.mainTitle}>비밀번호 재설정</h2>
                        <div className={styles.inputBox}>
                            <input type="email" placeholder="이메일 입력" className={styles.inputField} value={email} onChange={(e) => setEmail(e.target.value)} />
                            <button className={`${styles.inlineButton} ${email.length > 0 ? styles.activeInlineBtn : ''}`}>인증번호 전송</button>
                        </div>
                        <div className={styles.inputBox}>
                            <input type="text" placeholder="인증 번호 입력" className={styles.inputField} value={authCode} onChange={(e) => setAuthCode(e.target.value)} />
                            <button className={`${styles.inlineButton} ${authCode.length > 0 ? styles.activeInlineBtn : ''}`}>확인</button>
                        </div>
                        <button className={`${styles.fullButton} ${authCode ? styles.activeFullBtn : ''}`} onClick={() => setStep(2)}>
                            비밀번호 재설정
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className={styles.mainTitle}>비밀번호 재설정</h2>
                        <div className={styles.inputLabel}>새 비밀번호 *</div>
                        <div className={styles.underlineInput}>
                            <input type={showPassword ? "text" : "password"} className={styles.inputField} value={password} onChange={(e) => setPassword(e.target.value)} />
                            <button type="button" className={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
                                <img src={eyeIcon} alt="view" className={`${styles.eyeIconImage} ${showPassword ? styles.eyeActive : styles.eyeInactive}`} />
                            </button>
                        </div>

                        <div className={styles.inputLabel}>새 비밀번호 확인 *</div>
                        <div className={styles.underlineInput}>
                            <input type={showConfirmPassword ? "text" : "password"} className={styles.inputField} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            <button type="button" className={styles.eyeButton} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <img src={eyeIcon} alt="view" className={`${styles.eyeIconImage} ${showConfirmPassword ? styles.eyeActive : styles.eyeInactive}`} />
                            </button>
                        </div>

                        <button 
                            className={`${styles.fullButton} ${isPasswordValid && isConfirmValid ? styles.activeGreenBtn : ''}`}
                            onClick={() => isPasswordValid && isConfirmValid && setStep(3)}
                        >
                            확인
                        </button>
                    </>
                )}

                {/* 3단계: 완료 화면 (텍스트 유지 + 왼쪽 로고 추가) */}
                {step === 3 && (
                    <div className={styles.completeContainer}>
                        <div className={styles.brandLogoRow}>
                             <img src={UsdtLogo} alt="LogoIcon" className={styles.usdtIcon} />
                             <span className={styles.brandName}>CrossPay</span>
                        </div>
                        <p className={styles.completeMessage}>비밀번호 재설정이 완료되었습니다.</p>
                        
                        <button 
                            className={styles.homeButton} 
                            onClick={() => navigate('/')} 
                        >
                            홈으로
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;