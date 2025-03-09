<template>
  <div 
    class="music-item" 
    @click="navigateToRecentPlays"
  >
    <div class="cover">
      <img :src="loveCover" alt="最近播放">
      <div class="play-overlay" @click.stop="playAllRecentMusic">
        <i class="ri-play-circle-fill"></i>
      </div>
    </div>
    <div class="info">
      <div class="title">最近播放</div>
      <div class="count">{{ recentPlayStore.recentPlayCount }}首歌曲</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRecentPlayStore } from '@/stores/list/recentPlay';
// import { usePlayerStore } from '@/stores/play/player';
import { ElMessage } from 'element-plus';
import loveCover from '@/assets/image/love.avif';

// 引入状态管理
const recentPlayStore = useRecentPlayStore();
// const playerStore = usePlayerStore();
const router = useRouter();

// 组件挂载时获取最近播放列表
onMounted(async () => {
  if (recentPlayStore.recentPlayCount === 0) {
    await recentPlayStore.fetchRecentPlays();
  }
});

// 播放所有最近播放的音乐
const playAllRecentMusic = async () => {
  // 如果没有最近播放的音乐，不执行任何操作
  if (recentPlayStore.recentPlayCount === 0) {
    ElMessage.warning('暂无最近播放记录');
    return;
  }
  
  // TODO: 实现播放所有最近播放音乐的逻辑
  // 将最近播放的音乐添加到播放列表
  ElMessage.success('开始播放最近播放的音乐');
};

// 导航到最近播放详情页
const navigateToRecentPlays = () => {
  router.push('/recent-plays');
};
</script>

<style lang="scss" scoped>
// 样式继承自父组件
</style>
