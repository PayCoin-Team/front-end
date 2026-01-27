import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './PayScreen.module.css';
import api from './utils/api'; // [필수] API 유틸 import

// 아이콘
import navHomeIcon from './assets/nav_home.svg';
import navPayIcon from './assets/nav_pay.svg';
import navUserIcon from './assets/nav_user.svg';

// 로고 파일
import usdtLogo from './component/UsdtLogo.svg';

const PayScreen = () => {
  const navigate = useNavigate();
  
  // 1:주소입력, 2:금액입력, 3:로딩(진행중), 4:완료
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  
  // 수신자 정보 및 검증 상태
  const [receiverName, setReceiverName] = useState('');
  const [isVerified, setIsVerified] = useState(false); // 주소 검증 여부

  // [API] 1. 주소 확인 핸들러
  const checkAddress = async () => {
    if (address.length < 8) {
      alert("올바른 지갑 주소를 입력해주세요.");
      return;
    }

    try {
      // API 호출: GET /wallets/verify?address=...
      const response = await api.get(`/wallets/verify`, {
        params: { address: address }
      });

      // 성공 시 (200 OK)
      // 명세서에 따르면 응답 자체가 문자열(이름)입니다.
      const name = response.data; 
      
      setReceiverName(name);
      setIsVerified(true); // 검증 완료 플래그 세팅
      
      alert(`'${name}' 님이 확인되었습니다.`);
      
    } catch (error) {
      console.error("주소 확인 실패:", error);
      setIsVerified(false);
      setReceiverName('');
      
      if (error.response && error.response.status === 404) {
        alert("존재하지 않는 주소입니다.");
      } else {
        alert("주소 확인 중 오류가 발생했습니다.");
      }
    }
  };

  // [UI] 다음 단계로 이동 (화살표 버튼)
  const goNextStep = () => {
    if (!isVerified || !receiverName) {
      // 검증되지 않았다면 검증 먼저 시도하거나 경고
      alert("먼저 '주소 확인'을 완료해주세요.");
      return;
    }
    // 검증된 상태라면 Step 2로 이동
    setStep(2);
  };

  // [API] 2. 송금 실행 핸들러
  const handleSend = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("금액을 입력해주세요.");
      return;
    }

    // 1. 먼저 로딩 화면(Step 3)을 보여줌
    setStep(3);

    try {
      // 2. API 호출: POST /history/transfer
      // Body: { targetAddress, amount }
      const response = await api.post('/history/transfer', {
        targetAddress: address,
        amount: Number(amount)
      });

      if (response.status === 201 || response.status === 200) {
        console.log("송금 성공:", response.data);

        // 3. 성공 시 시각적 효과를 위해 잠시 대기 후 완료 화면(Step 4) 이동
        setTimeout(() => {
            setStep(4);
        }, 2000); // 2초 딜레이
      }

    } catch (error) {
      console.error("송금 실패:", error);
      
      // 에러 발생 시 로딩 풀고 다시 Step 2로 복귀
      setStep(2);

      let msg = "송금 중 오류가 발생했습니다.";
      if (error.response) {
          if (error.response.status === 400) msg = "잔액이 부족하거나 자신에게 보낼 수 없습니다.";
          else if (error.response.status === 404) msg = "해당 지갑 주소를 찾을 수 없습니다.";
          else if (error.response.data && error.response.data.message) msg = error.response.data.message;
      }
      alert(msg);
    }
  };

  // 주소가 바뀌면 검증 상태 초기화
  const handleInputChange = (e) => {
      setAddress(e.target.value);
      setIsVerified(false); // 수정하면 다시 검증해야 함
  };

  return (
    <div className={common.layout}>
      
      {/* =========================================================
          [STEP 1] 주소 입력 화면
         ========================================================= */}
      {step === 1 && (
        <div className={styles.container}>
          <header className={styles.header}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
            <h2 className={styles.title}>결제</h2>
          </header>

          <div className={styles.content}>
            <div className={styles.scannerPlaceholder}>
                <div className={styles.scanIcon}>📸</div>
                <p className={styles.scanMsg}>
                    현재 웹 환경에서는<br/>
                    카메라 스캔을 지원하지 않습니다.
                </p>
                <p className={styles.scanSubMsg}>
                    아래에 지갑 주소를 직접 입력해주세요.
                </p>
            </div>
            
            <div className={styles.inputCapsule}>
                <input 
                  type="text" 
                  placeholder="지갑 주소 입력" 
                  className={styles.inputField}
                  value={address}
                  onChange={handleInputChange}
                />
                <button className={styles.miniCheckBtn} onClick={checkAddress}>주소 확인</button>
                <button className={styles.circleNextBtn} onClick={goNextStep}>›</button>
            </div>

            <p className={styles.guideText}>
              코드를 스캔하거나 지갑주소를 입력하여<br/>
              결제를 진행합니다.
            </p>
          </div>
          
          <BottomNav navigate={navigate} />
        </div>
      )}

      {/* =========================================================
          [STEP 2] 금액 입력 화면
         ========================================================= */}
      {step === 2 && (
        <div className={styles.container}>
          <header className={styles.header}>
            <button className={styles.backBtn} onClick={() => setStep(1)}>←</button>
            <h2 className={styles.title}>결제</h2>
          </header>

          <div className={styles.content} style={{alignItems: 'flex-start', textAlign: 'left'}}>
            <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '10px'}}>
              <span style={{color: '#169279'}}>{receiverName}</span> 님에게<br/>
              <span style={{fontSize:'0.9rem', color:'#888', fontWeight:'normal'}}>받는 사람이 맞으십니까?</span>
            </h1>

            <div style={{height: 40}}></div>

            <h2 style={{fontSize: '1.2rem', color: '#169279', fontWeight: 'bold', marginBottom: '10px'}}>보낼 금액</h2>
            
            <div style={{display:'flex', alignItems:'center', borderBottom: '2px solid #169279', width:'100%', paddingBottom: '5px'}}>
              <input 
                type="number" 
                placeholder="0"
                style={{flex:1, border:'none', fontSize:'2rem', fontWeight:'bold', color:'#169279', outline:'none', background:'transparent'}}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span style={{fontSize:'1.2rem', fontWeight:'bold', color:'#169279'}}>USDT</span>
            </div>

            <button 
                style={{width:'100%', backgroundColor:'#169279', color:'white', padding:'15px', borderRadius:'12px', border:'none', fontSize:'1.1rem', fontWeight:'bold', marginTop:'30px', cursor:'pointer'}}
                onClick={handleSend}
            >
              보내기
            </button>
          </div>

          <BottomNav navigate={navigate} />
        </div>
      )}

      {/* =========================================================
          [STEP 3 & 4 통합] 로딩 및 완료 화면
         ========================================================= */}
      {(step === 3 || step === 4) && (
        <div className={styles.container}>
          <div className={styles.centerContent}>
            
            {/* 로고 영역 */}
            <div className={styles.logoArea}>
               <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
               <span className={styles.brandName}>CrossPay</span>
            </div>

            {/* 상태 텍스트 */}
            <h2 className={styles.statusMessage}>
                {step === 3 ? "결제가 진행 중이에요." : "결제가 완료되었습니다."}
            </h2>

            {/* 확인 버튼 (Step 3에서는 숨김) */}
            <button 
                className={`${styles.confirmBtn} ${step === 3 ? styles.hiddenBtn : ''}`} 
                onClick={() => navigate('/home')}
                disabled={step === 3} 
            >
              확인
            </button>
          </div>

          <BottomNav navigate={navigate} />
        </div>
      )}

    </div>
  );
};

// 하단 네비게이션 컴포넌트
const BottomNav = ({ navigate }) => (
  <nav className={common.bottomNav}>
    <div className={common.navItem} onClick={() => navigate('/home')}>
        <img src={navHomeIcon} className={common.navImg} alt="홈" />
        <span className={common.navText}>홈</span>
    </div>
    <div className={`${common.navItem} ${common.active}`}>
        <img src={navPayIcon} className={common.navImg} alt="결제" />
        <span className={common.navText}>결제</span>
    </div>
    <div className={common.navItem} onClick={() => navigate('/mypage')}>
        <img src={navUserIcon} className={common.navImg} alt="마이페이지" />
        <span className={common.navText}>마이페이지</span>
    </div>
  </nav>
);

export default PayScreen;