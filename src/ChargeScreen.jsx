import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './ChargeScreen.module.css';

// 아이콘
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';
import usdtLogo from './component/UsdtLogo.svg';

// 유틸 및 API
import api from './utils/api';
import { translations } from './utils/translations';

// =========================================================
// 🔧 [최종 확정 설정] 이 주소 조합이 정답입니다.
// =========================================================

// 1. USDT 컨트랙트 (Base58 포맷)
const USDT_CONTRACT_ADDRESS = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf";

// 2. 서버 지갑 주소 (Hex 포맷)
const SERVER_WALLET_ADDRESS = "410d9dc139bfb641d58517da42876ec4022cce7865";


const ChargeScreen = () => {
  const navigate = useNavigate();
  const language = localStorage.getItem('appLanguage') || 'ko';
  const t = translations[language] || translations['ko'];

  const [step, setStep] = useState('input');
  const [amount, setAmount] = useState('');
  const [myExternalAddress, setMyExternalAddress] = useState(null); 
  
  const pollingTimerRef = useRef(null);
  const startTimeRef = useRef(null); 

  useEffect(() => {
      return () => {
          if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
      };
  }, []);

  // [초기 로드]
  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const res = await api.get('/wallets/users/me');
        if (res.data) {
           let addr = "";
           const ext = res.data.externalAddress;
           if (Array.isArray(ext) && ext.length > 0) addr = ext[0];
           else if (typeof ext === 'string') addr = ext;

           if (addr) {
             setMyExternalAddress(addr);
           } else {
             alert(t.alertConnectFirst || "외부 지갑 연동이 필요합니다.");
             navigate('/home');
           }
        }
      } catch (err) {
        console.error("지갑 정보 로드 실패:", err);
        navigate('/home');
      }
    };
    fetchWalletInfo();
  }, [navigate, t]);

  // [API] 상태 확인 (GET 요청: /transaction/deposit/{id}/{txHash})
  const pollTransactionStatus = async (transactionId, txHash) => {
    const now = Date.now();
    
    // 60초 타임아웃
    if (now - startTimeRef.current > 60000) {
        alert("입금 확인이 지연되고 있습니다.\n잠시 후 거래 내역을 확인해주세요.");
        setStep('input'); 
        return;
    }

    try {
        // 백엔드 명세서에 맞춘 경로 파라미터 방식
        const response = await api.get(`/transaction/deposit/${transactionId}/${txHash}`);
        const { status } = response.data;

        console.log("Polling Status:", status);

        if (status === 'COMPLETED') {
            setStep('success');
        } else if (status === 'FAILED') {
            alert("입금 처리에 실패했습니다.");
            setStep('input');
        } else {
            // 아직 완료 안 됐으면 3초 뒤 재시도
            pollingTimerRef.current = setTimeout(() => {
                pollTransactionStatus(transactionId, txHash);
            }, 3000);
        }
    } catch (error) {
        console.error("Polling Error:", error);
        // 에러 발생 시에도 잠시 후 재시도
        pollingTimerRef.current = setTimeout(() => {
            pollTransactionStatus(transactionId, txHash);
        }, 3000);
    }
  };

  const handleCharge = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("올바른 금액을 입력해주세요.");
      return;
    }
    
    if (!window.tronWeb || !window.tronWeb.ready) {
        alert("TronLink 지갑이 연결되지 않았습니다.");
        return;
    }

    try {
      setStep('loading');

      // =========================================================
      // 📡 [STEP 1] 서버에 입금 신청 (POST)
      // =========================================================
      console.log("1. 입금 신청 시작 (POST)...");
      
      const initResponse = await api.post('/transaction/deposit', {
        amount: Number(amount),
        walletAddress: myExternalAddress
      });

      // 서버로부터 주문 번호(transactionId) 획득
      const transactionId = initResponse.data.transactionId;
      console.log("✅ 입금 신청 완료. Transaction ID:", transactionId);

      if (!transactionId) {
        throw new Error("서버에서 거래 ID를 받지 못했습니다.");
      }


      // =========================================================
      // 🚀 [STEP 2] 블록체인 전송 (확정된 주소 사용)
      // =========================================================
      console.log("2. 블록체인 전송 시작...");

      const amountInSun = BigInt(Math.floor(Number(amount) * 1_000_000)).toString();
      const issuerBase58 = window.tronWeb.defaultAddress.base58;

      // ⚠️ 사용자님 확정 설정: USDT(Base58) + Server(Hex)
      const transactionObj = await window.tronWeb.transactionBuilder.triggerSmartContract(
        USDT_CONTRACT_ADDRESS, // Base58
        "transfer(address,uint256)", 
        { feeLimit: 100_000_000 }, 
        [
          { type: 'address', value: SERVER_WALLET_ADDRESS }, // Hex
          { type: 'uint256', value: amountInSun }
        ],
        issuerBase58 
      );

      if (!transactionObj.result || !transactionObj.result.result) {
        throw new Error("블록체인 거래 생성 실패");
      }

      const signedTx = await window.tronWeb.trx.sign(transactionObj.transaction);
      if (!signedTx.signature) throw new Error("서명이 취소되었습니다.");

      const broadcast = await window.tronWeb.trx.sendRawTransaction(signedTx);
      if (!broadcast.result) throw new Error("전송 실패 (네트워크 오류)");

      const txHash = broadcast.txid; 
      console.log("✅ 전송 성공! TxHash:", txHash);


      // =========================================================
      // 📡 [STEP 3] 입금 확인 요청 (GET)
      // =========================================================
      console.log("3. 입금 확인 요청 (Polling)...");

      startTimeRef.current = Date.now();
      // transactionId와 txHash를 함께 전달하여 확인
      pollTransactionStatus(transactionId, txHash);

    } catch (error) {
      console.error("에러 발생:", error);
      let msg = "오류가 발생했습니다.";
      
      if (error.response && error.response.data) {
          msg = JSON.stringify(error.response.data);
      } else if (typeof error === 'string') {
          msg = error;
      } else if (error.message) {
          msg = error.message;
      }

      if (msg.includes('cancelled') || msg.includes('취소')) {
          alert("전송을 취소하셨습니다.");
      } else {
          alert(`오류: ${msg}`);
      }
      setStep('input');
    }
  };

  return (
    <div className={common.layout}>
      {step === 'input' && (
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
          <h2 className={styles.title}>{t.chargeTitle || "충전하기"}</h2>
          <div style={{ width: 24 }}></div>
        </header>
      )}

      <div className={`${styles.container} ${common.fadeIn} ${step !== 'input' ? styles.centerMode : ''}`}>
        {step === 'input' && (
          <>
            <h1 className={styles.mainLabel}>{t.chargeLabel || "충전할 금액"}</h1>
            <div className={styles.inputWrapper}>
              <input 
                type="number" 
                min="0"  // 👈 [수정 1] 스피너가 0 이하로 내려가지 않도록 설정
                placeholder="0"
                className={styles.chargeInput}
                value={amount}
                onChange={(e) => {
                    const val = e.target.value;
                    // 👈 [수정 2] 값이 없거나(지울 때), 0보다 크거나 같을 때만 입력 허용
                    if (val === '' || Number(val) >= 0) {
                        setAmount(val);
                    }
                }}
              />
              <span className={styles.unit}>USDT</span>
            </div>

            <div className={styles.transferInfoBox}>
                <div className={styles.transferRow}>
                    <span className={styles.transferLabel}>From</span>
                    <span className={styles.transferValue}>
                        {myExternalAddress ? `${myExternalAddress.substring(0,6)}...` : 'Loading...'}
                    </span>
                </div>
                <div className={styles.arrowArea}>↓</div>
                <div className={styles.transferRow}>
                    <span className={styles.transferLabel}>To</span>
                    <span className={styles.transferValue}>Server Wallet</span>
                </div>
            </div>

            <div className={styles.btnWrapper}>
              <button className={styles.submitBtn} onClick={handleCharge}>
                {t.chargeBtn || "충전하기"}
              </button>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>충전 진행 중입니다...<br/><span style={{fontSize:'14px', color:'#999'}}>지갑에서 서명을 완료해주세요.</span></p>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.statusContent}>
            <div className={styles.logoArea}>
              <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
            </div>
            <p className={styles.statusText}>충전 완료!</p>
            <p className={styles.amountText}>+ {Number(amount).toLocaleString()} USDT</p>
            <button className={styles.confirmBtn} onClick={() => navigate('/home')}>확인</button>
          </div>
        )}
      </div>

      <nav className={common.bottomNav}>
        <div className={common.navItem} onClick={() => navigate('/home')}>
            <img src={navHomeIcon} className={common.navImg} alt="Home" />
            <span className={common.navText}>{t.home}</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/pay')}>
            <img src={navPayIcon} className={common.navImg} alt="Pay" />
            <span className={common.navText}>{t.payNav}</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/mypage')}>
            <img src={navUserIcon} className={common.navImg} alt="MyPage" />
            <span className={common.navText}>{t.myPage}</span>
        </div>
      </nav>
    </div>
  );
};

export default ChargeScreen;