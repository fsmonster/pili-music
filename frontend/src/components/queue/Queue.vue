<template>
  <div 
    class="queue-container" 
    :class="{ 'is-visible': queueStore.isPopup }"
    v-if="queueStore.isPopup"
  >
    <div class="queue-header">
      <div class="queue-title">
        <span>播放队列 ({{ queueStore.total }})</span>
      </div>
      <div class="queue-actions">
        <i class="ri-close-line" @click="queueStore.togglePopup()"></i>
      </div>
    </div>
    
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
  </div>
</template>

<script setup lang="ts">
import { useQueueStore, useLazyLoadStore } from '@/stores';
import { usePlayerStore } from '@/stores/play/player';
import { onMounted, onUnmounted, ref } from 'vue';
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
  // 触发播放
  if (queueStore.currentItem) {
    playerStore.play(queueStore.currentItem);
  }
};

// 监听点击外部关闭队列
const handleClickOutside = (event: MouseEvent) => {
  const queueElement = document.querySelector('.queue-container');
  const playlistButton = document.querySelector('.ri-play-list-line');
  
  if (queueElement && 
      !queueElement.contains(event.target as Node) && 
      playlistButton && 
      !playlistButton.contains(event.target as Node)) {
    queueStore.setPopupState(false);
  }
};

// 添加队列
const addToQueue = async () => {
  if (loadLock.value) return;
  if (lazyLoad.hasMore) {
    loadLock.value = true;
    lazyLoad.pn++;
    queueStore.queue.push(...(await lazyLoad.getData()));
    loadLock.value = false;
  }
};

// 滚动加载
const handleScroll = async () => {
  if (queueContentRef.value && lazyLoad.type) {
    const { scrollTop, clientHeight, scrollHeight } = queueContentRef.value;
    if (scrollTop + clientHeight >= scrollHeight - 150) {
      console.log('滚动加载', scrollTop, clientHeight, scrollHeight);
      await addToQueue();
    }
  }
};

// 组件挂载时添加点击外部关闭事件
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
.queue-container {
  position: fixed;
  right: 35px;
  top: 160px;
  bottom: 80px;
  width: 30%;
  min-width: 320px;
  background-color: rgba(#f9f9f9, 0.9);
  border: 1px solid var(--el-border-color-light);
  border-bottom: 0;
  border-radius: 10px 10px 0 0;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: 10px -3px 10px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  
  &.is-visible {
    transform: translateX(0);
  }
}

.queue-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .queue-title {
    font-weight: bold;
    font-size: 16px;
  }
  
  .queue-actions {
    i {
      cursor: pointer;
      font-size: 20px;
      color: var(--el-text-color-secondary);
      
      &:hover {
        color: var(--el-text-color-primary);
      }
    }
  }
}

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
    font-size: 14px;
  }
}
</style>