import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserInfo } from '../types/auth';
import { QRCodeStatus } from '../types/auth';
import { authApi } from '../api/auth';
import { useUserStore } from './user';

/**
 * 认证状态管理
 */
export const useAuthStore = defineStore('auth', () => {
    // 状态
    const userInfo = ref<UserInfo | null>(null);
    const qrCodeStatus = ref<QRCodeStatus>(QRCodeStatus.PENDING);
    const qrCodeKey = ref<string>('');
    const qrCodeUrl = ref<string>('');
    const pollingTimer = ref<number | null>(null);
    const userStore = useUserStore();

    // 计算属性
    const isLoggedIn = computed(() => userInfo.value?.isLogin ?? false);

    // 方法
    /**
     * 获取登录二维码
     */
    async function getQRCode() {
        console.log('store: 开始获取二维码');
        const response = await authApi.getQRCode();
        console.log('store: 获取二维码响应:', response);
        const { data: { qrcode_key, url } } = response;  
        qrCodeKey.value = qrcode_key;
        qrCodeUrl.value = url;
        qrCodeStatus.value = QRCodeStatus.PENDING;
        console.log('store: 更新状态完成', {
            qrCodeKey: qrCodeKey.value,
            qrCodeUrl: qrCodeUrl.value,
            qrCodeStatus: qrCodeStatus.value
        });
        return { qrcode_key, url };
    }

    /**
     * 检查二维码状态
     */
    async function checkQRCodeStatus() {
        if (!qrCodeKey.value) {
            console.log('store: 没有二维码key，跳过检查');
            return;
        }
        
        console.log('store: 开始检查二维码状态');
        const response = await authApi.checkQRCodeStatus(qrCodeKey.value);
        console.log('store: 检查二维码状态响应:', response);

        // 请求成功
        if (response.code === 0) {
            const qrData = response.data;
            qrCodeStatus.value = qrData.code;
            console.log('store: 更新二维码状态:', qrCodeStatus.value);
            
            // 已确认
            if (qrData.code === QRCodeStatus.CONFIRMED) {
                console.log('store: 二维码已确认，获取用户信息');
                await getUserInfo();
                stopPolling();
                console.log('store: 登录流程完成');
            }
            // 已过期，停止轮询
            else if (qrData.code === QRCodeStatus.EXPIRED) {
                console.log('store: 二维码已过期，停止轮询');
                stopPolling();
            }
            
            return qrData;
        }
        
        // 请求失败
        console.error('store: 检查二维码状态失败:', response.message);
        return null;
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
        console.log('store: 开始获取用户信息');
        const response = await authApi.getUserInfo();
        console.log('store: 获取用户信息响应:', response);
        if (response.code === 0) {
            userInfo.value = response.data;
            // 同步更新user store
            userStore.setUserInfo(response.data);
            console.log('store: 更新用户信息完成');
        }
        return response.data;
    }

    /**
     * 登出
     */
    function logout() {
        userInfo.value = null;
        qrCodeStatus.value = QRCodeStatus.PENDING;
        qrCodeKey.value = '';
        qrCodeUrl.value = '';
        stopPolling();
        // 同步登出user store
        userStore.logout();
    }

    /**
     * 初始化：检查登录状态
     */
    async function init() {
        try {
            await getUserInfo();
        } catch (error) {
            console.error('初始化检查登录状态失败:', error);
            logout();
        }
    }

    return {
        // 状态
        userInfo,
        qrCodeStatus,
        qrCodeKey,
        qrCodeUrl,
        isLoggedIn,

        // 方法
        getQRCode,
        checkQRCodeStatus,
        startPolling,
        stopPolling,
        getUserInfo,
        logout,
        init
    };
});
