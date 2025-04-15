<template>
  <div class="now-playing" :class="{ playing }">
    <img 
      :src="currentTrack ? processResourceUrl(currentTrack.cover)+'@120h' : defaultCover" 
      :alt="currentTrack?.title || '封面'" 
    />
    <div class="track-info">
      <div class="track-name"
        @click="goToVideoPage()"
      >{{ currentTrack?.title || '点击播放你喜欢的音乐吧～' }}</div>
      <div class="artist"
        @click="goToUserPage()"
      >{{ currentTrack?.upper?.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 无需导入 Vue 组合式 API
import { storeToRefs } from 'pinia';
import defaultCover from '@/assets/image/music_cover.avif';
import { usePlayerStore, useCurrentTrackStore } from '@/stores';
import { processResourceUrl } from '@/utils';
import { useRouter } from 'vue-router';

const router = useRouter();

// 播放器 store
const playStore = usePlayerStore();
// 当前播放项 store
const currentTrackStore = useCurrentTrackStore();

const { currentTrack } = storeToRefs(currentTrackStore);
const { playing } = storeToRefs(playStore);

// 跳转到视频页面
const goToVideoPage = () => {
  if (currentTrack.value?.bvid){
    window.open(`https://www.bilibili.com/video/${currentTrack.value?.bvid}`);
  }
  else{
    window.open(`https://www.bilibili.com/video/BV1uT4y1P7CX`);
  }
};

// 跳转到用户页面
const goToUserPage = () => {
  router.push(`/user/${currentTrack.value?.upper?.mid}`);
};
</script>

<style lang="scss" scoped>
@use '../../assets/styles/mixins.scss';

.now-playing {
  min-width: 15%;
  max-width: 300px;
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    height: 56px; /* 固定高度 */
    width: 56px;  /* 初始宽度 */
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: width 0.5s ease;
  }

  .track-info {
    .track-name {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
      color: var(--el-text-color-primary);
      @include mixins.text-ellipsis-multi(2);

      &:hover {
        color: var(--el-color-primary);
        cursor: pointer;
        text-decoration: underline;
      }
    }

    .artist {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      @include mixins.text-ellipsis;

      &:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }
  }

  &.playing {
    img {
      width: calc(56px * 16 / 9); /* 计算 16:9 的宽度 */
    }
  }
}
</style>
