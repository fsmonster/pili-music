<template>
  <div class="multi-page-content">
    <!-- 多P内容表格 -->
    <el-table
      :data="paginatedPageList"
      style="width: 100%"
      :border="false"
      :show-header="false"
      class="sub-table"
    >
      <!-- 索引列 -->
      <el-table-column width="60">
        <template #default="{ row: pageItem }">
          <div class="page-index">P{{ pageItem.page }}</div>
        </template>
      </el-table-column>

      <!-- 空白列 - 替代封面 -->
      <el-table-column width="70">
        <template #default="{ row: pageItem }">
          <div class="play-button-container">
            <el-button 
              type="primary" 
              circle 
              size="small"
              @click="playPage(pageItem)"
            >
              <i class="ri-play-fill"></i>
            </el-button>
          </div>
        </template>
      </el-table-column>

      <!-- 分P标题列 -->
      <el-table-column min-width="250">
        <template #default="{ row: pageItem }">
          <div class="page-title" :class="{ 'playing-page': isCurrentPlayingPage(pageItem) }">{{ pageItem.part }}</div>
        </template>
      </el-table-column>

      <!-- 空白列 - 替代up主 -->
      <el-table-column min-width="50">
        <template #default>
          <div></div>
        </template>
      </el-table-column>

      <!-- 时长列 -->
      <el-table-column width="120">
        <template #default="{ row: pageItem }">
          {{ formatDuration(pageItem.duration) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div v-if="pageList.length > pageSize" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        layout="prev, pager, next"
        :total="pageList.length"
        @current-change="handlePageChange"
        background
        small
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElTable, ElTableColumn, ElButton, ElPagination } from 'element-plus';
import { useQueueStore, usePlayerStore, useMultiPageQueueStore } from '@/stores';
import { formatDuration } from '@/utils';
import type { MediaItem, CidInfo } from '@/types';

// 定义组件属性
const props = defineProps<{
  parentMedia: MediaItem; // 父媒体项
  pageList: CidInfo[]; // 分P列表
}>();

// 播放队列和播放器
const queueStore = useQueueStore();
const playerStore = usePlayerStore();
const multiPageQueueStore = useMultiPageQueueStore();

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10); // 每页显示的分P数量

// 分页后的列表
const paginatedPageList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return props.pageList.slice(start, end);
});

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

// 播放指定分P
const playPage = (pageItem: CidInfo) => {
  // 设置多P播放队列
  multiPageQueueStore.setPageList(props.parentMedia.id, props.pageList);
  
  // 设置当前选中的分P
  multiPageQueueStore.setSelectedPage(pageItem.page);
  
  // 播放该媒体项
  playerStore.play(props.parentMedia);
};

// 判断是否为当前播放的分P
const isCurrentPlayingPage = (pageItem: CidInfo) => {
  const currentTrack = queueStore.currentTrack;
  if (!currentTrack) return false;
  
  // 检查是否是同一个视频的同一个分P
  return currentTrack.bvid === props.parentMedia.bvid && 
         currentTrack.cid === pageItem.cid &&
         multiPageQueueStore.selectedPage === pageItem.page;
};
</script>

<style lang="scss" scoped>
.multi-page-content {
  padding: 10px 20px;
}

.sub-table {
  margin-bottom: 10px;
  
  :deep(.el-table__row) {
    background-color: var(--el-fill-color-lighter);
  }
}

.page-index {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.play-button-container {
  display: flex;
  justify-content: center;
}

.page-title {
  font-size: 13px;
  
  &.playing-page {
    color: var(--el-color-primary);
    font-weight: bold;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>
