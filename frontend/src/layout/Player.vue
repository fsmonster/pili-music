<template>
  <div class="player-bar">
    <!-- 左侧：当前播放信息 -->
    <div class="now-playing">
      <img 
        :src="playStore.currentItem ? processResourceUrl(playStore.currentItem.cover) : defaultCover" 
        :alt="playStore.currentItem?.title || '封面'" 
      />
      <div class="track-info">
        <div class="track-name">{{ playStore.currentItem?.title || '未在播放 (｡•́︿•̀｡)' }}</div>
        <div class="artist">{{ playStore.currentItem?.upper?.name || '点击播放你喜欢的音乐吧～' }}</div>
      </div>
    </div>

    <!-- 中间：播放控制 -->
    <div class="player-controls">
      <div class="control-buttons">
        <i class="ri-repeat-line" @click="playStore.toggle"></i>
        <i class="ri-skip-back-fill" @click="playStore.prev"></i>
        <i 
          class="play-btn"
          :class="[
            playStore.playing ? 'ri-pause-circle-fill' : 'ri-play-circle-fill',
            { 'is-loading': playStore.loading }
          ]"
          @click="playStore.toggle"
        ></i>
        <i class="ri-skip-forward-fill" @click="playStore.next"></i>
        <i class="ri-heart-line"></i>
      </div>
      <div class="progress-bar">
        <span class="time">{{ formatTime(playStore.currentTime) }}</span>
        <div 
          class="progress" 
          @click="handleProgressClick"
          ref="progressRef"
        >
          <div 
            class="progress-inner" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <span class="time">{{ formatTime(playStore.duration) }}</span>
      </div>
    </div>

    <!-- 右侧：音量控制等 -->
    <div class="player-options">
      <i :class="[volume === 0 ? 'ri-volume-mute-line' : 'ri-volume-up-line']"></i>
      <div class="volume-slider" @click="setVolume">
        <div class="volume-progress" :style="{ width: `${volume * 100}%` }"></div>
      </div>
      <i class="ri-playlist-line"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import defaultCover from '@/assets/image/music_cover.jpg';
import { usePlayerStore } from '../stores';
import { processResourceUrl } from '../utils/processResoureUrl';

const playStore = usePlayerStore();
const progressRef = ref<HTMLElement | null>(null);
const volume = ref(1);

// 播放进度
const progress = computed(() => {
  if (!playStore.duration) return 0;
  return (playStore.currentTime / playStore.duration) * 100;
});

// 格式化时间
function formatTime(seconds: number) {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 进度条点击
function handleProgressClick(event: MouseEvent) {
  if (!progressRef.value || !playStore.duration) return;
  
  const rect = progressRef.value.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  playStore.seek(percent * playStore.duration);
}

// 音量控制
function setVolume(event: MouseEvent) {
  const volumeBar = event.currentTarget as HTMLElement;
  const rect = volumeBar.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  volume.value = Math.max(0, Math.min(1, percent));
  playStore.setVolume(volume.value);
}
</script>

<style lang="scss" scoped>
.player-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  background-color: var(--el-bg-color-overlay);
  border-top: 1px solid var(--el-border-color-light);

  .now-playing {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 300px;

    img {
      width: 56px;
      height: 56px;
      border-radius: 8px;
      object-fit: cover;
    }

    .track-info {
      .track-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--el-text-color-primary);
      }

      .artist {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .player-controls {
    flex: 1;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .control-buttons {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 8px;

      i {
        font-size: 24px;
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

    .progress-bar {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;

      .time {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        width: 45px;
      }

      .progress {
        flex: 1;
        height: 4px;
        background-color: var(--el-border-color);
        border-radius: 2px;
        cursor: pointer;
        position: relative;

        .progress-inner {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background-color: var(--el-color-primary);
          border-radius: 2px;
        }

        &:hover {
          height: 6px;
          
          .progress-inner {
            height: 100%;
          }
        }
      }
    }
  }

  .player-options {
    width: 200px;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      font-size: 20px;
      cursor: pointer;
      color: var(--el-text-color-regular);

      &:hover {
        color: var(--el-text-color-primary);
      }
    }

    .volume-slider {
      width: 80px;
      height: 4px;
      background-color: var(--el-border-color);
      border-radius: 2px;
      cursor: pointer;
      position: relative;

      .volume-progress {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background-color: var(--el-color-primary);
        border-radius: 2px;
      }

      &:hover {
        height: 6px;

        .volume-progress {
          height: 100%;
        }
      }
    }
  }
}
</style>
