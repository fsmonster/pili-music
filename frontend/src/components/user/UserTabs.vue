<template>
  <div class="content-tabs">
    <div 
      v-for="tab in tabs" 
      :key="tab.id"
      class="tab-item"
      :class="{ active: modelValue === tab.id }"
      @click="$emit('update:modelValue', tab.id)"
    >
      <i :class="tab.icon"></i> {{ tab.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义标签类型
interface Tab {
  id: string;
  name: string;
  icon: string;
}

// 定义组件属性
defineProps<{
  modelValue: string; // 当前选中的标签ID
  tabs: Tab[]; // 标签列表
}>();

// 定义事件
defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<style lang="scss" scoped>
.content-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  
  .tab-item {
    padding: 12px 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    
    i {
      margin-right: 6px;
    }
    
    &.active {
      color: var(--el-color-primary);
      border-bottom: 2px solid var(--el-color-primary);
    }
    
    &:hover:not(.active) {
      color: var(--el-color-primary-light-3);
    }
  }
}
</style>
