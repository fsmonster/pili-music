<template>
  <div class="sidebar-filter">
    <div 
      v-for="(filter, index) in filters" 
      :key="index" 
      class="filter-item" 
      :class="{ active: activeFilter === filter.value }"
      @click="handleFilterChange(filter.value)"
    >
      {{ filter.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 筛选类型
const filters = [
  { label: '全部', value: 'all' },
  { label: '歌单', value: 'collection' },
  { label: 'UP主', value: 'up' }
];

// 当前激活的筛选
const activeFilter = ref('all');

// 定义事件
const emit = defineEmits<{
  (e: 'filter-change', value: string): void;
}>();

// 处理筛选变更
const handleFilterChange = (value: string) => {
  activeFilter.value = value;
  emit('filter-change', value);
};
</script>

<style lang="scss" scoped>
.sidebar-filter {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 0 5px;
  
  .filter-item {
    padding: 5px 10px;
    font-size: 13px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    
    &:hover {
      background-color: $background-color-hover;
    }
    
    &.active {
      color: #fff;
      background-color: $primary-color;
    }
  }
}
</style>
