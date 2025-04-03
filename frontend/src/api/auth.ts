import { request, biliRequest } from '../utils/request';
import { getBuvidFromCookie, saveBuvid } from '../utils/buvid';
import type { 
    QRCodeGenerateData, 
    QRCodeStatusData, 
    BiliUserInfo, 
    ApiResponse 
} from '../types';

export interface Buvid {
    // buvid3
    b_3: string;
    // buvid4
    b_4: string;
    [property: string]: any;
}

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
     * 获取 Buvid
     */
    async getBuvid(): Promise<Buvid> {
        try {
            // 先尝试从 Cookie 获取 Buvid
            const cookieBuvid = getBuvidFromCookie();
            if (cookieBuvid && (cookieBuvid.b_3 || cookieBuvid.b_4)) {
                return cookieBuvid;
            }

            // Cookie 中不存在或无效，从服务器获取
            const response = await biliRequest.get<ApiResponse<Buvid>>('/frontend/finger/spi');
            if (response.data.code !== 0) {
                throw new Error(`获取 Buvid 失败: ${response.data.message}`);
            }
            
            // 保存到 Cookie
            saveBuvid(response.data.data);
            
            return response.data.data;
        } catch (error) {
            console.error('获取 Buvid 失败:', error);
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
     * 验证 JWT 令牌
     */
    async validateToken() {
        try {
            const response = await request.post<ApiResponse<{data: boolean}>>('/auth/validate');
            if(response.data.code !== 0) {
                throw new Error(response.data.message || '验证令牌失败');
            }
            return response.data.data.data;
        } catch (error) {
            console.error('验证令牌失败:', error);
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
