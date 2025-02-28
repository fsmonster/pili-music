# 控制栏组件
<template>
  <div class="controls-sticky">
    <div class="controls">
      <div class="left">
        <button 
          class="play-all" 
          @click="$emit('play-all')"
          :disabled="disabled"
        >
          <i class="ri-play-fill"></i>
          播放全部
        </button>
      </div>
      <div class="right">
        <el-input 
          :model-value="search"
          placeholder="搜索" 
          @input="handleSearch"
        />
        <el-select 
          :model-value="sort"
          placeholder="排序" 
          @change="handleSort"
        >
          <el-option 
            v-for="item in sortOptions" 
            :key="item.value" 
            :label="item.label" 
            :value="item.value"
          />
        </el-select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  search?: string
  sort?: string
  disabled?: boolean
}>();

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:sort', value: string): void
  (e: 'play-all'): void
  (e: 'search'): void
  (e: 'sort'): void
}>();

// 排序选项
const sortOptions = [
  { label: '最新添加', value: 'desc' },
  { label: '最早添加', value: 'asc' }
];

// 搜索处理
function handleSearch(value: string) {
  emit('update:search', value);
  emit('search');
}

// 排序处理
function handleSort(value: string) {
  emit('update:sort', value);
  emit('sort');
}
</script>

<style scoped>
.controls-sticky {
  position: sticky;
  top: 0;
  background: var(--el-bg-color);
  padding: 20px 0;
  z-index: 2;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.right {
  display: flex;
  gap: 10px;
}

.play-all {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: var(--el-color-primary);
  color: white;
  cursor: pointer;
}

.play-all:disabled {
  background-color: var(--el-color-primary-light-5);
  cursor: not-allowed;
}
</style>
