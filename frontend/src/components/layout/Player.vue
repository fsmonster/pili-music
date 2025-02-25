<template>
  <div class="player-bar">
    <!-- 左侧：当前播放信息 -->
    <div class="now-playing">
      <img 
        :src="currentTrack?.cover || defaultCover" 
        :alt="currentTrack?.title || '封面'" 
      />
      <div class="track-info">
        <div class="track-name">{{ currentTrack?.title || '未在播放 (｡•́︿•̀｡)' }}</div>
        <div class="artist">{{ currentTrack?.artist || '点击播放你喜欢的音乐吧～' }}</div>
      </div>
    </div>

    <!-- 中间：播放控制 -->
    <div class="player-controls">
      <div class="control-buttons">
        <i 
          :class="[
            playMode === 'sequence' ? 'ri-repeat-line' : 
            playMode === 'shuffle' ? 'ri-shuffle-line' : 
            'ri-repeat-one-line'
          ]"
          @click="togglePlayMode"
        ></i>
        <i class="ri-skip-back-fill" @click="skipPrevious"></i>
        <i 
          :class="[isPlaying ? 'ri-pause-circle-fill' : 'ri-play-circle-fill']" 
          class="play-btn"
          @click="togglePlay"
        ></i>
        <i class="ri-skip-forward-fill" @click="skipNext"></i>
        <i class="ri-heart-line"></i>
      </div>
      <div class="progress-bar">
        <span class="time">{{ formattedCurrentTime }}</span>
        <div class="progress" @click="setProgress">
          <div class="progress-inner" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="time">{{ formattedDuration }}</span>
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
import defaultCover from '@/assets/image/music_cover.jpg';
import { ref, computed } from 'vue';

// 播放状态
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const currentTrack = ref<{
  title: string;
  artist: string;
  cover: string;
} | null>(null);

// 播放模式
const playMode = ref<'sequence' | 'shuffle' | 'repeat'>('sequence');

// 计算属性
const formattedCurrentTime = computed(() => formatTime(currentTime.value));
const formattedDuration = computed(() => formatTime(duration.value));
const progress = computed(() => (currentTime.value / duration.value) * 100 || 0);

// 格式化时间
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 播放控制方法
function togglePlay() {
  isPlaying.value = !isPlaying.value;
  // TODO: 实际的音频播放控制
}

function setProgress(event: MouseEvent) {
  const progressBar = event.currentTarget as HTMLElement;
  const rect = progressBar.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  currentTime.value = percent * duration.value;
  // TODO: 设置实际的音频播放进度
}

function setVolume(event: MouseEvent) {
  const volumeBar = event.currentTarget as HTMLElement;
  const rect = volumeBar.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  volume.value = Math.max(0, Math.min(1, percent));
  // TODO: 设置实际的音频音量
}

function togglePlayMode() {
  const modes: Array<'sequence' | 'shuffle' | 'repeat'> = ['sequence', 'shuffle', 'repeat'];
  const currentIndex = modes.indexOf(playMode.value);
  playMode.value = modes[(currentIndex + 1) % modes.length];
}

// 播放控制
function skipPrevious() {
  // TODO: 上一首
}

function skipNext() {
  // TODO: 下一首
}
</script>

<style lang="scss" scoped>
.player-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
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
    gap: 8px;

    .control-buttons {
      display: flex;
      align-items: center;
      gap: 24px;

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
          color: var(--el-color-primary);

          &:hover {
            transform: scale(1.05);
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
        text-align: center;
      }

      .progress {
        flex: 1;
        height: 4px;
        background-color: var(--el-fill-color-lighter);
        border-radius: 2px;
        cursor: pointer;
        position: relative;

        .progress-inner {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 30%;
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
    width: 300px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;

    i {
      font-size: 20px;
      cursor: pointer;
      color: var(--el-text-color-regular);
      transition: all 0.3s;

      &:hover {
        color: var(--el-text-color-primary);
      }
    }

    .volume-slider {
      width: 100px;
      height: 4px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 2px;
      cursor: pointer;
      position: relative;

      .volume-progress {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 50%;
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
