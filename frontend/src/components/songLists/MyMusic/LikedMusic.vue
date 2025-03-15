<template>
  <div 
    class="music-item" 
    @click="navigateToLikedMusic"
  >
    <div class="cover">
      <img :src="loveCover" alt="我喜欢的音乐">
    </div>
    <div class="info">
      <div class="title">我的喜欢</div>
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
const emit = defineEmits(['navigateToLikedMusic']);

// 导航到喜欢的音乐详情页
const navigateToLikedMusic = () => {
  emit('navigateToLikedMusic');
};
</script>

<style lang="scss" scoped>
// 样式继承自父组件
</style>
