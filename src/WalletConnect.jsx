import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. 필요한 아이콘들 모두 import
import { Wallet, Key, ShieldCheck, RefreshCw, Home, Settings, ChevronLeft } from 'lucide-react';

import common from './Common.module.css';
import styles from './WalletConnect.module.css';

// 실제 백엔드 주소로 변경 필요
const BASE_URL = '/api'; 

const WalletConnect = () => {
  const navigate = useNavigate();

  // Step 0: 로딩, 1: 주소입력, 2: 서명, 3: 완료
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 데이터 상태
  const [walletAddress, setWalletAddress] = useState('');
  const [nonce, setNonce] = useState('');
  const [signature, setSignature] = useState('');
  
  // API 응답 데이터 저장소
  const [myWalletInfo, setMyWalletInfo] = useState(null); 
  const [externalWallet, setExternalWallet] = useState(null); 

  // --- 1. 초기 로드: 내 지갑 정보 조회 ---
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      const resUser = await fetch(`${BASE_URL}/wallet/users/me`);
      
      if (resUser.ok) {
        const userData = await resUser.json();
        setMyWalletInfo(userData);
        const resExt = await fetch(`${BASE_URL}/wallet/external/me`);
        if (resExt.ok) {
          const extData = await resExt.json();
          setExternalWallet(extData);
        }
        setStep(3); 
      } else {
        setStep(1); 
      }
    } catch (err) {
      console.error(err);
      setStep(1); 
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Nonce 요청 ---
  const handleRequestNonce = async () => {
    if (!walletAddress) return setError('지갑 주소를 입력해주세요.');
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/wallet?walletAddress=${walletAddress}`);
      if (!res.ok) throw new Error('Nonce 발급 실패');
      
      const data = await res.json();
      setNonce(data.nonce || `mock_nonce_${Date.now()}`); 
      setStep(2);
    } catch (err) {
      setError('서버 연결 실패: 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. 연동 검증 ---
  const handleVerify = async () => {
    if (!signature) return setError('서명 값을 입력해주세요.');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/wallet/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletAddress,
          nonce: nonce,
          signature: signature
        })
      });

      if (res.status === 201 || res.status === 200) {
        await checkConnection(); 
      } else {
        throw new Error('서명 검증에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const mockSign = () => setSignature(`signed_${nonce}_key`);

  return (

    <div className={common.layout}>
      
      {/* --- 헤더 --- */}
      <div 
        className={styles.header} 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px'
        }}
      >
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChevronLeft size={28} color="#333" />
        </button>

        <h1 
          className={styles.headerTitle} 
          style={{ 
            margin: 0, 
            textAlign: 'center', 
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
        >
          지갑 연동
        </h1>
        <div style={{ width: 28 }}></div>
      </div>

      {/* --- 메인 콘텐츠 --- */}
      <div className={styles.content}>
        
        {/* STEP 1: 지갑 주소 입력 */}
        {step === 1 && (
          <div className={`${styles.whiteCard} ${common.fadeIn}`}>
            <div className={styles.iconCircle}>
              <Wallet size={28} />
            </div>
            <h2 className={styles.title}> 지갑 연동 </h2>
            <p className={styles.subtitle}>
              서비스 이용을 위해<br/>보유하신 지갑 주소를 입력해주세요.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>지갑 주소 (Wallet Address)</label>
              <input 
                type="text" 
                className={styles.input}
                placeholder="T..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>

            <button className={styles.button} onClick={handleRequestNonce} disabled={loading}>
              {loading ? '처리 중...' : '다음 단계'}
            </button>
            {error && <p className={styles.errorMsg} style={{color: 'red', background:'none'}}>{error}</p>}
          </div>
        )}

        {/* STEP 2: 서명 인증 */}
        {step === 2 && (
          <div className={`${styles.greenCard} ${common.fadeIn}`}>
            <div className={styles.iconCircle}>
              <Key size={28} />
            </div>
            <h2 className={styles.title}>본인 인증</h2>
            <p className={styles.subtitle}>
              아래 보안 문자열(Nonce)을<br/>지갑의 개인키로 서명해주세요.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>보안 문자열 (Nonce)</label>
              <div className={styles.nonceBox}>{nonce}</div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>서명 값 (Signature)</label>
              <input 
                type="text" 
                className={styles.input}
                placeholder="서명 결과를 입력하세요"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
              <button onClick={mockSign} className={styles.textBtn}>
                (테스트) 자동 서명 생성
              </button>
            </div>

            <button className={styles.button} onClick={handleVerify} disabled={loading}>
              {loading ? '검증 중...' : '연동 완료하기'}
            </button>
            {error && <p className={styles.errorMsg}>{error}</p>}
          </div>
        )}

        {/* STEP 3: 연동 완료 */}

        {step === 3 && (
          <div className={`${styles.greenCard} ${common.fadeIn}`}>
            <div className={styles.iconCircle}>
              <ShieldCheck size={32} />
            </div>
            <h2 className={styles.title}>연동 완료</h2>
            <p className={styles.subtitle}>
              지갑이 성공적으로 연결되었습니다.
            </p>

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
                setStep(1); setWalletAddress(''); setNonce(''); setSignature('');
              }}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              <RefreshCw size={16} style={{marginRight:8, verticalAlign:'text-bottom'}}/>
              지갑 재연동
            </button>
          </div>
        )}

      </div>
      {/* --- 하단 네비게이션 바 (Home과 동일하게 수정) --- */}
      <nav className={common.bottomNav}>
        {/* 1. 홈 탭: /home 으로 이동 */}
        <div 
          className={common.navItem} 
          onClick={() => navigate('/home')}
          style={{ cursor: 'pointer' }}
        >
          <Home className={common.navImg} />
          <span className={common.navText}>홈</span>
        </div>

        {/* 2. 지갑 탭: 현재 화면이므로 active 클래스 추가 */}
        <div 
          className={`${common.navItem} ${common.active}`}
          // onClick={() => navigate('/wallet')} // 필요하다면 새로고침 개념으로 추가
        >
          <Wallet className={common.navImg} />
          <span className={common.navText}>지갑</span>
        </div>

        {/* 3. 설정 탭: /settings 로 이동 */}
        <div 
          className={common.navItem} 
          onClick={() => navigate('/settings')}
          style={{ cursor: 'pointer' }}
        >
          <Settings className={common.navImg} />
          <span className={common.navText}>설정</span>
        </div>
      </nav>

    </div>
  );
};

export default WalletConnect;

