<!-- 二维码组件 -->
<template>
  <div class="qrcode-container">
    <!-- 二维码 -->
    <div class="qrcode" ref="qrcodeRef"></div>
    
    <!-- 状态提示 -->
    <div class="status-tip" :class="statusClass">
      <el-icon v-if="props.status === QRCodeStatus.SCANNED"><Check /></el-icon>
      <el-icon v-if="props.status === QRCodeStatus.EXPIRED"><Warning /></el-icon>
      {{ statusText }}
    </div>
    
    <!-- 刷新按钮 -->
    <el-button 
      v-if="props.status === QRCodeStatus.EXPIRED"
      type="primary" 
      @click="refresh"
      :loading="loading"
    >
      刷新二维码
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import QRCode from 'qrcode';
import { QRCodeStatus } from '../../types/auth';
import { Check, Warning } from '@element-plus/icons-vue';

const props = defineProps<{
  url: string;
  status: QRCodeStatus;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const qrcodeRef = ref<HTMLElement>();
const loading = ref(false);

// 状态文本
const statusText = computed(() => {
  switch (props.status) {
    case QRCodeStatus.PENDING:
      return '请使用哔哩哔哩手机客户端扫码登录';
    case QRCodeStatus.SCANNED:
      return '扫描成功，请在手机上确认';
    case QRCodeStatus.CONFIRMED:
      return '登录成功';
    case QRCodeStatus.EXPIRED:
      return '二维码已过期';
    default:
      return '';
  }
});

// 状态样式
const statusClass = computed(() => ({
  'status-pending': props.status === QRCodeStatus.PENDING,
  'status-scanned': props.status === QRCodeStatus.SCANNED,
  'status-confirmed': props.status === QRCodeStatus.CONFIRMED,
  'status-expired': props.status === QRCodeStatus.EXPIRED,
}));

// 生成二维码
async function generateQRCode() {
  if (!qrcodeRef.value || !props.url) return;
  
  try {
    const dataUrl = await QRCode.toDataURL(props.url, {
      width: 200,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    qrcodeRef.value.innerHTML = `<img src="${dataUrl}" alt="登录二维码">`;
  } catch (error) {
    console.error('生成二维码失败:', error);
  }
}

// 刷新二维码
async function refresh() {
  loading.value = true;
  try {
    emit('refresh');
  } finally {
    loading.value = false;
  }
}

// 监听 url 变化，重新生成二维码
watch(() => props.url, generateQRCode, { immediate: true });

// 组件挂载时生成二维码
onMounted(generateQRCode);
</script>

<style scoped lang="scss">
.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  
  .qrcode {
    width: 200px;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  
  .status-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    
    &.status-scanned {
      color: var(--el-color-success);
    }
    
    &.status-expired {
      color: var(--el-color-danger);
    }
  }
}
</style>
