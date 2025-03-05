<template>
  <Layout>
    <template #main>
      <div class="playlist-container" ref="containerRef">
        <div class="playlist-scroll" @scroll="handleScroll" ref="scrollRef">
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
              :disabled="!store.items.length"
              @update:sort="handleSort"
              @play-all="handlePlayAll"
              @sort="handleSort"
            />

            <!-- 表格 -->
            <MediaTable
              :data="store.items"
              :loading="store.loading"
              @play="handlePlay"
            />

            <!-- 加载状态 -->
            <div v-if="store.loading" class="loading-more">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>

            <!-- 无更多数据 -->
            <div v-if="!store.hasMore && store.items.length > 0" class="no-more">
              没有更多数据了
            </div>

            <!-- 无数据 -->
            <div v-if="!store.loading && store.items.length === 0" class="empty-data">
              暂无数据
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, computed, onBeforeMount, onMounted, onUnmounted, nextTick } from 'vue';
import { useFavoriteStore, useSeasonStore, usePlayerStore } from '../stores';
import Layout from '../layout/Layout.vue';
import MediaTable from '../components/songList/MediaTable.vue';
import ListHeader from '../components/songList/ListHeader.vue';
import ListControls from '../components/songList/ListControls.vue';
import { Loading } from '@element-plus/icons-vue';
import type { MediaItem } from '../types';

const route = useRoute();
const playerStore = usePlayerStore();

const { type, id } = route.params;

// 判断 store 类型
function isFavoriteStore(type: string | string[], _store: any): _store is ReturnType<typeof useFavoriteStore> {
  if (type == 'favorite') {
    return true;
  }
  return false;
}

function isSeasonStore(type: string | string[], _store: any): _store is ReturnType<typeof useSeasonStore> {
  if (type == 'season') {
    return true;
  }
  return false;
}

// 滚动容器引用
const scrollRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

/**
 * @desc 根据路由类型获取当前store
 */
const store = computed(() => {
  if (type == 'favorite') {
    return useFavoriteStore();
  } else if (type == 'season') {
    return useSeasonStore();
  }
  return useFavoriteStore();
});

/**
 * @desc 获取当前内容信息
 */
const currentInfo = computed(() => {
  if (isFavoriteStore(type, store.value)) {
    return store.value.currentFavorite;
  } else if (isSeasonStore(type, store.value)) {
    return store.value.currentSeason;
  }
  return null;
});

/**
 * @desc 加载内容
 */
async function loadContent() {  
  if (!id) return;
  if (isFavoriteStore(type, store.value))
      await store.value.fetchFavoriteContent(Number(id));
  if (isSeasonStore(type, store.value))
      await store.value.fetchSeasonContent(Number(id));
}

// 添加一个标志位，防止连续触发加载
const isLoadingMore = ref(false);

/**
 * @desc 加载更多内容
 */
async function loadMoreContent() {
  if (!store.value.hasMore || store.value.loading || isLoadingMore.value) return;
  
  // 设置标志位，防止连续触发
  isLoadingMore.value = true;
  
  // 记录当前滚动位置
  const scrollPosition = scrollRef.value?.scrollTop || 0;
  
  if (isFavoriteStore(type, store.value)) {
      await store.value.loadMoreFavoriteContent();

  } else if (isSeasonStore(type, store.value)) {
      await store.value.loadMoreSeasonContent?.();
  }
  
  // 使用 nextTick 确保 DOM 更新后再恢复滚动位置
  nextTick(() => {
    // 延迟一点时间，确保 DOM 完全渲染
    setTimeout(() => {
      // 恢复滚动位置
      if (scrollRef.value) {
        scrollRef.value.scrollTop = scrollPosition;
      }
      
      // 延迟重置标志位，防止快速连续触发
      // setTimeout(() => {
        isLoadingMore.value = false;
      // }, 200);
    },50);
  });
}

/**
 * @desc 处理滚动事件，实现触底加载
 */
function handleScroll() {
  if (!scrollRef.value || isLoadingMore.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = scrollRef.value;
  
  // 当滚动到距离底部100px时触发加载更多
  if (scrollHeight - scrollTop - clientHeight < 100) {
    loadMoreContent();
  }
}

/**
 * @desc 播放全部
 */
function handlePlayAll() {
  if (store.value.items.length > 0) {
    playerStore.setPlaylist(store.value.items);
    playerStore.play(store.value.items[0]);
  }
}

/**
 * @desc 播放单曲
 */
function handlePlay(item: MediaItem) {
  playerStore.setPlaylist(store.value.items);
  playerStore.play(item);
}

/**
 * @desc 搜索处理
 */
// function handleSearch(value: string) {
//   store.value.searchKeyword = value;
//   // 重新加载数据
//   loadContent();
// }

/**
 * @desc 排序处理
 */
function handleSort(value: 'desc' | 'asc') {
  // store.value.sortOrder = value;
  console.log(value);  
  // 重新加载数据
  loadContent();
}

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

onMounted(() => {
  loadContent();
  console.log(route.params);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.playlist-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .playlist-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    .playlist-content {
      flex: 1;
      overflow: visible;
      position: relative;
      /* 加载更多样式 */
      .loading-more {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px 0;
        color: var(--el-text-color-secondary);
      }

      .loading-more .el-icon {
        margin-right: 5px;
      }
      .no-more {
        text-align: center;
        padding: 20px 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }

      .empty-data {
        text-align: center;
        padding: 40px 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
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
}
</style>
