import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import common from './Common.module.css';
import styles from './SignUpScreen.module.css';
import eyeIcon from './component/eye.svg';

const SignUpScreen = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // 비밀번호 가시성 상태
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 입력값 상태
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [vertification, setVertification] = useState(""); // 이메일 인증코드
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

    // 1. 아이디 중복 확인 (GET /auth/check-username)
    const checkIdDuplicate = async () => {
        if (!id) return alert("아이디를 입력해주세요.");
        try {
            const response = await axios.get(`/auth/check-username?username=${id}`);
            if (response.data === true) { // 중복되면 true 리턴
                setIdError("이미 사용 중인 아이디입니다.");
                setIsIdChecked(false);
            } else {
                alert("사용 가능한 아이디입니다.");
                setIdError("");
                setIsIdChecked(true);
            }
        } catch (error) {
            alert("아이디 중복 확인 중 오류가 발생했습니다.");
        }
    };

    // 2. 이메일 인증코드 전송 (POST /auth/email/send)
    const sendEmailCode = async () => {
        if (!emailRegex.test(email)) {
            setEmailError("올바른 이메일 형식이 아닙니다.");
            return;
        }
        try {
            await axios.post('/auth/email/send', { email: email });
            alert("인증코드가 발송되었습니다.");
            setEmailError("");
        } catch (error) {
            alert("이메일 발송에 실패했습니다.");
        }
    };

    // 3. 이메일 인증코드 검증 (POST /auth/email/verify)
    const verifyEmailCode = async () => {
        if (!vertification) return alert("인증번호를 입력해주세요.");
        try {
            const response = await axios.post('/auth/email/verify', { emailCode: vertification });
            if (response.data.isVerified === true) {
                alert("이메일 인증이 완료되었습니다.");
                setIsEmailVerified(true);
                setVertificationError("");
            } else {
                setVertificationError("인증번호가 일치하지 않습니다.");
                setIsEmailVerified(false);
            }
        } catch (error) {
            alert("인증 확인 중 오류가 발생했습니다.");
        }
    };

    // 4. 다음 단계 및 최종 회원가입 (POST /auth/join)
    const handleNext = async () => {
        if (step === 1) {
            let isNameValid = true;
            if (!nameRegex.test(lastName)) { setLastNameError("올바른 성 형식이 아닙니다."); isNameValid = false; }
            else setLastNameError("");

            if (!nameRegex.test(firstName)) { setFirstNameError("올바른 이름 형식이 아닙니다."); isNameValid = false; }
            else setFirstNameError("");

            if (isNameValid) setStep(2);
        } else if (step === 2) {
            let isValid = true;

            if (!isEmailVerified) { alert("이메일 인증을 완료해주세요."); isValid = false; }
            if (!isIdChecked) { alert("아이디 중복 확인을 해주세요."); isValid = false; }
            if (!passwordRegex.test(password)) { setPasswordError("올바른 비밀번호 형식이 아닙니다."); isValid = false; }
            else setPasswordError("");

            if (password !== confirmPassword) { setConfirmError("비밀번호가 일치하지 않습니다."); isValid = false; }
            else setConfirmError("");

            if (isValid) {
                try {
                    // RequestUserDto 구조에 맞춤
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
                        alert("가입이 완료되었습니다!");
                        navigate('/login');
                    }
                } catch (error) {
                    alert("회원가입 처리 중 오류가 발생했습니다.");
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
                        <h2 className={styles.mainTitle}>이름을 알려주세요</h2>
                        <div className={styles.formGroup}>
                            <div className={styles.inputWrapper}>
                                <label className={styles.inputLabel}>성 <span className={styles.required}>*</span></label>
                                <input type="text" className={`${styles.nameInput} ${lastNameError ? styles.inputError : ''}`}
                                    value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="성 입력" />
                                {lastNameError && <p className={styles.errorMessage}>{lastNameError}</p>}
                            </div>
                            <div className={styles.inputWrapper}>
                                <label className={styles.inputLabel}>이름 <span className={styles.required}>*</span></label>
                                <input type="text" className={`${styles.nameInput} ${firstNameError ? styles.inputError : ''}`}
                                    value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="이름 입력" />
                                {firstNameError && <p className={styles.errorMessage}>{firstNameError}</p>}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.formGroup}>
                        <h2 className={styles.mainTitle}>회원가입</h2>
                        
                        {/* 이메일 주소 */}
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>이메일 주소 <span className={styles.required}>*</span></label>
                            <div className={styles.emailInputRow}>
                                <input type="email" className={`${styles.nameInput} ${emailError ? styles.inputError : ''}`}
                                    value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일 입력" disabled={isEmailVerified} />
                                <button type="button" className={styles.duplicateCheckButton} onClick={sendEmailCode} disabled={isEmailVerified}>인증코드 전송</button>
                            </div>
                            {emailError && <p className={styles.errorMessage}>{emailError}</p>}
                        </div>

                        {/* 인증번호 */}
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>인증번호 <span className={styles.required}>*</span></label>
                            <div className={styles.emailInputRow}>
                                <input type="text" className={`${styles.nameInput} ${vertificationError ? styles.inputError : ''}`}
                                    value={vertification} onChange={(e) => setVertification(e.target.value)} placeholder="인증번호 입력" disabled={isEmailVerified} />
                                <button type="button" className={styles.duplicateCheckButton} onClick={verifyEmailCode} disabled={isEmailVerified}>
                                    {isEmailVerified ? "완료" : "확인"}
                                </button>
                            </div>
                            {vertificationError && <p className={styles.errorMessage}>{vertificationError}</p>}
                        </div>

                        {/* 아이디 */}
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>아이디 <span className={styles.required}>*</span></label>
                            <div className={styles.emailInputRow}>
                                <input type="text" className={`${styles.nameInput} ${idError ? styles.inputError : ''}`}
                                    value={id} onChange={(e) => {setId(e.target.value); setIsIdChecked(false);}} placeholder="ID 입력" />
                                <button type="button" className={styles.duplicateCheckButton} onClick={checkIdDuplicate} disabled={isIdChecked}>
                                    {isIdChecked ? "사용가능" : "중복 확인"}
                                </button>
                            </div>
                            {idError && <p className={styles.errorMessage}>{idError}</p>}
                        </div>

                        {/* 비밀번호 */}
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>비밀번호 <span className={styles.required}>*</span></label>
                            <div className={styles.passwordInputContainer}>
                                <input type={showPassword ? "text" : "password"} className={`${styles.nameInput} ${passwordError ? styles.inputError : ''}`}
                                    value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력" />
                                <button type="button" className={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
                                    <img src={eyeIcon} alt="eye" className={showPassword ? styles.eyeActive : styles.eyeInactive} />
                                </button>
                            </div>
                            {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
                        </div>

                        {/* 비밀번호 확인 */}
                        <div className={styles.inputWrapper}>
                            <label className={styles.inputLabel}>비밀번호 확인 <span className={styles.required}>*</span></label>
                            <div className={styles.passwordInputContainer}>
                                <input type={showConfirmPassword ? "text" : "password"} className={`${styles.nameInput} ${confirmError ? styles.inputError : ''}`}
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="비밀번호 재입력" />
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
                    {step === 1 ? "다음" : "회원가입"}
                </button>
            </div>
        </div>
    );
};

export default SignUpScreen;