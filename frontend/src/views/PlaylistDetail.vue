<template>
  <div class="playlist-detail-page">
    <!-- 列表头部 -->
    <ListHeader 
      :title="currentPlaylist?.name" 
      :cover="currentPlaylist?.coverUrl || defaultCover" 
      :count="currentPlaylist?.mediaItems?.length || 0" 
    />
    
    <!-- 控制栏 -->
    <ListControls 
      @play-all="playAllPlaylist" 
      :disabled="!currentPlaylist?.mediaItems?.length"
    />
    
    <!-- 媒体列表 -->
    <MediaTable 
      :data="currentPlaylist?.mediaItems || []" 
      :loading="loading" 
      @play="playMedia" 
      @add="addToQueue"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import ListHeader from '@/components/songList/ListHeader.vue';
import ListControls from '@/components/songList/ListControls.vue';
import MediaTable from '@/components/songList/MediaTable.vue';
import { usePlaylistStore } from '@/stores/list/custom';
import { usePlayerStore } from '@/stores/play/player';
import defaultCover from '@/assets/image/default_cover.avif';
import type { MediaItem } from '@/types';

// 引入状态管理
const playlistStore = usePlaylistStore();
const playerStore = usePlayerStore();
const route = useRoute();

// 加载状态
const loading = ref(false);

// 获取当前播放列表
const currentPlaylist = computed(() => playlistStore.currentPlaylist);

// 组件挂载时获取播放列表详情
onMounted(async () => {
  const playlistId = route.params.id as string;
  if (!playlistId) return;
  
  loading.value = true;
  try {
    await playlistStore.fetchPlaylistDetail(playlistId);
  } catch (error) {
    console.error('获取播放列表详情失败:', error);
    ElMessage.error('获取播放列表详情失败');
  } finally {
    loading.value = false;
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

// 播放整个播放列表
const playAllPlaylist = () => {
  // 如果播放列表为空，不执行任何操作
  if (!currentPlaylist.value?.mediaItems?.length) {
    ElMessage.warning('播放列表为空');
    return;
  }
  
  // TODO: 实现播放整个播放列表的逻辑
  ElMessage.success(`开始播放播放列表: ${currentPlaylist.value.name}`);
};
</script>

<style lang="scss" scoped>
.playlist-detail-page {
  padding: 20px;
}
</style>
