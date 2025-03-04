<template>
  <Layout>
    <template #main>
      <div class="home-content">
        <!-- <RecentlyPlayed /> -->
        <MyMusic />
        <Favorites />
        <Subscriptions />
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '../layout/Layout.vue';
// import RecentlyPlayed from '../components/songLists/RecentlyPlayed.vue';
import Favorites from '../components/songLists/Favorites.vue';
import Subscriptions from '../components/songLists/Subscriptions.vue';
import MyMusic from '../components/songLists/MyMusic.vue';
</script>

<style lang="scss" scoped>
.home-content {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}
</style>