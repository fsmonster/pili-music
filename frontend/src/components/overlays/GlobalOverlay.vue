<!-- 全局弹窗组件 -->
<template>
  <div class="global-overlay">
    <!-- 登录弹窗 -->
    <LoginModal 
      v-model="overlayStore.showingLoginModal"
      @login-success="handleLoginSuccess"
    />
    
    <!-- 收藏夹弹窗 -->
    <FavoriteModal 
      v-model="overlayStore.showingFavoriteModal"
      :media-id="overlayStore.currentMediaId"
      :media-type="overlayStore.currentMediaType"
      @success="handleFavoriteSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { useOverlayStore } from '../../stores/overlay';
import LoginModal from '../auth/LoginModal.vue';
import FavoriteModal from './FavoriteModal.vue';

// 状态
const overlayStore = useOverlayStore();

// 处理登录成功
function handleLoginSuccess() {
  // 可以在这里添加登录成功后的逻辑
}

// 处理收藏成功
function handleFavoriteSuccess() {
  // 可以在这里添加收藏成功后的逻辑
}
</script>

<style scoped>
/* 全局样式，不需要额外的样式规则 */
</style>