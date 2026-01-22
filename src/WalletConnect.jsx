import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Key, ShieldCheck, RefreshCw, Home, Settings, ChevronLeft } from 'lucide-react';

import common from './Common.module.css';
import styles from './WalletConnect.module.css';

// ⭐ [실전] 실제 API 통신을 위해 활성화
import api from './utils/api'; 

// 문자열 -> Hex 변환 유틸리티 (TronLink 서명 필수)
const stringToHex = (str) => {
  let val = "";
  for (let i = 0; i < str.length; i++)
    val += str.charCodeAt(i).toString(16);
  return val;
};

const WalletConnect = () => {
  const navigate = useNavigate();
  
  // Step 0:로딩, 1:연동시작, 2:서명대기, 3:완료
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 데이터 상태
  const [walletAddress, setWalletAddress] = useState('');
  const [nonce, setNonce] = useState('');
  
  // 지갑 정보 상태 (서버에서 받아옴)
  const [myWalletInfo, setMyWalletInfo] = useState(null); 
  const [externalWallet, setExternalWallet] = useState(null); 

  // --- 1. 초기 로드: 서버에서 현재 상태 조회 ---
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      
      // 1. 내 서비스 계정 정보 조회 (잔액 등)
      const resUser = await api.get('/wallet/users/me');
      setMyWalletInfo(resUser.data);

      try {
        // 2. 이미 연동된 외부 지갑이 있는지 확인
        const resExt = await api.get('/wallet/external/me');
        
        if (resExt.data && resExt.data.walletAddress) {
           setExternalWallet(resExt.data);
           setStep(3); // 이미 연동됨 -> 완료 화면
        } else {
           setStep(1); // 연동 안됨 -> 시작 화면
        }
      } catch (extErr) {
        // 404 등 정보가 없으면 연동 시작 화면으로
        setStep(1);
      }

    } catch (err) {
      console.error("초기 로드 실패:", err);
      
      // [보안] 401 Unauthorized 발생 시 로그인 페이지로 이동
      if (err.response && err.response.status === 401) {
        alert("로그인 세션이 만료되었습니다.");
        navigate('/login');
        return;
      }
      setStep(1); 
    } finally {
      setLoading(false);
    }
  };

  // --- 2. TronLink 연결 요청 및 Nonce 발급 (Step 1 -> 2) ---
  const handleConnectAndRequestNonce = async () => {
    setError('');
    setLoading(true);

    try {
      // [1단계] TronLink 객체가 로드될 때까지 대기 (타이밍 이슈 해결)
      let tron = window.tronWeb;
      if (!tron) {
          for (let i = 0; i < 3; i++) {
              await new Promise(resolve => setTimeout(resolve, 500));
              if (window.tronWeb) {
                  tron = window.tronWeb;
                  break;
              }
          }
      }

      // [2단계] 연결 팝업 강제로 띄우기 (필수)
      if (window.tronLink) {
          console.log("🔗 TronLink 연결 요청...");
          const res = await window.tronLink.request({ method: 'tron_requestAccounts' });
          
          if (res.code === 200) {
              tron = window.tronWeb; // 객체 갱신
          } else if (res.code === 4001) {
             throw new Error("지갑 연결 요청을 거절하셨습니다.");
          }
      }

      // [3단계] 최종 지갑 확인
      if (!tron || !tron.defaultAddress || !tron.defaultAddress.base58) {
        throw new Error("TronLink 지갑이 감지되지 않습니다. 로그인 후 다시 시도해주세요.");
      }

      const address = tron.defaultAddress.base58;
      setWalletAddress(address);

      // [4단계] ⭐ 실제 서버에 Nonce 요청 (API)
      const response = await api.post('/wallets/nonce', { address: address });
      
      if (response.data && response.data.nonce) {
        setNonce(response.data.nonce);
        setStep(2); // 서명 단계로 이동
      } else {
        throw new Error("보안 문자열(Nonce) 발급에 실패했습니다.");
      }

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. 서명 및 서버 검증 (Step 2 -> 3) ---
  const handleSignAndVerify = async () => {
    setError('');
    setLoading(true);

    try {
      if (!window.tronWeb) throw new Error("TronLink 연결이 끊어졌습니다.");

      // 1. TronLink로 서명 요청 (Hex 변환)
      const hexNonce = stringToHex(nonce);
      
      // 팝업이 뜨고 사용자가 [Sign]을 누르면 값이 반환됨
      const signature = await window.tronWeb.trx.sign(hexNonce);
      
      // 2. ⭐ 실제 서버에 검증 요청 (API)
      await api.post('/wallets/verify', {
        address: walletAddress,
        nonce: nonce,
        signature: signature
      });

      // 3. 검증 성공 시 정보 갱신 (Step 3로 자동 이동됨)
      await checkConnection(); 

    } catch (err) {
      console.error(err);
      // 서버에서 400이나 401을 주면 검증 실패
      if (err.response) {
          setError(err.response.data.message || "서명 검증에 실패했습니다.");
      } else {
          setError("서명을 취소했거나 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={common.layout}>
      {/* 헤더 */}
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ChevronLeft size={28} color="#333" />
        </button>
        <h1 className={styles.headerTitle} style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>지갑 연동</h1>
        <div style={{ width: 28 }}></div>
      </div>

      <div className={styles.content}>
        
        {/* STEP 1: 지갑 주소 자동 감지 */}
        {step === 1 && (
          <div className={`${styles.whiteCard} ${common.fadeIn}`}>
            <div className={styles.iconCircle}>
              <Wallet size={28} />
            </div>
            <h2 className={styles.title}>TronLink 연결</h2>
            <p className={styles.subtitle}>
              아래 버튼을 눌러 TronLink 지갑을<br/>연결하고 인증을 시작합니다.
            </p>

            <button className={styles.button} onClick={handleConnectAndRequestNonce} disabled={loading}>
              {loading ? 'TronLink 확인 중...' : 'TronLink 지갑 연결하기'}
            </button>
            {error && <p className={styles.errorMsg} style={{color: '#ff4d4f', marginTop: '10px'}}>{error}</p>}
          </div>
        )}

        {/* STEP 2: 서명 요청 */}
        {step === 2 && (
          <div className={`${styles.greenCard} ${common.fadeIn}`}>
            <div className={styles.iconCircle}>
              <Key size={28} />
            </div>
            <h2 className={styles.title}>전자 서명 요청</h2>
            <p className={styles.subtitle}>
              TronLink 팝업창에서<br/>[서명] 버튼을 눌러주세요.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>지갑 주소</label>
              <input type="text" className={styles.input} value={walletAddress} readOnly />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>보안 문자열 (Nonce)</label>
              <div className={styles.nonceBox}>{nonce}</div>
            </div>

            <button className={styles.button} onClick={handleSignAndVerify} disabled={loading}>
              {loading ? '서명 검증 중...' : '서명 팝업 띄우기 & 검증'}
            </button>
            {error && <p className={styles.errorMsg} style={{color: '#fffae5', marginTop: '10px'}}>{error}</p>}
          </div>
        )}

        {/* STEP 3: 연동 완료 */}
        {step === 3 && (
          <div className={`${styles.greenCard} ${common.fadeIn}`}>
            <div className={styles.iconCircle}>
              <ShieldCheck size={32} />
            </div>
            <h2 className={styles.title}>연동 완료</h2>
            <p className={styles.subtitle}>지갑이 성공적으로 연결되었습니다.</p>

            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>서비스 잔고</span>
                <span className={styles.infoValue}>
                  {myWalletInfo?.totalBalance || myWalletInfo?.balance || '0'} USDT
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>연동된 지갑</span>
                <span className={styles.infoValue}>
                  {externalWallet?.walletAddress 
                    ? externalWallet.walletAddress.substring(0, 6) + '...' + externalWallet.walletAddress.slice(-4)
                    : '정보 없음'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>상태</span>
                <span className={styles.infoValue} style={{color: '#81E6D9'}}>Active</span>
              </div>
            </div>

            <button 
              className={styles.button} 
              onClick={() => { 
                setStep(1); 
                setWalletAddress(''); 
                setNonce(''); 
              }}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              <RefreshCw size={16} style={{marginRight:8, verticalAlign:'text-bottom'}}/>
              지갑 재연동
            </button>
          </div>
        )}

      </div>
      
      {/* 하단 네비게이션 */}
      <nav className={common.bottomNav}>
        <div className={common.navItem} onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
          <Home className={common.navImg} />
          <span className={common.navText}>홈</span>
        </div>
        <div className={`${common.navItem} ${common.active}`}>
          <Wallet className={common.navImg} />
          <span className={common.navText}>지갑</span>
        </div>
        <div className={common.navItem} onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
          <Settings className={common.navImg} />
          <span className={common.navText}>설정</span>
        </div>
      </nav>
    </div>
  );
};

export default WalletConnect;