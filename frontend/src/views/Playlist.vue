<template>
  <Layout>
    <template #main>
      <div class="playlist">
        <!-- 播放列表头部 -->
        <div class="playlist-header">
          <div class="cover">
            <img 
              :src="favoriteStore.currentFavorite?.cover" 
              :alt="favoriteStore.currentFavorite?.title"
            >
          </div>
          <div class="info">
            <h1>{{ favoriteStore.currentFavorite?.title }}</h1>
            <p>{{ favoriteStore.currentFavorite?.media_count }}个内容</p>
          </div>
        </div>

        <!-- 播放列表内容 -->
        <div class="playlist-content">
          <div class="controls">
            <button 
              class="play-all" 
              @click="handlePlayAll"
              :disabled="!favoriteStore.currentItems.length"
            >
              <i class="ri-play-fill"></i>
              播放全部
            </button>
          </div>

          <!-- 歌曲列表 -->
          <div v-if="favoriteStore.loading" class="loading">
            加载中...
          </div>
          <div v-else-if="favoriteStore.error" class="error">
            {{ favoriteStore.error }}
          </div>
          <div v-else class="song-list">
            <div 
              v-for="(item, index) in favoriteStore.currentItems" 
              :key="item.id" 
              class="song-item"
              :class="{ active: playlistStore.currentTrack?.id === item.id }"
              @click="handlePlay(item)"
            >
              <span class="index">{{ index + 1 }}</span>
              <div class="song-info">
                <img :src="item.cover" :alt="item.title" class="song-cover">
                <div class="song-text">
                  <span class="title">{{ item.title }}</span>
                  <span class="artist">{{ item.upper.name }}</span>
                </div>
              </div>
              <span class="duration">{{ formatDuration(item.duration) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Layout from '../layout/Layout.vue';
import { useFavoriteStore } from '@/stores/favorite';
import { usePlaylistStore } from '@/stores/playlist';
import type { FavoriteItem } from '@/types/types';

const route = useRoute();
const favoriteStore = useFavoriteStore();
const playlistStore = usePlaylistStore();

// 格式化时长
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 播放全部
const handlePlayAll = () => {
  if (favoriteStore.currentItems.length > 0) {
    playlistStore.setPlaylist(favoriteStore.currentItems);
    playlistStore.play(favoriteStore.currentItems[0]);
  }
};

// 播放单曲
const handlePlay = (item: FavoriteItem) => {
  playlistStore.setPlaylist(favoriteStore.currentItems);
  playlistStore.play(item);
};

onMounted(async () => {
  const id = route.query.id as string;
  if (id) {
    await favoriteStore.fetchFavoriteContent(id);
  }
});
</script>

<style scoped>
.playlist {
  padding: 24px;
  color: var(--color-text);
  height: 100%;
  overflow-y: auto;
}

.playlist-header {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.cover {
  width: 232px;
  height: 232px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 60px rgba(0, 0, 0, .5);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.info h1 {
  font-size: 96px;
  line-height: 96px;
  margin-bottom: 8px;
}

.info p {
  color: var(--color-text-secondary);
  font-size: 16px;
}

.controls {
  margin: 24px 0;
}

.play-all {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.play-all:not(:disabled):hover {
  transform: scale(1.04);
}

.play-all:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-all i {
  font-size: 24px;
}

.song-list {
  display: flex;
  flex-direction: column;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.song-item:hover {
  background-color: var(--color-background-hover);
}

.song-item.active {
  background-color: var(--color-background-active);
}

.index {
  width: 40px;
  color: var(--color-text-secondary);
  text-align: center;
}

.song-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.song-text {
  display: flex;
  flex-direction: column;
}

.title {
  font-weight: 400;
  color: var(--color-text);
}

.artist {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.duration {
  color: var(--color-text-secondary);
  margin-left: 16px;
}

.loading {
  text-align: center;
  padding: 24px;
  color: var(--color-text-secondary);
}

.error {
  text-align: center;
  padding: 24px;
  color: var(--color-error);
}
</style>
