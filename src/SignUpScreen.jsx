import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './SignUpScreen.module.css';
import eyeIcon from './component/eye.svg';

import api from './utils/api'; 
import { translations } from './utils/translations';

const SignUpScreen = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'ko');

    useEffect(() => {
        const handleLanguageChange = () => {
            setLanguage(localStorage.getItem('appLanguage') || 'ko');
        };
        window.addEventListener('languageChange', handleLanguageChange);
        return () => window.removeEventListener('languageChange', handleLanguageChange);
    }, []);

    const t = translations[language];

    // 상태 변수
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [vertification, setVertification] = useState(""); // 인증번호 입력값은 유지 (API 전송용)

    const [isIdChecked, setIsIdChecked] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    // 에러 메시지
    const [lastNameError, setLastNameError] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [idError, setIdError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");

    const nameRegex = /^[가-힣a-zA-Z]+$/; 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,}$/; 

    // 1. 아이디 중복 확인 (GET /auth/check-username)
    const checkIdDuplicate = async () => {
        setIdError(""); 
        if (!id) { setIdError(t.alertInputId); return; }
        try {
            const response = await api.get('/auth/check-username', { params: { username: id } });
            if (response.data === true) {
                setIdError(t.errorIdDuplicate);
                setIsIdChecked(false);
            } else {
                setIdError(""); 
                setIsIdChecked(true);
                alert(t.alertIdAvailable);
            }
        } catch (error) {
            setIdError(t.alertErrorGeneral);
        }
    };

    // 2. 이메일 인증코드 전송 (POST /auth/signup/send-code)
    const sendEmailCode = async () => {
        setEmailError("");
        if (!emailRegex.test(email)) { setEmailError(t.errorEmailFormat); return; }
        try {
            await api.post('/auth/signup/send-code', null, { params: { email: email } });
            alert(t.alertEmailSent);
            setIsEmailSent(true);
            setEmailError("");
        } catch (error) {
            setEmailError(t.alertEmailError || "이메일 전송에 실패했습니다.");
        }
    };

    // 3. 회원가입 및 최종 검증 (POST /auth/join)
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
            
            if (!isEmailSent) { setEmailError(t.alertSendEmailFirst || "이메일 인증을 먼저 진행해주세요."); isValid = false; }
            if (!isIdChecked) { setIdError(t.alertCheckIdFirst); isValid = false; }
            if (!passwordRegex.test(password)) { setPasswordError(t.errorPasswordFormat); isValid = false; }
            else setPasswordError("");
            if (password !== confirmPassword) { setConfirmError(t.errorPasswordMatch); isValid = false; }
            else setConfirmError("");
            if (!vertification) { alert("메일로 받은 인증번호를 입력해주세요."); isValid = false; }

            if (isValid) {
                try {
                    // API 명세서 Body 구성
                    const requestData = {
                        username: id,
                        email: email,
                        password: password,
                        checkPassword: confirmPassword, 
                        firstName: firstName,
                        lastName: lastName,
                        code: vertification // 화면에서 받은 인증번호를 여기서 백엔드로 전송
                    };

                    const response = await api.post('/auth/join', requestData);
                    
                    if (response.status === 201) {
                        alert(t.alertJoinComplete);
                        navigate('/login');
                    }
                } catch (error) {
                    if (error.response && error.response.status === 400) {
                        alert("인증번호가 일치하지 않거나 입력값이 잘못되었습니다.");
                    } else if (error.response && error.response.status === 409) {
                        alert(t.errorIdDuplicate);
                    } else {
                        alert(t.alertErrorGeneral);
                    }
                }
            }
        }
    };

    return (
        <div className={common.layout}>
            <div className={styles.header}>
                <button type="button" className={styles.backButton} onClick={() => step === 1 ? navigate(-1) : setStep(1)}>
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
                                <p className={styles.errorMessage}>{lastNameError}</p>
                            </div>
                            <div className={styles.inputWrapper}>
                                <label className={styles.inputLabel}>{t.firstName} <span className={styles.required}>*</span></label>
                                <input type="text" className={`${styles.nameInput} ${firstNameError ? styles.inputError : ''}`}
                                    value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t.placeholderFirstName} />
                                <p className={styles.errorMessage}>{firstNameError}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.formGroup}>
                        <h2 style={{marginBottom: '10px'}} className={styles.mainTitle}>{t.signup}</h2>
                        
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>{t.email} <span className={styles.required}>*</span></label>
                            <div className={styles.emailInputRow}>
                                <input type="email" className={`${styles.nameInput} ${emailError ? styles.inputError : ''}`}
                                    value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.placeholderEmail} />
                                <button type="button" className={styles.duplicateCheckButton} onClick={sendEmailCode}>{t.btnSendCode}</button>
                            </div>
                            <p className={styles.errorMessage}>{emailError}</p>
                        </div>

                        {/* ⭐ 인증번호 확인 버튼이 사라지고 입력란만 남음 (가입 버튼 클릭 시 함께 전송됨) */}
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>{t.verifyCode} <span className={styles.required}>*</span></label>
                            <input type="text" className={styles.nameInput}
                                value={vertification} onChange={(e) => setVertification(e.target.value)} placeholder={t.placeholderVerifyCode} />
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
                            <p className={styles.errorMessage}>{idError}</p>
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
                            <p className={styles.errorMessage}>{passwordError}</p>
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
                            <p className={styles.errorMessage}>{confirmError}</p>
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