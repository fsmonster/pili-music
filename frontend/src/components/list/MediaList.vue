# 主列表组件
<template>
  <div class="playlist-container">
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
          v-model:search="store.searchKeyword"
          v-model:sort="store.sortOrder"
          :disabled="!store.items.length"
          @play-all="handlePlayAll"
          @search="handleSearch"
          @sort="handleSort"
        />

        <!-- 表格 -->
        <MediaTable
          :data="store.paginatedItems"
          :loading="store.loading"
          @play="handlePlay"
        />

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="store.currentPage"
            v-model:page-size="store.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="store.total"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePlaylistStore } from '../../stores/playlist';
import { useFavoriteStore } from '../../stores/favorite';
import { useSeasonStore } from '../../stores/season';
import ListHeader from './ListHeader.vue';
import ListControls from './ListControls.vue';
import MediaTable from './MediaTable.vue';
import type { MediaItem } from '../../types/types';

/**
 * Props
 */
const props = defineProps<{
  // 可选的外部传入的 store，用于自定义列表数据源
  customStore?: any
}>();

const route = useRoute();
const playlistStore = usePlaylistStore();

// 根据路由类型获取当前store
const store = computed(() => {
  if (props.customStore) {
    return props.customStore;
  }

  switch (route.params.type) {
    case 'favorite':
      return useFavoriteStore();
    case 'season':
      return useSeasonStore();
    default:
      return useFavoriteStore();
  }
});

// 当前内容信息
const info = computed(() => {
  switch (route.params.type) {
    case 'favorite':
      return store.value.currentFavorite;
    case 'season':
      return store.value.currentSeason;
    default:
      return null;
  }
});

// 播放全部
function handlePlayAll() {
  if (store.value.items.length > 0) {
    playlistStore.setPlaylist(store.value.items);
    playlistStore.play(store.value.items[0]);
  }
}

// 播放单曲
function handlePlay(item: MediaItem) {
  playlistStore.setPlaylist([item]);
  playlistStore.play(item);
}

// 加载内容
async function loadContent() {
  const { type, id } = route.params;
  
  if (!id) return;
  
  switch (type) {
    case 'favorite':
      await store.value.fetchFavoriteContent(id.toString());
      break;
    case 'season':
      await store.value.fetchSeasonContent(id.toString());
      break;
  }
}

// 搜索处理
function handleSearch() {
  store.value.setPage(1);
}

// 排序处理
function handleSort() {
  store.value.setPage(1);
}

// 分页处理
function handlePageChange(page: number) {
  store.value.setPage(page);
}

function handleSizeChange(size: number) {
  store.value.setPageSize(size);
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
  margin: 20px;
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

.playlist-content {
  position: relative;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
