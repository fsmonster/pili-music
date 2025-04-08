<template>
  <div class="control-buttons">
    <i class="ri-shuffle-line"></i>
    <i class="ri-skip-back-fill" @click="playStore.prev"></i>
    <i 
      class="play-btn"
      :class="[
        playing ? 'ri-pause-circle-fill' : 'ri-play-circle-fill',
        { 'is-loading': loading }
      ]"
      @click="togglePlay"
    ></i>
    <i class="ri-skip-forward-fill" @click="playStore.next"></i>
    <i class="ri-repeat-one-line"></i>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores';

// 播放器 store
const playStore = usePlayerStore();
const { playing, loading } = storeToRefs(playStore);

// 切换播放状态
function togglePlay() {
  playStore.toggle();
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
