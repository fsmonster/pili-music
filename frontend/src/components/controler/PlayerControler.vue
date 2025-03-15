<template>
  <div class="player-bar">
    <!-- 左侧：当前播放信息 -->
    <div class="now-playing">
      <img 
        :src="playStore.currentItem ? processResourceUrl(playStore.currentItem.cover) : defaultCover" 
        :alt="playStore.currentItem?.title || '封面'" 
      />
      <div class="track-info">
        <div class="track-name">{{ playStore.currentItem?.title || '未在播放' }}</div>
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
        <i :class="{ 'ri-heart-line': !isLiked, 'ri-heart-fill': isLiked }" @click="toggleLike"></i>
      </div>
      <div class="progress-bar">
        <span class="time">{{ formatTime(playStore.currentTime) }}</span>
        <!-- 使用自定义进度条组件 -->
        <ProgressBar
          v-model="currentProgress"
          @input="isDragging = true"
          @change="handleProgressChange"
          class="progress-slider"
        />
        <span class="time">{{ formatTime(playStore.duration) }}</span>
      </div>
    </div>

    <!-- 右侧：音量控制等 -->
    <div class="player-options">
      <i :class="[playStore.volume === 0 ? 'ri-volume-mute-line' : 'ri-volume-up-line']" @click="toggleMute"></i>
      <!-- 使用自定义音量控制组件 -->
      <VolumeBar
        v-model="volumeValue"
        @change="handleVolumeChange"
        class="volume-slider"
      />
      <i class="ri-playlist-line"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import defaultCover from '@/assets/image/music_cover.jpg';
import { usePlayerStore, useQueueStore, useLikeStore } from '../../stores';
import { processResourceUrl } from '../../utils/processResoureUrl';
// 导入自定义组件
import { ProgressBar, VolumeBar } from './index';

// 播放器 store
const playStore = usePlayerStore();
// 播放列表 store
const queueStore = useQueueStore();
// 点赞 store
const likeStore = useLikeStore();

// 音量控制值
const volumeValue = ref(playStore.volume * 100);
// 播放进度值（0-100）
const currentProgress = ref(0);

// 当前播放项
const currentTrack = computed(() => queueStore.currentItem);
const currentAvid = computed(() => currentTrack.value?.id || 0);
const currentBvid = computed(() => currentTrack.value?.bvid || '');
const currentCid = computed(() => currentTrack.value?.cid || 0);
const isLiked = computed(() => likeStore.checkIsLiked(currentAvid.value, currentCid.value));

// const toggleLike = async () => {
//   if (isLiked.value) {
//     likeStore.removeLike(currentAvid.value, currentCid.value);
//   } else {
//     likeStore.addLike(currentAvid.value, currentBvid.value, currentCid.value);
//   }
// };

// 监听播放时间变化，更新进度条
watch(() => playStore.currentTime, (newTime) => {
  if (!playStore.duration) return;
  // 只有当用户不在拖动进度条时才更新
  if (!isDragging.value) {
    currentProgress.value = (newTime / playStore.duration) * 100;
  }
});

// 监听音量变化
watch(() => playStore.volume, (newVolume) => {
  volumeValue.value = newVolume * 100;
});

// 是否正在拖动进度条
const isDragging = ref(false);

// 格式化时间
function formatTime(seconds: number) {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 进度条变化处理（拖动结束时）
function handleProgressChange(value: number) {
  if (!playStore.duration) return;
  
  // 计算目标时间
  const seekTime = (value / 100) * playStore.duration;
  
  // 调用播放器的seek方法
  playStore.seek(seekTime);
  
  // 重置拖动状态
  setTimeout(() => {
    isDragging.value = false;
  }, 200);
}

// 音量变化处理
function handleVolumeChange(value: number) {
  playStore.volume = value / 100;
  playStore.setVolume();
}

// 静音切换
function toggleMute() {
  if (playStore.volume > 0) {
    // 存储当前音量，以便取消静音时恢复
    volumeValue.value = playStore.volume * 100;
    playStore.volume = 0;
  } else {
    // 恢复之前的音量，如果之前是0，则设为50%
    playStore.volume = volumeValue.value > 0 ? volumeValue.value / 100 : 0.5;
  }
  playStore.setVolume();
}
</script>

<style lang="scss" scoped>
@use '../../assets/styles/mixins.scss';
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
        @include mixins.text-ellipsis-multi(2);
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
      margin-top: 8px;
      .ri-heart-line {
        font-size: 24px;
        line-height: 1;
        color: var(--el-text-color-regular);
        transition: all 0.3s;

        &:hover {
          color: var(--el-text-color-primary);
        }
      }
      .ri-heart-fill {
        font-size: 24px;
        line-height: 1;
        color: var(--el-color-primary);
        transition: all 0.3s; 

        &:hover {
          color: var(--el-color-primary);
        }
      }

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
        text-align: center;
      }

      .progress-slider {
        flex: 1;
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
    }
  }
}
</style>
