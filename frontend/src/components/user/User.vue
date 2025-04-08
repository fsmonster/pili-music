<template>
  <div class="user-container" 
    ref="userContainerRef"  
    @scroll="handleScroll">
    <!-- 用户信息头部 -->
    <UserHeader 
      v-if="userInfo"
      :avatar="userInfo.face" 
      :name="userInfo.name" 
      :mid="userInfo.mid" 
    />

    <!-- 内容切换标签 -->
    <UserTabs 
      v-model:activeTab="activeTab"
      :tabs="tabs"
    />

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 投稿视频 -->
      <UserVideos 
        v-if="activeTab === 'videos' && userInfo" 
        :user-info="userInfo" 
        v-model:loadMore="loadMore"
      />

      <!-- 收藏夹 -->
      <UserFavorites 
        v-if="activeTab === 'favorites' && privacy?.fav_video && userInfo" 
        :mid="userInfo.mid" 
      />

      <!-- 合集 -->
      <UserSeasons 
        v-if="activeTab === 'seasons' && userInfo" 
        :mid="userInfo.mid" 
      />

      <!-- 系列 -->
      <UserSeries 
        v-if="activeTab === 'series' && userInfo" 
        :mid="userInfo.mid" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import UserHeader from './UserHeader.vue';
import UserTabs from './UserTabs.vue';
import UserVideos from './UserVideos.vue';
import UserFavorites from './UserFavorites.vue';
import UserSeasons from './UserSeasons.vue';
import UserSeries from './UserSeries.vue';
import { ElMessage } from 'element-plus';
import { 
  getUserInfo, 
  getUserSettings,
} from '@/api';
import type { Privacy, MediaUpper } from '@/types';
import { useRoute } from 'vue-router';

const route = useRoute();
const routerMid = computed(() => Number(route.params.mid));

// 标签定义
const tabs = ref(
  [
  { label: '投稿视频', value: 'videos', icon: 'ri-video-line' },
  { label: '合集', value: 'seasons', icon: 'ri-stack-line' },
  { label: '系列', value: 'series', icon: 'ri-list-check-2' },
]
);

// 当前激活的标签
const activeTab = ref('videos');
const privacy = ref<Privacy | null>(null);

// 用户信息
const userInfo = ref<MediaUpper | null>(null);

// 视频加载状态
const loadMore = ref(false);
const userContainerRef = ref<HTMLElement | null>(null);

// 加载状态控制
const isLoading = ref(false);

// 滚动防抖定时器
let scrollTimer: number | null = null;

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    if (!routerMid.value) {
      return;
    }
    // 获取用户基本信息
    userInfo.value = await getUserInfo(routerMid.value);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败，请稍后重试');
  }
};

// 获取用户设置信息
const fetchUserSettings = async () => {
  try {
    if (!routerMid.value) {
      return;
    }
    const settings = await getUserSettings(routerMid.value);
    privacy.value = settings.data.privacy;
    if(privacy.value?.fav_video) {
      tabs.value.splice(1, 0, { label: '收藏夹', value: 'favorites', icon: 'ri-star-line' });
    }
  } catch (error) {
    console.error('获取用户设置失败:', error);
    ElMessage.error('获取用户设置失败，请稍后重试');
  }
};

// 处理滚动事件，实现触底加载
const handleScroll = (e: Event) => {
  // 如果正在加载中，不触发新的加载
  if (isLoading.value) return;
  
  // 清除之前的定时器，实现防抖
  if (scrollTimer) {
    clearTimeout(scrollTimer);
    scrollTimer = null;
  }
  
  // 设置新的定时器，延迟200ms执行
  scrollTimer = window.setTimeout(() => {
    const target = e.target as HTMLElement;
    const scrollHeight = target.scrollHeight;
    const scrollTop = target.scrollTop;
    const clientHeight = target.clientHeight;
    
    // 当滚动到距离底部350px时，触发加载更多
    if (scrollHeight - scrollTop - clientHeight < 350) {
      isLoading.value = true; // 设置加载状态
      loadMore.value = true;
      
      // 2秒后重置加载状态，避免频繁触发
      setTimeout(() => {
        isLoading.value = false;
      }, 2000);
    }
  }, 200);
};

watch(() => routerMid.value, () => {
  fetchUserInfo();
  fetchUserSettings();
}, { immediate: true });
</script>

<style lang="scss" scoped>
.user-container {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.content-area {
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  // box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 24px;
}
</style>
