<template>
  <div class="user-series">
    <div class="content-header">
      <h3>系列</h3>
    </div>
    <div class="series-list">
      <!-- 系列列表 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="seriesList.length === 0" class="empty-container">
        <el-empty description="暂无系列" />
      </div>
      <div v-else class="series-grid">
        <div 
          v-for="item in seriesList" 
          :key="item.meta.series_id" 
          class="series-card"
          @click="goToSeries(item.meta.series_id)"
        >
          <div class="series-cover">
            <template v-if="item.meta.cover">
              <img 
                :src="processResourceUrl(item.meta.cover)" 
                alt="系列封面" 
                loading="lazy" 
              />
            </template>
            <div v-else class="no-cover">
              <i class="ri-list-check-2"></i>
            </div>
            <!-- <div class="play-button" @click.stop="playSeries(item.meta.series_id)">
              <i class="ri-play-fill"></i>
            </div> -->
          </div>
          <div class="series-info">
            <div class="series-title" :title="item.meta.name">{{ item.meta.name }}</div>
            <div class="series-count">{{ item.meta.total || 0 }}个视频</div>
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
import { getUserSeasonsAndSeries } from '@/api';
import type { UserSeriesList } from '@/types';
import { processResourceUrl } from '@/utils';

// 定义组件属性
const props = defineProps<{
  mid: number;
}>();

// 路由器
const router = useRouter();

// 系列列表数据
const seriesList = ref<UserSeriesList[]>([]);
const loading = ref(true);

// 获取用户系列
const fetchUserSeries = async () => {
  try {
    loading.value = true;
    // 调用 API 获取数据
    const response = await getUserSeasonsAndSeries({
      mid: props.mid,
      page_num: 1,
      page_size: 20
    });
    
    if (response.data?.items_lists?.series_list) {
      seriesList.value = response.data.items_lists.series_list;
    } else {
      seriesList.value = [];
    }
  } catch (error) {
    console.error('获取用户系列失败:', error);
    ElMessage.error('获取系列列表失败，请稍后重试');
    seriesList.value = [];
  } finally {
    loading.value = false;
  }
};

// 跳转到系列详情
const goToSeries = (id: number) => {
  // 实际项目中应该跳转到系列详情页
  router.push(`/series/${id}`);
};

// 组件挂载时获取系列
onMounted(() => {
  if (props.mid) {
    fetchUserSeries();
  }
});
</script>

<style lang="scss" scoped>
.user-series {
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

.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.series-card {
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.series-cover {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .no-cover {
    width: 100%;
    height: 100%;
    background-color: var(--el-fill-color);
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
      font-size: 32px;
      color: var(--el-text-color-secondary);
    }
  }
  
  // .play-button {
  //   position: absolute;
  //   top: 50%;
  //   left: 50%;
  //   transform: translate(-50%, -50%);
  //   width: 48px;
  //   height: 48px;
  //   background-color: rgba(0, 0, 0, 0.5);
  //   border-radius: 50%;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  //   opacity: 0;
  //   transition: opacity 0.2s;
    
  //   i {
  //     color: white;
  //     font-size: 24px;
  //   }
  // }
  
  // &:hover .play-button {
  //   opacity: 1;
  // }
}

.series-info {
  padding: 8px 0;
}

.series-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.series-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
