<template>
  <div class="app-container">
    <!-- 左侧导航栏 -->
    <Sidebar class="sidebar" />

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部栏 -->
      <Header />

      <!-- 内容区 -->
      <slot name="main"></slot>
    </div>

    <!-- 底部播放控制栏 -->
    <Player class="player" />
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue';
import Header from './Header.vue';
// 使用封装后的Player组件
import { Player } from '../components/player';
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  display: grid;
  grid-template-areas:
    "sidebar main"
    "player player";
  grid-template-columns: 250px 1fr;
  grid-template-rows: 1fr auto;
}

.sidebar {
  grid-area: sidebar;
  border-right: 1px solid var(--el-border-color-light);
}

.main-content {
  grid-area: main;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--el-bg-color);

  :deep(> *) {
    height: fit-content;
    overflow: hidden;
  }
}

.player {
  grid-area: player;
  height: 72px;
  border-top: 1px solid var(--el-border-color-light);
}
</style>
