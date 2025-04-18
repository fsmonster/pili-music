<template>
  <Layout>
    <template #main>
      <div class="playlist-container">
        <div class="playlist-scroll" ref="playlistScroll" @scroll="debouncedScroll">
          <!-- 列表头部 -->
          <ListHeader 
            v-if="currentInfo"
            :mid="currentInfo.mid"
            :title="currentInfo.title"
            :cover="currentInfo.cover"
            :count="currentInfo.media_count"
          />

          <!-- 播放列表内容 -->
          <div class="playlist-content">
            <!-- 控制栏 -->
            <ListControls
              :disabled="!medias.length"
              :type="CollectionType.Favorite"
              :sort="sort"
              :sortOptions="favoriteSortOptions"
              @play-all="handlePlayAll"
              @sort="handleSort"
              @add="handleAdd"
            />

            <!-- 表格 -->
            <MediaList
              ref="mediaListRef"
              :data="initialData"
              type="favorite"
              :loading="favoriteContentStore.loading"
              @play="handlePlay"
            />
            <!-- 加载状态 -->
            <div v-if="favoriteContentStore.loading && medias.length === 0" class="loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>

            <!-- 无数据 -->
            <div v-if="!favoriteContentStore.loading && medias.length === 0" class="empty-data">
              暂无数据
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Layout from '../layout/Layout.vue';
import { MediaList, ListHeader, ListControls} from '../components';
import { Loading } from '@element-plus/icons-vue';
import { FavoriteSortType, SeriesSortType, CollectionType } from '../types';
import type { SortType, FavoriteInfo, MediaItem } from '../types';
import * as favoriteApi from '../api/favorite';
import { storeToRefs } from 'pinia';
import { 
  useFavoriteContentStore, 
  usePlayerStore, 
  useLazyLoadStore,
  useOverlayStore
} from '../stores';

const route = useRoute();
const playerStore = usePlayerStore();
const favoriteContentStore = useFavoriteContentStore();
const lazyLoad = useLazyLoadStore();
const overlayStore = useOverlayStore();

// 当前收藏夹信息
const currentInfo = ref<FavoriteInfo | null>(null);

// 计算属性
const { medias } = storeToRefs(favoriteContentStore);

// 初始数据，只用于 MediaList 组件的初始渲染
const initialData = ref<MediaItem[]>([]);

// MediaList 组件引用
const mediaListRef = ref<InstanceType<typeof MediaList> | null>(null);

// 滚动容器引用
const playlistScroll = ref<HTMLElement | null>(null);

// 滚动锁，防止多次触发
const scrollLock = ref(false);

// 防抖定时器
let scrollTimer: number | null = null;

// 计算属性
const id = computed(() => route.params.id);

// 排序类型
const sort = ref<SortType | null>({
  type: CollectionType.Favorite,
  order: FavoriteSortType.MTIME,
});

// 收藏夹排序选项
const favoriteSortOptions = [
  { label: '收藏时间', value: FavoriteSortType.MTIME },
  { label: '播放量', value: FavoriteSortType.VIEW },
  { label: '投稿时间', value: FavoriteSortType.PUBTIME }
];

// 加载收藏夹信息
const loadInfo = async () => {
  if (!id.value) return;
  
  // 获取收藏夹信息
  try {
    const favoriteInfo: FavoriteInfo = await favoriteApi.getFavoriteInfo(Number(id.value));
    currentInfo.value = favoriteInfo;
  } catch (error) {
    console.error('获取收藏夹信息失败:', error);
  }
};

// 加载内容
async function loadContent() {  
  if (!id.value) return;
  // 加载收藏夹内容
  const firstPageData = await favoriteContentStore.fetchFavoriteContent(
    Number(id.value), 
    sort.value?.order as FavoriteSortType 
      ?? FavoriteSortType.MTIME);
  initialData.value = firstPageData || [];
}

/**
 * @desc 加载更多
 */
