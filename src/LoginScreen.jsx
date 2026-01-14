import React, { useState } from 'react'; // 1. useState 추가
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './LoginScreen.module.css';

const LoginScreen = () => {
    const navigate = useNavigate();
    
    // 2. 입력값을 저장할 상태 변수 (없어도 이동은 가능하지만, 실제 기능을 위해 추가)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 3. 로그인 버튼 클릭 시 실행될 함수
    const handleLogin = () => {
        if (email === "" || password === "") {
            alert("이메일과 비밀번호를 입력해주세요.");
            return;
        }
        
        // 여기에 로그인 성공 로직이 들어갑니다.
        // 성공 시 /home으로 이동!
        console.log("홈으로 이동합니다.");
        navigate('/home'); 
    };

    return (
        <div className={common.layout}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    <span className={styles.arrow}></span>
                </button>
            </div>

            <div className={`${styles.content} ${common.fadeIn}`}>
                <h2 className={styles.title}>이메일로 로그인</h2>
                <div className={styles.inputGroup}>
                    {/* 4. onChange를 통해 입력값 저장 */}
                    <input 
                        type="email" 
                        placeholder="이메일 입력" 
                        className={styles.input} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="비밀번호 입력" 
                        className={styles.input} 
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                
                {/* 5. onClick={handleLogin} 추가 */}
                <button 
                    className={styles.submitButton} 
                    onClick={handleLogin}
                >
                    로그인 하기
                </button>
            </div>
        </div>
    );
};

export default LoginScreen;