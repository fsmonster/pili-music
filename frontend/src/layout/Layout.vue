<template>
  <div class="app-container">
    <!-- 顶部栏 -->
    <Header class="header"/>

    <!-- 左侧导航栏 -->
    <Sidebar class="sidebar" />

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 内容区 -->
      <slot name="main"></slot>
    </div>

    <!-- 底部播放控制栏 -->
    <PlayerControler class="player" />
    
    <!-- 播放队列容器（包含普通队列和多P列表） -->
    <QueueContainer />
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue';
import Header from './Header.vue';
import PlayerControler from './PlayerControler.vue';
import QueueContainer from '@/components/queue/QueueContainer.vue';
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "player player";
  grid-template-rows: auto 1fr auto;
  grid-template-columns: auto 1fr;
}

.header {
  grid-area: header;
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
}

.player {
  grid-area: player;
  height: 72px;
  border-top: 1px solid var(--el-border-color-light);
}
</style>
