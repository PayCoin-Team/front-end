import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Key, ShieldCheck, RefreshCw, Home, Settings } from 'lucide-react';

/* * [수정 포인트] 
 * import 이름을 'commonStyles'에서 'common'으로 변경했습니다.
 * 이제 common.layout, common.bottomNav 등이 정상 작동합니다.
 */
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
      // API 1: 내 지갑 정보 조회
      const resUser = await fetch(`${BASE_URL}/wallet/users/me`);
      
      if (resUser.ok) {
        const userData = await resUser.json();
        setMyWalletInfo(userData);

        // API 2: 외부 지갑 주소 조회 (연동된 경우)
        const resExt = await fetch(`${BASE_URL}/wallet/external/me`);
        if (resExt.ok) {
          const extData = await resExt.json();
          setExternalWallet(extData);
        }
        
        setStep(3); // 이미 연동됨 -> 완료 화면으로
      } else {
        setStep(1); // 정보 없음 -> 연동 시작 화면으로
      }
    } catch (err) {
      console.error(err);
      setStep(1); // 에러 발생 시 초기 화면
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
      // API 3: Nonce 발급
      const res = await fetch(`${BASE_URL}/wallet?walletAddress=${walletAddress}`);
      if (!res.ok) throw new Error('Nonce 발급 실패');
      
      const data = await res.json();
      setNonce(data.nonce || `mock_nonce_${Date.now()}`); 
      setStep(2);
    } catch (err) {
      // 테스트용: 실패해도 진행하려면 주석 해제
      // setNonce('SAMPLE_NONCE_TEST'); setStep(2);
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
      // API 4: 검증 및 연동
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
    /* 여기서 common.layout을 사용하므로 import common from ... 이 필수입니다 */
    <div className={common.layout}>
      
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>지갑 연동</h1>
        <div style={{width: 24}}></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.content}>
        
        {/* STEP 1: 지갑 주소 입력 (흰색 카드) */}
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

        {/* STEP 2: 서명 인증 (녹색 카드) */}
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

        {/* STEP 3: 연동 완료 (녹색 카드) */}
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

      {/* 하단 탭바 (common 스타일 적용) */}
      <nav className={common.bottomNav}>
        <div className={common.navItem} onClick={() => navigate('/')}>
          <Home className={common.navImg} />
          <span className={common.navText}>홈</span>
        </div>
        <div className={`${common.navItem} ${common.active}`}>
          <Wallet className={common.navImg} />
          <span className={common.navText}>지갑</span>
        </div>
        <div className={common.navItem}>
          <Settings className={common.navImg} />
          <span className={common.navText}>설정</span>
        </div>
      </nav>
    </div>
  );
};

export default WalletConnect;
