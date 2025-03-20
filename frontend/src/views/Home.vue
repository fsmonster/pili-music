<template>
  <Layout>
    <template #main>
      <div class="home-content">
        <CategoryTabs />
        <SectionList />
        <Favorites />
        <Seasons />
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '../layout/Layout.vue';
import CategoryTabs from '../components/songLists/CategoryTabs.vue';
import Favorites from '../components/songLists/Favorites.vue';
import Seasons from '../components/songLists/Seasons.vue';
import SectionList from '../components/songLists/SectionList.vue';
</script>

<style lang="scss" scoped>
.home-content {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}
</style>