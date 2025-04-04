<template>
  <div class="logo" @click="handleClick">
    <i class="ri-bilibili-fill"></i>
    <span>哔哩音乐 (｡･∀･)ﾉﾞ</span>
  </div>
</template>

<script setup lang="ts">
// Logo 组件，显示应用程序的标志
const handleClick = () => {
  window.location.href = '/';
};
</script>

<style lang="scss" scoped>
.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 10px;

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
</style>
