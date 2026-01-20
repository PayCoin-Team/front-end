import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css'; 
import styles from './LoginScreen.module.css';

const LoginScreen = () => {
    const navigate = useNavigate();

    // 이메일 대신 아이디 상태 사용
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        // 유효성 검사 메시지 수정
        if (!id || !password) {
            alert("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        console.log("로그인 성공 → 홈으로 이동", { username: id });
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
                {/* 타이틀 수정 */}
                <h2 className={styles.title}>아이디로 로그인</h2>

                <form onSubmit={handleLogin} className={styles.inputGroup}>
                    {/* type을 email에서 text로, placeholder 수정 */}
                    <input 
                        type="text"
                        placeholder="아이디 입력"
                        className={styles.input}
                        value={id}
                        onChange={(e) => setId(e.target.value)}
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