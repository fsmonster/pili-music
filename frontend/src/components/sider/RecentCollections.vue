<template>
  <div class="recent-collections">
    <div class="header">
      <div class="title" v-if="!isCollapsed">
        <i class="ri-history-line"></i>
        <span>最近播放</span>
      </div>
      <!-- 折叠/展开按钮 -->
      <div class="collapse-btn" @click="toggleCollapse">
        <i :class="isCollapsed ? 'ri-menu-unfold-line is-collapsed' : 'ri-menu-fold-line'"></i>
      </div>
    </div>

    <div class="filter-container" v-if="!isCollapsed">
      <SidebarFilter @filter-change="handleFilterChange" />
    </div>

    <div class="collections-list" v-if="filteredCollections.length > 0">
      <CollectionItem v-for="item in filteredCollections" :key="`${item.type}-${item.id}`" :item="item"
        v-model:is-collapsed="isCollapsed" />
    </div>

    <div class="empty-state" v-else>
      <i class="ri-inbox-line"></i>
      <p>暂无最近播放记录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRecentlyStore } from '@/stores';
import { CollectionType } from '@/types';
import SidebarFilter from './SidebarFilter.vue';
import CollectionItem from './CollectionItem.vue';

// 获取最近播放记录
const recentlyStore = useRecentlyStore();

// 是否折叠
const isCollapsed = defineModel('is-collapsed', { type: Boolean, default: false });

// 当前筛选类型
const currentFilter = ref('all');

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 处理筛选变更
const handleFilterChange = (filter: string) => {
  currentFilter.value = filter;
};

// 根据筛选条件过滤收藏夹
const filteredCollections = computed(() => {
  if (currentFilter.value === 'all') {
    return recentlyStore.recent;
  } else if (currentFilter.value === 'up') {
    return recentlyStore.recent.filter(item => item.type === CollectionType.UP);
  } else {
    // 筛选歌单类型（非UP主）
    return recentlyStore.recent.filter(item =>
      item.type === CollectionType.Favorite ||
      item.type === CollectionType.Season ||
      item.type === CollectionType.Series
    );
  }
});
</script>

<style lang="scss" scoped>
.recent-collections {
  padding: 10px;

  .header {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 15px;

    .title {
      display: flex;
      align-items: center;
      gap: 5px;
      width: 100%;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;

      i {
        font-size: 16px;
        color: $primary-color;
      }

      span {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }

    // 折叠按钮
    .collapse-btn {
      display: flex;
      justify-content: flex-end;
      padding: 10px;
      cursor: pointer;

      i {
        font-size: 18px;
        color: $text-color-secondary;
        transition: all 0.3s ease;

        &.is-collapsed {
          font-size: 23px;
        }

        &:hover {
          color: $primary-color;
        }
      }
    }

    .actions {
      i {
        font-size: 16px;
        cursor: pointer;
        color: $text-color-secondary;

        &:hover {
          color: $primary-color;
        }
      }
    }
  }

  .collections-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 0;
    color: $text-color-secondary;

    i {
      font-size: 24px;
      margin-bottom: 10px;
    }

    p {
      font-size: 12px;
    }
  }
}
</style>
