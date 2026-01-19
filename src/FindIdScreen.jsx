import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // axios 설치 필요
import common from './Common.module.css';
import styles from './FindIdScreen.module.css';

const FindIdScreen = () => {
    const navigate = useNavigate();
    
    // 입력값 상태
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    
    // UI 상태 관리
    const [isFound, setIsFound] = useState(false);
    const [foundId, setFoundId] = useState(""); 
    const [message, setMessage] = useState({ text: "", isError: false }); // 에러/성공 메시지

    // 1. 이메일 인증코드 전송 (POST /auth/email/send)
    const handleSendCode = async () => {
        try {
            const response = await axios.post('/auth/email/send', { email });
            if (response.status === 200) {
                alert("인증번호가 전송되었습니다.");
                setMessage({ text: "", isError: false });
            }
        } catch (error) {
            setMessage({ text: "존재하지 않는 이메일입니다.", isError: true });
        }
    };

    // 2. 이메일 인증코드 검증 및 아이디 찾기 (POST /auth/email/verify)
    const handleVerifyAndFindId = async () => {
        try {
            // API 명세서에 따라 emailCode를 보냄
            const response = await axios.post('/auth/email/verify', { 
                emailCode: verificationCode 
            });

            // 응답 데이터에 isVerified가 true인 경우
            if (response.data.isVerified) {
                // 보통 이 단계에서 서버가 아이디 정보를 같이 주거나, 
                // 명세서에 없는 경우 response.data.username 등을 확인해야 합니다.
                setFoundId(response.data.username || "abcd1234"); // 예시 데이터
                setIsFound(true);
            } else {
                setMessage({ text: "인증번호가 일치하지 않습니다.", isError: true });
            }
        } catch (error) {
            setMessage({ text: "인증에 실패했습니다. 다시 시도해주세요.", isError: true });
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
                            {/* 이메일 입력 */}
                            <div className={styles.inputBox}>
                                <input 
                                    type="email" 
                                    placeholder="이메일 입력" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.inputField}
                                />
                                <button 
                                    className={styles.innerButton} 
                                    onClick={handleSendCode}
                                    disabled={!email}
                                >
                                    인증번호 전송
                                </button>
                            </div>
                            {message.isError && <p className={styles.errorMessage}>{message.text}</p>}

                            {/* 인증번호 입력 */}
                            <div className={styles.inputBox}>
                                <input 
                                    type="text" 
                                    placeholder="인증 번호 입력" 
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className={styles.inputField}
                                />
                                <button className={styles.innerButton} onClick={handleVerifyAndFindId}>확인</button>
                            </div>

                            <button 
                                className={`${styles.submitButton} ${(email && verificationCode) ? styles.activeButton : ''}`} 
                                onClick={handleVerifyAndFindId}
                                disabled={!email || !verificationCode}
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