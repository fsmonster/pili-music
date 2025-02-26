<template>
  <ContentSection title="收藏夹" :show-manage="true" @manage="showManageDialog = true">
    <template #icon>
      <i class="ri-folder-2-line"></i>
    </template>
    <div class="music-grid">
      <div 
        v-for="item in favorites" 
        :key="item.id" 
        class="music-item"
        @click="goToPlaylist(item.id)"
      >
        <div class="cover">
          <img :src="item.cover" :alt="item.title">
          <div class="play-overlay">
            <i class="ri-play-circle-fill"></i>
          </div>
        </div>
        <div class="info">
          <div class="title">{{ item.title }}</div>
          <div class="count">{{ item.count }}个内容</div>
        </div>
      </div>
    </div>

    <!-- 管理对话框 -->
    <el-dialog v-model="showManageDialog" title="管理收藏夹" width="500px">
      <div class="favorites-manage">
        <el-checkbox-group v-model="checkedFavorites">
          <el-checkbox 
            v-for="item in allFavorites" 
            :key="item.id" 
            :label="item.id"
          >
            {{ item.title }}
            <span class="count">({{ item.count }}个内容)</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="showManageDialog = false">取消</el-button>
        <el-button type="primary" @click="saveFavoritesSettings">确定</el-button>
      </template>
    </el-dialog>
  </ContentSection>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ContentSection from '../common/ContentSection.vue';
import defaultCover from '@/assets/image/default_cover.avif';

// 假数据
const allFavorites = ref([
  {
    id: 1,
    title: '日语歌曲',
    count: 42,
    cover: defaultCover,
  },
  {
    id: 2,
    title: '英语歌曲',
    count: 28,
    cover: defaultCover,
  },
  {
    id: 3,
    title: '中文歌曲',
    count: 35,
    cover: defaultCover,
  },
]);

const favorites = ref(allFavorites.value);
const checkedFavorites = ref(allFavorites.value.map(f => f.id));
const showManageDialog = ref(false);

const router = useRouter();

// 跳转到播放列表
const goToPlaylist = (id: number) => {
  router.push('/playlist');
};

// 保存收藏夹显示设置
const saveFavoritesSettings = () => {
  favorites.value = allFavorites.value.filter(f => checkedFavorites.value.includes(f.id));
  showManageDialog.value = false;
};
</script>

<style lang="scss" scoped>
@import '../styles/music-grid.scss';

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
