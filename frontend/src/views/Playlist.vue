<template>
  <Layout>
    <template #main>
      <div class="playlist">
        <!-- 播放列表头部 -->
        <div class="playlist-header">
          <div class="cover">
            <img :src="playlist.cover" :alt="playlist.title">
          </div>
          <div class="info">
            <h1>{{ playlist.title }}</h1>
            <p>{{ playlist.description }}</p>
          </div>
        </div>

        <!-- 播放列表内容 -->
        <div class="playlist-content">
          <div class="controls">
            <button class="play-all">
              <i class="ri-play-fill"></i>
              播放全部
            </button>
          </div>

          <!-- 歌曲列表 -->
          <div class="song-list">
            <div v-for="(song, index) in songs" :key="song.id" class="song-item">
              <span class="index">{{ index + 1 }}</span>
              <div class="song-info">
                <img :src="song.cover" :alt="song.title" class="song-cover">
                <div class="song-text">
                  <span class="title">{{ song.title }}</span>
                  <span class="artist">{{ song.uploader }}</span>
                </div>
              </div>
              <span class="duration">{{ formatDuration(song.duration) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Layout from '../layout/Layout.vue';
import defaultCover from '@/assets/image/default_cover.avif';
import musicCover from '@/assets/image/music_cover.jpg';
import likedSongs from '@/assets/image/liked-songs-300.jpg';

// 假数据
const playlist = ref({
  title: '测试播放列表',
  description: '这是一个测试播放列表的描述',
  cover: likedSongs,
  id: '1'
});

const songs = ref([
  {
    id: '1',
    title: '测试歌曲1',
    uploader: '测试上传者1',
    duration: 180,
    cover: defaultCover
  },
  {
    id: '2',
    title: '测试歌曲2',
    uploader: '测试上传者2',
    duration: 240,
    cover: musicCover
  },
  {
    id: '3',
    title: '测试歌曲3',
    uploader: '测试上传者3',
    duration: 200,
    cover: defaultCover
  }
]);

// 格式化时长
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
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

.play-all:hover {
  transform: scale(1.04);
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
}

.song-item:hover {
  background-color: var(--color-background-hover);
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
</style>
