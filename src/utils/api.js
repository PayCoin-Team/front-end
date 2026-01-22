import axios from 'axios';

// 1. Axios 인스턴스 생성
const api = axios.create({
    baseURL: 'http://localhost:8080', // 백엔드 서버 주소
    withCredentials: true,             // 쿠키(Refresh Token) 전송 허용
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. [요청 인터셉터] 모든 요청 직전에 헤더에 Access Token을 삽입
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // 백엔드 명세에 맞춰 'access' 헤더 사용
            config.headers['access'] = token; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. [응답 인터셉터] 토큰 만료 처리 및 재발급 로직
api.interceptors.response.use(
    (response) => {
        return response; // 성공 시 그대로 반환
    },
    async (error) => {
        const originalRequest = error.config;

        // [중요 수정] 401 에러 발생 시 재발급을 시도하되, '로그인' 요청은 제외함
        // 로그인 실패는 토큰 만료가 아니라 아이디/비번이 틀린 것이기 때문입니다.
        if (
            error.response && 
            error.response.status === 401 && 
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/login') // 로그인 경로는 재발급 로직 패스
        ) {
            originalRequest._retry = true; // 재시도 플래그 설정 (무한 루프 방지)

            try {
                // 재발급 API 호출 (HttpOnly 쿠키에 담긴 Refresh Token이 자동 전송됨)
                const response = await api.post('/auth/reissue');

                // 새 Access Token 추출
                const newAccessToken = response.headers['access'] || response.headers['Access'];

                if (newAccessToken) {
                    // 새 토큰 저장 및 헤더 교체
                    localStorage.setItem('accessToken', newAccessToken);
                    originalRequest.headers['access'] = newAccessToken;

                    // 원래 실패했던 요청 재시도
                    return api(originalRequest);
                }
            } catch (reissueError) {
                // 재발급 실패 (리프레시 토큰까지 만료된 경우)
                console.error("토큰 재발급 실패: 세션 만료");
                localStorage.removeItem('accessToken');
                
                // 로그인 화면이 아닐 때만 세션 만료 알림을 띄우는 것이 좋습니다.
                alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                window.location.href = '/login'; 
            }
        }

        // 로그인 실패(401) 등은 여기서 reject되어 LoginScreen의 catch로 전달됨
        return Promise.reject(error);
    }
);

export default api;