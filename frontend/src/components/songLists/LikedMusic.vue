<template>
  <div 
    class="music-item" 
    @click="navigateToLikedMusic"
  >
    <div class="cover">
      <img :src="loveCover" alt="我喜欢的音乐">
      <div class="play-overlay" @click.stop="playAllLikedMusic">
        <i class="ri-play-circle-fill"></i>
      </div>
    </div>
    <div class="info">
      <div class="title">我的喜欢</div>
      <div class="count">{{ likeStore.likedCount }}首歌曲</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLikeStore } from '@/stores/list/like';
// import { usePlayerStore } from '@/stores/play/player';
import { ElMessage } from 'element-plus';
import loveCover from '@/assets/image/love.avif';

// 引入状态管理
const likeStore = useLikeStore();
// const playerStore = usePlayerStore();
const router = useRouter();

// 组件挂载时获取喜欢列表
onMounted(async () => {
  if (likeStore.likedCount === 0) {
    await likeStore.fetchLikedMedia();
  }
});

// 播放所有喜欢的音乐
const playAllLikedMusic = async () => {
  // 如果没有喜欢的音乐，不执行任何操作
  if (likeStore.likedCount === 0) {
    ElMessage.warning('暂无喜欢的音乐');
    return;
  }
  
  // TODO: 实现播放所有喜欢的音乐的逻辑
  // 需要先获取喜欢的音乐的详细信息，然后添加到播放列表
  ElMessage.success('开始播放我喜欢的音乐');
};

// 导航到喜欢的音乐详情页
const navigateToLikedMusic = () => {
  router.push('/liked-music');
};
</script>

<style lang="scss" scoped>
// 样式继承自父组件
</style>
