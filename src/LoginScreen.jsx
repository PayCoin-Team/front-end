import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import common from './Common.module.css'; 
import styles from './LoginScreen.module.css';
import { translations } from './utils/translations'; 

const LoginScreen = () => {
    const navigate = useNavigate();
    const language = localStorage.getItem('appLanguage') || 'ko';
    const t = translations[language];

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault(); 

        // 1. 유효성 검사: 아이디/비밀번호 미입력 시
        if (!userId || !password) {
            alert(t.alertInputAll); // 신규 추가 필요
            return;
        }

        try {
            setIsLoading(true);
            
            // 2. 서버 통신 (아이디 로그인 / Access Token: Header / Refresh Token: Cookie)
            const response = await axios.post('http://localhost:8080/auth/login', {
                username: userId, 
                password: password
            }, { withCredentials: true });

            // 3. 헤더에서 'access' 토큰 추출
            const accessToken = response.headers['access'] || response.headers['Access'];

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                console.log("로그인 성공");
                navigate('/home');
            }
        } catch (error) {
            console.error("로그인 에러:", error);
            // 서버 에러 메시지가 있으면 우선 출력, 없으면 다국어 공통 에러 출력
            const errorMsg = error.response?.data?.message || t.errorLoginFail; // 신규 추가 필요
            alert(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={common.layout}>
            <div className={styles.header}>
                <button type="button" className={styles.backButton} onClick={() => navigate('/home')}>
                    <span className={styles.arrow} />
                </button>
            </div>

            <div className={`${styles.content} ${common.fadeIn}`}>
                <h2 className={styles.title}>{t.login}</h2> 

                <form onSubmit={handleLogin} className={styles.inputGroup}>
                    <input 
                        type="text" 
                        placeholder={t.idPlaceholder} 
                        className={styles.input}
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        disabled={isLoading}
                    />
                    <input 
                        type="password" 
                        placeholder={t.pwPlaceholder} 
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />

                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? "..." : t.login}
                    </button>
                </form>

                <div className={styles.findMenu}>
                    <span onClick={() => navigate('/findId')}>{t.findId}</span>
                    <span onClick={() => navigate('/resetPw')}>{t.resetPw}</span>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;