import axios from 'axios';
import { getToken, isTokenExpired } from './token';

/**
 * HTTP 客户端
 * - 统一的请求配置
 * - 请求/响应拦截
 * - 错误处理
 */
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 请求拦截器
 * - 添加通用请求头
 * - 处理请求参数
 * - 添加 JWT 认证头
 */
request.interceptors.request.use(
  (config) => {
    // 获取 JWT 令牌并添加到请求头
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request;
