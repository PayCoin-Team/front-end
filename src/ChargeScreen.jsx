import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './ChargeScreen.module.css';

// 아이콘 (경로가 다르다면 프로젝트 구조에 맞게 수정해주세요)
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import usdtLogo from './component/UsdtLogo.svg';

// 유틸 및 API
import api from './utils/api';
import { translations } from './utils/translations';

const ChargeScreen = () => {
  const navigate = useNavigate();
  
  // 언어 설정
  const language = localStorage.getItem('appLanguage') || 'ko';
  const t = translations[language] || translations['ko'];

  // 상태 관리
  const [step, setStep] = useState('input'); // input -> loading -> success
  const [amount, setAmount] = useState('');
  const [myExternalAddress, setMyExternalAddress] = useState(null); // 출금할 외부 지갑 주소
  
  // 폴링/타이머 제어용 Ref
  const timerRef = useRef(null);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
      return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
      };
  }, []);

  // 1. 초기 로드: 내 '외부 지갑' 주소 가져오기
  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        // 내 지갑 정보 조회
        const res = await api.get('/wallets/users/me');
        
        if (res.data) {
           // 외부 지갑 주소 추출 (배열이든 문자열이든 처리)
           let addr = "";
           const ext = res.data.externalAddress;
           
           if (Array.isArray(ext) && ext.length > 0) addr = ext[0];
           else if (typeof ext === 'string') addr = ext;

           if (addr) {
             setMyExternalAddress(addr);
             console.log("✅ 출금할 외부 지갑 주소:", addr);
           } else {
             alert(t.alertConnectFirst || "외부 지갑 연동이 필요합니다.");
             navigate('/home');
           }
        }
      } catch (err) {
        console.error("지갑 정보 로드 실패:", err);
        alert("지갑 정보를 불러오는데 실패했습니다.");
        navigate('/home');
      }
    };
    fetchWalletInfo();
  }, [navigate, t]);

  // [API] 2. 상태 확인 (성공 시뮬레이션)
  const pollTransactionStatus = (txId) => {
    console.log(`[Process] Transaction ID: ${txId} 처리 중...`);
    
    // 실제 블록체인 처리는 시간이 걸리므로, 1.5초 뒤에 완료 화면으로 전환하여 사용자 경험 개선
    // (실제로는 백엔드에서 PENDING 상태이지만, 사용자에게는 요청 완료를 알림)
    timerRef.current = setTimeout(() => {
        setStep('success');
    }, 1500);
  };

  // [API] 3. 충전 요청 함수 (From: 외부 -> To: 내부)
  const handleCharge = async () => {
    // 유효성 검사
    if (!amount || Number(amount) <= 0) {
      alert(t.alertValidAmount || "올바른 금액을 입력해주세요.");
      return;
    }
    if (!myExternalAddress) {
      alert("출금할 지갑 정보가 없습니다.");
      return;
    }

    try {
      setStep('loading');

      // API 호출: 외부 지갑에서 입금 요청
      const response = await api.post('/transaction/deposit', {
        amount: Number(amount),
        walletAddress: myExternalAddress 
      });

      console.log("📡 충전 요청 응답:", response.data);

      if (response.status === 201 || response.status === 200) {
        // transactionId 혹은 txId 등 백엔드가 주는 식별자 사용
        const txId = response.data.transactionId || response.data.txId || "unknown";
        
        // 요청 성공 -> 결과 처리 시작
        pollTransactionStatus(txId);
      } 

    } catch (error) {
      console.error("충전 요청 에러:", error);
      
      if (error.response) {
          const status = error.response.status;
          // 명세서 기반 에러 처리
          if (status === 400) alert(t.alertFail || "잔액이 부족하거나 송금이 차단되었습니다.");
          else if (status === 404) alert("연동된 지갑 주소를 찾을 수 없습니다.");
          else alert(`충전 요청 실패 (${status})`);
      } else {
          alert(t.alertError || "네트워크 오류가 발생했습니다.");
      }
      setStep('input'); // 실패 시 입력 화면으로 복귀
    }
  };

  return (
    <div className={common.layout}>
      
      {/* 1. 헤더 (입력 화면일 때만 표시) */}
      {step === 'input' && (
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
          <h2 className={styles.title}>{t.chargeTitle || "충전하기"}</h2>
          <div style={{ width: 24 }}></div>
        </header>
      )}

      {/* 2. 메인 콘텐츠 */}
      <div className={`${styles.container} ${common.fadeIn} ${step !== 'input' ? styles.centerMode : ''}`}>
        
        {/* STEP 1: 금액 입력 및 정보 확인 */}
        {step === 'input' && (
          <>
            <h1 className={styles.mainLabel}>{t.chargeLabel || "충전할 금액"}</h1>
            
            <div className={styles.inputWrapper}>
              <input 
                type="number" 
                placeholder={t.amountPlaceholder || "0"}
                className={styles.chargeInput}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className={styles.unit}>USDT</span>
            </div>

            {/* ⭐ [핵심] 입금 흐름 시각화 (From -> To) */}
            <div className={styles.transferInfoBox}>
                <div className={styles.transferRow}>
                    <span className={styles.transferLabel}>From (외부 지갑)</span>
                    <span className={styles.transferValue}>
                        {myExternalAddress 
                            ? `${myExternalAddress.substring(0,6)}...${myExternalAddress.slice(-4)}` 
                            : 'Loading...'}
                    </span>
                </div>
                
                {/* 화살표 */}
                <div className={styles.arrowArea}>↓</div>

                <div className={styles.transferRow}>
                    <span className={styles.transferLabel}>To (내부 지갑)</span>
                    <span className={styles.transferValue}>CrossPay Wallet</span>
                </div>
            </div>

            <div className={styles.btnWrapper}>
              <button className={styles.submitBtn} onClick={handleCharge}>
                {t.chargeBtn || "충전하기"}
              </button>
            </div>
          </>
        )}

        {/* STEP 2: 로딩 화면 */}
        {step === 'loading' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>
               {t.chargingProgress || "입금 요청 중..."}<br/>
               <span style={{fontSize: '14px', color: '#999', fontWeight: 'normal'}}>
                 {t.waitMoment || "잠시만 기다려주세요."}
               </span>
            </p>
          </div>
        )}

        {/* STEP 3: 성공 화면 */}
        {step === 'success' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>{t.chargeComplete || "충전 요청 완료!"}</p>
            <p className={styles.amountText}>+ {Number(amount).toLocaleString()} USDT</p>
            <p className={styles.descText}>
                {t.balanceUpdated || "블록체인 승인 후 잔액에 반영됩니다."}
            </p>
            
            <button className={styles.confirmBtn} onClick={() => navigate('/home')}>
              {t.confirm || "확인"}
            </button>
          </div>
        )}

      </div>
       
      {/* 3. 하단 네비게이션 (Common.module.css 사용) */}
      <nav className={common.bottomNav}>
        <div className={common.navItem} onClick={() => navigate('/home')}>
            <img src={navHomeIcon} className={common.navImg} alt="Home" />
            <span className={common.navText}>{t.home}</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/pay')}>
            <img src={navPayIcon} className={common.navImg} alt="Pay" />
            <span className={common.navText}>{t.payNav}</span>
        </div>
        {/* 마이페이지나 설정 탭 (필요 시 active 클래스 제거 가능) */}
        <div className={common.navItem} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={common.navImg} alt="MyPage" />
            <span className={common.navText}>{t.myPage}</span>
        </div>
      </nav>
       
    </div>
  );
};

export default ChargeScreen;