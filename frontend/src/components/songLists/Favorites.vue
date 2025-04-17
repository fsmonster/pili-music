<template>
  <ContentSection 
    title="收藏夹" 
    :show-manage="true" 
    :show-refresh="true" 
    :isEmpty="!favoriteStore.favorites.length && !favoriteStore.loading"
    @manage="showManageDialog = true"
    @refresh="favoriteStore.refreshFavorites()">
    <!-- 图标插槽 -->
    <template #icon>
      <i class="ri-star-line"></i>
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
              :src="processResourceUrl(item.cover) + '@250h'" 
              :alt="item.title"
            >
            <!-- 私密收藏夹标识 -->
            <div v-if="isPrivate(item)" class="private-badge">
              <i class="ri-lock-line"></i>
            </div>
            <div class="play-button" @click.stop="playFavorite(item.id)">
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
import { ElDialog, ElMessage } from 'element-plus';
import { CollectionType } from '@/types';
import ContentSection from './ContentSection.vue';
import { useUserStore, useFavoriteStore,useFavoriteContentStore, useQueueStore, usePlayerStore, useLazyLoadStore } from '@/stores';
import { processResourceUrl } from '@/utils';

// 路由
const router = useRouter();

// store
const userStore = useUserStore();
const favoriteStore = useFavoriteStore();
const favoriteContentStore = useFavoriteContentStore();
const queueStore = useQueueStore();
const playerStore = usePlayerStore();
const lazyLoad = useLazyLoadStore();

// 对话框显示状态
const showManageDialog = ref(false);
// 选中的收藏夹ID列表
const checkedFavorites = ref<number[]>([]);

// 跳转到播放列表
const goToPlaylist = (id: number) => {
  router.push(`/favorite/${id}`);
};

// 判断收藏夹是否私密
const isPrivate = (item: any) => {
  // 根据 attr 值判断是否为私密收藏夹
  // attr 值为 23 或 3 表示私密收藏夹
  return item.attr === 23 || item.attr === 3;
};

// 播放收藏夹内容
const playFavorite = async (id: number) => {
  try {
    if (lazyLoad.type === CollectionType.Favorite && lazyLoad.id === id) {
      queueStore.setCurrentIndex(0);
      playerStore.replay();
      return;
    } else {
      lazyLoad.set({ type: CollectionType.Favorite, id });
    }
    // 完整加载收藏夹内容
    await favoriteContentStore.fetchFavoriteContent(Number(id));
    if (favoriteContentStore.medias.length > 0) {
      queueStore.setQueue(favoriteContentStore.medias);
      queueStore.total = favoriteContentStore.totalCount;
      queueStore.setCurrentIndex(0);
      playerStore.replay();
    }
  } catch (error) {
    console.error('播放收藏夹失败:', error);
    ElMessage.error('播放收藏夹失败');
  }
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
}

.private-badge {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 40px 40px;
  border-color: transparent transparent transparent var(--el-color-primary);
  
  i {
    position: absolute;
    top: 3px;
    left: -37px;
    font-size: 14px;
    color: #fff;
  }
}
</style>