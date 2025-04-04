<template>
  <Layout>
    <template #main>
      <SearchContainer />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '../layout/Layout.vue';
import { SearchContainer } from '@/components/search';
</script>

<style lang="scss" scoped>
/* 样式已移至各组件内部 */
</style>
