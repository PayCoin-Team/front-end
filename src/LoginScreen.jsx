import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css'; 
import styles from './LoginScreen.module.css';
// 1. 번역 데이터 가져오기 (경로는 파일 위치에 맞게 수정하세요)
import { translations } from './utils/translations'; 

const LoginScreen = () => {
    const navigate = useNavigate();

    // 2. 저장된 언어 설정 가져오기 (없으면 한국어 기본)
    const language = localStorage.getItem('appLanguage') || 'ko';
    // 해당 언어의 텍스트 객체 선택 (예: translations.ko)
    const t = translations[language];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault(); 

        if (!email || !password) {
            // 알림 메시지도 언어별로 하려면 translations.js에 추가해야 합니다.
            // 우선은 기존대로 둡니다.
            alert("이메일과 비밀번호를 입력해주세요.");
            return;
        }

        console.log("로그인 성공 → 홈으로 이동");
        navigate('/home');
    };

    return (
        <div className={common.layout}>
            <div className={styles.header}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate('/home')}
                >
                    <span className={styles.arrow} />
                </button>
            </div>

            <div className={`${styles.content} ${common.fadeIn}`}>
                {/* 3. 텍스트 변환 적용 (t.login 등) */}
                <h2 className={styles.title}>{t.login}</h2> 

                <form onSubmit={handleLogin} className={styles.inputGroup}>
                    <input 
                        type="email"
                        // placeholder도 변수로 변경 (기존: 이메일 입력 -> 변경: 아이디 입력)
                        placeholder={t.idPlaceholder} 
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                        type="password"
                        // placeholder 변수로 변경
                        placeholder={t.pwPlaceholder} 
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        className={styles.submitButton}
                    >
                        {t.login} {/* 버튼 텍스트 변경 */}
                    </button>
                </form>

                <div className={styles.findMenu}>
                    <span onClick={() => navigate('/findId')}>
                        {t.findId} {/* 아이디 찾기 */}
                    </span>
                    <span onClick={() => navigate('/resetPw')}>
                        {t.resetPw} {/* 비밀번호 재설정 */}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;