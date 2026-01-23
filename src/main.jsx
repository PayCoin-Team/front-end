import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'; // 1. axios 임포트
import './index.css'
import App from './App.jsx'

// 2. 전역 설정 추가: 이제 앱 내의 모든 axios 요청은 쿠키를 달고 다닙니다.
axios.defaults.withCredentials = true; 
// 3. (선택사항) 기본 주소도 설정하면 편합니다.
axios.defaults.baseURL = 'http://localhost:8080';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
