import { CollectionType } from '@/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * @desc 全局弹窗状态管理
 */
export const useOverlayStore = defineStore('overlay', () => {
  // 收藏夹弹窗
  const showingFavoriteModal = ref(false);
  const currentMediaId = ref<number>(0);
  
  // 显示收藏夹弹窗
  const showFavoriteModal = (mediaId: number) => {
    currentMediaId.value = mediaId;
    showingFavoriteModal.value = true;
  };
  
  // 隐藏收藏夹弹窗
  const hideFavoriteModal = () => {
    showingFavoriteModal.value = false;
  };

  // 分区弹窗
  const showingSectionModal = ref(false);
  // 分区 ID
  const currentSectionId = ref<number>(0);
  // 分区类型
  const currentType = ref<CollectionType>(CollectionType.Favorite);
  // 媒体资源 ID
  const collectionId = ref<number>(0);
  
  // 显示分区弹窗
  const showSectionModal = (mediaId: number) => {
    currentSectionId.value = mediaId;
    showingSectionModal.value = true;
  };
  
  // 隐藏分区弹窗
  const hideSectionModal = () => {
    showingSectionModal.value = false;
  };

  // 删除历史记录弹窗
  const showingDeleteHistoryModal = ref(false);
  
  return {
    // 状态
    showingFavoriteModal,
    currentMediaId,
    showingSectionModal,
    currentSectionId,
    currentType,
    collectionId,
    showingDeleteHistoryModal,
    // 方法
    showFavoriteModal,
    hideFavoriteModal,
    showSectionModal,
    hideSectionModal
  };
});