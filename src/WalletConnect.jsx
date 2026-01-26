import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Key, ShieldCheck, RefreshCw, Home, Settings, ChevronLeft } from 'lucide-react';

import common from './Common.module.css';
import styles from './WalletConnect.module.css';
import api from './utils/api'; 

const WalletConnect = () => {
  const navigate = useNavigate();
  
  // Step 0:로딩, 1:연동시작, 2:서명대기, 3:완료
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 데이터 상태
  const [walletAddress, setWalletAddress] = useState('');
  const [nonce, setNonce] = useState('');
  
  // 지갑 정보 상태
  const [myWalletInfo, setMyWalletInfo] = useState(null); 
  const [connectedAddress, setConnectedAddress] = useState(''); 

  // --- 1. 초기 로드 ---
  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      setLoading(true);
      
      // ✅ [수정] 이제 이 API가 externalAddress를 줍니다!
      const res = await api.get('/wallets/users/me', {
          params: { _t: new Date().getTime() } // 캐시 방지
      });
      setMyWalletInfo(res.data);

      if (res.data && res.data.externalAddress) {
          // ⭐ 이미 연동된 상태라면 -> 바로 완료 화면(Step 3)으로
          console.log("이미 연동된 지갑 발견:", res.data.externalAddress);
          setConnectedAddress(res.data.externalAddress);
          setStep(3);
      } else {
          // 미연동 상태라면 -> 연동 시작 화면(Step 1)으로
          setStep(1);
      }

    } catch (err) {
      console.error("초기 로드 실패:", err);
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

  // --- 2. TronLink 연결 및 Nonce 요청 ---
  const handleConnectAndRequestNonce = async () => {
    setError('');
    setLoading(true);

    try {
      let tron = window.tronWeb;
      
      // TronLink 로드 대기
      if (!tron) {
          for (let i = 0; i < 3; i++) {
              await new Promise(resolve => setTimeout(resolve, 500));
              if (window.tronWeb) {
                  tron = window.tronWeb;
                  break;
              }
          }
      }

      if (window.tronLink) {
          try {
              const res = await window.tronLink.request({ method: 'tron_requestAccounts' });
              if (res.code === 200) tron = window.tronWeb; 
              else if (res.code === 4001) throw new Error("지갑 연결 요청을 거절하셨습니다.");
          } catch (e) {
              if (!tron || !tron.defaultAddress) throw new Error("TronLink 팝업을 확인해주세요.");
          }
      }

      if (!tron || !tron.defaultAddress || !tron.defaultAddress.base58) {
        throw new Error("TronLink 지갑이 감지되지 않습니다.");
      }

      const base58Address = tron.defaultAddress.base58;
      setWalletAddress(base58Address);

      // Nonce 요청
      const response = await api.post('/wallets/nonce', { address: base58Address });
      
      if (response.data && response.data.nonce) {
        setNonce(response.data.nonce);
        setStep(2); 
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

  // --- 3. 서명 및 서버 검증 ---
  const handleSignAndVerify = async () => {
    setError('');
    setLoading(true);

    try {
      const tron = window.tronWeb;
      if (!tron || !tron.defaultAddress) throw new Error("TronLink 연결이 끊어졌습니다.");

      const currentAddress = tron.defaultAddress.base58;
      if (currentAddress !== walletAddress) {
          throw new Error("지갑 주소가 변경되었습니다. 처음부터 다시 시도해주세요.");
      }

      // 서명 수행
      const signature = await tron.trx.signMessageV2(nonce);
      console.log("✅ 서명 완료:", signature);

      // 검증 요청
      await api.post('/wallets/verify', {
        address: walletAddress, 
        nonce: nonce, 
        signature: signature
      });

      console.log("🎉 서버 검증 통과!");

      // 완료 처리
      setConnectedAddress(walletAddress);
      setStep(3); 

    } catch (err) {
      console.error("서명 검증 에러:", err);
      if (err.response) {
          const status = err.response.status;
          const msg = err.response.data.message || JSON.stringify(err.response.data);
          if (status === 409) setError("이미 다른 계정에 등록된 지갑입니다.");
          else setError(`[서버 에러 ${status}] ${msg}`);
      } else {
          setError(err.message || "서명을 취소했거나 오류가 발생했습니다.");
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
        
        {step === 1 && (
          <div className={`${styles.whiteCard} ${common.fadeIn}`}>
            <div className={styles.iconCircle}><Wallet size={28} /></div>
            <h2 className={styles.title}>TronLink 연결</h2>
            <p className={styles.subtitle}>버튼을 눌러 연결을 시작하세요.</p>
            <button className={styles.button} onClick={handleConnectAndRequestNonce} disabled={loading}>
              {loading ? '확인 중...' : 'TronLink 지갑 연결하기'}
            </button>
            {error && <p className={styles.errorMsg} style={{color: '#ff4d4f', marginTop: '10px'}}>{error}</p>}
          </div>
        )}

        {step === 2 && (
          <div className={`${styles.greenCard} ${common.fadeIn}`}>
            <div className={styles.iconCircle}><Key size={28} /></div>
            <h2 className={styles.title}>전자 서명 요청</h2>
            <p className={styles.subtitle}>팝업창에서 [서명] 해주세요.</p>

            <div className={styles.formGroup}>
              <label className={styles.label}>지갑 주소</label>
              <input type="text" className={styles.input} value={walletAddress} readOnly />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nonce</label>
              <div className={styles.nonceBox}>{nonce}</div>
            </div>

            <button className={styles.button} onClick={handleSignAndVerify} disabled={loading}>
              {loading ? '검증 중...' : '서명 팝업 띄우기'}
            </button>
            
            {error && <div className={styles.errorBox}>{error}</div>}
          </div>
        )}

        {step === 3 && (
          <div className={`${styles.greenCard} ${common.fadeIn}`}>
            <div className={styles.iconCircle}><ShieldCheck size={32} /></div>
            <h2 className={styles.title}>연동 완료</h2>
            <p className={styles.subtitle}>성공적으로 연결되었습니다.</p>
            
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
                        {connectedAddress ? connectedAddress.slice(0,6) + '...' + connectedAddress.slice(-4) : ''}
                    </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>상태</span>
                  <span className={styles.infoValue} style={{color: '#81E6D9'}}>Active</span>
                </div>
            </div>

            <button className={styles.button} onClick={() => { setStep(1); setWalletAddress(''); setNonce(''); }}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <RefreshCw size={16} style={{marginRight:8}}/> 재연동
            </button>
          </div>
        )}
      </div>
      
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