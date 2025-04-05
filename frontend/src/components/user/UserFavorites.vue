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
          @mouseenter="startHoverTimer(item.id)"
          @mouseleave="clearHoverTimer"
        >
          <!-- 收藏夹卡片内容 -->
          <div class="favorite-card-content">
            <!-- 收藏夹信息 -->
            <div class="favorite-info" @click="goToFavorite(item.id)">
              <div class="favorite-info-content">
                <div 
                  class="private-badge" 
                  v-if="isPrivate(item)"
                ><i class="ri-lock-line"></i></div>
                <div class="favorite-title" :title="item.title">{{ item.title }}</div>
              </div>
              <div class="favorite-count">{{ item.media_count }}个内容</div>
            </div>
          </div>
          
          <!-- 收藏夹详情弹窗 -->
          <el-popover
            :visible="currentHoverId === item.id && showPopover"
            placement="left"
            :width="300"
            trigger="hover"
            :show-after="1000"
            :hide-after="0"
            :teleported="true"
            popper-class="favorite-popover"
            @show="fetchFavoriteInfo(item.id)"
            @hide="clearFavoriteInfo()"
          >
            <template #default>
              <div v-if="favoriteInfo" class="favorite-detail">
                <!-- 封面图片 -->
                <div class="favorite-detail-cover" v-if="favoriteInfo.cover">
                  <img :src="processResourceUrl(favoriteInfo.cover) + '@200h'" :alt="favoriteInfo.title" loading="lazy" />
                  <!-- 私密标识 -->
                  <div v-if="isPrivate(favoriteInfo)" class="detail-private-badge">
                    <i class="ri-lock-fill"></i>
                  </div>
                </div>
                
                <div class="favorite-detail-header">
                  <h4>{{ favoriteInfo.title }}</h4>
                  <div class="favorite-detail-meta">
                    <span>{{ favoriteInfo.media_count }}个内容</span>
                  </div>
                </div>
                <div class="favorite-detail-desc" v-if="favoriteInfo.intro">
                  <p>{{ favoriteInfo.intro }}</p>
                </div>
                <div class="favorite-detail-stats">
                  <div class="stat-item">
                    <i class="ri-time-line"></i>
                    <span>创建: {{ formatDate2(favoriteInfo.ctime) }}</span>
                  </div>
                  <div class="stat-item">
                    <i class="ri-refresh-line"></i>
                    <span>更新: {{ formatDate2(favoriteInfo.mtime) }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="favorite-detail-loading">
                <el-skeleton :rows="3" animated />
              </div>
            </template>
            <template #reference>
              <div class="popover-reference"></div>
            </template>
          </el-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElSkeleton, ElEmpty, ElMessage, ElPopover } from 'element-plus';
import { useRouter } from 'vue-router';
import { getFavoriteList, getFavoriteInfo } from '@/api';
import type { FavoriteList, FavoriteInfoResponse } from '@/types';
import { processResourceUrl, formatDate2 } from '@/utils';

// 定义组件属性
const props = defineProps<{
  mid: number;
}>();

// 路由器
const router = useRouter();

// 收藏夹列表数据
const favorites = ref<FavoriteList[]>([]);
const loading = ref(true);

// 悬停相关状态
const hoverTimer = ref<number | null>(null);
const currentHoverId = ref<number | null>(null);
const showPopover = ref(false);
const favoriteInfo = ref<FavoriteInfoResponse | null>(null);

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

// 获取收藏夹详情
const fetchFavoriteInfo = async (id: number) => {
  try {
    const data = await getFavoriteInfo(id);
    favoriteInfo.value = data;
  } catch (error) {
    console.error('获取收藏夹详情失败:', error);
    // 不显示错误消息，避免打扰用户
  }
};

// 清空收藏夹详情
const clearFavoriteInfo = () => {
  favoriteInfo.value = null;
};

// 开始悬停计时器
const startHoverTimer = (id: number) => {
  // 清除之前的计时器
  clearHoverTimer();
  
  // 设置当前悬停的收藏夹ID
  currentHoverId.value = id;
  
  // 创建新的计时器，0.5秒后显示详情
  hoverTimer.value = window.setTimeout(() => {
    showPopover.value = true;
  }, 500);
};

// 清除悬停计时器
const clearHoverTimer = () => {
  if (hoverTimer.value) {
    clearTimeout(hoverTimer.value);
    hoverTimer.value = null;
  }
  showPopover.value = false;
  currentHoverId.value = null;
};

// 判断收藏夹是否为私密
const isPrivate = (item: FavoriteList | FavoriteInfoResponse) => {
  // attr 为 23 或 3 时为私密收藏夹
  return item.attr === 23 || item.attr === 3;
};

// 跳转到收藏夹详情
const goToFavorite = (id: number) => {
  // 实际项目中应该跳转到收藏夹详情页
  router.push(`/favorite/${id}`);
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
    color: var(--el-text-color-primary);
  }
}

.loading-container, .empty-container {
  padding: 20px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.favorite-card {
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.favorite-card-content {
  position: relative;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.favorite-info {
  flex: 1;
  cursor: pointer;
  padding-bottom: 12px;
  .favorite-info-content {
    display: flex;
    align-items: center;
    gap: 8px;
    .private-badge {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .favorite-title {
      font-size: 15px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--el-text-color-primary);
    }
  }
}

.favorite-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

// 弹窗引用元素
.popover-reference {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

// 收藏夹详情弹窗样式
.favorite-detail {
  padding: 8px;
  
  &-cover {
    position: relative;
    width: 100%;
    height: 140px;
    margin-bottom: 12px;
    border-radius: 6px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .detail-private-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        font-size: 14px;
      }
    }
  }
  
  &-header {
    margin-bottom: 12px;
    
    h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  &-meta {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
  
  &-desc {
    margin-bottom: 12px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    
    p {
      margin: 0;
      line-height: 1.5;
      // 最多显示3行
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  
  &-stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      
      i {
        font-size: 14px;
      }
    }
  }
  
  &-loading {
    padding: 8px;
  }
}

// 自定义弹窗样式
:deep(.favorite-popover) {
  padding: 0;
  overflow: hidden;
  
  .el-popover__title {
    margin: 0;
    padding: 0;
  }
}
</style>
