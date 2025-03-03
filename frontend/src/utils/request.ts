import axios, { AxiosError } from 'axios';
import { ElMessage } from 'element-plus';
import type { APIResponse } from '../types/auth';

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
 */
request.interceptors.request.use(
  (config) => {
    // 开发环境打印请求信息
    // if (import.meta.env.DEV) {
    //   console.log('Request:', {
    //     url: config.url,
    //     method: config.method,
    //     params: config.params,
    //     data: config.data
    //   });
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * - 统一处理响应
 * - 解构data
 */
// request.interceptors.response.use(
//   (response) => {
//     const res = response.data;

//     // **正确解构 data.data**
//     if (res?.data?.data) {
//       res.data = res.data.data;
//     }

//     return res;
//   },
//   (error) => Promise.reject(error)
// );

/**
 * 响应拦截器
 * - 统一错误处理
 * - 数据转换
 */
// request.interceptors.response.use(
//   (response) => {
//     const res = response.data as APIResponse<any>;

//     // 处理业务错误
//     if (res.code !== 0) {
//       ElMessage.error(res.message || '请求失败');
//       return Promise.reject(new Error(res.message || '请求失败'));
//     }
    
//     // 返回完整响应，让 API 层处理数据结构
//     return response;
//   },
//   (error: AxiosError<APIResponse<any>>) => {
//     // 处理不同类型的错误
//     if (error.response) {
//       // 服务器返回错误
//       const res = error.response.data;
//       ElMessage.error(res?.message || `请求失败 (${error.response.status})`);
//     } else if (error.request) {
//       // 请求发出但未收到响应
//       ElMessage.error('网络错误，请检查网络连接');
//     } else {
//       // 请求配置错误
//       ElMessage.error(error.message || '请求配置错误');
//     }

//     return Promise.reject(error);
//   }
// );

export default request;
