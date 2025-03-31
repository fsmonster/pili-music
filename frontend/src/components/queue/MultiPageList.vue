<template>
  <div class="multi-page-content">
    <div 
      v-for="(page, index) in multiPageQueueStore.pageList" 
      :key="page.cid"
      class="queue-item"
      :class="{ 'active': isCurrentPage(page) }"
      @click="playPage(index + 1)"
    >
      <div class="item-index">{{ index + 1 }}</div>
      <div class="item-info">
        <div class="item-title">{{ page.part }}</div>
        <div class="item-duration">{{ formatDuration(page.duration) }}</div>
      </div>
    </div>
    
    <div v-if="multiPageQueueStore.pageList.length === 0" class="empty-queue">
      暂无分P内容
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMultiPageQueueStore, usePlayerStore } from '../../stores';
import { formatDuration } from '../../utils';

// 获取多P播放列表 store
const multiPageQueueStore = useMultiPageQueueStore();
// 获取播放器 store
const playerStore = usePlayerStore();

// 判断是否为当前播放的分P
const isCurrentPage = (page: any) => {
  // 检查是否是同一个视频的同一个分P
  return multiPageQueueStore.currentPage === page.page;
};

// 播放指定分P
const playPage = (page: number) => {
  multiPageQueueStore.setCurrentPage(page);
  playerStore.replay();
};
</script>

<style lang="scss" scoped>
.multi-page-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  
  .queue-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: var(--el-fill-color-light);
    }
    
    &.active {
      background-color: var(--el-color-primary-light-9);
      
      .item-index, .item-title {
        color: var(--el-color-primary);
      }
    }
    
    .item-index {
      width: 24px;
      text-align: center;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
    
    .item-info {
      flex: 1;
      margin-left: 12px;
      overflow: hidden;
      
      .item-title {
        font-size: 14px;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .item-duration {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
  
  .empty-queue {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    color: var(--el-text-color-secondary);
  }
}
</style>
