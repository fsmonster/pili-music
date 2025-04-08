<template>
  <Layout>
    <template #main>
      <div class="home-container">
        <!-- 轮播图 -->
        <!-- <RecommendBanner /> -->
        
        <!-- 推荐内容 -->
        <RecommendSection />
        
        <!-- 分类推荐 -->
        <!-- <CategoryRecommend /> -->
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '../layout/Layout.vue';
import RecommendBanner from '../components/recommend/RecommendBanner.vue';
import RecommendSection from '../components/recommend/RecommendSection.vue';
import CategoryRecommend from '../components/recommend/CategoryRecommend.vue';
</script>

<style scoped lang="scss">
.home-container {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>