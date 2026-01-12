import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './SignUpScreen.module.css';

const SignUpScreen = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // 입력값 상태
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // 에러 메시지 상태
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");

    // 정규표현식 정의
    const nameRegex = /^[가-힣a-zA-Z]+$/; // 한글, 영문만 허용
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,}$/; // 영문+숫자+특수문자 8자 이상

    const handleNext = () => {
        if (step === 1) {
            // 이름 유효성 검사 (image_77fe23.png)
            if (!nameRegex.test(name)) {
                setNameError("올바른 이름 형식이 아닙니다.");
            } else {
                setNameError("");
                setStep(2);
            }
        } else if (step === 2) {
            // 2단계 유효성 검사 (image_7800d1.png)
            let isValid = true;

            if (!emailRegex.test(email)) {
                setEmailError("올바른 이메일 주소 형식이 아닙니다.");
                isValid = false;
            } else setEmailError("");

            if (!passwordRegex.test(password)) {
                setPasswordError("올바른 비밀번호 형식이 아닙니다.");
                isValid = false;
            } else setPasswordError("");

            if (password !== confirmPassword) {
                setConfirmError("비밀번호가 일치하지 않습니다.");
                isValid = false;
            } else setConfirmError("");

            if (isValid) {
                alert("가입이 완료되었습니다!");
                navigate('/login');
            }
        }
    };

    return (
        <div className={common.layout}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => step === 1 ? navigate(-1) : setStep(1)}>
                    <span className={styles.arrow}></span>
                </button>
            </div>

            <div className={`${styles.contentSection} ${common.fadeIn}`}>
                {step === 1 ? (
                    <>
                        <h2 className={styles.mainTitle}>이름을 알려주세요</h2>
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>이름 <span className={styles.required}>*</span></label>
                            <input 
                                type="text" 
                                className={`${styles.nameInput} ${nameError ? styles.inputError : ''}`}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="이름 입력"
                            />
                            {nameError && <p className={styles.errorMessage}>{nameError}</p>}
                        </div>
                    </>
                ) : (
                    <div className={styles.formGroup}>
                        <h2 className={styles.mainTitle}>회원가입</h2>
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>이메일 주소 <span className={styles.required}>*</span></label>
                            <input 
                                type="email" 
                                className={`${styles.nameInput} ${emailError ? styles.inputError : ''}`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {emailError && <p className={styles.errorMessage}>{emailError}</p>}
                        </div>
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>비밀번호 <span className={styles.required}>*</span></label>
                            <input 
                                type="password" 
                                className={`${styles.nameInput} ${passwordError ? styles.inputError : ''}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
                        </div>
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>비밀번호 확인 <span className={styles.required}>*</span></label>
                            <input 
                                type="password" 
                                className={`${styles.nameInput} ${confirmError ? styles.inputError : ''}`}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {confirmError && <p className={styles.errorMessage}>{confirmError}</p>}
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <button className={styles.nextButton} onClick={handleNext}>
                    {step === 1 ? "다음" : "회원가입"}
                </button>
            </div>
        </div>
    );
};

export default SignUpScreen;