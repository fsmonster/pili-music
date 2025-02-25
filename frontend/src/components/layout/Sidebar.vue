<template>
  <div class="sidebar">
    <div class="logo">
      <i class="ri-bilibili-fill"></i>
      <span>哔哩音乐 <br> (｡･∀･)ﾉﾞ</span>
    </div>

    <div class="nav-menu">
      <div class="menu-item active">
        <i class="ri-home-4-line"></i>
        <span>首页</span>
      </div>
      <div class="menu-item">
        <i class="ri-search-line"></i>
        <span>搜索</span>
      </div>
    </div>

    <div class="playlist-section">
      <div class="section-header">
        <i class="ri-folder-music-line"></i>
        <span>歌单</span>
      </div>
      <div class="playlist-list">
        <!-- 歌单列表将在这里动态生成 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加收藏夹相关的逻辑
</script>

<style lang="scss" scoped>
.sidebar {
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 30px;
    
    i {
      font-size: 32px;
      color: var(--el-color-primary);
    }
    
    span {
      font-size: 18px;
      font-weight: bold;
      line-height: 1.2;
    }
  }

  .nav-menu {
    margin-bottom: 30px;

    .menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      i {
        font-size: 20px;
      }

      &:hover {
        background-color: var(--el-color-primary-light-9);
      }

      &.active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }
    }
  }

  .playlist-section {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      font-weight: 500;
      
      i {
        font-size: 20px;
      }
    }

    .playlist-list {
      flex: 1;
      overflow-y: auto;
      margin-top: 10px;
    }
  }
}
</style>
