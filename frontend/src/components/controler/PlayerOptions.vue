<template>
  <div class="player-options">
    <!-- 多P连播控制 -->
    <div class="multi-page-controls">
      <el-tooltip placement="top">
        <template #content>
          多P连播开启时，会依次播放所有P<br />关闭则只播放第一P~
        </template>
        <el-switch
          v-model="multiPageQueueStore.enableMultiPagePlay"
          size="small"
          inline-prompt
        />
      </el-tooltip>
    </div>
    <!-- 播放队列按钮 -->
    <div class="queue">
      <i :class="[multiPageQueueStore.isMultiPage ? 'ri-file-list-line' : 'ri-play-list-line']" @click="toggleQueue"></i>
      <!-- <div v-if="multiPageQueueStore.isMultiPage" class="multi-indicator"></div> -->
    </div>
    <!-- 音量控制 -->
    <i :class="[volume === 0 ? 'ri-volume-mute-line' : 'ri-volume-up-line']" @click="toggleMute"></i>
    <!-- 音量滑块 -->
    <VolumeBar
      v-model="volumeValue"
      @change="handleVolumeChange"
      class="volume-slider"
    />
    <!-- 全屏按钮 -->
    <i class="ri-expand-diagonal-2-line"></i>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { ElSwitch } from 'element-plus';
import { usePlayerStore, useQueueStore, useMultiPageQueueStore } from '@/stores';
// 导入自定义组件
import { VolumeBar } from './index';

// 播放器 store
const playStore = usePlayerStore();
// 播放列表 store
const queueStore = useQueueStore();
// 多P播放列表 store
const multiPageQueueStore = useMultiPageQueueStore();

const { volume } = storeToRefs(playStore);

// 音量控制值
const volumeValue = computed(() => volume.value * 100);
const savedVolume = ref(0);

// 音量变化处理
function handleVolumeChange(value: number) {
  volume.value = value / 100;
  playStore.setVolume();
}

// 静音切换
function toggleMute() {
  if (volume.value > 0) {
    // 存储当前音量，以便取消静音时恢复
    savedVolume.value = volume.value;
    volume.value = 0;
  } else {
    // 恢复之前的音量，如果之前是0，则设为50%
    volume.value = savedVolume.value > 0 ? savedVolume.value : 0.5;
  }
  playStore.setVolume();
}

// 切换播放队列显示状态
function toggleQueue() {
  queueStore.togglePopup();
}
</script>

<style lang="scss" scoped>
.player-options {
  min-width: 15%;
  max-width: 300px;
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 8px;

  .multi-page-controls {
    display: flex;
    align-items: center;
    padding-right: 8px;
    gap: 4px;
  }

  i {
    font-size: 20px;
    cursor: pointer;
    color: var(--el-text-color-regular);

    &:hover {
      color: var(--el-text-color-primary);
    }
  }

  .queue {
    position: relative;
    .multi-indicator {
      position: absolute;
      background-color: $primary-color;
      bottom: 4px;
      right: -4px;
      width: 8px;
      height: 8px;
      border: 3px solid #fff;
      border-radius: 50%;
    }
  }

  .volume-slider {
    width: 80px;
  }
}
</style>
