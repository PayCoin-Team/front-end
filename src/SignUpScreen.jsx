import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './SignUpScreen.module.css';
import eyeIcon  from './component/eye.svg';

const SignUpScreen = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 입력값 상태
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [vertification, setVertification] = useState("");
    const [email, setEmail] = useState("");
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // 에러 메시지 상태
    const [lastNameError, setLastNameError] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [vertificationError, setVertificationError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [idError, setIdError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");

    // 정규표현식 정의
    const nameRegex = /^[가-힣a-zA-Z]+$/; // 한글, 영문만 허용
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,}$/; // 영문+숫자+특수문자 8자 이상

    const handleNext = () => {
        if (step === 1) {
            let isNameValid = true;

            if (!nameRegex.test(lastName)) {
                setLastNameError("올바른 성 형식이 아닙니다.");
                isNameValid = false;
            } else setLastNameError("");

            if (!nameRegex.test(firstName)) {
                setFirstNameError("올바른 이름 형식이 아닙니다.");
                isNameValid = false;
            } else setFirstNameError("");

            if (isNameValid) setStep(2);
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
                        <div className={styles.formGroup}>
                            {/* 성 입력 칸 (image_ae0e7f.png) */}
                            <div className={styles.inputWrapper}>
                                <label className={styles.inputLabel}>성 <span className={styles.required}>*</span></label>
                                <input 
                                    type="text" 
                                    className={`${styles.nameInput} ${lastNameError ? styles.inputError : ''}`}
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="성 입력"
                                />
                                {lastNameError && <p className={styles.errorMessage}>{lastNameError}</p>}
                            </div>

                            {/* 이름 입력 칸 (image_ae0e7f.png) */}
                            <div className={styles.inputWrapper}>
                                <label className={styles.inputLabel}>이름 <span className={styles.required}>*</span></label>
                                <input 
                                    type="text" 
                                    className={`${styles.nameInput} ${firstNameError ? styles.inputError : ''}`}
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="이름 입력"
                                />
                                {firstNameError && <p className={styles.errorMessage}>{firstNameError}</p>}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.formGroup}>
                        <h2 className={styles.mainTitle}>회원가입</h2>
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>이메일 주소 <span className={styles.required}>*</span></label>
                            <div className={styles.emailInputRow}>
                                <input 
                                    type="email" 
                                    className={`${styles.nameInput} ${emailError ? styles.inputError : ''}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="이메일 입력"
                                />
                                <button type="button" className={styles.duplicateCheckButton}>
                                    이메일 인증
                                </button>
                            </div>
                            {emailError && <p className={styles.errorMessage}>{emailError}</p>}
                        </div>

                        {/* 인증번호 입력 */}
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>인증번호 <span className={styles.required}>*</span></label>
                            <div className={styles.emailInputRow}>
                                <input 
                                    type="text" 
                                    className={`${styles.nameInput} ${emailError ? styles.inputError : ''}`}
                                    value={vertification}
                                    onChange={(e) => setVertification(e.target.value)}
                                    placeholder="인증번호 입력"
                                />
                                <button type="button" className={styles.duplicateCheckButton}>
                                    확인
                                </button>
                            </div>
                            {vertificationError && <p className={styles.errorMessage}>{vertificationError}</p>}
                        </div>

                        {/* 아이디 입력 */}
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>아이디 <span className={styles.required}>*</span></label>
                            <div className={styles.emailInputRow}>
                                <input 
                                    type="text" 
                                    className={`${styles.nameInput} ${emailError ? styles.inputError : ''}`}
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    placeholder="ID 입력"
                                />
                                <button type="button" className={styles.duplicateCheckButton}>
                                    중복 확인
                                </button>
                            </div>
                            {idError && <p className={styles.errorMessage}>{idError}</p>}
                        </div>

                        {/* 비밀번호 입력 (눈 아이콘 추가) */}
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>비밀번호 <span className={styles.required}>*</span></label>
                            <div className={styles.passwordInputContainer}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className={`${styles.nameInput} ${passwordError ? styles.inputError : ''}`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="비밀번호 입력"
                                />
                                <button 
                                    type="button" 
                                    className={styles.eyeButton}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <img 
                                        src={eyeIcon} 
                                        alt="눈 아이콘" 
                                        className={showPassword ? styles.eyeActive : styles.eyeInactive} 
                                    />
                                </button>
                            </div>
                            {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
                        </div>

                        {/* 비밀번호 확인 (눈 아이콘 추가) */}
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>비밀번호 확인 <span className={styles.required}>*</span></label>
                            <div className={styles.passwordInputContainer}>
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    className={`${styles.nameInput} ${confirmError ? styles.inputError : ''}`}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="비밀번호 재입력"
                                />
                                <button 
                                    type="button" 
                                    className={styles.eyeButton}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <img 
                                        src={eyeIcon} 
                                        alt="눈 아이콘" 
                                        className={showConfirmPassword ? styles.eyeActive : styles.eyeInactive} 
                                    />
                                </button>
                            </div>
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