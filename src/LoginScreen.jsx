import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css'; 
import styles from './LoginScreen.module.css';

const LoginScreen = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault(); // form submit 기본 동작 방지

        if (!email || !password) {
            alert("이메일과 비밀번호를 입력해주세요.");
            return;
        }

        // TODO: 실제 로그인 API 연동
        console.log("로그인 성공 → 홈으로 이동");
        navigate('/home');
    };

    return (
        <div className={common.layout}>
            <div className={styles.header}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate(-1)}
                >
                    <span className={styles.arrow} />
                </button>
            </div>

            <div className={`${styles.content} ${common.fadeIn}`}>
                <h2 className={styles.title}>이메일로 로그인</h2>

                <form onSubmit={handleLogin} className={styles.inputGroup}>
                    <input 
                        type="email"
                        placeholder="이메일 입력"
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                        type="password"
                        placeholder="비밀번호 입력"
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        className={styles.submitButton}
                    >
                        로그인 하기
                    </button>
                </form>

                <div className={styles.findMenu}>
                    <span onClick={() => navigate('/findId')}>
                        아이디 찾기
                    </span>
                    <span onClick={() => navigate('/resetPw')}>
                        비밀번호 재설정
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
