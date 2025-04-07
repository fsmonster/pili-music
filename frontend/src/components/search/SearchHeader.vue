<template>
  <div class="search-header">
    <!-- 主筛选栏：视频、用户 -->
    <div class="primary-filter">
      <TabsWithUnderline 
        :tabs="searchTypes" 
        v-model:activeTab="currentType" 
      />
    </div>

    <!-- 分割线 -->
    <div class="divider"></div>

    <!-- 次筛选栏：根据所选类型显示不同的排序选项 -->
    <div class="secondary-filter">
      <div v-for="order in currentOrderOptions" :key="order.value"
        :class="['filter-item', { active: currentOrder === order.value }]" 
        @click="handleOrderChange(order.value)">
        {{ order.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { TabsWithUnderline } from '../common';
import { VideoSearchOrder, UserSearchOrder, SearchType } from '@/types';

// 定义事件
const emit = defineEmits<{
  (e: 'filter-change', type: SearchType, order: VideoSearchOrder | UserSearchOrder): void;
}>();

// 搜索类型选项
const searchTypes = [
  { label: '视频', value: SearchType.Video },
  { label: '用户', value: SearchType.User }
];

// 当前选中的搜索类型
const currentType = defineModel<SearchType>('searchType', { default: SearchType.Video });

const videoOrder = ref<VideoSearchOrder>(VideoSearchOrder.TotalRank);
const userOrder = ref<UserSearchOrder>(UserSearchOrder.Default);

// 当前选中的排序方式
const currentOrder = computed(() => {
  return currentType.value === SearchType.Video ? videoOrder.value : userOrder.value;
});

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
const handleTypeChange = (type: SearchType) => {
  currentType.value = type;
  // 切换类型时，重置为该类型的默认排序方式
  if (type === SearchType.Video) {
    videoOrder.value = VideoSearchOrder.TotalRank;
  } else {
    userOrder.value = UserSearchOrder.Default;
  }
  // 触发筛选变更事件
  emit('filter-change', currentType.value, currentOrder.value);
};

watch(currentType, () => {
  handleTypeChange(currentType.value);
});

// 处理排序方式变更
const handleOrderChange = (order: VideoSearchOrder | UserSearchOrder) => {
  if (currentType.value === SearchType.Video) {
    videoOrder.value = order as VideoSearchOrder;
  } else {
    userOrder.value = order as UserSearchOrder;
  }
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

  .primary-filter {
    display: flex;
    padding: 0 4%;
    margin-bottom: 2px;
  }

  .secondary-filter {
    display: flex;
    padding: 0 4%;
    margin-bottom: 2px;
    margin-top: 8px;

    .filter-item {
      padding: 5px 14px;
      margin-right: 8px;
      cursor: pointer;
      font-size: 13px;
      border-radius: 16px;
      background-color: $background-color;
      transition: all 0.2s ease;

      &:hover {
        background-color: $background-color-hover;
      }

      &.active {
        color: #fff;
        background-color: $primary-secondary-color;
        font-weight: 500;
      }
    }
  }


  .divider {
    border: 1px solid $border-secondary-color;
  }
}
</style>
