<template>
  <Layout>
    <template #main>
      <UserComponent :mid="mid" />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Layout from '@/layout/Layout.vue';
import UserComponent from '@/components/user/User.vue';

const route = useRoute();
const mid = ref<number>(0);

onMounted(() => {
  // 从路由参数中获取用户ID
  if (route.params.mid) {
    mid.value = parseInt(route.params.mid as string);
  }
});
</script>

<style lang="scss" scoped>
</style>