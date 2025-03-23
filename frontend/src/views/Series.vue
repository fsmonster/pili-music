
<template>
  <Layout>
    <template #main>
      <div class="playlist-container">
        <div class="playlist-scroll">
          <!-- 列表头部 -->
          <ListHeader 
            :title="seriesMeta?.name"
            :cover="seriesMeta?.cover"
            :count="seriesMeta?.total"
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
              type="series"
              :data="medias"
              :loading="loading"
              @play="handlePlay"
            />

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-more">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>

            <!-- 无数据 -->
            <div v-if="!loading && medias.length === 0" class="empty-data">
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
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import Layout from '../layout/Layout.vue';
import ListHeader from '../components/songList/ListHeader.vue';
import ListControls from '../components/songList/ListControls.vue';
import MediaTable from '../components/songList/MediaTable.vue';
import { usePlayerStore, useQueueStore } from '../stores';
import { useSeriesStore } from '../stores/list/series';
import { convertArchiveToMediaItem } from '../utils/common';
import type { MediaItem } from '../types';

// 路由参数
const route = useRoute();
const seriesId = computed(() => Number(route.params.id));

// Store
const seriesStore = useSeriesStore();
const playerStore = usePlayerStore();
const queueStore = useQueueStore();

// 状态
const loading = ref(false);

// 计算属性
const seriesMeta = computed(() => seriesStore.series.find(s => s.series_id === seriesId.value));
const medias = computed<MediaItem[]>(() => {
  return seriesStore.seriesArchives.map(convertArchiveToMediaItem);
});

// 加载内容
const loadContent = async () => {
  if (!seriesId.value) return;
  
  try {
    loading.value = true;
    
    // 获取系列内容
    const mid = seriesMeta.value?.mid;
    if (mid) {
      await seriesStore.fetchSeriesArchives(mid, seriesId.value);
    } else {
      ElMessage.error('获取系列信息失败');
    }
  } catch (error) {
    console.error('加载系列内容失败:', error);
    ElMessage.error('加载系列内容失败');
  } finally {
    loading.value = false;
  }
};

// 播放全部
const handlePlayAll = () => {
  if (medias.value.length === 0) return;
  
  // 设置播放队列
  queueStore.setQueue(medias.value);
  
  // 播放第一个
  playerStore.play(medias.value[0]);
};

// 播放单曲
const handlePlay = (item: MediaItem) => {
  // 设置播放队列
  queueStore.setQueue(medias.value);
  
  // 播放选中的
  playerStore.play(item);
};

// 排序处理
const handleSort = (value: 'desc' | 'asc') => {
  // 这里可以实现排序逻辑
  console.log('排序方式:', value);
};

// 表格最大高度
const tableMaxHeight = ref(500);

// 计算表格高度
const calculateTableHeight = () => {
  const containerHeight = window.innerHeight; // 减去其他元素的高度
  tableMaxHeight.value = Math.max(300, containerHeight);
};

// 监听窗口大小变化
const handleResize = () => {
  calculateTableHeight();
};

onBeforeMount(() => {
  calculateTableHeight();
  window.addEventListener('resize', handleResize);
});

onMounted(() => {
  loadContent();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
@import './style/playlist.scss';
</style>