<template>
  <div class="pagination" v-if="totalPages > 1">
    <el-pagination 
      v-model:current-page="currentPageModel" 
      background 
      :page-size="pageSize" 
      layout="prev, pager, next"
      :total="totalResults" 
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 定义属性
const props = defineProps<{
  currentPage: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
}>();

// 定义事件
const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
}>();

// 计算属性，用于双向绑定
const currentPageModel = computed({
  get: () => props.currentPage,
  set: (value) => emit('update:currentPage', value)
});
</script>

<style lang="scss" scoped>
.pagination {
  display: flex;
  justify-content: center;
}
</style>
