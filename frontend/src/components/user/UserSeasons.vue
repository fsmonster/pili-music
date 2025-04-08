<template>
  <div class="user-seasons">
    <div class="content-header">
      <h3>合集</h3>
    </div>
    <div class="seasons-list">
      <!-- 合集列表 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="seasons.length === 0" class="empty-container">
        <el-empty description="暂无合集" />
      </div>
      <div v-else class="seasons-grid">
        <div 
          v-for="item in seasons" 
          :key="item.meta.season_id" 
          class="season-card"
          @click="goToSeason(item.meta.season_id)"
        >
          <div class="season-cover">
            <img 
              :src="processResourceUrl(item.meta.cover)" 
              alt="合集封面" 
              loading="lazy" 
            />
          </div>
          <div class="season-info">
            <div class="season-title" :title="item.meta.name">{{ item.meta.name }}</div>
            <div class="season-count">{{ item.meta.total }}个内容</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';
import { ElSkeleton, ElEmpty, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { getUserSeasonsAndSeries, getSeasonCover } from '@/api';
import type { UserSeasonList } from '@/types';
import { processResourceUrl } from '@/utils';

// 定义组件属性
const props = defineProps<{
  mid: number;
}>();

// 路由器
const router = useRouter();

// 合集列表数据
const seasons = ref<UserSeasonList[]>([]);
const loading = ref(true);

// 获取用户合集
const fetchUserSeasons = async () => {
  try {
    loading.value = true;
    // 调用 API 获取数据
    const response = await getUserSeasonsAndSeries({
      mid: props.mid,
      page_num: 1,
      page_size: 20
    });
    
    if (response.data?.items_lists?.seasons_list) {
      seasons.value = response.data.items_lists.seasons_list;
    } else {
      seasons.value = [];
    }
  } catch (error) {
    console.error('获取用户合集失败:', error);
    ElMessage.error('获取合集列表失败，请稍后重试');
    seasons.value = [];
  } finally {
    loading.value = false;
  }
};

// 跳转到合集详情
const goToSeason = (id: number) => {
  // 实际项目中应该跳转到合集详情页
  router.push(`/season/${id}`);
};

watchEffect(async () => {
  if (!seasons.value) return; // 避免 seasons 未初始化时报错
  
  const promises = seasons.value.map(async (season) => {
    if (season.meta.cover.includes("viedeo_material_default.png")) {
      try {
        return await getSeasonCover(season.meta.season_id); // 等待 Promise 解析
      } catch (error) {
        console.error("获取封面失败", error);
        return season.meta.cover; // 获取失败时使用原封面
      }
    }
    return season.meta.cover;
  });

  const covers = await Promise.all(promises);
  seasons.value.forEach((season, index) => {
    season.meta.cover = covers[index];
  });
});

// 组件挂载时获取合集
onMounted(() => {
  if (props.mid) {
    fetchUserSeasons();
  }
});
</script>

<style lang="scss" scoped>
.user-seasons {
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

.seasons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.season-card {
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.season-cover {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.season-info {
  padding: 8px 0;
}

.season-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.season-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
