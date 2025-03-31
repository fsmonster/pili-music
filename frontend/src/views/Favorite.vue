<template>
  <Layout>
    <template #main>
      <div class="playlist-container">
        <div class="playlist-scroll">
          <!-- 列表头部 -->
          <ListHeader 
            v-if="currentInfo"
            :mid="currentInfo.mid"
            :title="currentInfo.title"
            :cover="currentInfo.cover"
            :count="currentInfo.media_count"
          />

          <!-- 播放列表内容 -->
          <div class="playlist-content">
            <!-- 控制栏 -->
            <ListControls
              :disabled="!medias.length"
              @update:sort="handleSort"
              @play-all="handlePlayAll"
              @sort="handleSort"
            />

            <!-- 表格 -->
            <MediaTable
              :data="medias"
              type="favorite"
              :loading="favoriteContentStore.loading"
              @play="handlePlay"
            />

            <!-- 加载更多 -->
            <div v-if="favoriteContentStore.hasMore" class="loading-more">
              <el-button type="primary" @click="loadMore">加载更多</el-button>
            </div>

            <!-- 加载状态 -->
            <div v-if="favoriteContentStore.loading" class="loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>

            <!-- 无数据 -->
            <div v-if="!favoriteContentStore.loading && medias.length === 0" class="empty-data">
              暂无数据
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useFavoriteContentStore, usePlayerStore, useQueueStore, useLazyLoadStore } from '../stores';
import Layout from '../layout/Layout.vue';
import MediaTable from '../components/songList/MediaTable.vue';
import ListHeader from '../components/songList/ListHeader.vue';
import ListControls from '../components/songList/ListControls.vue';
import { Loading } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import type { FavoriteInfo, MediaItem } from '../types';
import * as favoriteApi from '../api/favorite';
import { storeToRefs } from 'pinia';

const route = useRoute();
const playerStore = usePlayerStore();
const queueStore = useQueueStore();
const favoriteContentStore = useFavoriteContentStore();
const lazyLoad = useLazyLoadStore();

const { id } = route.params;

// 当前收藏夹信息
const currentInfo = ref<FavoriteInfo | null>(null);

// 播放状态锁 - 设置懒加载状态信息
const playLock = ref(false);

// 计算属性
const { medias } = storeToRefs(favoriteContentStore);

/**
 * @desc 加载内容
 */
async function loadContent() {  
  if (!id) return;
  
  // 获取收藏夹信息
  try {
    const favoriteInfo: FavoriteInfo = await favoriteApi.getFavoriteInfo(Number(id));
    currentInfo.value = favoriteInfo;
  } catch (error) {
    console.error('获取收藏夹信息失败:', error);
  }
  
  // 加载收藏夹内容
  await favoriteContentStore.fetchFavoriteContent(Number(id));
}

/**
 * @desc 加载更多
 */
const loadMore = async () => {
  await favoriteContentStore.fetchFavoriteContent(Number(id));
};

/**
 * @desc 播放全部
 */
function handlePlayAll() {
  if (medias.value.length > 0) {
    queueStore.setQueue(medias.value);
    queueStore.total = currentInfo.value?.media_count ?? 0;
    queueStore.setCurrentIndex(0);
    playerStore.replay();
    playLock.value = true;
  }
}

/**
 * @desc 播放单曲
 */
function handlePlay(item: MediaItem) {
  queueStore.setQueue(medias.value);
  queueStore.total = currentInfo.value?.media_count ?? 0;
  queueStore.setCurrentTrack(item);
  playerStore.replay();
  playLock.value = true;
}

/**
 * @desc 排序处理
 */
function handleSort(value: 'desc' | 'asc') {
  console.log('排序:', value);
  // TODO: 实现排序功能
  // 可能需要调用 API 重新获取数据
}

// 播放状态变化
watch(() => playLock.value, () => {
  if (playLock.value) {
    // 设置懒加载
    lazyLoad.reset();
    lazyLoad.type = 'favorite';
    lazyLoad.id = currentInfo.value?.id ?? 0;
    lazyLoad.pn = favoriteContentStore.page;
    lazyLoad.total = currentInfo.value?.media_count ?? 0;
  }
  playLock.value = false;
});

onMounted(() => {
  playLock.value = false;
  loadContent();
});

onUnmounted(() => {
  lazyLoad.pn = favoriteContentStore.page;
  favoriteContentStore.reset();
});
</script>

<style lang="scss" scoped>
@import './style/playlist.scss';

.loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 15px;
  color: var(--el-text-color-secondary);
}
</style>
