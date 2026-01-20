import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import common from './Common.module.css';
import styles from './FindIdScreen.module.css';

const FindIdScreen = () => {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isFound, setIsFound] = useState(false);
    const [foundId, setFoundId] = useState(""); 
    
    // 에러 메시지 상태 분리 (이메일용, 인증번호용)
    const [emailError, setEmailError] = useState("");
    const [codeError, setCodeError] = useState("");

    // 이메일 형식 검증 (유효할 때만 전송 버튼 활성화)
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // 1. 이메일 인증코드 전송
    const handleSendCode = async () => {
        setEmailError(""); // 초기화
        try {
            const response = await axios.post('/auth/email/send', { email });
            if (response.status === 200) {
                alert("인증번호가 전송되었습니다.");
            }
        } catch (error) {
            setEmailError("존재하지 않는 이메일입니다.");
        }
    };

    // 2. 이메일 인증코드 검증 및 아이디 찾기
    const handleVerifyAndFindId = async () => {
        setCodeError(""); // 초기화
        try {
            const response = await axios.post('/auth/email/verify', { 
                emailCode: verificationCode 
            });

            if (response.data.isVerified) {
                setFoundId(response.data.username || "abcd1234");
                setIsFound(true);
            } else {
                setCodeError("인증번호가 일치하지 않습니다.");
            }
        } catch (error) {
            setCodeError("인증에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <div className={common.layout}>
            <div className={styles.header}>
                <button 
                    type="button"
                    className={styles.backButton} 
                    onClick={() => isFound ? setIsFound(false) : navigate(-1)}
                >
                    <span className={styles.arrow} />
                </button>
            </div>

            <div className={styles.contentSection}>
                {!isFound ? (
                    <>
                        <h2 className={styles.mainTitle}>아이디 찾기</h2>
                        <div className={styles.formContainer}>
                            {/* 이메일 섹션 */}
                            <div className={styles.inputGroup}>
                                <div className={styles.inputBox}>
                                    <input 
                                        type="email" 
                                        placeholder="이메일 입력" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={styles.inputField}
                                    />
                                    <button 
                                        className={`${styles.innerButton} ${isEmailValid ? styles.activeInnerButton : ''}`} 
                                        onClick={handleSendCode}
                                        disabled={!isEmailValid}
                                    >
                                        인증번호 전송
                                    </button>
                                </div>
                                {emailError && <p className={styles.errorMessage}>{emailError}</p>}
                            </div>

                            {/* 인증번호 섹션 */}
                            <div className={styles.inputGroup}>
                                <div className={styles.inputBox}>
                                    <input 
                                        type="text" 
                                        placeholder="인증 번호 입력" 
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className={styles.inputField}
                                    />
                                    <button 
                                        className={`${styles.innerButton} ${verificationCode.length > 0 ? styles.activeInnerButton : ''}`} 
                                        onClick={handleVerifyAndFindId}
                                        disabled={verificationCode.length === 0}
                                    >
                                        확인
                                    </button>
                                </div>
                                {codeError && <p className={styles.errorMessage}>{codeError}</p>}
                            </div>

                            <button 
                                className={`${styles.submitButton} ${(isEmailValid && verificationCode) ? styles.activeButton : ''}`} 
                                onClick={handleVerifyAndFindId}
                                disabled={!isEmailValid || !verificationCode}
                            >
                                아이디 찾기
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.resultContainer}>
                        <h2 className={styles.mainTitle}>회원님의 아이디는</h2>
                        <div className={styles.idResultBox}>
                            <p className={styles.foundIdText}>{foundId}</p>
                            <div className={styles.underline}></div>
                        </div>
                        <h2 className={styles.mainTitle}>입니다.</h2>
                        <button className={styles.homeButton} onClick={() => navigate('/login')}>
                            홈으로
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindIdScreen;