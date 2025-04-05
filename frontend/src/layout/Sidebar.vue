<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- 导航菜单 -->
    <!-- <div class="nav-menu">
      <div 
        class="menu-item" 
        :class="{ active: currentRoute === '/' }"
        @click="navigateTo('/')"
      >
        <i class="ri-home-4-line"></i>
        <span v-if="!isCollapsed">首页</span>
      </div>
      <div 
        class="menu-item" 
        :class="{ active: currentRoute.includes('/search') }"
        @click="navigateTo('/search')"
      >
        <i class="ri-search-line"></i>
        <span v-if="!isCollapsed">搜索</span>
      </div>
    </div> -->
    
    <!-- 分割线 -->
    <!-- <div class="divider"></div> -->
    
    <!-- 最近播放记录 -->
    <div class="recent-section">
      <RecentCollections 
        v-model:is-collapsed="isCollapsed"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RecentCollections } from '@/components/sider';

// 侧边栏状态
const isCollapsed = ref(false);

</script>

<style lang="scss" scoped>
.sidebar {
  width: 220px;
  height: 100%;
  background-color: #fff;
  border-right: 1px solid $border-color;
  transition: width 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  
  // 折叠状态
  &.collapsed {
    width: 100px;
    
    .menu-item {
      justify-content: center;
      
      i {
        margin-right: 0;
      }
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
      
      &:hover {
        color: $primary-color;
      }
    }
  }
  
  // 导航菜单
  // .nav-menu {
  //   margin-bottom: 20px;
    
  //   .menu-item {
  //     display: flex;
  //     align-items: center;
  //     padding: 12px 20px;
  //     cursor: pointer;
  //     transition: all 0.3s ease;
      
  //     i {
  //       font-size: 18px;
  //       margin-right: 10px;
  //     }
      
  //     span {
  //       font-size: 14px;
  //       white-space: nowrap;
  //     }
      
  //     &:hover {
  //       background-color: $background-color-hover;
  //     }
      
  //     &.active {
  //       color: $primary-color;
  //       // background-color: rgba($primary-color, 0.1);
  //       font-weight: 500;
  //     }
  //   }
  // }
  
  // 分割线
  // .divider {
  //   height: 1px;
  //   background-color: $border-color;
  //   margin: 10px 0;
  // }
  
  // 最近播放区域
  .recent-section {
    padding: 0 5px;
  }
}
</style>
