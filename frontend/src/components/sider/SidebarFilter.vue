<template>
  <div class="sidebar-filter">
    <div 
      v-for="(filter, index) in filters" 
      :key="index" 
      class="filter-item" 
      :class="{ active: activeFilter === filter.value }"
      @click="activeFilter = filter.value"
    >
      {{ filter.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineModel } from 'vue';
import { Filter } from '@/types';

// 筛选类型
const filters = [
  { label: '全部', value: Filter.All },
  { label: '歌单', value: Filter.Collection },
  { label: 'UP主', value: Filter.Up }
];

// 当前激活的筛选
const activeFilter = defineModel<'all' | 'collection' | 'up'>();
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
