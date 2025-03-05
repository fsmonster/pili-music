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
          :disabled="!items.length"
          @play-all="$emit('play-all')"
        />

        <!-- 表格 -->
        <MediaTable
          :data="items"
          :loading="loading"
          @play="$emit('play', $event)"
        />

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next"
            @size-change="$emit('size-change', $event)"
            @current-change="$emit('page-change', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ListHeader from './ListHeader.vue';
import ListControls from './ListControls.vue';
import MediaTable from './MediaTable.vue';
import type { MediaItem } from '../../types';

/**
 * Props
 */
defineProps<{
  // 媒体列表数据
  items: MediaItem[]
  // 当前内容信息
  info?: any
  // 加载状态
  loading?: boolean
  // 分页相关
  currentPage: number
  pageSize: number
  total: number
}>();

// 定义事件
defineEmits<{
  (e: 'play', item: MediaItem): void
  (e: 'play-all'): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
}>();
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
