<template>
  <div class="user-favorites">
    <div class="content-header">
      <h3>收藏夹</h3>
    </div>
    <div class="favorites-list">
      <!-- 收藏夹列表 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="favorites.length === 0" class="empty-container">
        <el-empty description="暂无收藏夹" />
      </div>
      <div v-else class="favorites-grid">
        <div 
          v-for="item in favorites" 
          :key="item.id" 
          class="favorite-card"
          @click="goToFavorite(item.id)"
        >
          <div class="favorite-cover">
            <img :src="item.cover" alt="收藏夹封面" loading="lazy">
            <!-- 私密收藏夹标识 -->
            <div v-if="isPrivate(item)" class="private-badge">
              <i class="ri-lock-line"></i>
            </div>
            <div class="play-button" @click.stop="playFavorite(item.id)">
              <i class="ri-play-fill"></i>
            </div>
          </div>
          <div class="favorite-info">
            <div class="favorite-title" :title="item.title">{{ item.title }}</div>
            <div class="favorite-count">{{ item.media_count }}个内容</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElSkeleton, ElEmpty, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { getFavoriteList } from '@/api';
import type { FavoriteList } from '@/types';

// 定义组件属性
const props = defineProps<{
  mid: number;
}>();

// 路由器
const router = useRouter();

// 收藏夹列表数据
const favorites = ref<FavoriteList[]>([]);
const loading = ref(true);

// 获取用户收藏夹
const fetchUserFavorites = async () => {
  try {
    loading.value = true;
    // 调用 API 获取数据
    const data = await getFavoriteList({
      up_mid: props.mid
    });
    
    favorites.value = data || [];
  } catch (error) {
    console.error('获取用户收藏夹失败:', error);
    ElMessage.error('获取收藏夹列表失败，请稍后重试');
    favorites.value = [];
  } finally {
    loading.value = false;
  }
};

// 判断收藏夹是否为私密
const isPrivate = (item: FavoriteList) => {
  // attr 为 23 或 119 时为私密收藏夹
  return item.attr === 23 || item.attr === 119;
};

// 跳转到收藏夹详情
const goToFavorite = (id: number) => {
  // 实际项目中应该跳转到收藏夹详情页
  router.push(`/favorite/${id}`);
};

// 播放收藏夹内容
const playFavorite = (id: number) => {
  // 实际项目中应该调用播放器播放收藏夹内容
  console.log('播放收藏夹:', id);
};

// 组件挂载时获取收藏夹
onMounted(() => {
  if (props.mid) {
    fetchUserFavorites();
  }
});
</script>

<style lang="scss" scoped>
.user-favorites {
  width: 100%;
}

.content-header {
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.loading-container, .empty-container {
  padding: 20px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.favorite-card {
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.favorite-cover {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .private-badge {
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 30px 30px 0;
    border-color: transparent rgba(0, 0, 0, 0.6) transparent transparent;
    
    i {
      position: absolute;
      top: 2px;
      right: -25px;
      color: white;
      font-size: 12px;
    }
  }
  
  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 48px;
    height: 48px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    
    i {
      color: white;
      font-size: 24px;
    }
  }
  
  &:hover .play-button {
    opacity: 1;
  }
}

.favorite-info {
  padding: 8px 0;
}

.favorite-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
