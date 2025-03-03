<template>
  <Layout>
    <template #main>
      <MediaList />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
// import { usePlaylistStore } from '../stores/playlist';
import { useFavoriteStore } from '../stores/favorite';
import { useSeasonStore } from '../stores/season';
// import type { MediaItem } from '../types/types';
import Layout from '../layout/Layout.vue';
import MediaList from '../components/list/MediaList.vue';

const route = useRoute();
// const playlistStore = usePlaylistStore();
const favoriteStore = useFavoriteStore();
const seasonStore = useSeasonStore();

// 表格最大高度
const tableMaxHeight = ref(500);

// 计算表格高度
function calculateTableHeight() {
  // 获取视窗高度
  const windowHeight = window.innerHeight;
  // 减去其他元素的高度（头部、控制栏、分页等）
  // 预留 padding 和其他元素的空间
  tableMaxHeight.value = windowHeight - 400; // 根据实际情况调整
}

// 监听窗口大小变化
function handleResize() {
  calculateTableHeight();
}

onBeforeMount(() => {
  calculateTableHeight();
  window.addEventListener('resize', handleResize);
});

// 加载内容
async function loadContent() {
  const { type, id } = route.params;
  
  if (!id) return;
  
  switch (type) {
    case 'favorite':
      await favoriteStore.fetchFavoriteContent(Number(id));
      break;
    case 'season':
      await seasonStore.fetchSeasonContent(Number(id));
      break;
  }
}

onMounted(() => {
  loadContent();
});
</script>

<style scoped>
.playlist-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.playlist-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 滚动条样式 */
.playlist-scroll::-webkit-scrollbar {
  width: 6px;
}

.playlist-scroll::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
  border-radius: 3px;
}

.playlist-scroll::-webkit-scrollbar-track {
  background: var(--el-border-color-light);
  border-radius: 3px;
}

.playlist-header {
  margin-bottom: 20px;
}

.playlist-header-inner {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.cover {
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.info p {
  margin: 0;
  color: #666;
}

.playlist-content {
  flex: 1;
  overflow: visible;
  position: relative;
}

.controls-sticky {
  position: sticky;
  top: 0;
  background: var(--el-bg-color);
  padding: 20px 0;
  margin: -20px 0;
  z-index: 2;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.right {
  display: flex;
  gap: 10px;
}

.play-all {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: var(--el-color-primary);
  color: white;
  cursor: pointer;
}

.play-all:disabled {
  background-color: var(--el-color-primary-light-5);
  cursor: not-allowed;
}

:deep(.el-table) {
  border: none;
}

:deep(.el-table__inner-wrapper) {
  border: none;
}

:deep(.el-table__header-wrapper) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-table__body-wrapper) {
  overflow-y: visible;
}

.media-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.media-cover {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.media-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 固定表头样式 */
:deep(.el-table--scrollable-y) .el-table__fixed-header-wrapper {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-table__fixed-header-wrapper) {
  z-index: 1;
}

/* 表格滚动条样式 */
:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: var(--el-border-color-darker);
  border-radius: 3px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: var(--el-border-color-light);
  border-radius: 3px;
}

:deep(.el-table__row) {
  cursor: pointer;
}
</style>
