import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// [수정] 직접 axios를 부르는 대신, 우리가 만든 api 인스턴스를 가져옵니다.
import api from './utils/api'; 
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

        if (!userId.trim() || !password.trim()) {
            alert(t.alertInputAll); 
            return;
        }

        try {
            setIsLoading(true);
            
            // [API 호출]
            const response = await api.post('/auth/login', {
                username: userId, 
                password: password
            });

            // ⭐ [수정 핵심] API 명세서에 따라 'Authorization' 헤더 확인
            // 대소문자 구분을 피하기 위해 둘 다 확인
            const authHeader = response.headers['authorization'] || response.headers['Authorization'];
            let accessToken = null;

            if (authHeader) {
                // 보통 "Bearer [토큰]" 형식이므로 앞의 "Bearer "를 제거하고 토큰값만 추출
                if (authHeader.startsWith('Bearer ')) {
                    accessToken = authHeader.split(' ')[1];
                } else {
                    accessToken = authHeader;
                }
            }

            // 토큰이 있으면 저장하고 이동
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                console.log("로그인 성공:", accessToken); // 개발 확인용 로그
                navigate('/home');
            } else {
                // 응답은 200인데 헤더에 토큰이 없는 경우
                throw new Error("NO_TOKEN");
            }

        } catch (error) {
            console.error("로그인 에러 발생:", error);
            
            let message = "";

            if (error.message === "NO_TOKEN") {
                message = t.errorNoToken || "인증 정보를 받아오지 못했습니다. (토큰 누락)";
            } else if (error.response) {
                // 401 Unauthorized 등 서버 에러
                message = error.response.data?.message || t.errorLoginFail || "로그인 정보를 확인해주세요.";
            } else if (error.request) {
                message = t.errorNetwork || "서버에 연결할 수 없습니다.";
            } else {
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