<template>
  <div class="search-container">
    <div class="search-header">
      <h2>搜索结果: {{ keyword }}</h2>
      <div class="search-stats" v-if="totalResults > 0">
        共找到 {{ totalResults }} 个结果
      </div>
    </div>

    <div class="search-content">
      <!-- 加载中状态 -->
      <div class="loading-container" v-if="loading">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 搜索结果为空 -->
      <div class="empty-result" v-else-if="audioResults.length === 0">
        <el-empty description="没有找到相关音乐" />
      </div>

      <!-- 搜索结果列表 -->
      <div class="result-list" v-else>
        <div 
          v-for="item in audioResults" 
          :key="item.id" 
          class="audio-item"
        >
          <div class="audio-cover">
            <img :src="item.cover + '@100w'" :alt="item.title" loading="lazy">
            <div class="play-icon">
              <i class="ri-play-circle-fill"></i>
            </div>
          </div>
          <div class="audio-info">
            <div class="audio-title">{{ item.title }}</div>
            <div class="audio-author">{{ item.author }}</div>
            <div class="audio-stats">
              <span class="play-count">
                <i class="ri-headphone-line"></i>
                {{ formatCount(item.play) }}
              </span>
              <span class="duration">
                <i class="ri-time-line"></i>
                {{ formatDuration(item.duration) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="totalResults"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { search, SearchType } from '../api/search';
import { usePlayerStore } from '@/stores';

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();

// 搜索状态
const loading = ref(false);
const keyword = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const totalResults = ref(0);
const totalPages = ref(0);
const audioResults = ref<AudioSearchResultItem[]>([]);

// 从路由参数获取关键词
const getKeywordFromRoute = () => {
  const routeKeyword = route.query.keyword as string;
  if (routeKeyword) {
    keyword.value = routeKeyword;
    currentPage.value = Number(route.query.page || 1);
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
      search_type: SearchType.Video,
      page: currentPage.value,
      page_size: pageSize.value
    });
    
    audioResults.value = result.result;
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

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  // 更新路由参数
  router.push({
    query: {
      ...route.query,
      page: page.toString()
    }
  });
  // 滚动到顶部
  window.scrollTo(0, 0);
  // 重新获取搜索结果
  fetchSearchResults();
};


// 格式化播放次数
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万';
  }
  return count.toString();
};

// 格式化时长
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

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
  padding: 20px;
  
  .search-header {
    margin-bottom: 20px;
    
    h2 {
      margin-bottom: 8px;
      font-size: 24px;
    }
    
    .search-stats {
      color: #666;
      font-size: 14px;
    }
  }
  
  .search-content {
    .result-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      
      .audio-item {
        display: flex;
        padding: 12px;
        border-radius: 8px;
        background-color: #f5f5f5;
        transition: all 0.3s ease;
        cursor: pointer;
        
        &:hover {
          background-color: #e0e0e0;
          
          .play-icon {
            opacity: 1;
          }
        }
        
        .audio-cover {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
          margin-right: 12px;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .play-icon {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.3);
            opacity: 0;
            transition: opacity 0.3s ease;
            
            i {
              font-size: 32px;
              color: #fff;
            }
          }
        }
        
        .audio-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          
          .audio-title {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          .audio-author {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
          }
          
          .audio-stats {
            display: flex;
            font-size: 12px;
            color: #999;
            
            span {
              display: flex;
              align-items: center;
              margin-right: 12px;
              
              i {
                margin-right: 4px;
              }
            }
          }
        }
      }
    }
    
    .empty-result {
      padding: 40px 0;
    }
    
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>
