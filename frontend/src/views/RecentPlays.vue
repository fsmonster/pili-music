<template>
  <Layout>
    <template #main>
      <div class="recent-plays-page">
        <!-- 列表头部 -->
        <ListHeader 
          title="最近播放" 
      :cover="recentCover" 
      :count="recentPlayStore.recentPlayCount" 
    />
    
    <!-- 控制栏 -->
    <ListControls 
      @play-all="playAllRecentMusic" 
      :disabled="recentPlayStore.recentPlayCount === 0"
    />
    
    <!-- 媒体列表 -->
    <MediaTable 
      :data="recentPlayStore.recentPlays" 
      :loading="loading" 
      @play="playMedia" 
      @add="addToQueue"
    />
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import Layout from '@/layout/Layout.vue';
import ListHeader from '@/components/songList/ListHeader.vue';
import ListControls from '@/components/songList/ListControls.vue';
import MediaTable from '@/components/songList/MediaTable.vue';
import { useRecentPlayStore } from '@/stores/list/recent';
import { usePlayerStore } from '@/stores/play/player';
import recentCover from '@/assets/image/recent.avif';
import type { MediaItem } from '@/types';

// 引入状态管理
const recentPlayStore = useRecentPlayStore();
const playerStore = usePlayerStore();

// 加载状态
const loading = ref(false);

// 组件挂载时获取最近播放列表
onMounted(async () => {
  if (recentPlayStore.recentPlayCount === 0) {
    loading.value = true;
    try {
      await recentPlayStore.fetchRecentPlays();
    } catch (error) {
      console.error('获取最近播放记录失败:', error);
      ElMessage.error('获取最近播放记录失败');
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

// 播放所有最近播放的音乐
const playAllRecentMusic = () => {
  // 如果没有最近播放的音乐，不执行任何操作
  if (recentPlayStore.recentPlayCount === 0) {
    ElMessage.warning('暂无最近播放记录');
    return;
  }
  
  // TODO: 实现播放所有最近播放音乐的逻辑
  ElMessage.success('开始播放最近播放的音乐');
};
</script>

<style lang="scss" scoped>
.recent-plays-page {
  padding: 20px;
}
</style>
