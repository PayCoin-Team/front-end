import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './FindIdScreen.module.css';

const FindIdScreen = () => {
    const navigate = useNavigate();
    
    // 입력값 상태
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    
    // 화면 전환 상태 (false: 찾기 입력창, true: 결과 화면)
    const [isFound, setIsFound] = useState(false);
    const [foundId, setFoundId] = useState(""); // 서버에서 받아올 아이디

    const handleFindId = () => {
        // 실제로는 여기서 API 통신을 통해 아이디를 가져옵니다.
        // 임시 데이터로 abcd1234를 설정하고 화면을 전환합니다.
        setFoundId("abcd1234");
        setIsFound(true);
    };

    return (
        <div className={common.layout}>
            {/* 상단 헤더 */}
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => isFound ? setIsFound(false) : navigate(-1)}>
                    <span className={styles.arrowIcon}>〈</span> 
                </button>
            </div>

            <div className={styles.contentSection}>
                {!isFound ? (
                    /* 1단계: 아이디 찾기 입력 화면 */
                    <>
                        <h2 className={styles.mainTitle}>아이디 찾기</h2>
                        <div className={styles.formContainer}>
                            <div className={styles.inputBox}>
                                <input 
                                    type="email" 
                                    placeholder="이메일 입력" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.inputField}
                                />
                                <button className={styles.innerButton}>인증번호 전송</button>
                            </div>
                            <div className={styles.inputBox}>
                                <input 
                                    type="text" 
                                    placeholder="인증 번호 입력" 
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className={styles.inputField}
                                />
                                <button className={styles.innerButton}>확인</button>
                            </div>
                            <button 
                                className={`${styles.submitButton} ${(email && verificationCode) ? styles.activeButton : ''}`} 
                                onClick={handleFindId}
                                disabled={!email || !verificationCode}
                            >
                                아이디 찾기
                            </button>
                        </div>
                    </>
                ) : (
                    /* 2단계: 아이디 찾기 결과 화면 (image_b7e769.png 반영) */
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