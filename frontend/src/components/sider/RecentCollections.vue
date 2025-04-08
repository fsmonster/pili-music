<template>
  <div class="recent-collections">
    <div class="header">
      <div class="title">
        <i class="ri-history-line"></i>
        <span>最近播放</span>
      </div>
      <!-- 折叠/展开按钮 -->
      <!-- <div class="collapse-btn" @click="toggleCollapse">
        <i 
          class="ri-arrow-left-circle-line"
          :class="isCollapsed ? 'is-collapsed' : ''"
        ></i>
      </div> -->
    </div>

    <div class="filter-container">
      <RecentFilter 
        v-model="activeFilter" />
    </div>

    <div class="collections-list" v-if="filteredCollections.length > 0">
      <CollectionItem v-for="item in filteredCollections" :key="`${item.type}-${item.id}`" :item="item" />
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
import { CollectionType, Filter } from '@/types';
import RecentFilter from './RecentFilter.vue';
import CollectionItem from './CollectionItem.vue';
import { storeToRefs } from 'pinia';

// 获取最近播放记录
const recentlyStore = useRecentlyStore();

// 是否折叠
// const isCollapsed = defineModel('is-collapsed', { type: Boolean });

// 当前筛选类型
const { activeFilter } = storeToRefs(recentlyStore);

// 切换折叠状态
// const toggleCollapse = () => {
//   isCollapsed.value = !isCollapsed.value;
// };

// 根据筛选条件过滤收藏夹
const filteredCollections = computed(() => {
  if (activeFilter.value === Filter.All) {
    return recentlyStore.recent;
  } else if (activeFilter.value === Filter.Up) {
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
      gap: 5px;
      width: 100%;
      font-size: 16px;
      font-weight: 500;

      i {
        font-size: 18px;
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
        font-size: 20px;
        color: $text-color-secondary;
        transition: all 0.5s ease;

        &.is-collapsed {
          font-size: 26px;
          transform: rotate(180deg);
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
