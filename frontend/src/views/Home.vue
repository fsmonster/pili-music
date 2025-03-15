<template>
  <Layout>
    <template #main>
      <div class="home-content">
        <Favorites />
        <Seasons />
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '../layout/Layout.vue';
import Favorites from '../components/songLists/Favorites.vue';
import Seasons from '../components/songLists/Seasons.vue';
</script>

<style lang="scss" scoped>
.home-content {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}
</style>