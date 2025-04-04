<template>
  <div class="search-results-container">
    <div class="result-list">
      <SearchResultItem 
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
import SearchResultItem from './SearchResultItem.vue';
import SearchPagination from './SearchPagination.vue';
import type { SearchResult } from '@/types';

// 定义属性
defineProps<{
  results: SearchResult[];
  pageSize: number;
  totalResults: number;
  totalPages: number;
}>();

const currentPage = defineModel<number>('currentPage');

// 定义事件
const emit = defineEmits<{
  (e: 'itemClick', item: SearchResult): void;
}>();

// 处理项目点击
const handleItemClick = (item: SearchResult) => {
  emit('itemClick', item);
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
