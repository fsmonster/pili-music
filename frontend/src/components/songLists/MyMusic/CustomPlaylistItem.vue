<template>
  <div 
    class="music-item" 
    @click="navigateToPlaylist"
  >
    <div class="cover">
      <img :src="playlist.coverUrl || defaultCover" :alt="playlist.name">
    </div>
    <div class="info">
      <div class="title">{{ playlist.name }}</div>
      <div class="count">{{ playlist.mediaItems?.length || 0 }}首歌曲</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import defaultCover from '@/assets/image/default_cover.avif';
import type { CustomPlaylist } from '@/types';
// 接收属性
const props = defineProps<{
  playlist: CustomPlaylist;
}>();
const emit = defineEmits(['navigateToPlaylist']);


// 导航到播放列表详情页
const navigateToPlaylist = () => {
  emit('navigateToPlaylist', props.playlist);
};
</script>

<style lang="scss" scoped>
// 样式继承自父组件
</style>
