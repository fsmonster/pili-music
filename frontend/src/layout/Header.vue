<template>
  <div class="header">
    <div class="header-left">
      <Logo @goToHome="goToHome" />
    </div>
    <div class="header-right">
      <SearchBar ref="searchBarRef" />
      <UserInfo />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Logo, SearchBar, UserInfo } from '@/components/header';

// 搜索栏引用
const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null);

// 路由
const router = useRouter();

// 跳转到首页
const goToHome = () => {
  router.push('/');
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color-light);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 50px;
  }
}
</style>
