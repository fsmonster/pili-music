<!-- 登录弹窗组件 -->
<template>
  <el-dialog
    v-model="visible"
    title="登录"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="handleClose"
  >
    <div class="login-container">
      <!-- 二维码 -->
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
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Lock } from '@element-plus/icons-vue';
import { useAuthStore } from '../../stores/user/auth';
// import { QRCodeStatus } from '../../types/auth';
import QRCode from './QRCode.vue';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'login-success'): void;
}>();

const store = useAuthStore();
const visible = ref(props.modelValue);

// 监听 visible 变化
watch(() => props.modelValue, val => {
  visible.value = val;
  if (val) {
    getQRCode();
  }
});

// 监听 visible 变化，同步到父组件
watch(() => visible.value, val => {
  emit('update:modelValue', val);
});

// 监听登录状态
watch(() => store.isLoggedIn, val => {
  if (val) {
    visible.value = false;
    emit('login-success');
  }
});

// 获取二维码
async function getQRCode() {
  try {
    await store.getQRCode();
    store.startPolling();
  } catch (error) {
    console.error('获取二维码失败:', error);
  }
}

// 关闭弹窗
function handleClose() {
  store.stopPolling();
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  
  .tip-text {
    margin-top: 16px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

:deep(.el-dialog__header) {
  margin-right: 0;
  text-align: center;
}
</style>
