<!-- 全局弹窗组件 -->
<template>
  <div class="global-overlay">
    <!-- 收藏夹弹窗 -->
    <FavoriteModal 
      v-model="overlayStore.showingFavoriteModal"
      :media-id="overlayStore.currentMediaId"
    />
    
    <!-- 分区弹窗 -->
    <SectionModal 
      v-model="overlayStore.showingSectionModal"
      :type="overlayStore.currentType"
      :media-id="overlayStore.collectionId"
    />
  </div>
</template>

<script setup lang="ts">
import { useOverlayStore } from '../../stores/overlay';
import FavoriteModal from './FavoriteModal.vue';
import SectionModal from './SectionModal.vue';

// 状态
const overlayStore = useOverlayStore();

</script>

<style scoped>
/* 全局样式，不需要额外的样式规则 */
</style>