<template>
  <Layout>
    <template #main>
      <div class="home-content">
        <RecentlyPlayed />
        <Favorites />
        <Subscriptions />
        <MyMusic />
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '../components/layout/Layout.vue';
import RecentlyPlayed from '../components/content/views/RecentlyPlayed.vue';
import Favorites from '../components/content/views/Favorites.vue';
import Subscriptions from '../components/content/views/Subscriptions.vue';
import MyMusic from '../components/content/views/MyMusic.vue';
</script>

<style lang="scss" scoped>
.home-content {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}
</style>