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
            
            // [수정] api 인스턴스를 사용합니다. 
            // 1. 전체 URL 대신 상대 경로만 적습니다.
            // 2. withCredentials는 api.js에 설정되어 있으므로 생략 가능합니다.
            const response = await api.post('/auth/login', {
                username: userId, 
                password: password
            });

            // 헤더에서 토큰 추출 (api.js에서 이미 가로채기를 하지만, 로그인 직후 저장 로직은 유지합니다)
            const accessToken = response.headers['access'] || response.headers['Access'];

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                console.log("로그인 성공");
                navigate('/home');
            } else {
                throw new Error("NO_TOKEN");
            }

        } catch (error) {
            console.error("로그인 에러 발생:", error);
            
            let message = "";

            if (error.message === "NO_TOKEN") {
                message = t.errorNoToken || "인증 정보를 받아오지 못했습니다.";
            } else if (error.response) {
                // 401 Unauthorized 등의 에러도 여기서 처리됩니다.
                message = error.response.data?.message || t.errorLoginFail;
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