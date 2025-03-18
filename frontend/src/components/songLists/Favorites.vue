<template>
  <ContentSection title="收藏夹" :show-manage="true" :isEmpty="!favoriteStore.favorites.length && !favoriteStore.loading"
    @manage="showManageDialog = true">
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

    <!-- 歌单列表 -->
    <template #content>
      <div class="music-grid">
        <div 
          v-for="item in favoriteStore.favorites" 
          :key="item.id" 
          class="music-item" 
          @click="goToPlaylist(item.id)">
          <div class="cover">
            <el-skeleton 
              v-if="favoriteStore.loading || !item.cover" 
              :rows="1" 
              animated
            />
            <img v-else 
              :src="processResourceUrl(item.cover)" 
              :alt="item.title"
            >
          </div>
          <div class="info">
            <div class="title">{{ item.title }}</div>
            <div class="count">{{ item.media_count }}个内容</div>
          </div>
        </div>
      </div>
    </template>
  </ContentSection>

  <!-- 管理对话框 -->
  <el-dialog
   v-model="showManageDialog" 
   title="管理收藏夹" 
   width="500px" 
   :close-on-click-modal="false"
   @open="initManageDialog">
    <div class="favorites-manage">
      <el-checkbox-group v-model="checkedFavorites">
        <el-checkbox 
          v-for="item in favoriteStore.allFavorites" 
          :key="item.id" 
          :value="item.id">
          <div class="title">{{ item.title }}</div>
          <div class="count">({{ item.media_count }}个内容)</div>
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="dialog-footer">
      <el-button @click="cancelManage">取消</el-button>
      <el-button type="primary" @click="saveFavoritesSettings">确定</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
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
const goToPlaylist = (id: number) => {
  router.push(`/favorite/${id}`);
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

onMounted(() => {
  favoriteStore.fetchFavoritesIfNeeded();
});

watch(() => userStore.isLoggedIn, favoriteStore.fetchFavoritesIfNeeded);

</script>

<style lang="scss" scoped>
@use './styles/music-grid.scss';

.favorites-manage {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 20px;

  :deep(.el-checkbox) {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .el-checkbox__label {
      display: flex;
      width: 100%;
      align-items: center;
      .title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .count {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        margin-left: 4px;
      }
    }
  }
}

.dialog-footer {
  text-align: right;
  margin-top: 16px;
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