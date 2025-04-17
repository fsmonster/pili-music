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
            :cover="medias[0]?.cover || ''"
            :count="seriesMeta.total"
          />

          <!-- 播放列表内容 -->
          <div class="playlist-content">
            <!-- 控制栏 -->
            <ListControls
              :disabled="!medias.length"
              :type="CollectionType.Series"
              :sort="sort"
              :sortOptions="seriesSortOptions"
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
import { ref, computed, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import Layout from '../layout/Layout.vue';
import ListHeader from '../components/songList/ListHeader.vue';
import ListControls from '../components/songList/ListControls.vue';
import MediaList from '../components/songList/MediaList.vue';
import {useSeriesStore,useSeriesContentStore, usePlayerStore } from '../stores';
import { CollectionType, type SortType } from '../types';
import { SeriesSortType, FavoriteSortType, type MediaItem, type SeriesMeta } from '@/types';
import { getSeriesMeta } from '@/api';

// 路由参数
const route = useRoute();

const id = computed(() => route.params.id);

// Store
const seriesStore = useSeriesStore();
const seriesContentStore = useSeriesContentStore();
const playerStore = usePlayerStore();

// 状态
const loading = ref(false);

// 排序
const sort = ref<SortType | null>({
  type: CollectionType.Series,
  order: SeriesSortType.DESC,
});

// 排序选项
const seriesSortOptions = [
  { label: '升序', value: SeriesSortType.DESC },
  { label: '降序', value: SeriesSortType.ASC }
];

// 计算属性
const seriesMeta = ref<SeriesMeta | null>(null);
const { medias } = storeToRefs(seriesContentStore);

// 加载信息
const loadInfo = async () => {
  if (!id.value) return;
  try {
    const existingInfo = seriesStore.series.find(s => s.series_id === Number(id.value));
    if (existingInfo) {
      seriesMeta.value = existingInfo;
    } else {
      // 获取系列信息
      const seriesInfo = await getSeriesMeta(Number(id.value));
      seriesMeta.value = seriesInfo;
    }
  } catch (error) {
    console.error('获取系列信息失败:', error);
    ElMessage.error('获取系列信息失败');
  }
};

// 加载内容
const loadContent = async () => {
  if (!id.value) return;
  
  try {
    loading.value = true;
    
    // 获取系列内容
    const mid = seriesMeta.value?.mid;
    if (mid) {
      await seriesContentStore.fetchSeriesArchives(
        Number(id.value), 
        mid, 
        sort.value?.order as SeriesSortType
          ?? SeriesSortType.DESC);
    } else {
      ElMessage.error('获取系列内容失败');
    }
  } catch (error) {
    console.error('加载系列内容失败:', error);
    ElMessage.error('加载系列内容失败');
  } finally {
    loading.value = false;
  }
};

/**
 * @desc 构建播放选项
 */
function buildPlayOptionsPartial() {
  const id = seriesMeta.value?.series_id ?? 0;
  const title = seriesMeta.value?.name ?? '';
  const cover = medias.value[0].cover ?? '';

  return {
    collection: {
      type: CollectionType.Series,
      id,
      name: title,
      cover
    }
  };
}

// 播放全部
const handlePlayAll = () => {
  if (medias.value.length > 0) {
    playerStore.playMedia({
      queue: medias.value,
      total: seriesMeta.value?.total ?? 0,
      ...buildPlayOptionsPartial()
    });
  }
};

// 播放单曲
const handlePlay = (item: MediaItem) => {
  playerStore.playMedia({
    queue: medias.value,
    total: seriesMeta.value?.total ?? 0,
    currentTrack: item,
    ...buildPlayOptionsPartial()
  });
};

// 排序处理
const handleSort = (order: SeriesSortType | FavoriteSortType) => {
  sort.value = { type: CollectionType.Series, order };
};

/**
 * @desc 移除内容
 */
function removeContent() {
  seriesContentStore.reset();
}

watch(() => id.value, async () => {
  removeContent();
  await loadInfo();
  await loadContent();
}, { immediate: true });

watch(() => sort.value, () => {
  removeContent();
  loadContent();
});

onUnmounted(() => {
  removeContent();
});
</script>

<style lang="scss" scoped>
@use './style/playlist.scss';
</style>