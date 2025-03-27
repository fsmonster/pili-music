import { request } from '../utils/request';
import type { 
    QRCodeGenerateData, 
    QRCodeStatusData, 
    BiliUserInfo, 
    ApiResponse 
} from '../types';

/**
 * 认证相关 API
 */
export const authApi = {
    /**
     * 获取登录二维码
     */
    async getQRCode() {
        try {
            const res = await request.get<ApiResponse<QRCodeGenerateData>>('/auth/qrcode');
            if(res.data.code !== 0) {
                throw new Error(res.data.message || '获取登录二维码失败');
            }
            return res.data.data;
        } catch (error) {
            console.error('获取登录二维码失败:', error);
            throw error;
        }
    },

    /**
     * 检查二维码状态
     * @param qrcode_key 二维码密钥
     */
    async checkQRCodeStatus(qrcode_key: string): Promise<QRCodeStatusData> {
        try {
            const response = await request.get<ApiResponse<QRCodeStatusData>>('/auth/qrcode/status', {
                params: { qrcode_key }
            });
            if (response.data.code !== 0) {
                throw new Error(`二维码状态请求失败: ${response.data.message}`);
            }
            return response.data.data;
        } catch (error) {
            console.error('检查二维码状态失败:', error);
            throw error;
        }
    },

    /**
     * 获取用户信息
     */
    async getUserInfo(){
        try {
            const response = await request.get<ApiResponse<BiliUserInfo>>('/auth/user/info');
            if(response.data.code !== 0) {
                throw new Error(response.data.message || '获取用户信息失败');
            }
            return response.data.data;
        } catch (error) {
            console.error('获取用户信息失败:', error);
            throw error;
        }
    },

    /**
     * 刷新 JWT 令牌
     */
    async refreshToken() {
        try {
            const response = await request.post<ApiResponse<{token: string}>>('/auth/refresh');
            if(response.data.code !== 0) {
                throw new Error(response.data.message || '刷新令牌失败');
            }
            return response.data.data.token;
        } catch (error) {
            console.error('刷新令牌失败:', error);
            throw error;
        }
    },

    /**
     * 登出
     * @returns {Promise<boolean>} 登出是否成功
     */
    async logout() {
        try {
            const response = await request.get<ApiResponse<null>>('/user/logout');
            if(response.data.code !== 0) {
                throw new Error(response.data.message || '登出失败');
            }
            return true;
        } catch (error) {
            console.error('登出失败:', error);
            throw error;
        }
    }
};
