import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './Withdraw.module.css';

import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import UsdtLogo from './component/UsdtLogo.svg';

const Withdraw = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState(1);

    const usdtBalance = 200;
    const krwBalance = "291,714.85";

    // 출금 가능 여부 확인 로직
    const isInvalidAmount = !amount || Number(amount) <= 0 || Number(amount) >usdtBalance;

    const handleNext = () => {
        if(isInvalidAmount) return;
        setStep(2);
    };


    return (
        <div className={common.layout}>
            {step === 1 ? (
                /* STEP 1: 출금 입력 화면 */
                <div className={`${styles.contentWrapper} ${common.fadeIn}`}>
                    <header className={styles.header}>
                        <button className={styles.backButton} onClick={() => navigate(-1)}>
                            <span className={styles.arrow}></span>
                        </button>
                        <h1 className={styles.headerTitle}>출금</h1>
                    </header>

                    <div className={styles.content}>
                        <div className={styles.balanceSummary}>
                            <div className={styles.balanceRow}>
                                <span className={styles.balanceText}>현재 <strong>홍길동</strong>님의 잔고는</span>
                                <span className={styles.usdtHighlight}>{usdtBalance} USDT</span>
                            </div>
                            <p className={styles.krwEquivalent}>⇆ {krwBalance} KRW</p>
                        </div>

                        <div className={styles.inputContainer}>
                            <input
                                type="number"
                                className={styles.amountInput}
                                placeholder='금액 입력'
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <span className={styles.unitText}>USDT</span>
                        </div>

                        <div className={styles.buttonWrapper}>
                            <button 
                                className={isInvalidAmount ? styles.disabledButton : styles.withdrawButton}
                                onClick={handleNext}
                                disabled={isInvalidAmount}
                            >
                                출금
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* STEP 2: 출금 완료 화면 (image_f92f23.png 반영) */
                <div className={`${styles.successWrapper} ${common.fadeIn}`}>
                    <div className={styles.successContent}>
                        <div className={styles.brandArea}>
                            <img src={UsdtLogo} className={styles.usdtLogoImg} alt="USDT" />
                            <h2 className={styles.brandTitle}>CrossPay</h2>
                        </div>
                        <p className={styles.successMessage}>출금이 완료되었습니다.</p>
                        
                        <button className={styles.confirmButton} onClick={() => navigate('/home')}>
                            확인
                        </button>
                    </div>
                </div>
            )}

            {/* 하단 네비게이션 */}
            <nav className={styles.bottomNav}>
                <div className={styles.navItem} onClick={() => navigate('/home')}>
                    <img src={navHomeIcon} className={styles.navImg} alt="홈" />
                    <span className={styles.navText}>홈</span>
                </div>
                <div className={styles.navItem} onClick={() => navigate('/pay')}>
                    <img src={navPayIcon} className={styles.navImg} alt="결제" />
                    <span className={styles.navText}>결제</span>
                </div>
                <div className={styles.navItem}>
                    <img src={navUserIcon} className={styles.navImg} alt="마이페이지" />
                    <span className={styles.navText}>마이페이지</span>
                </div>
            </nav>
        </div>
    );
};

export default Withdraw;