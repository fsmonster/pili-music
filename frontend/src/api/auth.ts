import request from '../utils/request';
import type { 
    QRCodeGenerateData, 
    QRCodeStatusData, 
    UserInfo, 
    APIResponse 
} from '../types/auth';

/**
 * 认证相关 API
 */
export const authApi = {
    /**
     * 获取登录二维码
     */
    async getQRCode() {
        if (import.meta.env.DEV) {
            console.log('🔑 调用 getQRCode API');
        }
        const response = await request.get<APIResponse<QRCodeGenerateData>>('/qrcode');
        if (import.meta.env.DEV) {
            console.log('✅ getQRCode response:', response.data);
        }
        return response.data;
    },

    /**
     * 检查二维码状态
     * @param qrcode_key 二维码密钥
     */
    async checkQRCodeStatus(qrcode_key: string) {
        if (import.meta.env.DEV) {
            console.log('🔍 调用 checkQRCodeStatus API');
        }
        const response = await request.get<APIResponse<QRCodeStatusData>>('/qrcode/status', {
            params: { qrcode_key }
        });
        if (import.meta.env.DEV) {
            console.log('✅ checkQRCodeStatus response:', response.data);
        }
        return response.data;
    },

    /**
     * 获取用户信息
     */
    async getUserInfo() {
        if (import.meta.env.DEV) {
            console.log('👤 调用 getUserInfo API');
        }
        const response = await request.get<APIResponse<UserInfo>>('/user/info');
        if (import.meta.env.DEV) {
            console.log('✅ getUserInfo response:', response.data);
        }
        return response.data;
    }
};
