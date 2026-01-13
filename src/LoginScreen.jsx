import React from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css'; // 1. 공통 CSS 임포트
import styles from './LoginScreen.module.css';

const LoginScreen = () => {
    const navigate = useNavigate();

    return (
        /* 2. 공통 레이아웃 적용 */
        <div className={common.layout}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    <span className={styles.arrow}></span>
                </button>
            </div>

            {/* 3. 내부 콘텐츠에 애니메이션 클래스(fadeIn) 추가 */}
            <div className={`${styles.content} ${common.fadeIn}`}>
                <h2 className={styles.title}>이메일로 로그인</h2>
                <div className={styles.inputGroup}>
                    <input type="email" placeholder="이메일 입력" className={styles.input} />
                    <input type="password" placeholder="비밀번호 입력" className={styles.input} />
                </div>
                <button className={styles.submitButton}>로그인 하기</button>
            </div>
        </div>
    );
};

export default LoginScreen;