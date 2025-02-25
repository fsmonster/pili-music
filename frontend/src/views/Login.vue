<template>
    <div class="login-container">
      <div class="login-box">
        <div class="logo">
          <i class="ri-bilibili-fill"></i>
          <h2>哔哩音乐 <br> (｡･∀･)ﾉﾞ</h2>
        </div>
        
        <!-- 二维码组件 -->
        <QRCode
          :url="store.qrCodeUrl"
          :status="store.qrCodeStatus"
          @refresh="getQRCode"
        />
        
        <!-- 底部提示 -->
        <div class="tip-text">
          <el-icon><Lock /></el-icon>
          安全登录，保护账号
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, watch,onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { Lock } from '@element-plus/icons-vue';
  import { useAuthStore } from '../stores/auth';
  import { QRCodeStatus } from '../types/auth';
  import QRCode from '../components/auth/QRCode.vue';
  import { ElMessage } from 'element-plus';
  
  const router = useRouter();
  const store = useAuthStore();
  
  // 监听登录状态
  watch(() => store.isLoggedIn, val => {
    console.log('登录状态变化:', val);
    if (val) {
      console.log('登录成功，准备跳转到首页');
      router.push('/');
    }
  });
  
  // 获取二维码
  async function getQRCode() {
    console.log('组件: 开始获取二维码');
    try {
      await store.getQRCode();
      console.log('组件: 获取二维码成功，开始轮询');
      store.startPolling();
    } catch (error) {
      console.error('组件: 获取二维码失败:', error);
      ElMessage.error('获取二维码失败，请刷新重试');
    }
  }
  
  // 组件卸载时停止轮询
  onUnmounted(() => {
    console.log('组件: 卸载，停止轮询');
    store.stopPolling();
  });
  
  // 组件挂载时获取二维码
  onMounted(() => {
    console.log('组件: 挂载，获取二维码');
    getQRCode();
  });
  
  // 监听二维码状态
  watch(() => store.qrCodeStatus, (status) => {
    console.log('组件: 二维码状态变化:', status);
    if (status === QRCodeStatus.EXPIRED) {
      ElMessage.warning('二维码已过期，请刷新重试');
    }
  });
  </script>
  
  <style lang="scss" scoped>
  .login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--el-bg-color);
  }
  
  .login-box {
    padding: 40px;
    background: var(--el-bg-color-overlay);
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);
    text-align: center;
    
    .logo {
      margin-bottom: 24px;
      
      i {
        font-size: 48px;
        color: var(--el-color-primary);
      }
      
      h2 {
        margin-top: 16px;
        font-size: 24px;
        color: var(--el-text-color-primary);
      }
    }
    
    .tip-text {
      margin-top: 16px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
  }
  </style>
  