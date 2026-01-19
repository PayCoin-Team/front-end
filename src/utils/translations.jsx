// src/utils/translations.js

export const translations = {
    ko: {
        // 공통 / 버튼
        appName: 'CrossPay',
        login: '로그인',
        signup: '회원가입',
        confirm: '확인',
        cancel: '취소',
        
        // 스플래시 & 로그인 화면
        findId: '아이디 찾기',
        resetPw: '비밀번호 재설정',
        idPlaceholder: '아이디를 입력하세요',
        pwPlaceholder: '비밀번호를 입력하세요',
        welcome: '환영합니다',
        
        // 홈 화면
        wallet: '내 지갑',
        send: '보내기',
        receive: '받기',
        history: '거래 내역',
        
        // 언어 이름
        langLabel: '한국어'
    },
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
        
        wallet: 'My Wallet',
        send: 'Send',
        receive: 'Receive',
        history: 'Transaction History',
        
        langLabel: 'English'
    },
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
        
        wallet: '我的钱包',
        send: '转账',
        receive: '收款',
        history: '交易记录',
        
        langLabel: '中文'
    },
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
        
        wallet: 'Mi Billetera',
        send: 'Enviar',
        receive: 'Recibir',
        history: 'Historial',
        
        langLabel: 'Español'
    },
    // 일본어 (Japanese)
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

        wallet: 'ウォレット',
        send: '送金',
        receive: '受け取る',
        history: '取引履歴',

        langLabel: '日本語'
    },
    // 러시아어 (Russian)
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

        wallet: 'Кошелек',
        send: 'Отправить',
        receive: 'Получить',
        history: 'История',

        langLabel: 'Русский'
    },
    // 힌디어 (Hindi)
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

        wallet: 'वॉलेट',
        send: 'भेजें',
        receive: 'प्राप्त करें',
        history: 'लेनदेन का इतिहास',

        langLabel: 'हिन्दी'
    },
    // 독일어 (German)
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

        wallet: 'Brieftasche',
        send: 'Senden',
        receive: 'Empfangen',
        history: 'Verlauf',

        langLabel: 'Deutsch'
    },
    // 프랑스어 (French)
    fr: {
        appName: 'CrossPay',
        login: 'Connexion',
        signup: 'Inscription',
        confirm: 'Confirmer',
        cancel: 'Annuler',

        findId: 'Trouver l\'ID',
        resetPw: 'Réinitialiser le mot de passe',
        idPlaceholder: 'Entrez votre ID',
        pwPlaceholder: 'Entrez votre mot de passe',
        welcome: 'Bienvenue',

        wallet: 'Portefeuille',
        send: 'Envoyer',
        receive: 'Recevoir',
        history: 'Historique',

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