<template>
  <Layout>
    <template #main>
      <div class="home-content">
        <RecentlyPlayed />
        <MyMusic />
        <Favorites />
        <Subscriptions />
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '../layout/Layout.vue';
import RecentlyPlayed from '../components/content/RecentlyPlayed.vue';
import Favorites from '../components/content/Favorites.vue';
import Subscriptions from '../components/content/Subscriptions.vue';
import MyMusic from '../components/content/MyMusic.vue';
</script>

<style lang="scss" scoped>
.home-content {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}
</style>