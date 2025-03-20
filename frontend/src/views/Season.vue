<template>
  <Layout>
    <template #main>
      <div class="playlist-container" ref="containerRef">
        <div class="playlist-scroll">
          <!-- 列表头部 -->
          <ListHeader 
            :title="info?.title"
            :cover="info?.cover"
            :count="info?.media_count"
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
              type="season"
              :data="medias"
              :loading="seasonStore.loading"
              @play="handlePlay"
            />

            <!-- 加载状态 -->
            <div v-if="seasonStore.loading" class="loading-more">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>

            <!-- 无数据 -->
            <div v-if="!seasonStore.loading && medias.length === 0" class="empty-data">
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
import { ref, computed, onBeforeMount, onMounted, onUnmounted } from 'vue';
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
const seasonStore = useSeasonStore();

const { id } = route.params;

// 滚动容器引用
// const scrollRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

// 计算属性
const info = computed(() => seasonStore.seasonContents?.info || null);
const medias = computed(() => seasonStore.seasonContents?.medias || []);

/**
 * @desc 加载内容
 */
async function loadContent() {  
  if (!id) return;
  await seasonStore.fetchAllSeasonContent(Number(id));
}

/**
 * @desc 移除内容
 */
function removeContent() {
  seasonStore.reset();
}

/**
 * @desc 播放全部
 */
function handlePlayAll() {
  if (medias.value.length > 0) {
    queueStore.setQueue(medias.value);
    playerStore.play(medias.value[0]);
  }
}

/**
 * @desc 播放单曲
 */
function handlePlay(item: MediaItem) {
  queueStore.setQueue(medias.value);
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
