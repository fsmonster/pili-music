<template>
  <div class="search-container">
    <!-- 搜索头部 -->
    <SearchHeader 
      :searchType="searchType"
      @filter-change="handleFilterChange"
    />

    <div class="search-content">
      <!-- 加载中状态 -->
      <SearchLoading v-if="loading" />

      <!-- 搜索结果为空 -->
      <SearchEmpty v-else-if="results.length === 0" />

      <!-- 搜索结果列表 -->
      <template v-else>
        <!-- 视频搜索结果 -->
        <SearchVideoResults 
          v-if="searchType === SearchType.Video"
          :results="results" 
          v-model:currentPage="currentPage"
          :pageSize="pageSize"
          :totalResults="totalResults"
          :totalPages="totalPages"
        />
        <!-- 用户搜索结果 -->
        <SearchUserResults 
          v-if="searchType === SearchType.User"
          :results="results" 
          v-model:currentPage="currentPage"
          :pageSize="pageSize"
          :totalResults="totalResults"
          :totalPages="totalPages"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, onMounted, watch } from 'vue';
import { useSearchStore } from '@/stores';
import { SearchType, VideoSearchOrder, UserSearchOrder } from '@/types';

// 导入子组件
import SearchHeader from './SearchHeader.vue';
import SearchVideoResults from './SearchVideoResults.vue';
import SearchUserResults from './SearchUserResults.vue';
import SearchEmpty from './SearchEmpty.vue';
import SearchLoading from './SearchLoading.vue';

// 搜索 store
const searchStore = useSearchStore();

const { keyword, currentPage, pageSize, totalResults, totalPages, results, loading, searchOrder, searchType, searchLock } = storeToRefs(searchStore);


// 处理筛选条件变更
const handleFilterChange = (type: SearchType, order: VideoSearchOrder | UserSearchOrder) => {
  // 更新搜索类型和排序方式
  searchType.value = type;
  searchOrder.value = order;
  
  // 重置页码
  currentPage.value = 1;
  
  // 滚动到顶部
  window.scrollTo(0, 0);
  searchStore.getSearchResults();
};

// 处理搜索关键词变化
watch(() => searchLock.value, () => {
  currentPage.value = 1;
  
  // 滚动到顶部
  window.scrollTo(0, 0);
  searchStore.getSearchResults();
  searchLock.value = true;
});

// 监听当前页变化
watch(() => currentPage.value, () => {
  // 滚动到顶部
  window.scrollTo(0, 0);
  searchStore.getSearchResults();
});

onMounted(() => {
  searchStore.getSearchResults();
});
</script>

<style lang="scss" scoped>
.search-container {
  box-sizing: border-box;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; // 防止内容溢出
}
</style>
