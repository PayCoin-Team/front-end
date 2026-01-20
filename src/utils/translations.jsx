// src/utils/translations.js

export const translations = {
    // 1. 한국어 (Korean)
    ko: {
        // [공통 / 버튼]
        appName: 'CrossPay',
        login: '로그인',
        signup: '회원가입',
        confirm: '확인',
        cancel: '취소',
        
        // [스플래시 & 로그인 화면]
        findId: '아이디 찾기',
        resetPw: '비밀번호 재설정',
        idPlaceholder: '아이디를 입력하세요',
        pwPlaceholder: '비밀번호를 입력하세요',
        welcome: '환영합니다',

        // [아이디 찾기 화면] (추가됨)
        emailPlaceholder: '이메일 입력',
        sendCode: '인증번호 전송',
        codePlaceholder: '인증 번호 입력',
        findIdBtn: '아이디 찾기', 
        idResultPrefix: '회원님의 아이디는',
        idResultSuffix: '입니다.',
        goHome: '홈으로',
        
        // [홈 화면 - 상단 & 카드]
        walletConnect: '지갑 연동',
        usdtChart: 'USDT 차트',
        wallet: '내 지갑',
        balanceWithdraw: '잔고 및 출금',
        copyAlert: '지갑 주소가 복사되었습니다!',
        copyTooltip: '클릭해서 주소 복사',

        // [홈 화면 - 메뉴]
        payBtn: '결제하기',
        createQr: 'QR 생성',
        charge: '충전',
        history: '거래 기록',

        // [충전 화면]
        chargeTitle: '충전',
        chargeLabel: '잔고에 충전할 금액',
        amountPlaceholder: '금액 입력',
        chargeBtn: '충전하기',
        chargingProgress: '충전 진행 중입니다...',
        waitMoment: '잠시만 기다려주세요.',
        chargeComplete: '충전이 완료되었습니다!',
        alertValidAmount: '올바른 금액을 입력해주세요.',
        alertFail: '충전 처리에 실패했습니다. (관리자 문의 요망)',
        alertError: '통신 오류가 발생했습니다.',

        // [하단 네비게이션]
        home: '홈',
        payNav: '결제',
        myPage: '마이페이지',
        
        // [언어 라벨]
        langLabel: '한국어'
    },

    // 2. 영어 (English)
    en: {
        appName: 'CrossPay',
        login: 'Login',
        signup: 'Sign Up',
        confirm: 'Confirm',
        cancel: 'Cancel',
        
        findId: 'Find ID',
        resetPw: 'Reset Password',
        idPlaceholder: 'Enter your ID',
        pwPlaceholder: 'Enter your Password',
        welcome: 'Welcome',

        // [Find ID Screen]
        emailPlaceholder: 'Enter Email',
        sendCode: 'Send Code',
        codePlaceholder: 'Enter Verification Code',
        findIdBtn: 'Find ID',
        idResultPrefix: 'Your ID is',
        idResultSuffix: '.',
        goHome: 'Go Home',
        
        walletConnect: 'Connect Wallet',
        usdtChart: 'USDT Chart',
        wallet: 'My Wallet',
        balanceWithdraw: 'Balance & Withdraw',
        copyAlert: 'Wallet address copied!',
        copyTooltip: 'Click to copy',

        payBtn: 'Pay',
        createQr: 'Create QR',
        charge: 'Charge',
        history: 'History',

        // [Charge Screen]
        chargeTitle: 'Charge',
        chargeLabel: 'Amount to Top Up',
        amountPlaceholder: 'Enter amount',
        chargeBtn: 'Charge',
        chargingProgress: 'Charging in progress...',
        waitMoment: 'Please wait a moment.',
        chargeComplete: 'Charging completed!',
        alertValidAmount: 'Please enter a valid amount.',
        alertFail: 'Charging failed. (Contact Admin)',
        alertError: 'Communication error occurred.',

        home: 'Home',
        payNav: 'Pay',
        myPage: 'My Page',
        
        langLabel: 'English'
    },

    // 3. 중국어 (Chinese - Simplified)
    zh: {
        appName: 'CrossPay',
        login: '登录',
        signup: '注册',
        confirm: '确认',
        cancel: '取消',
        
        findId: '找回账号',
        resetPw: '重置密码',
        idPlaceholder: '请输入账号',
        pwPlaceholder: '请输入密码',
        welcome: '欢迎',

        // [Find ID Screen]
        emailPlaceholder: '请输入邮箱',
        sendCode: '发送验证码',
        codePlaceholder: '请输入验证码',
        findIdBtn: '找回账号',
        idResultPrefix: '您的账号是',
        idResultSuffix: '。',
        goHome: '返回首页',
        
        walletConnect: '连接钱包',
        usdtChart: 'USDT 图表',
        wallet: '我的钱包',
        balanceWithdraw: '余额与提现',
        copyAlert: '钱包地址已复制！',
        copyTooltip: '点击复制',

        payBtn: '支付',
        createQr: '生成二维码',
        charge: '充值',
        history: '交易记录',

        // [Charge Screen]
        chargeTitle: '充值',
        chargeLabel: '充值金额',
        amountPlaceholder: '请输入金额',
        chargeBtn: '充值',
        chargingProgress: '充值进行中...',
        waitMoment: '请稍候。',
        chargeComplete: '充值已完成！',
        alertValidAmount: '请输入有效的金额。',
        alertFail: '充值失败。（请联系管理员）',
        alertError: '发生通信错误。',

        home: '首页',
        payNav: '支付',
        myPage: '我的',
        
        langLabel: '中文'
    },

    // 4. 스페인어 (Spanish)
    es: {
        appName: 'CrossPay',
        login: 'Iniciar sesión',
        signup: 'Registrarse',
        confirm: 'Confirmar',
        cancel: 'Cancelar',
        
        findId: 'Buscar ID',
        resetPw: 'Restablecer contraseña',
        idPlaceholder: 'Ingrese su ID',
        pwPlaceholder: 'Ingrese su contraseña',
        welcome: 'Bienvenido',

        // [Find ID Screen]
        emailPlaceholder: 'Ingrese su email',
        sendCode: 'Enviar código',
        codePlaceholder: 'Ingrese el código',
        findIdBtn: 'Buscar ID',
        idResultPrefix: 'Su ID es',
        idResultSuffix: '.',
        goHome: 'Ir al Inicio',
        
        walletConnect: 'Conectar Billetera',
        usdtChart: 'Gráfico USDT',
        wallet: 'Mi Billetera',
        balanceWithdraw: 'Saldo y Retiro',
        copyAlert: '¡Dirección de billetera copiada!',
        copyTooltip: 'Clic para copiar',

        payBtn: 'Pagar',
        createQr: 'Crear QR',
        charge: 'Recargar',
        history: 'Historial',

        // [Charge Screen]
        chargeTitle: 'Recargar',
        chargeLabel: 'Cantidad a recargar',
        amountPlaceholder: 'Ingrese cantidad',
        chargeBtn: 'Recargar',
        chargingProgress: 'Recarga en curso...',
        waitMoment: 'Por favor espere.',
        chargeComplete: '¡Recarga completada!',
        alertValidAmount: 'Ingrese una cantidad válida.',
        alertFail: 'Falló la recarga. (Contacte al admin)',
        alertError: 'Error de comunicación.',

        home: 'Inicio',
        payNav: 'Pagar',
        myPage: 'Mi Página',
        
        langLabel: 'Español'
    },

    // 5. 일본어 (Japanese)
    ja: {
        appName: 'CrossPay',
        login: 'ログイン',
        signup: '会員登録',
        confirm: '確認',
        cancel: 'キャンセル',

        findId: 'ID検索',
        resetPw: 'パスワード再設定',
        idPlaceholder: 'IDを入力してください',
        pwPlaceholder: 'パスワードを入力してください',
        welcome: 'ようこそ',

        // [Find ID Screen] (추가됨)
        emailPlaceholder: 'メールアドレスを入力',
        sendCode: '認証コード送信',
        codePlaceholder: '認証コードを入力',
        findIdBtn: 'IDを検索',
        idResultPrefix: 'お客様のIDは',
        idResultSuffix: 'です。',
        goHome: 'ホームへ',

        walletConnect: 'ウォレット連携',
        usdtChart: 'USDTチャート',
        wallet: 'ウォレット',
        balanceWithdraw: '残高・出金',
        copyAlert: 'アドレスをコピーしました！',
        copyTooltip: 'クリックしてコピー',

        payBtn: '決済',
        createQr: 'QR作成',
        charge: 'チャージ',
        history: '取引履歴',

        // [Charge Screen]
        chargeTitle: 'チャージ',
        chargeLabel: 'チャージする金額',
        amountPlaceholder: '金額を入力',
        chargeBtn: 'チャージ',
        chargingProgress: 'チャージ中です...',
        waitMoment: '少々お待ちください。',
        chargeComplete: 'チャージが完了しました！',
        alertValidAmount: '正しい金額を入力してください。',
        alertFail: 'チャージに失敗しました。（管理者にお問い合わせください）',
        alertError: '通信エラーが発生しました。',

        home: 'ホーム',
        payNav: '決済',
        myPage: 'マイページ',

        langLabel: '日本語'
    },

    // 6. 러시아어 (Russian)
    ru: {
        appName: 'CrossPay',
        login: 'Вход',
        signup: 'Регистрация',
        confirm: 'Подтвердить',
        cancel: 'Отмена',

        findId: 'Найти ID',
        resetPw: 'Сброс пароля',
        idPlaceholder: 'Введите ID',
        pwPlaceholder: 'Введите пароль',
        welcome: 'Добро пожаловать',

        // [Find ID Screen] (추가됨)
        emailPlaceholder: 'Введите Email',
        sendCode: 'Отправить код',
        codePlaceholder: 'Введите код',
        findIdBtn: 'Найти ID',
        idResultPrefix: 'Ваш ID:',
        idResultSuffix: '.',
        goHome: 'На главную',

        walletConnect: 'Подключить кошелек',
        usdtChart: 'График USDT',
        wallet: 'Кошелек',
        balanceWithdraw: 'Баланс и вывод',
        copyAlert: 'Адрес кошелька скопирован!',
        copyTooltip: 'Нажмите, чтобы скопировать',

        payBtn: 'Оплата',
        createQr: 'Создать QR',
        charge: 'Пополнить',
        history: 'История',

        // [Charge Screen]
        chargeTitle: 'Пополнить',
        chargeLabel: 'Сумма пополнения',
        amountPlaceholder: 'Введите сумму',
        chargeBtn: 'Пополнить',
        chargingProgress: 'Выполняется пополнение...',
        waitMoment: 'Пожалуйста, подождите.',
        chargeComplete: 'Пополнение завершено!',
        alertValidAmount: 'Введите корректную сумму.',
        alertFail: 'Ошибка пополнения. (Свяжитесь с админом)',
        alertError: 'Ошибка связи.',

        home: 'Главная',
        payNav: 'Оплата',
        myPage: 'Моя страница',

        langLabel: 'Русский'
    },

    // 7. 힌디어 (Hindi)
    hi: {
        appName: 'CrossPay',
        login: 'लॉग इन',
        signup: 'साइन अप',
        confirm: 'पुष्टि करें',
        cancel: 'रद्द करें',

        findId: 'आईडी खोजें',
        resetPw: 'पासवर्ड रीसेट',
        idPlaceholder: 'अपनी आईडी दर्ज करें',
        pwPlaceholder: 'अपना पासवर्ड दर्ज करें',
        welcome: 'स्वागत है',

        // [Find ID Screen] (추가됨)
        emailPlaceholder: 'ईमेल दर्ज करें',
        sendCode: 'कोड भेजें',
        codePlaceholder: 'कोड दर्ज करें',
        findIdBtn: 'आईडी खोजें',
        idResultPrefix: 'आपकी आईडी है',
        idResultSuffix: '।',
        goHome: 'होम पर जाएं',

        walletConnect: 'वॉलेट कनेक्ट करें',
        usdtChart: 'USDT चार्ट',
        wallet: 'वॉलेट',
        balanceWithdraw: 'शेष राशि और निकासी',
        copyAlert: 'वॉलेट पता कॉपी किया गया!',
        copyTooltip: 'कॉपी करने के लिए क्लिक करें',

        payBtn: 'भुगतान करें',
        createQr: 'QR बनाएं',
        charge: 'रिचार्ज',
        history: 'लेनदेन इतिहास',

        // [Charge Screen]
        chargeTitle: 'रिचार्ज',
        chargeLabel: 'रिचार्ज राशि',
        amountPlaceholder: 'राशि दर्ज करें',
        chargeBtn: 'रिचार्ज',
        chargingProgress: 'रिचार्ज जारी है...',
        waitMoment: 'कृपया प्रतीक्षा करें।',
        chargeComplete: 'रिचार्ज पूरा हुआ!',
        alertValidAmount: 'कृपया मान्य राशि दर्ज करें।',
        alertFail: 'रिचार्ज विफल। (व्यवस्थापक से संपर्क करें)',
        alertError: 'संचार त्रुटि।',

        home: 'होम',
        payNav: 'भुगतान',
        myPage: 'मेरा पेज',

        langLabel: 'हिन्दी'
    },

    // 8. 독일어 (German)
    de: {
        appName: 'CrossPay',
        login: 'Anmelden',
        signup: 'Registrieren',
        confirm: 'Bestätigen',
        cancel: 'Abbrechen',

        findId: 'ID suchen',
        resetPw: 'Passwort zurücksetzen',
        idPlaceholder: 'ID eingeben',
        pwPlaceholder: 'Passwort eingeben',
        welcome: 'Willkommen',

        // [Find ID Screen] (추가됨)
        emailPlaceholder: 'E-Mail eingeben',
        sendCode: 'Code senden',
        codePlaceholder: 'Bestätigungscode',
        findIdBtn: 'ID suchen',
        idResultPrefix: 'Ihre ID ist',
        idResultSuffix: '.',
        goHome: 'Zum Start',

        walletConnect: 'Wallet verbinden',
        usdtChart: 'USDT-Chart',
        wallet: 'Brieftasche',
        balanceWithdraw: 'Guthaben & Auszahlung',
        copyAlert: 'Wallet-Adresse kopiert!',
        copyTooltip: 'Zum Kopieren klicken',

        payBtn: 'Bezahlen',
        createQr: 'QR erstellen',
        charge: 'Aufladen',
        history: 'Verlauf',

        // [Charge Screen]
        chargeTitle: 'Aufladen',
        chargeLabel: 'Aufladebetrag',
        amountPlaceholder: 'Betrag eingeben',
        chargeBtn: 'Aufladen',
        chargingProgress: 'Aufladen läuft...',
        waitMoment: 'Bitte warten.',
        chargeComplete: 'Aufladen abgeschlossen!',
        alertValidAmount: 'Bitte gültigen Betrag eingeben.',
        alertFail: 'Aufladen fehlgeschlagen. (Admin kontaktieren)',
        alertError: 'Kommunikationsfehler.',

        home: 'Startseite',
        payNav: 'Bezahlen',
        myPage: 'Meine Seite',

        langLabel: 'Deutsch'
    },

    // 9. 프랑스어 (French)
    fr: {
        appName: 'CrossPay',
        login: 'Connexion',
        signup: 'Inscription',
        confirm: 'Confirmer',
        cancel: 'Annuler',

        findId: 'Trouver l\'ID',
        resetPw: 'Réinitialiser',
        idPlaceholder: 'Entrez votre ID',
        pwPlaceholder: 'Entrez votre mot de passe',
        welcome: 'Bienvenue',

        // [Find ID Screen] (추가됨)
        emailPlaceholder: 'Entrez votre email',
        sendCode: 'Envoyer le code',
        codePlaceholder: 'Entrez le code',
        findIdBtn: 'Trouver l\'ID',
        idResultPrefix: 'Votre ID est',
        idResultSuffix: '.',
        goHome: 'Retour à l\'accueil',

        walletConnect: 'Connecter le portefeuille',
        usdtChart: 'Graphique USDT',
        wallet: 'Portefeuille',
        balanceWithdraw: 'Solde et Retrait',
        copyAlert: 'Adresse copiée !',
        copyTooltip: 'Cliquez pour copier',

        payBtn: 'Payer',
        createQr: 'Créer QR',
        charge: 'Recharger',
        history: 'Historique',

        // [Charge Screen]
        chargeTitle: 'Recharger',
        chargeLabel: 'Montant à recharger',
        amountPlaceholder: 'Entrez le montant',
        chargeBtn: 'Recharger',
        chargingProgress: 'Rechargement en cours...',
        waitMoment: 'Veuillez patienter.',
        chargeComplete: 'Rechargement terminé !',
        alertValidAmount: 'Veuillez entrer un montant valide.',
        alertFail: 'Échec du rechargement. (Contactez l\'admin)',
        alertError: 'Erreur de communication.',

        home: 'Accueil',
        payNav: 'Payer',
        myPage: 'Ma Page',

        langLabel: 'Français'
    }
};

// 국기 아이콘 매핑 (국가 코드)
export const flags = {
    ko: 'kr', // 한국
    en: 'us', // 미국
    zh: 'cn', // 중국
    es: 'es', // 스페인
    ja: 'jp', // 일본
    ru: 'ru', // 러시아
    hi: 'in', // 인도 (힌디어)
    de: 'de', // 독일
    fr: 'fr'  // 프랑스
};