<template>
  <div class="player-bar">
    <!-- 左侧：当前播放信息 -->
    <NowPlaying />

    <!-- 中间：播放控制 -->
    <div class="player-controls">
      <PlayControls />
      <ProgressBar
        v-model="currentProgress"
        @dragStart="isDragging = true"
        @change="handleProgressChange"
      />
    </div>

    <!-- 右侧：音量控制等 -->
    <PlayerOptions />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlayerStore, useQueueStore } from '@/stores';
// 导入子组件
import { 
  NowPlaying, 
  PlayControls, 
  ProgressBar, 
  PlayerOptions 
} from './index';

// 播放器 store
const playStore = usePlayerStore();
// 播放列表 store
const queueStore = useQueueStore();

const { currentTime, duration, playing } = storeToRefs(playStore);

// 播放进度值（0-100）
const currentProgress = ref(0);

// 是否正在拖动进度条
const isDragging = ref(false);

// 进度条变化处理（拖动结束时）
function handleProgressChange(value: number) {
  if (!duration.value) return;
  
  // 计算目标时间
  const seekTime = (value / 100) * duration.value;
  
  // 调用播放器的seek方法
  playStore.seek(seekTime);
  
  // 重置拖动状态
  setTimeout(() => {
    isDragging.value = false;
  }, 200);
}

// 监听播放时间变化，更新进度条
watch(() => currentTime.value, (newTime) => {
  if (!duration.value) return;
  // 只有当用户不在拖动进度条时才更新
  if (!isDragging.value) {
    currentProgress.value = (newTime / duration.value) * 100;
  }
});

// 监听播放列表变化，自动播放
watch(() => queueStore.queue.length, () => {
  if (queueStore.queue.length === 0) {
    playing.value = false;
    duration.value = 0;
    currentTime.value = 0;
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.player-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  background-color: var(--el-bg-color-overlay);
  border-top: 1px solid var(--el-border-color-light);
  
  .player-controls {
    flex: 1;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
