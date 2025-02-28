<template>
  <ContentSection title="最近播放">
    <template #icon>
      <i class="ri-history-line"></i>
    </template>
    <div class="music-grid">
      <div v-for="item in recentlyPlayed" :key="item.id" class="music-item">
        <div class="cover">
          <img :src="item.cover" :alt="item.title">
          <div class="play-overlay">
            <i class="ri-play-circle-fill"></i>
          </div>
        </div>
        <div class="info">
          <div class="title">{{ item.title }}</div>
          <div class="artist">{{ item.artist }}</div>
        </div>
      </div>
    </div>
  </ContentSection>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ContentSection from './ContentSection.vue';
import defaultCover from '@/assets/image/default_cover.avif';
// 假数据
const recentlyPlayed = ref([
  {
    id: 1,
    title: '夜に駆ける',
    artist: 'YOASOBI',
    cover: defaultCover,
  },
  {
    id: 2,
    title: '群青',
    artist: 'YOASOBI',
    cover: defaultCover,
  },
  {
    id: 3,
    title: '怪物',
    artist: 'YOASOBI',
    cover: defaultCover,
  },
]);
</script>

<style lang="scss" scoped>
@import './styles/music-grid.scss';
</style>
