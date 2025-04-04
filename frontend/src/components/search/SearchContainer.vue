<template>
  <div class="search-container">
    <!-- 搜索头部 -->
    <SearchHeader 
      :keyword="keyword" 
      :totalResults="totalResults" 
      @filter-change="handleFilterChange"
    />

    <div class="search-content">
      <!-- 加载中状态 -->
      <SearchLoading v-if="loading" />

      <!-- 搜索结果为空 -->
      <SearchEmpty v-else-if="results.length === 0" />

      <!-- 搜索结果列表 -->
      <template v-else>
        <SearchResults 
          :results="results" 
          @itemClick="handleItemClick" 
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
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { search } from '@/api/search';
import { SearchType, VideoSearchOrder, UserSearchOrder } from '@/types';
import type { SearchResult } from '@/types';

// 导入子组件
import SearchHeader from './SearchHeader.vue';
import SearchResults from './SearchResults.vue';
import SearchEmpty from './SearchEmpty.vue';
import SearchLoading from './SearchLoading.vue';

const route = useRoute();
const router = useRouter();

// 搜索状态
const loading = ref(false);
const keyword = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const totalResults = ref(0);
const totalPages = ref(0);
const results = ref<SearchResult[]>([]);
const searchType = ref(SearchType.Video);
const searchOrder = ref<string>(VideoSearchOrder.TotalRank);

// 从路由参数获取关键词
const getKeywordFromRoute = () => {
  const routeKeyword = route.query.keyword as string;
  if (routeKeyword) {
    keyword.value = routeKeyword;
    currentPage.value = Number(route.query.page || 1);
    // 获取搜索类型和排序方式（如果存在）
    if (route.query.type) {
      searchType.value = route.query.type as SearchType;
    }
    if (route.query.order) {
      searchOrder.value = route.query.order as string;
    }
    fetchSearchResults();
  } else {
    ElMessage.warning('请输入搜索关键词');
    router.push('/');
  }
};

// 获取搜索结果
const fetchSearchResults = async () => {
  if (!keyword.value) return;

  loading.value = true;
  try {
    const result = await search({
      keyword: keyword.value,
      search_type: searchType.value,
      page: currentPage.value,
      page_size: pageSize.value,
      order: searchOrder.value as VideoSearchOrder | UserSearchOrder
    });

    results.value = result.result;
    totalResults.value = result.numResults;
    totalPages.value = result.numPages;

    // 如果没有结果，显示提示
    if (result.result.length === 0) {
      ElMessage.info('没有找到相关音乐');
    }
  } catch (error) {
    console.error('搜索失败:', error);
    ElMessage.error('搜索失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 处理筛选条件变更
const handleFilterChange = (type: string, order: string) => {
  // 更新搜索类型和排序方式
  searchType.value = type === 'video' ? SearchType.Video : SearchType.User;
  searchOrder.value = order;
  
  // 重置页码
  currentPage.value = 1;
  
  // 更新路由参数
  router.push({
    query: {
      ...route.query,
      type: type,
      order: order,
      page: '1'
    }
  });
  
  // 重新获取搜索结果
  fetchSearchResults();
};

// 处理搜索结果项点击
const handleItemClick = (item: SearchResult) => {
  console.log('点击了搜索结果项:', item);
  // 这里可以添加跳转到详情页或播放音乐的逻辑
};

// 监听当前页变化
watch(() => currentPage.value, (newPage) => {
  // 更新路由参数
  router.push({
    query: {
      ...route.query,
      page: newPage.toString()
    }
  });
  // 滚动到顶部
  window.scrollTo(0, 0);
  // 重新获取搜索结果
  fetchSearchResults();
});

// 监听路由变化
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (newKeyword && newKeyword !== keyword.value) {
      keyword.value = newKeyword as string;
      currentPage.value = 1;
      fetchSearchResults();
    }
  }
);

// 组件挂载时获取搜索结果
onMounted(() => {
  getKeywordFromRoute();
});
</script>

<style lang="scss" scoped>
.search-container {
  padding: 20px 2%;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px); // 减去顶部导航栏的高度
}

.search-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; // 防止内容溢出
}
</style>
