import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './FindIdScreen.module.css';

// api 및 로고 import
import api from './utils/api'; 
import { translations } from './utils/translations'; 
import LogoIcon from './component/UsdtLogo.svg'; 

const FindIdScreen = () => {
    const navigate = useNavigate();
    const language = localStorage.getItem('appLanguage') || 'ko';
    const t = translations[language];
    
    // 상태 관리: 인증번호 관련 상태 삭제됨
    const [email, setEmail] = useState("");
    const [isFound, setIsFound] = useState(false); // 결과 화면 전환용
    const [emailError, setEmailError] = useState("");

    // 이메일 유효성 검사 정규식
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // [핵심 로직] 아이디 찾기 요청 (API 명세서: POST /auth/find-id?email=...)
    const handleFindId = async () => {
        setEmailError(""); 
        
        if (!isEmailValid) {
            setEmailError(t.errorInvalidEmail || "올바른 이메일 형식이 아닙니다.");
            return;
        }

        try {
            // ⭐ [수정] 명세서에 email이 (query) 파라미터로 명시되어 있음
            // POST 요청이지만 데이터를 Body(null)가 아닌 Query String으로 보냄
            await api.post('/auth/find-id', null, {
                params: { email: email } 
            });

            // 성공 시(200 OK) 바로 결과 화면으로 이동
            setIsFound(true); 

        } catch (error) {
            console.error(error);
            // 404: 사용자를 찾을 수 없음 등 에러 처리
            if (error.response && error.response.status === 404) {
                setEmailError(t.errorUserNotFound || "가입되지 않은 이메일입니다.");
            } else {
                setEmailError(t.alertErrorGeneral || "요청 실패. 잠시 후 다시 시도해주세요.");
            }
        }
    };

    return (
        <div className={common.layout}>
            {/* 헤더 */}
            <div className={styles.header}>
                <button 
                    type="button"
                    className={styles.backButton} 
                    onClick={() => isFound ? navigate('/login') : navigate(-1)}
                >
                    <span className={styles.arrow} />
                </button>
            </div>

            <div className={`${styles.contentSection} ${common.fadeIn}`}>
                {!isFound ? (
                    /* --- [입력 화면] 간소화됨 --- */
                    <>
                        <h2 className={styles.mainTitle}>{t.findId}</h2>
                        
                        <div className={styles.formContainer}>
                            <p className={styles.description}>
                                {t.findIdDesc || "가입 시 등록한 이메일을 입력하시면\n아이디를 메일로 보내드립니다."}
                            </p>

                            {/* 이메일 입력 (버튼 없음) */}
                            <div className={styles.inputGroup}>
                                <div className={styles.inputBox}>
                                    <input 
                                        type="email" 
                                        placeholder={t.emailPlaceholder} 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={styles.inputField}
                                    />
                                </div>
                                {emailError && <p className={styles.errorMessage}>{emailError}</p>}
                            </div>

                            {/* 아이디 찾기 버튼 */}
                            <button 
                                className={`${styles.submitButton} ${isEmailValid ? styles.activeButton : ''}`} 
                                onClick={handleFindId}
                                disabled={!isEmailValid}
                            >
                                {t.findIdBtn || "아이디 찾기"}
                            </button>
                        </div>
                    </>
                ) : (
                    /* --- [결과 화면] --- */
                    <div className={styles.resultContainer}>
                        <div className={styles.logoWrapper}>
                            <img src={LogoIcon} alt="CrossPay Logo" className={styles.logoImg} />
                            <h1 className={styles.logoText}>CrossPay</h1>
                        </div>
                        
                        <h2 className={styles.successMessage}>
                            {t.idSentToEmail || "이메일로 아이디가 전송되었습니다."}
                        </h2>

                        <button className={styles.homeButton} onClick={() => navigate('/login')}>
                            {t.goHome || "홈으로"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindIdScreen;