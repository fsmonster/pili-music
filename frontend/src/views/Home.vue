<template>
  <Layout>
    <template #main>
      <div class="home-content">
        <CategoryTabs @change="handleCategoryChange"/>
        <SectionList :categories="selectedCategories" />
        <Favorites v-if="selectedCategories.includes('favorite') || isAllSelected"/>
        <Seasons v-if="selectedCategories.includes('season') || isAllSelected"/>
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

import { ref, computed } from 'vue';

const selectedCategories = ref<string[]>([]);

const isAllSelected = computed(() => selectedCategories.value.length === 0);

const handleCategoryChange = (categories: string[]) => {
  selectedCategories.value = categories;
};
</script>

<style lang="scss" scoped>
.home-content {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}
</style>