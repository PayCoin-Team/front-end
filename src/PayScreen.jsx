import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import common from './Common.module.css';
import styles from './PayScreen.module.css';

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
  const [receiverName, setReceiverName] = useState('홍길동');

  // [Step 1] 주소 확인 핸들러
  const handleAddressCheck = () => {
    if (address.length < 8) {
      alert("올바른 지갑 주소를 입력해주세요.");
      return;
    }
    setStep(2);
  };

  // [Step 2] 송금 버튼 클릭 핸들러
  const handleSend = () => {
    if (!amount || Number(amount) <= 0) {
      alert("금액을 입력해주세요.");
      return;
    }

    // Step 3 (로딩)으로 이동
    setStep(3);

    // 2초 뒤 Step 4 (완료)로 자동 이동
    setTimeout(() => {
        setStep(4);
    }, 2000);
  };

  return (
    <div className={common.layout}>
      
      {/* =========================================================
          [STEP 1] 주소 입력 화면 (기존 유지)
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
                  onChange={(e) => setAddress(e.target.value)}
                />
                <button className={styles.miniCheckBtn} onClick={handleAddressCheck}>주소 확인</button>
                <button className={styles.circleNextBtn} onClick={handleAddressCheck}>›</button>
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
          [STEP 2] 금액 입력 화면 (기존 유지)
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
          [STEP 3 & 4 통합] 로딩 및 완료 화면 (통합됨)
         ========================================================= */}
      {(step === 3 || step === 4) && (
        <div className={styles.container}>
          <div className={styles.centerContent}>
            
            {/* 로고 영역 (항상 표시, 위치 고정) */}
            <div className={styles.logoArea}>
               <img src={usdtLogo} alt="USDT" className={styles.logoImg} />
               <span className={styles.brandName}>CrossPay</span>
            </div>

            {/* 상태 텍스트 (단계에 따라 텍스트만 변경) */}
            <h2 className={styles.statusMessage}>
                {step === 3 ? "결제가 진행 중이에요." : "결제가 완료되었습니다."}
            </h2>

            {/* 확인 버튼 (Step 3에서는 투명하게 숨김, 공간은 차지함) */}
            <button 
                className={`${styles.confirmBtn} ${step === 3 ? styles.hiddenBtn : ''}`} 
                onClick={() => navigate('/home')}
                disabled={step === 3} // 숨겨진 상태에선 클릭 방지
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