<template>
  <div 
    class="music-item" 
    @click="navigateToRecentPlays"
  >
    <div class="cover">
      <img :src="loveCover" alt="最近播放">
    </div>
    <div class="info">
      <div class="title">最近播放</div>
      <div class="count">{{ count }}首歌曲</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import loveCover from '@/assets/image/love.avif';

defineProps({
  count: {
    type: Number,
    default: 0
  }
});
const emit = defineEmits(['navigateToRecentPlays']);

const navigateToRecentPlays = () => {
  emit('navigateToRecentPlays');
};
</script>

<style lang="scss" scoped>
// 样式继承自父组件
</style>
