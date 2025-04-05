<template>
  <div class="search-results-container">
    <div class="result-list">
      <SearchVideoResultItem 
        v-for="item in results" 
        :key="item.id" 
        :item="item"
        @click="handleItemClick"
      />
    </div>
    <SearchPagination 
      v-if="totalPages > 1"
      v-model:currentPage="currentPage"
      :pageSize="pageSize"
      :totalResults="totalResults"
      :totalPages="totalPages"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { usePlayerStore } from '@/stores';
import SearchVideoResultItem from './SearchVideoResultItem.vue';
import SearchPagination from './SearchPagination.vue';
import type { MediaItem, SearchVideoResult } from '@/types';
import { removeHtmlTags } from '@/utils';

// 定义属性
defineProps<{
  results: SearchVideoResult[];
  pageSize: number;
  totalResults: number;
  totalPages: number;
}>();

const playerStore = usePlayerStore();

const currentPage = defineModel<number>('currentPage', { default: 1 });

// 处理项目点击
const handleItemClick = (item: SearchVideoResult) => {
  if (item && item.aid) {
    // 创建媒体项
    const mediaItem: MediaItem = {
      id: item.aid,
      title: removeHtmlTags(item.title),
      cover: 'https:' + item.pic,
      duration: parseInt(item.duration.split(':')[0]) * 60 + parseInt(item.duration.split(':')[1]),
      author: '',
      bvid: item.bvid,
      // 添加必要的字段
      bv_id: item.bvid,
      pubtime: item.pubdate || 0
    };
    
    // 使用 playMediaList 方法播放单个视频
    playerStore.playMedia(mediaItem);
  }
};
</script>

<style lang="scss" scoped>
.search-results-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 2%;
  padding-right: calc(2% + 8px);
  
  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #c9c9c9;
    border-radius: 3px;
    
    &:hover {
      background-color: #a8a8a8;
    }
  }
  
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 3px;
  }
}

.result-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 4px;
  min-height: 100%;
}
</style>
