import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import common from './Common.module.css';
import styles from './SignUpScreen.module.css';
import eyeIcon from './component/eye.svg';

// 1. 번역 파일 임포트
import { translations } from './utils/translations';

const SignUpScreen = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // 언어 상태 관리 및 실시간 감지
    const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'ko');

    useEffect(() => {
        const handleLanguageChange = () => {
            setLanguage(localStorage.getItem('appLanguage') || 'ko');
        };
        window.addEventListener('languageChange', handleLanguageChange);
        return () => window.removeEventListener('languageChange', handleLanguageChange);
    }, []);

    // 현재 언어에 맞는 번역 객체
    const t = translations[language];

    // 비밀번호 가시성 상태
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 입력값 상태
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [vertification, setVertification] = useState("");
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // API 검증 완료 상태
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // 에러 메시지 상태
    const [lastNameError, setLastNameError] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [vertificationError, setVertificationError] = useState("");
    const [idError, setIdError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");

    // 정규표현식
    const nameRegex = /^[가-힣a-zA-Z]+$/; 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,}$/; 

    // 아이디 중복 확인
    const checkIdDuplicate = async () => {
        if (!id) return alert(t.alertInputId);
        try {
            const response = await axios.get(`/auth/check-username?username=${id}`);
            if (response.data === true) {
                setIdError(t.errorIdDuplicate);
                setIsIdChecked(false);
            } else {
                alert(t.alertIdAvailable);
                setIdError("");
                setIsIdChecked(true);
            }
        } catch (error) {
            alert(t.alertErrorGeneral);
        }
    };

    // 이메일 인증코드 전송
    const sendEmailCode = async () => {
        if (!emailRegex.test(email)) {
            setEmailError(t.errorEmailFormat);
            return;
        }
        try {
            await axios.post('/auth/email/send', { email: email });
            alert(t.alertEmailSent);
            setEmailError("");
        } catch (error) {
            alert(t.alertEmailError);
        }
    };

    // 이메일 인증코드 검증
    const verifyEmailCode = async () => {
        if (!vertification) return alert(t.alertInputVerifyCode);
        try {
            const response = await axios.post('/auth/email/verify', { emailCode: vertification });
            if (response.data.isVerified === true) {
                alert(t.alertEmailVerified);
                setIsEmailVerified(true);
                setVertificationError("");
            } else {
                setVertificationError(t.errorVerifyCodeMatch);
                setIsEmailVerified(false);
            }
        } catch (error) {
            alert(t.alertErrorGeneral);
        }
    };

    const handleNext = async () => {
        if (step === 1) {
            let isNameValid = true;
            if (!nameRegex.test(lastName)) { setLastNameError(t.errorLastName); isNameValid = false; }
            else setLastNameError("");

            if (!nameRegex.test(firstName)) { setFirstNameError(t.errorFirstName); isNameValid = false; }
            else setFirstNameError("");

            if (isNameValid) setStep(2);
        } else if (step === 2) {
            let isValid = true;

            if (!isEmailVerified) { alert(t.alertVerifyEmailFirst); isValid = false; }
            if (!isIdChecked) { alert(t.alertCheckIdFirst); isValid = false; }
            if (!passwordRegex.test(password)) { setPasswordError(t.errorPasswordFormat); isValid = false; }
            else setPasswordError("");

            if (password !== confirmPassword) { setConfirmError(t.errorPasswordMatch); isValid = false; }
            else setConfirmError("");

            if (isValid) {
                try {
                    const requestData = {
                        username: id,
                        email: email,
                        password: password,
                        checkPassword: confirmPassword,
                        firstName: firstName,
                        lastName: lastName
                    };
                    const response = await axios.post('/auth/join', requestData);
                    if (response.status === 201) {
                        alert(t.alertJoinComplete);
                        navigate('/login');
                    }
                } catch (error) {
                    alert(t.alertErrorGeneral);
                }
            }
        }
    };

    return (
        <div className={common.layout}>
            <div className={styles.header}>
                <button 
                    type="button"
                    className={styles.backButton} 
                    onClick={() => step === 1 ? navigate(-1) : setStep(1)}
                >
                    <span className={styles.arrow} />
                </button>
            </div>

            <div className={`${styles.contentSection} ${common.fadeIn}`}>
                {step === 1 ? (
                    <>
                        <h2 className={styles.mainTitle}>{t.signUpStep1Title}</h2>
                        <div className={styles.formGroup}>
                            <div className={styles.inputWrapper}>
                                <label className={styles.inputLabel}>{t.lastName} <span className={styles.required}>*</span></label>
                                <input type="text" className={`${styles.nameInput} ${lastNameError ? styles.inputError : ''}`}
                                    value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t.placeholderLastName} />
                                {lastNameError && <p className={styles.errorMessage}>{lastNameError}</p>}
                            </div>
                            <div className={styles.inputWrapper}>
                                <label className={styles.inputLabel}>{t.firstName} <span className={styles.required}>*</span></label>
                                <input type="text" className={`${styles.nameInput} ${firstNameError ? styles.inputError : ''}`}
                                    value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t.placeholderFirstName} />
                                {firstNameError && <p className={styles.errorMessage}>{firstNameError}</p>}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.formGroup}>
                        <h2 className={styles.mainTitle}>{t.signup}</h2>
                        
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>{t.email} <span className={styles.required}>*</span></label>
                            <div className={styles.emailInputRow}>
                                <input type="email" className={`${styles.nameInput} ${emailError ? styles.inputError : ''}`}
                                    value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.placeholderEmail} disabled={isEmailVerified} />
                                <button type="button" className={styles.duplicateCheckButton} onClick={sendEmailCode} disabled={isEmailVerified}>{t.btnSendCode}</button>
                            </div>
                            {emailError && <p className={styles.errorMessage}>{emailError}</p>}
                        </div>

                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>{t.verifyCode} <span className={styles.required}>*</span></label>
                            <div className={styles.emailInputRow}>
                                <input type="text" className={`${styles.nameInput} ${vertificationError ? styles.inputError : ''}`}
                                    value={vertification} onChange={(e) => setVertification(e.target.value)} placeholder={t.placeholderVerifyCode} disabled={isEmailVerified} />
                                <button type="button" className={styles.duplicateCheckButton} onClick={verifyEmailCode} disabled={isEmailVerified}>
                                    {isEmailVerified ? t.btnComplete : t.btnVerify}
                                </button>
                            </div>
                            {vertificationError && <p className={styles.errorMessage}>{vertificationError}</p>}
                        </div>

                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>{t.id} <span className={styles.required}>*</span></label>
                            <div className={styles.emailInputRow}>
                                <input type="text" className={`${styles.nameInput} ${idError ? styles.inputError : ''}`}
                                    value={id} onChange={(e) => {setId(e.target.value); setIsIdChecked(false);}} placeholder={t.placeholderId} />
                                <button type="button" className={styles.duplicateCheckButton} onClick={checkIdDuplicate} disabled={isIdChecked}>
                                    {isIdChecked ? t.btnIdAvailable : t.btnCheckDuplicate}
                                </button>
                            </div>
                            {idError && <p className={styles.errorMessage}>{idError}</p>}
                        </div>

                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>{t.password} <span className={styles.required}>*</span></label>
                            <div className={styles.passwordInputContainer}>
                                <input type={showPassword ? "text" : "password"} className={`${styles.nameInput} ${passwordError ? styles.inputError : ''}`}
                                    value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.placeholderPassword} />
                                <button type="button" className={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
                                    <img src={eyeIcon} alt="eye" className={showPassword ? styles.eyeActive : styles.eyeInactive} />
                                </button>
                            </div>
                            {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
                        </div>

                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>{t.confirmPassword} <span className={styles.required}>*</span></label>
                            <div className={styles.passwordInputContainer}>
                                <input type={showConfirmPassword ? "text" : "password"} className={`${styles.nameInput} ${confirmError ? styles.inputError : ''}`}
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t.placeholderConfirmPw} />
                                <button type="button" className={styles.eyeButton} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <img src={eyeIcon} alt="eye" className={showConfirmPassword ? styles.eyeActive : styles.eyeInactive} />
                                </button>
                            </div>
                            {confirmError && <p className={styles.errorMessage}>{confirmError}</p>}
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <button className={styles.nextButton} onClick={handleNext}>
                    {step === 1 ? t.next : t.signup}
                </button>
            </div>
        </div>
    );
};

export default SignUpScreen;