<template>
  <div class="search-header">
    <!-- 主筛选栏：视频、用户 -->
    <div class="filter-row primary-filter">
      <div v-for="type in searchTypes" :key="type.value"
        :class="['filter-item', { active: currentType === type.value }]" @click="handleTypeChange(type.value)">
        {{ type.label }}
      </div>
    </div>

    <!-- 次筛选栏：根据所选类型显示不同的排序选项 -->
    <div class="filter-row secondary-filter">
      <div v-for="order in currentOrderOptions" :key="order.value"
        :class="['filter-item', { active: currentOrder === order.value }]" @click="handleOrderChange(order.value)">
        {{ order.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { VideoSearchOrder, UserSearchOrder } from '@/types';

// 定义属性
defineProps<{
  keyword: string;
  totalResults: number;
}>();

// 定义事件
const emit = defineEmits<{
  (e: 'filter-change', type: string, order: string): void;
}>();

// 搜索类型选项
const searchTypes = [
  { label: '视频', value: 'video' },
  { label: '用户', value: 'user' }
];

// 当前选中的搜索类型
const currentType = ref<string>('video');

// 当前选中的排序方式
const currentOrder = ref<string>(VideoSearchOrder.TotalRank);

// 视频排序选项
const videoOrderOptions = [
  { label: '综合排序', value: VideoSearchOrder.TotalRank },
  { label: '最多点击', value: VideoSearchOrder.Click },
  { label: '最新发布', value: VideoSearchOrder.PubDate },
  { label: '最多弹幕', value: VideoSearchOrder.Danmaku },
  { label: '最多收藏', value: VideoSearchOrder.Favorite },
  { label: '最多评论', value: VideoSearchOrder.Comment }
];

// 用户排序选项
const userOrderOptions = [
  { label: '默认排序', value: UserSearchOrder.Default },
  { label: '粉丝数', value: UserSearchOrder.Fans },
  { label: '用户等级', value: UserSearchOrder.Level }
];

// 根据当前选中的搜索类型，动态计算排序选项
const currentOrderOptions = computed(() => {
  return currentType.value === 'video' ? videoOrderOptions : userOrderOptions;
});

// 处理搜索类型变更
const handleTypeChange = (type: string) => {
  currentType.value = type;
  // 切换类型时，重置为该类型的默认排序方式
  if (type === 'video') {
    currentOrder.value = VideoSearchOrder.TotalRank;
  } else {
    currentOrder.value = UserSearchOrder.Default;
  }
  // 触发筛选变更事件
  emit('filter-change', currentType.value, currentOrder.value);
};

// 处理排序方式变更
const handleOrderChange = (order: string) => {
  currentOrder.value = order;
  // 触发筛选变更事件
  emit('filter-change', currentType.value, currentOrder.value);
};
</script>

<style lang="scss" scoped>
.search-header {
  margin-bottom: 20px;

  h2 {
    margin-bottom: 8px;
    font-size: 20px;
    font-weight: 600;
  }

  .search-stats {
    margin-bottom: 16px;
    color: #666;
    font-size: 14px;
  }

  .filter-row {
    display: flex;
    margin-bottom: 12px;

    &.primary-filter {
          border-bottom: 1px solid #eee;
      .filter-item {
        padding: 8px 16px;
        margin-right: 8px;
        cursor: pointer;
        font-size: 14px;
        border-radius: 4px 4px 0 0;
        transition: all 0.2s ease;

        &:hover {
          color: $primary-color;
        }

        &.active {
          color: $primary-color;
          border-bottom: 3px solid $primary-color;
          font-weight: 500;
        }
      }
    }

    &.secondary-filter {
      margin-top: 8px;
      .filter-item {
        padding: 8px 16px;
        margin-right: 8px;
        cursor: pointer;
        font-size: 14px;
        border-radius: 16px;
        background-color: $background-color;
        transition: all 0.2s ease;

        &:hover {
          background-color: $border-color;
        }

        &.active {
          color: #fff;
          background-color: $primary-color;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
