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

        // [보완 1] 공백 제거 후 유효성 검사 (스페이스바만 입력하는 경우 방지)
        if (!userId.trim() || !password.trim()) {
            alert(t.alertInputAll); 
            return;
        }

        try {
            setIsLoading(true);
            
            // 서버 통신
            const response = await axios.post('http://localhost:8080/auth/login', {
                username: userId, 
                password: password
            }, { withCredentials: true });

            // 헤더에서 토큰 추출
            const accessToken = response.headers['access'] || response.headers['Access'];

            // [보완 2] 토큰이 왔는지 확실하게 검사
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                console.log("로그인 성공");
                navigate('/home');
            } else {
                // 서버 응답은 성공(200)했으나, 헤더에 토큰이 없는 치명적인 상황
                // 강제로 에러를 발생시켜 catch 블록으로 보냅니다.
                throw new Error("NO_TOKEN");
            }

        } catch (error) {
            console.error("로그인 에러 발생:", error);
            
            let message = "";

            // [보완 3] 에러 종류별 상세 처리
            if (error.message === "NO_TOKEN") {
                // 1. 토큰이 없는 경우 (CORS 설정 문제 등)
                message = t.errorNoToken || "인증 정보를 받아오지 못했습니다.";
            } else if (error.response) {
                // 2. 서버가 응답을 줬지만 에러인 경우 (401 비번틀림, 404, 500 등)
                // 서버에서 주는 메시지가 있으면 그걸 쓰고, 없으면 기본 실패 메시지
                message = error.response.data?.message || t.errorLoginFail;
            } else if (error.request) {
                // 3. 요청은 보냈는데 응답이 없는 경우 (서버 다운, 인터넷 끊김)
                message = t.errorNetwork || "서버에 연결할 수 없습니다.";
            } else {
                // 4. 기타 알 수 없는 에러
                message = t.errorUnknown || "알 수 없는 오류가 발생했습니다.";
            }

            alert(message);
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