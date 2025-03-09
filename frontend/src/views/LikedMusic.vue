<template>
  <div class="liked-music-page">
    <!-- 列表头部 -->
    <ListHeader 
      title="我的喜欢" 
      :cover="loveCover" 
      :count="likeStore.likedCount" 
    />
    
    <!-- 控制栏 -->
    <ListControls 
      @play-all="playAllLikedMusic" 
      :disabled="likeStore.likedCount === 0"
    />
    
    <!-- 媒体列表 -->
    <MediaTable 
      :data="likeStore.likedMedia" 
      :loading="loading" 
      @play="playMedia" 
      @add="addToQueue"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import ListHeader from '@/components/songList/ListHeader.vue';
import ListControls from '@/components/songList/ListControls.vue';
import MediaTable from '@/components/songList/MediaTable.vue';
import { useLikeStore } from '@/stores/list/like';
import { usePlayerStore } from '@/stores/play/player';
import loveCover from '@/assets/image/love.avif';
import type { MediaItem } from '@/types';

// 引入状态管理
const likeStore = useLikeStore();
const playerStore = usePlayerStore();

// 加载状态
const loading = ref(false);

// 组件挂载时获取喜欢列表
onMounted(async () => {
  if (likeStore.likedCount === 0) {
    loading.value = true;
    try {
      await likeStore.fetchLikedMedia();
    } catch (error) {
      console.error('获取喜欢的音乐失败:', error);
      ElMessage.error('获取喜欢的音乐失败');
    } finally {
      loading.value = false;
    }
  }
});

// 播放单个媒体
const playMedia = (item: MediaItem) => {
  // TODO: 实现播放单个媒体的逻辑
  ElMessage.success(`开始播放: ${item.title}`);
};

// 添加到播放队列
const addToQueue = (item: MediaItem) => {
  // TODO: 实现添加到播放队列的逻辑
  ElMessage.success(`已添加到播放队列: ${item.title}`);
};

// 播放所有喜欢的音乐
const playAllLikedMusic = () => {
  // 如果没有喜欢的音乐，不执行任何操作
  if (likeStore.likedCount === 0) {
    ElMessage.warning('暂无喜欢的音乐');
    return;
  }
  
  // TODO: 实现播放所有喜欢的音乐的逻辑
  ElMessage.success('开始播放我喜欢的音乐');
};
</script>

<style lang="scss" scoped>
.liked-music-page {
  padding: 20px;
}
</style>
