<template>
  <ContentSection 
    title="收藏夹" 
    :show-manage="true" 
    :isEmpty="!favoriteStore.favorites.length && !favoriteStore.loading"
    @manage="showManageDialog = true"
  >
    <!-- 图标插槽 -->
    <template #icon>
      <i class="ri-folder-2-line"></i>
    </template>

    <!-- 标题后缀 -->
    <template #title-suffix>
      <span class="count-badge" v-if="favoriteStore.favorites.length">
        {{ favoriteStore.favorites.length }}
      </span>
    </template>

    <!-- 自定义操作按钮 -->
    <template #customActions>
    </template>

    <!-- 歌单列表 -->
    <template #content>
      <div class="music-grid">
        <div 
          v-for="item in favoriteStore.favorites" 
          :key="item.id" 
          class="music-item"
          @click="goToPlaylist('favorite', item.id)"
        >
          <div class="cover">
            <el-skeleton v-if="favoriteStore.loading || !item.cover" :rows="1" animated />
            <img v-else :src="processResourceUrl(item.cover)" :alt="item.title">
            <div class="play-overlay">
              <i class="ri-play-fill"></i>
            </div>
          </div>
          <div class="info">
            <div class="title">{{ item.title }}</div>
            <div class="count">{{ item.media_count }}个内容</div>
          </div>
        </div>
      </div>
    </template>

    <!-- 空状态提示 -->
    <template #empty>
      <div class="empty-tip">
        <p>点击右上角的<i class="ri-settings-3-line"></i>添加收藏夹</p>
      </div>
    </template>

    <!-- 底部内容 -->
    <template #footer v-if="favoriteStore.favorites.length > 9">
      <div class="view-more">
        <el-button link type="primary" @click="showManageDialog = true">
          查看更多收藏夹
          <i class="ri-arrow-right-line"></i>
        </el-button>
      </div>
    </template>
  </ContentSection>
    <!-- 管理对话框 -->
    <el-dialog 
    v-model="showManageDialog" 
    title="管理收藏夹" 
    width="500px"
    :close-on-click-modal="false"
    @open="initManageDialog"
  >
    <div class="favorites-manage">
      <el-checkbox-group v-model="checkedFavorites">
        <el-checkbox 
          v-for="item in favoriteStore.allFavorites" 
          :key="item.id" 
          :value="item.id"
        >
          {{ item.title }}
          <span class="count">({{ item.media_count }}个内容)</span>
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <template #footer>
      <el-button @click="cancelManage">取消</el-button>
      <el-button type="primary" @click="saveFavoritesSettings">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElDialog, ElMessage, ElCheckbox, ElCheckboxGroup, ElButton } from 'element-plus';
import ContentSection from './ContentSection.vue';
import { useUserStore, useFavoriteStore } from '@/stores';
import { processResourceUrl } from '@/utils/processResoureUrl';

const router = useRouter();
const userStore = useUserStore();
const favoriteStore = useFavoriteStore();

// 对话框显示状态
const showManageDialog = ref(false);
// 选中的收藏夹ID列表
const checkedFavorites = ref<number[]>([]);

// 跳转到播放列表
const goToPlaylist = (type: 'favorite' | 'playlist', id: number) => {
  router.push(`/playlist/${type}/${id}`);
};

// 打开管理对话框时，初始化选中状态
const initManageDialog = () => {
  console.log('Dialog opened, initializing');
  checkedFavorites.value = [...favoriteStore.displayFavoriteIds];
};

// 取消管理
const cancelManage = () => {
  showManageDialog.value = false;
  // 重置选中状态
  initManageDialog();
};

// 保存收藏夹显示设置
const saveFavoritesSettings = async () => {
  await favoriteStore.updateDisplaySettings(checkedFavorites.value);
  showManageDialog.value = false;
  ElMessage.success('设置已保存');
};

// onMounted(async () => {
//   if (!userStore.isLoggedIn) {
//     return;
//   }
//   // 获取所有收藏夹列表
//   await favoriteStore.fetchFavorites();
// });

watch(()=> userStore.isLoggedIn, async (newVal) => {
  if (newVal) {
    await favoriteStore.fetchFavorites();
  }
});

watch(checkedFavorites, async (newVal) => {
  // 更新显示设置并获取详细信息
  await favoriteStore.updateDisplaySettings(newVal);
});
</script>

<style lang="scss" scoped>
@use './styles/music-grid.scss';

.favorites-manage {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 20px;

  :deep(.el-checkbox-group) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  :deep(.el-checkbox) {
    height: auto;
    margin-right: 0;
    
    .el-checkbox__label {
      white-space: normal;
      line-height: 1.4;
    }
  }

  .count {
    color: var(--el-text-color-secondary);
    margin-left: 4px;
  }
}

.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: var(--el-text-color-secondary);
  
  i {
    margin: 0 4px;
  }
}

.count-badge {
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 4px;
}

.view-more {
  text-align: center;
  margin-top: 8px;
}
</style>