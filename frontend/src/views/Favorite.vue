<template>
  <Layout>
    <template #main>
      <div class="playlist-container">
        <div class="playlist-scroll">
          <!-- 列表头部 -->
          <ListHeader 
            :title="currentInfo?.title"
            :cover="currentInfo?.cover"
            :count="currentInfo?.media_count"
          />

          <!-- 播放列表内容 -->
          <div class="playlist-content">
            <!-- 控制栏 -->
            <ListControls
              :disabled="!favoriteContentStore.medias.length"
              @update:sort="handleSort"
              @play-all="handlePlayAll"
              @sort="handleSort"
            />

            <!-- 表格 -->
            <MediaTable
              :data="favoriteContentStore.medias"
              type="favorite"
              :loading="favoriteContentStore.loading"
              @play="handlePlay"
            />

            <!-- 加载状态 -->
            <div v-if="favoriteContentStore.loading" class="loading-more">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>

            <!-- 无数据 -->
            <div v-if="!favoriteContentStore.loading && favoriteContentStore.medias.length === 0" class="empty-data">
              暂无数据
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, onUnmounted } from 'vue';
import { useFavoriteContentStore, usePlayerStore, useQueueStore } from '../stores';
import Layout from '../layout/Layout.vue';
import MediaTable from '../components/songList/MediaTable.vue';
import ListHeader from '../components/songList/ListHeader.vue';
import ListControls from '../components/songList/ListControls.vue';
import { Loading } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import type { MediaItem } from '../types';
import * as favoriteApi from '../api/favorite';

const route = useRoute();
const playerStore = usePlayerStore();
const queueStore = useQueueStore();
const favoriteContentStore = useFavoriteContentStore();

const { id } = route.params;

// 当前收藏夹信息
const currentInfo = ref<any>(null);

/**
 * @desc 加载内容
 */
async function loadContent() {  
  if (!id) return;
  
  // 获取收藏夹信息
  try {
    const favoriteInfo = await favoriteApi.getFavoriteInfo({ media_id: Number(id) });
    currentInfo.value = favoriteInfo;
  } catch (error) {
    console.error('获取收藏夹信息失败:', error);
  }
  
  // 完整加载收藏夹内容
  await favoriteContentStore.fetchFavoriteContent(Number(id), true);
}

/**
 * @desc 移除内容
 */
function removeContent() {
  favoriteContentStore.reset();
}

/**
 * @desc 播放全部
 */
function handlePlayAll() {
  if (favoriteContentStore.medias.length > 0) {
    queueStore.setQueue(favoriteContentStore.medias);
    playerStore.play(favoriteContentStore.medias[0]);
  }
}

/**
 * @desc 播放单曲
 */
function handlePlay(item: MediaItem) {
  queueStore.setQueue(favoriteContentStore.medias);
  playerStore.play(item);
}

/**
 * @desc 排序处理
 */
function handleSort(value: 'desc' | 'asc') {
  console.log('排序:', value);
  // TODO: 实现排序功能
  // 可能需要调用 API 重新获取数据
}

// 表格最大高度
const tableMaxHeight = ref(500);

/**
 * 计算表格高度
 */
function calculateTableHeight() {
  const windowHeight = window.innerHeight;
  // 减去其他元素的高度，如头部、控制栏等
  tableMaxHeight.value = windowHeight - 200;
}

/**
 * 监听窗口大小变化
 */
function handleResize() {
  calculateTableHeight();
}

onBeforeMount(() => {
  calculateTableHeight();
  window.addEventListener('resize', handleResize);
});

onMounted(() => {
  loadContent();
});

onUnmounted(() => {
  removeContent();
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
@import './style/playlist.scss';
</style>
