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
            <el-skeleton v-if="favoriteStore.loading || !item.cover" :rows="1" animated>
            </el-skeleton>
            <img v-else :src="item.cover" :alt="item.title">
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
    >
      <div class="favorites-manage">
        <el-checkbox-group v-model="checkedFavorites">
          <el-checkbox 
            v-for="item in favoriteStore.allFavorites" 
            :key="item.id" 
            :label="item.id"
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ContentSection from '../common/ContentSection.vue';
import { useFavoriteStore } from '@/stores/favorite';

const router = useRouter();
const favoriteStore = useFavoriteStore();

// 对话框显示状态
const showManageDialog = ref(false);
// 选中的收藏夹ID列表
const checkedFavorites = ref<number[]>([]);

// 跳转到播放列表
const goToPlaylist = (id: number) => {
  router.push(`/playlist/${id}`);
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
  favoriteStore.updateDisplaySettings(checkedFavorites.value);
  showManageDialog.value = false;
  
  // 如果有新选中的收藏夹，需要重新获取列表以加载封面
  await favoriteStore.fetchFavorites();
  ElMessage.success('设置已保存');
};

// 监听对话框打开
const onDialogOpen = () => {
  initManageDialog();
};

onMounted(async () => {
  // 获取所有收藏夹列表
  await favoriteStore.fetchFavorites();
});

// 监听对话框
defineExpose({
  onDialogOpen
});
</script>

<style lang="scss" scoped>
@import '../styles/music-grid.scss';

.empty-tip {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);

  p {
    margin: 0 0 16px;
  }
}

.favorites-manage {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 20px;

  :deep(.el-checkbox) {
    display: block;
    margin-bottom: 12px;
    
    .count {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      margin-left: 4px;
    }
  }
}
</style>