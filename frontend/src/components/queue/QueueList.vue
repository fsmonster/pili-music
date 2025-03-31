<template>
  <div class="queue-content" 
    ref="queueContentRef"
    @scroll="handleScroll">
    <div 
      v-for="(item, index) in queueStore.queue" 
      :key="item.id || index"
      class="queue-item"
      :class="{ 'active': index === queueStore.currentIndex }"
      @click="playItem(index)"
    >
      <div class="item-info">
        <!-- 播放标题，默认只展示一行 -->
        <div class="item-title">{{ item.title }}</div>
      </div>
      <!-- 时间 -->
      <div class="item-duration">{{ formatTime(item.duration) }}</div>
    </div>
    
    <div v-if="queueStore.queue.length === 0" class="empty-queue">
      播放队列为空
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQueueStore, useLazyLoadStore } from '@/stores';
import { usePlayerStore } from '@/stores/play/player';
import { ref } from 'vue';
import { formatTime } from '@/utils';

// 获取状态管理
const queueStore = useQueueStore();
const playerStore = usePlayerStore();
const lazyLoad = useLazyLoadStore();

const queueContentRef = ref<HTMLElement | null>(null);
const loadLock = ref(false);

// 播放指定项目
const playItem = (index: number) => {
  queueStore.setCurrentIndex(index);
  playerStore.replay();
};

// 添加队列
const addToQueue = async () => {
  if (loadLock.value) return;
  loadLock.value = true;
  lazyLoad.pn++;
  queueStore.queue.push(...(await lazyLoad.getData()));
  loadLock.value = false;
};

// 滚动加载
const handleScroll = async () => {
  if (queueContentRef.value && lazyLoad.type) {
    const { scrollTop, clientHeight, scrollHeight } = queueContentRef.value;
    if (scrollTop + clientHeight >= scrollHeight - 150) {
      await addToQueue();
    }
  }
};
</script>

<style lang="scss" scoped>
.queue-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  
  .queue-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    
    &:hover {
      background-color: var(--el-fill-color-light);
    }
    
    &.active {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
    
    .item-info {
      flex: 1;
      min-width: 0; // 确保flex子项可以正确缩小
      
      .item-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
      }
    }
    
    .item-duration {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-left: 8px;
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
