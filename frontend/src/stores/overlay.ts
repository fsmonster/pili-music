import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * @desc 全局弹窗状态管理
 */
export const useOverlayStore = defineStore('overlay', () => {
  // 登录弹窗
  const showingLoginModal = ref(false);
  
  // 收藏夹弹窗
  const showingFavoriteModal = ref(false);
  const currentMediaId = ref<number>(0);
  const currentMediaType = ref<number>(2); // 默认为视频稿件
  
  // 显示登录弹窗
  const showLoginModal = () => {
    showingLoginModal.value = true;
  };
  
  // 隐藏登录弹窗
  const hideLoginModal = () => {
    showingLoginModal.value = false;
  };
  
  // 显示收藏夹弹窗
  const showFavoriteModal = (mediaId: number, mediaType: number = 2) => {
    currentMediaId.value = mediaId;
    currentMediaType.value = mediaType;
    showingFavoriteModal.value = true;
  };
  
  // 隐藏收藏夹弹窗
  const hideFavoriteModal = () => {
    showingFavoriteModal.value = false;
  };
  
  return {
    // 状态
    showingLoginModal,
    showingFavoriteModal,
    currentMediaId,
    currentMediaType,
    
    // 方法
    showLoginModal,
    hideLoginModal,
    showFavoriteModal,
    hideFavoriteModal
  };
});