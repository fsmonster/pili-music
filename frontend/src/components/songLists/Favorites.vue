<template>
  <ContentSection title="收藏夹" :show-manage="true" @manage="showManageDialog = true">
    <template #icon>
      <i class="ri-folder-2-line"></i>
    </template>
    <div class="music-grid">
      <div 
        v-for="item in favoriteStore.favorites" 
        :key="item.id" 
        class="music-item"
        @click="goToPlaylist(item.id)"
      >
        <div class="cover">
          <el-skeleton v-if="favoriteStore.loading || !item.cover" :rows="1" animated />
          <img v-else :src="processResourceUrl(item.cover)" :alt="item.title">
        </div>
        <div class="info">
          <div class="title">{{ item.title }}</div>
          <div class="count">{{ item.media_count }}个内容</div>
        </div>
      </div>

      <!-- 未选择收藏夹时的提示 -->
      <div v-if="!favoriteStore.favorites.length && !favoriteStore.loading" class="empty-tip">
        <p>点击右上角的<i class="ri-settings-3-line"></i>添加收藏夹</p>
      </div>
    </div>

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
  </ContentSection>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ContentSection from './ContentSection.vue';
import { useFavoriteStore } from '@/stores';
import { processResourceUrl } from '@/utils/processResoureUrl';

const router = useRouter();
const favoriteStore = useFavoriteStore();

// 对话框显示状态
const showManageDialog = ref(false);
// 选中的收藏夹ID列表
const checkedFavorites = ref<number[]>([]);

// 跳转到播放列表
const goToPlaylist = (id: number) => {
  router.push(`/playlist/${id}/favorite`);
};

// 打开管理对话框时，初始化选中状态
const initManageDialog = () => {
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

onMounted(async () => {
  // 获取所有收藏夹列表
  await favoriteStore.fetchFavorites();
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
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: var(--el-text-color-secondary);
  
  i {
    margin: 0 4px;
  }
}
</style>