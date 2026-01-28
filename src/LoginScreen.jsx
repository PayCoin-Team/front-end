import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './utils/api'; 
import common from './Common.module.css'; 
import styles from './LoginScreen.module.css';
import { translations } from './utils/translations'; 

const LoginScreen = () => {
    const navigate = useNavigate();
    const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'ko');

    // 실시간 언어 변경 감지
    useEffect(() => {
        const handleLanguageChange = () => {
            setLanguage(localStorage.getItem('appLanguage') || 'ko');
        };
        window.addEventListener('languageChange', handleLanguageChange);
        return () => window.removeEventListener('languageChange', handleLanguageChange);
    }, []);

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
            
            const response = await api.post('/auth/login', {
                username: userId, 
                password: password
            });

            const authHeader = response.headers['authorization'] || response.headers['Authorization'];
            let accessToken = null;

            if (authHeader) {
                if (authHeader.startsWith('Bearer ')) {
                    accessToken = authHeader.split(' ')[1];
                } else {
                    accessToken = authHeader;
                }
            }

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                navigate('/home');
            } else {
                throw new Error("NO_TOKEN");
            }

        } catch (error) {
            console.error("로그인 에러 발생:", error);
            
            let message = "";

            if (error.message === "NO_TOKEN") {
                message = t.errorNoToken || t.errorNoTokenDefault;
            } else if (error.response) {
                message = error.response.data?.message || t.errorLoginFail || t.errorLoginFailDefault;
            } else if (error.request) {
                message = t.errorNetwork || t.errorNetworkDefault;
            } else {
                message = t.errorUnknown || t.errorUnknownDefault;
            }

            alert(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={common.layout}>
            <div className={styles.header}>
                <button type="button" className={styles.backButton} onClick={() => navigate('/')}>
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