<template>
  <div class="search-results-container">
    <div class="result-list">
      <SearchUserResultItem 
        v-for="item in results" 
        :key="item.mid" 
        :item="item"
        @video-click="handleVideoClick"
      />
    </div>
    <SearchPagination 
      v-if="totalPages > 1"
      v-model:currentPage="currentPage"
      :pageSize="pageSize"
      :totalResults="totalResults"
      :totalPages="totalPages"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineModel } from 'vue';
import SearchUserResultItem from './SearchUserResultItem.vue';
import SearchPagination from './SearchPagination.vue';
import { CollectionType } from '@/types';
import type { SearchUserResult, Res } from '@/types';
import { usePlayerStore } from '@/stores';
import type { MediaItem } from '@/types';

// 初始化播放器 store
const playerStore = usePlayerStore();

// 定义属性
defineProps<{
  results: SearchUserResult[];
  pageSize: number;
  totalResults: number;
  totalPages: number;
}>();

const currentPage = defineModel<number>('currentPage', { default: 1 });

// 处理视频点击
const handleVideoClick = (video: Res) => {
  if (video && video.aid) {
    // 创建媒体项
    const mediaItem: MediaItem = {
      id: video.aid,
      title: video.title,
      cover: 'https:' + video.pic,
      duration: parseInt(video.duration.split(':')[0]) * 60 + parseInt(video.duration.split(':')[1]),
      author: '',
      bvid: video.bvid,
      // 添加必要的字段
      bv_id: video.bvid,
      pubtime: video.pubdate || 0
    };
    
    playerStore.playMedia({
      queue: [mediaItem],
      total: 1,
      currentTrack: mediaItem,
    });
  }
};
</script>

<style lang="scss" scoped>
.search-results-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 2%;
  padding-right: calc(2% + 8px);
  
  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #c9c9c9;
    border-radius: 3px;
    
    &:hover {
      background-color: #a8a8a8;
    }
  }
  
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 3px;
  }
}

.result-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 4px;
  min-height: 100%;
}
</style>