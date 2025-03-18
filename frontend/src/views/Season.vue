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
              type="season"
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
import { useSeasonStore, usePlayerStore, useQueueStore } from '../stores';
import Layout from '../layout/Layout.vue';
import ListHeader from '../components/songList/ListHeader.vue';
import ListControls from '../components/songList/ListControls.vue';
import { Loading } from '@element-plus/icons-vue';
import type { MediaItem } from '../types';
import MediaTable from '../components/songList/MediaTable.vue';

const route = useRoute();
const playerStore = usePlayerStore();
const queueStore = useQueueStore();
const store = useSeasonStore();

const { id } = route.params;

// 滚动容器引用
const scrollRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

/**
 * @desc 获取当前内容信息
 */
const currentInfo = computed(() => {
  return store.currentSeason;
});

/**
 * @desc 加载内容
 */
async function loadContent() {  
  if (!id) return;
  await store.fetchSeasonContent(Number(id));
}

/**
 * @desc 移除内容
 */
function removeContent() {
  store.items = [];
  store.currentSeason = null;
}

// 添加一个标志位，防止连续触发加载
const isLoadingMore = ref(false);

/**
 * @desc 加载更多内容
 */
async function loadMoreContent() {
  if (!store.hasMore || store.loading || isLoadingMore.value) return;
  
  // 设置标志位，防止连续触发
  isLoadingMore.value = true;
  
  // 记录当前滚动位置
  const scrollPosition = scrollRef.value?.scrollTop || 0;
  
  if (store.loadMoreSeasonContent) {
    await store.loadMoreSeasonContent();
  }
  
  // 使用 nextTick 确保 DOM 更新后再恢复滚动位置
  nextTick(() => {
    // 延迟一点时间，确保 DOM 完全渲染
    setTimeout(() => {
      // 恢复滚动位置
      if (scrollRef.value) {
        scrollRef.value.scrollTop = scrollPosition;
      }
      
      // 重置标志位
      isLoadingMore.value = false;
    }, 50);
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
  if (store.items.length > 0) {
    queueStore.setQueue(store.items);
    playerStore.play(store.items[0]);
  }
}

/**
 * @desc 播放单曲
 */
function handlePlay(item: MediaItem) {
  queueStore.setQueue(store.items);
  playerStore.play(item);
}

/**
 * @desc 排序处理
 */
function handleSort(value: 'desc' | 'asc') {
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
  removeContent();
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
