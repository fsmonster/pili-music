<template>
  <div class="sider-bar">
    <!-- 最近播放记录 -->
    <div class="recent-section">
      <RecentCollections />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RecentCollections } from '@/components/sider';

</script>

<style lang="scss" scoped>
.sider-bar {
  width: 220px;
  height: 100%;
  background-color: #fff;
  border-right: 1px solid $border-color;
  transition: width 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;

  // IE 10+
  -ms-overflow-style: none;

  // Chrome & Safari
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 4px;
  }

  // Hover 状态：显示滚动条颜色
  &:hover {
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.3);
    }
    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
  
  // 最近播放区域
  .recent-section {
    padding: 0 5px;
  }
}
</style>