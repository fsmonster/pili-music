<template>
  <div class="control-buttons">
    <i 
      class="ri-shuffle-line"
      :class="{ 'active': isRandomMode }"
      @click="toggleRandomMode"
      title="随机播放"
    ></i>
    <i class="ri-skip-back-fill" @click="queueStore.prev" title="上一首"></i>
    <i 
      class="play-btn"
      :class="[
        playing ? 'ri-pause-circle-fill' : 'ri-play-circle-fill',
        { 'is-loading': loading }
      ]"
      @click="togglePlay"
      title="播放/暂停"
    ></i>
    <i class="ri-skip-forward-fill" @click="queueStore.forceNext" title="下一首"></i>
    <i 
      class="ri-repeat-one-line"
      :class="{ 'active': isLoopMode }"
      @click="toggleLoopMode"
      title="单曲循环"
    ></i>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlayerStore, useQueueStore } from '@/stores';

// 播放器 store
const playStore = usePlayerStore();
const { playing, loading } = storeToRefs(playStore);

// 队列 store
const queueStore = useQueueStore();
const { isRandomMode, isLoopMode } = storeToRefs(queueStore);

// 切换播放状态
function togglePlay() {
  playStore.toggle();
}

// 切换随机播放模式
function toggleRandomMode() {
  queueStore.toggleRandomMode();
}

// 切换单曲循环模式
function toggleLoopMode() {
  queueStore.toggleLoopMode();
}
</script>

<style lang="scss" scoped>
.control-buttons {
  display: flex;
  align-items: center;
  gap: 24px;
  
  i {
    font-size: 20px;
    cursor: pointer;
    color: var(--el-text-color-regular);
    transition: all 0.3s;

    &:hover {
      color: var(--el-text-color-primary);
    }
    
    &.active {
      color: var(--el-color-primary);
    }

    &.play-btn {
      font-size: 40px;
      line-height: 1;
      color: var(--el-color-primary);

      &:hover {
        transform: scale(1.05);
      }

      &.is-loading {
        opacity: 0.7;
        cursor: wait;
      }
    }
  }
}
</style>
