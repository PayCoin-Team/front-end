import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import common from './Common.module.css';
import styles from './Withdraw.module.css'; // 이 파일의 내용을 아래 2번 내용으로 교체하세요

import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import usdtLogo from './component/UsdtLogo.svg';

const WithdrawScreen = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [step, setStep] = useState('input');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState({ balance: 0, userName: '홍길동' }); // 지갑 정보
  
  const pollingRef = useRef(null);

  // 컴포넌트 진입 시 지갑 잔액 조회
  useEffect(() => {
    fetchWalletInfo();
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  // [API] 내 지갑 정보 조회
  const fetchWalletInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('https://api.yourdomain.com/wallet/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // ResponseUserWalletDto 구조 반영
      setWallet({
        balance: response.data.balance,
        userName: response.data.userName || '홍길동' 
      });
    } catch (error) {
      console.error("지갑 정보 조회 실패:", error);
    }
  };

  // [API] 출금 상태 확인 (폴링)
  const pollWithdrawStatus = async (txId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`https://api.yourdomain.com/transaction/withdraw/${txId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const { status } = response.data; // ResponseTransactionDto

      if (status === 'COMPLETED' || status === 'SUCCESS') {
        setStep('success');
      } else if (status === 'PENDING' || status === 'PROCESSING') {
        pollingRef.current = setTimeout(() => pollWithdrawStatus(txId), 2000);
      } else if (status === 'FAILED') {
        alert('출금 처리에 실패했습니다.');
        setStep('input');
      }
    } catch (error) {
      console.error("상태 확인 오류:", error);
      setStep('input');
    }
  };

  // [API] 출금 신청
  const handleWithdraw = async () => {
    // 유효성 검사: 잔액 부족 체크
    if (!amount || Number(amount) <= 0) return alert("금액을 입력해주세요.");
    if (Number(amount) > wallet.balance) return alert("잔액이 부족합니다.");

    try {
      const token = localStorage.getItem('accessToken');
      setStep('loading');

      const response = await axios.post('https://api.yourdomain.com/transaction/withdraw', 
        { amount: Number(amount) }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.status === 201 || response.status === 200) {
        pollWithdrawStatus(response.data.transactionId);
      }
    } catch (error) {
      alert('출금 요청 중 오류가 발생했습니다.');
      setStep('input');
    }
  };

  return (
    <div className={common.layout}>
      {/* 1. 컨텐츠 영역 */}
      <div className={`${styles.container} ${common.fadeIn} ${step !== 'input' ? styles.centerMode : ''}`}>
        {step === 'input' && (
          <>
            <header className={styles.header}>
              <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
              <h2 className={styles.title}>출금</h2>
              <div style={{ width: 44 }}></div>
            </header>

            <div className={styles.mainLabel}>
              <p>현재 <strong>{wallet.userName}</strong>님의 잔고는</p>
              <span>{wallet.balance.toLocaleString()} USDT</span>
            </div>

            <div className={styles.inputWrapper}>
              <input 
                type="number" 
                className={styles.chargeInput}
                placeholder="금액 입력"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className={styles.unit}>USDT</span>
            </div>

            <div className={styles.btnWrapper}>
              <button 
                className={styles.submitBtn}
                onClick={handleWithdraw}
                disabled={!amount || Number(amount) > wallet.balance}
              >
                출금
              </button>
            </div>
          </>
        )}

        {/* 로딩 및 성공 화면 생략 (styles.statusContent 등 사용) */}
      </div>

      {/* 2. 하단 네비게이션 - common 클래스 사용으로 통일 */}
      <nav className={common.bottomNav}>
        <div className={common.navItem} onClick={() => navigate('/home')}>
          <img src={navHomeIcon} className={common.navImg} alt="홈" />
          <span className={common.navText}>홈</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/pay')}>
          <img src={navPayIcon} className={common.navImg} alt="결제" />
          <span className={common.navText}>결제</span>
        </div>
        <div className={`${common.navItem} ${common.active}`}>
          <img src={navUserIcon} className={common.navImg} alt="마이페이지" />
          <span className={common.navText}>마이페이지</span>
        </div>
      </nav>
    </div>
  );
};

export default WithdrawScreen;