const loadMore = async () => {
  if (favoriteContentStore.loading || !favoriteContentStore.hasMore) return;
  
  // 记录当前滚动位置
  const scrollPosition = playlistScroll.value ? playlistScroll.value.scrollTop : 0;
  
  // const currentLength = medias.value.length;
  const newData = await favoriteContentStore.fetchFavoriteContent(Number(id.value));
  
  // 如果有新数据并且 MediaList 组件已挂载，使用 updateData 方法更新
  if (mediaListRef.value && newData && newData.length > 0) {
    // 使用 updateData 方法增量更新
    mediaListRef.value.updateData(newData, false);
    
    // 恢复滚动位置
    setTimeout(() => {
      if (playlistScroll.value) {
        playlistScroll.value.scrollTop = scrollPosition;
      }
    }, 10);
  }
  
  scrollLock.value = false;
};

/**
 * @desc 处理滚动事件
 */
function handleScroll() {
  if (scrollLock.value || !playlistScroll.value || !favoriteContentStore.hasMore || favoriteContentStore.loading) return;
  
  const { scrollHeight, scrollTop, clientHeight } = playlistScroll.value;
  // 当滚动到距离底部 200px 时触发加载更多
  if (scrollHeight - scrollTop - clientHeight < 200) {
    scrollLock.value = true;
    // 使用 requestAnimationFrame 确保在下一帧渲染前执行，避免阻塞滚动
    requestAnimationFrame(() => {
      loadMore();
    });
  }
}

// 添加防抖函数，避免频繁触发滚动事件
function debouncedScroll() {
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
  scrollTimer = window.setTimeout(() => {
    handleScroll();
  }, 100);
}

/**
 * @desc 构建播放选项
 */
function buildPlayOptionsPartial() {
  const id = currentInfo.value?.id ?? 0;
  const title = currentInfo.value?.title ?? '';
  const cover = currentInfo.value?.cover ?? '';

  return {
    collection: {
      type: CollectionType.Favorite,
      id,
      name: title,
      cover
    },
    lazyParams: {
      type: CollectionType.Favorite,
      id,
    }
  };
}

/**
 * @desc 播放全部
 */
function handlePlayAll() {
  if (medias.value.length > 0) {
    playerStore.playMedia({
      queue: medias.value,
      total: currentInfo.value?.media_count ?? 0,
      ...buildPlayOptionsPartial()
    });
  }
}

/**
 * @desc 播放单曲
 */
function handlePlay(item: MediaItem) {
  playerStore.playMedia({
    queue: medias.value,
    total: currentInfo.value?.media_count ?? 0,
    currentTrack: item,
    ...buildPlayOptionsPartial()
  });
}

/**
 * @desc 移除内容
 */
function removeContent() {
  favoriteContentStore.reset();
}

/**
 * @desc 排序
 */
function handleSort(order: FavoriteSortType | SeriesSortType) {
  sort.value = { type: CollectionType.Favorite, order };
}

/**
 * @desc 添加到分区
 */
function handleAdd() {
  overlayStore.showingSectionModal = true;
  overlayStore.collectionId = currentInfo.value?.id ?? 0;
  overlayStore.currentType = CollectionType.Favorite;
}

watch(() => id.value, () => {
  removeContent();
  loadInfo();
  loadContent();
}, { immediate: true });

watch(() => sort.value, () => {
  removeContent();
  loadContent();
});

onMounted(() => {
  // 添加滚动事件监听
  if (playlistScroll.value) {
    playlistScroll.value.addEventListener('scroll', debouncedScroll);
  }
});

onUnmounted(() => {
  lazyLoad.pn = favoriteContentStore.page;
  favoriteContentStore.reset();
  
  // 移除滚动事件监听
  if (playlistScroll.value) {
    playlistScroll.value.removeEventListener('scroll', debouncedScroll);
  }
  
  // 清除定时器
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
});
</script>

<style lang="scss" scoped>
@use './style/playlist.scss';

.playlist-scroll {
  height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 0 16px;
}

.loading-more {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  color: var(--el-text-color-secondary);
  
  .el-icon {
    margin-right: 8px;
  }
}

.empty-data {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  color: var(--el-text-color-secondary);
}
</style>
