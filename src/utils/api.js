import axios from 'axios';

// 1. Axios 인스턴스 생성
const api = axios.create({
    baseURL: 'http://localhost:8080', // 배포 시 process.env.REACT_APP_API_URL 등으로 변경 권장
    withCredentials: true,            // 쿠키(Refresh Token) 전송 허용
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- [동시성 처리용 변수] ---
let isRefreshing = false; // 현재 재발급 중인지 체크
let failedQueue = [];     // 재발급 동안 대기하는 요청들

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};
// -------------------------

// 2. [요청 인터셉터] Authorization 헤더 설정
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // ⭐ [수정 1] 백엔드 표준에 맞춰 'Authorization' 헤더 사용 (Bearer 방식)
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. [응답 인터셉터] 토큰 만료 처리 및 재발급 로직
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401 에러 발생 시 (단, 로그인/재발급 요청은 제외)
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/login') && 
            !originalRequest.url.includes('/auth/reissue') // ⭐ 재발급 요청 자체는 인터셉트 제외
        ) {
            // [CASE A] 이미 다른 요청이 재발급을 진행 중이라면 -> 대기열에 추가
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (newToken) => {
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                            resolve(api(originalRequest));
                        },
                        reject: (err) => {
                            reject(err);
                        },
                    });
                });
            }

            // [CASE B] 총대 메고 재발급 시작
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // ⭐ 재발급 API 호출
                const response = await api.post('/auth/reissue');

                // ⭐ [수정] 헤더 이름 확인 (Authorization 또는 access 등 백엔드 응답에 맞춤)
                const authHeader = response.headers['authorization'] || response.headers['Authorization'];
                const newAccessToken = authHeader ? authHeader.split(' ')[1] : null;

                if (newAccessToken) {
                    // 1. 새 토큰 저장
                    localStorage.setItem('accessToken', newAccessToken);
                    
                    // 2. 헤더 업데이트
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    // 3. 대기 중이던 요청들 처리
                    processQueue(null, newAccessToken);

                    // 4. 실패했던 요청 재실행
                    return api(originalRequest);
                } else {
                    throw new Error("토큰이 갱신되지 않았습니다.");
                }

            } catch (reissueError) {
                // 재발급 실패 (Refresh Token 만료 등)
                processQueue(reissueError, null);
                
                console.error("세션 만료:", reissueError);
                localStorage.removeItem('accessToken');
                alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                window.location.href = '/login';
                return Promise.reject(reissueError);

            } finally {
                isRefreshing = false; // 상태 초기화
            }
        }

        return Promise.reject(error);
    }
);

export default api;