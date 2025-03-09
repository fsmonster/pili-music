import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { QRCodeStatusData, BiliUserInfo } from '../../types';
import { QRCodeStatus } from '../../types';
import { authApi } from '../../api/auth';
import { useUserStore } from './user';
import { setToken, getToken, removeToken, parseToken, isTokenExpired } from '../../utils/token';

/**
 * 认证状态管理
 */
export const useAuthStore = defineStore('auth', () => {
    // 状态
    const userInfo = ref<BiliUserInfo | null>(null);
    const qrCodeStatus = ref<QRCodeStatus>(QRCodeStatus.PENDING);
    const qrCodeKey = ref<string>('');
    const qrCodeUrl = ref<string>('');
    const pollingTimer = ref<number | null>(null);
    const userStore = useUserStore();
    const token = ref<string | null>(getToken());

    // 计算属性
    const isLoggedIn = computed(() => {
        // 检查 token 是否存在且未过期
        if (token.value && !isTokenExpired(token.value)) {
            return true;
        }
        return false;
    });

    // 方法
    /**
     * 获取登录二维码
     */
    async function getQRCode() {
        const response = await authApi.getQRCode();
        const { qrcode_key, url } = response;  
        qrCodeKey.value = qrcode_key;
        qrCodeUrl.value = url;
        qrCodeStatus.value = QRCodeStatus.PENDING;
        return { qrcode_key, url };
    }

    /**
     * 检查二维码状态
     */
    async function checkQRCodeStatus() {
        if (!qrCodeKey.value) {
            console.log('auth store: 没有二维码key，跳过检查');
            return;
        }
        
        // 获取二维码状态
        const qrData: QRCodeStatusData = await authApi.checkQRCodeStatus(qrCodeKey.value);

        // 请求成功
        qrCodeStatus.value = qrData.code;
        console.log('auth store: 更新二维码状态:', qrCodeStatus.value);
        
        // 已确认
        if (qrData.code === QRCodeStatus.CONFIRMED) {
            console.log('auth store: 二维码已确认，获取用户信息');
            
            // 如果 qrData 中包含 token，存储它
            if (qrData.token) {
                setTokenAndUpdateState(qrData.token);
            }
            
            await getUserInfo();
            stopPolling();
            console.log('auth store: 登录流程完成');
        }
        // 已过期，停止轮询
        else if (qrData.code === QRCodeStatus.EXPIRED) {
            console.log('auth store: 二维码已过期，停止轮询');
            stopPolling();
        }
        return qrData;
    }

    /**
     * 开始轮询检查二维码状态
     */
    function startPolling() {
        if (pollingTimer.value) return;
        
        pollingTimer.value = window.setInterval(async () => {
            try {
                await checkQRCodeStatus();
            } catch (error) {
                stopPolling();
                console.error('轮询二维码状态失败:', error);
            }
        }, 4000);
    }

    /**
     * 停止轮询
     */
    function stopPolling() {
        if (pollingTimer.value) {
            window.clearInterval(pollingTimer.value);
            pollingTimer.value = null;
        }
    }

    /**
     * 获取用户信息
     */
    async function getUserInfo() {
        const response: BiliUserInfo = await authApi.getUserInfo();
        userInfo.value = response;
        // 同步更新user store
        userStore.setUserInfo(response);
        return response;
    }

    /**
     * 设置令牌并更新状态
     */
    function setTokenAndUpdateState(newToken: string) {
        token.value = newToken;
        setToken(newToken);
        
        // 尝试从令牌中解析基本用户信息
        const payload = parseToken(newToken);
        if (payload && payload.uid) {
            // 可以从令牌中获取一些基本信息
            console.log('从令牌中获取用户ID:', payload.uid);
        }
    }

    /**
     * 刷新令牌
     */
    async function refreshToken() {
        try {
            const newToken = await authApi.refreshToken();
            setTokenAndUpdateState(newToken);
            return true;
        } catch (error) {
            console.error('刷新令牌失败:', error);
            logout();
            return false;
        }
    }

    /**
     * 登出
     */
    async function logout() {
        try {
            if (isLoggedIn.value) {
                await authApi.logout();
            }
        } catch (error) {
            console.error('登出请求失败:', error);
        } finally {
            // 无论请求成功与否，都清除本地状态
            userInfo.value = null;
            qrCodeStatus.value = QRCodeStatus.PENDING;
            qrCodeKey.value = '';
            qrCodeUrl.value = '';
            token.value = null;
            removeToken();
            stopPolling();
            // 同步登出user store
            userStore.logout();
        }
    }

    /**
     * 初始化：检查登录状态
     */
    async function init() {
        // 检查是否有令牌
        if (token.value) {
            // 检查令牌是否过期
            if (isTokenExpired(token.value)) {
                // 令牌过期，尝试刷新
                const refreshSuccess = await refreshToken();
                if (!refreshSuccess) {
                    logout();
                    return;
                }
            }
            
            try {
                // 获取用户详细信息
                await getUserInfo();
            } catch (error) {
                console.error('初始化检查登录状态失败:', error);
                logout();
            }
        }
    }

    return {
        // 状态
        userInfo,
        qrCodeStatus,
        qrCodeKey,
        qrCodeUrl,
        isLoggedIn,
        token,

        // 方法
        getQRCode,
        checkQRCodeStatus,
        startPolling,
        stopPolling,
        getUserInfo,
        refreshToken,
        logout,
        init
    };
});
