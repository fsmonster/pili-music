<template>
  <Layout>
    <template #main>
      <div class="playlist-container">
        <div class="playlist-scroll">
          <!-- 列表头部 -->
          <ListHeader 
            v-if="seriesMeta"
            :mid="seriesMeta.mid"
            :title="seriesMeta.name"
            :cover="seriesMeta.cover!"
            :count="seriesMeta.total"
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

            <!-- 媒体列表 -->
            <MediaList
              type="series"
              :data="medias"
              :loading="loading"
              @play="handlePlay"
            />

            <!-- 加载状态 -->
            <div v-if="loading" class="loading">
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
import { ref, onUnmounted, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import Layout from '../layout/Layout.vue';
import ListHeader from '../components/songList/ListHeader.vue';
import ListControls from '../components/songList/ListControls.vue';
import MediaList from '../components/songList/MediaList.vue';
import {useSeriesStore,useSeriesContentStore, usePlayerStore, useQueueStore } from '../stores';
import type { MediaItem, SeriesMeta } from '@/types';
import { getSeriesCover, getSeriesMeta } from '@/api';

// 路由参数
const route = useRoute();
// const seriesId = computed(() => Number(route.params.id));
const { id } = route.params;

// Store
const seriesStore = useSeriesStore();
const seriesContentStore = useSeriesContentStore();
const playerStore = usePlayerStore();
const queueStore = useQueueStore();

// 状态
const loading = ref(false);

// 计算属性
const seriesMeta = ref<SeriesMeta | null>(null);
const { medias } = storeToRefs(seriesContentStore);

// 加载信息
const loadInfo = async () => {
  if (!id) return;
  try {
    const existingInfo = seriesStore.series.find(s => s.series_id === Number(id));
    if (existingInfo) {
      seriesMeta.value = existingInfo;
    } else {
      // 获取系列信息
      const seriesInfo = await getSeriesMeta(Number(id));
      seriesMeta.value = seriesInfo;
      seriesMeta.value.cover = await getSeriesCover(Number(id), seriesInfo.mid);
    }
  } catch (error) {
    console.error('获取系列信息失败:', error);
    ElMessage.error('获取系列信息失败');
  }
};

// 加载内容
const loadContent = async () => {
  if (!id) return;
  
  try {
    loading.value = true;
    
    // 获取系列内容
    const mid = seriesMeta.value?.mid;
    if (mid) {
      await seriesContentStore.fetchSeriesArchives(Number(id), mid);
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
  queueStore.total = seriesMeta.value?.total ?? 0;
  playerStore.replay();
};

// 播放单曲
const handlePlay = (item: MediaItem) => {
  // 设置播放队列
  queueStore.setQueue(medias.value);
  queueStore.total = seriesMeta.value?.total ?? 0;
  queueStore.setCurrentTrack(item);
  playerStore.replay();
};

// 排序处理
const handleSort = (value: 'desc' | 'asc') => {
  // 这里可以实现排序逻辑
  console.log('排序方式:', value);
};

/**
 * @desc 移除内容
 */
function removeContent() {
  seriesContentStore.reset();
}

onMounted(() => {
  loadInfo();
  loadContent();
});

onUnmounted(() => {
  removeContent();
});
</script>

<style lang="scss" scoped>
@import './style/playlist.scss';
</style>