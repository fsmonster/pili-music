<template>
  <div 
    class="queue-container" 
    :class="{ 'is-visible': queueStore.isPopup }"
    v-if="queueStore.isPopup"
  >
    <div class="queue-header">
      <div class="queue-tabs">
        <TabsWithUnderline 
          :tabs="tabs" 
          font-size="14px"
          v-model:activeTab="activeTab"
        />
        <!-- <div 
          class="tab-item" 
          :class="{ 'active': activeTab === 'queue' }"
          @click="activeTab = 'queue'"
        >
          播放队列 ({{ queueStore.total }})
        </div>
        <div 
          v-if="multiPageQueueStore.isSetMultiPageList"
          class="tab-item" 
          :class="{ 'active': activeTab === 'multiPage' }"
          @click="activeTab = 'multiPage'"
        >
          分P列表 ({{ multiPageQueueStore.total }})
        </div> -->
      </div>
      <div class="queue-actions">
        <i class="ri-close-line" @click="queueStore.togglePopup()"></i>
      </div>
    </div>
    
    <!-- 播放队列内容 -->
    <div v-show="activeTab === 'queue'" class="tab-content">
      <QueueList />
    </div>
    
    <!-- 多P列表内容 -->
    <div v-show="activeTab === 'multiPage'" class="tab-content">
      <MultiPageList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useQueueStore, useMultiPageQueueStore } from '@/stores';
import QueueList from './QueueList.vue';
import MultiPageList from './MultiPageList.vue';
import { TabsWithUnderline } from '../common';

// 获取状态管理
const queueStore = useQueueStore();
const multiPageQueueStore = useMultiPageQueueStore();

// 
const tabs = computed(() => {
  if (multiPageQueueStore.isSetMultiPageList) {
    return [
      { label: `播放队列 (${queueStore.total})`, value: 'queue' },
      { label: `分P列表 (${multiPageQueueStore.total})`, value: 'multiPage' }
    ];
  }
  return [
    { label: `播放队列 (${queueStore.total})`, value: 'queue' }
  ];
});

// 当前激活的标签页
const activeTab = ref('queue');

// 当多P列表可用时，自动切换到多P标签
watch(() => multiPageQueueStore.isSetMultiPageList, (isSet) => {
  if (isSet && multiPageQueueStore.isDisplay) {
    activeTab.value = 'multiPage';
  }
});

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
  background-color: var(--el-bg-color);
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
  
  .queue-tabs {
    display: flex;
    gap: 16px;
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

.tab-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
