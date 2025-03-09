<template>
  <div 
    class="music-item" 
    @click="navigateToPlaylist"
  >
    <div class="cover">
      <img :src="coverUrl" :alt="playlist.name">
      <div class="play-overlay" @click.stop="playPlaylist">
        <i class="ri-play-circle-fill"></i>
      </div>
    </div>
    <div class="info">
      <div class="title">{{ playlist.name }}</div>
      <div class="count">{{ playlist.mediaItems?.length || 0 }}首歌曲</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
// import { usePlayerStore } from '@/stores/play/player';
import { usePlaylistStore } from '@/stores/list/custom';
import { ElMessage } from 'element-plus';
import type { CustomPlaylist } from '@/types';
import defaultCover from '@/assets/image/default_cover.avif';

// 接收属性
const props = defineProps<{
  playlist: CustomPlaylist;
}>();

// 引入状态管理
// const playerStore = usePlayerStore();
const playlistStore = usePlaylistStore();
const router = useRouter();

// 计算封面URL
const coverUrl = computed(() => {
  return props.playlist.coverUrl || defaultCover;
});

// 播放播放列表
const playPlaylist = async () => {
  // 如果播放列表为空，不执行任何操作
  if (!props.playlist.mediaItems || props.playlist.mediaItems.length === 0) {
    ElMessage.warning('播放列表为空');
    return;
  }
  
  // TODO: 实现播放播放列表的逻辑
  // 将播放列表中的音乐添加到播放队列
  ElMessage.success(`开始播放"${props.playlist.name}"`);
};

// 导航到播放列表详情页
const navigateToPlaylist = () => {
  // 设置当前查看的播放列表
  playlistStore.setCurrentPlaylist(props.playlist);
  router.push(`/playlist/${props.playlist._id}`);
};
</script>

<style lang="scss" scoped>
// 样式继承自父组件
</style>
