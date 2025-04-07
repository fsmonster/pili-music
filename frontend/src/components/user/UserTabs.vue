<template>
  <div class="content-tabs">
    <TabsWithUnderline
      :tabs="tabs"
      v-model:activeTab="activeTab"
    />
  </div>
</template>

<script setup lang="ts">
import { TabsWithUnderline } from '@/components/common';

// 定义标签类型
interface Tab {
  label: string;
  value: string;
  icon?: string;
}

// 定义组件属性
defineProps<{
  tabs: Tab[]; // 标签列表
}>();

const activeTab = defineModel('activeTab', { type: String, required: true });
</script>

<style lang="scss" scoped>
.content-tabs {
  width: 100%;
  display: flex;
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
