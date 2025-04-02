<template>
  <div class="media-list-container">
    <!-- 列表头部 -->
    <div class="media-list-header" :class="type">
      <div class="header-index">#</div>
      <div class="header-title">歌曲</div>
      <div v-if="type === 'favorite'" class="header-uploader">UP主</div>
      <div v-if="type === 'season' || type === 'series'" class="header-pubtime">上传时间</div>
      <div class="header-duration">时长</div>
      <div class="header-actions">操作</div>
    </div>

    <!-- 列表内容 -->
    <div class="media-list-body">
      <!-- 加载中状态（仅在首次加载且无数据时显示） -->
      <div v-if="loading && mediaList.length === 0" class="media-list-loading">
        <el-icon class="is-loading"><i class="ri-loader-4-line"></i></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 无数据状态 -->
      <div v-else-if="!loading && mediaList.length === 0" class="media-list-empty">
        <i class="ri-inbox-line"></i>
        <span>暂无数据</span>
      </div>

      <!-- 数据列表 -->
      <template v-else>
        <div 
          v-for="(item, index) in mediaList" 
          :key="item.id"
          class="media-list-item"
          :class="{ 
            'is-playing': isCurrentPlaying(item),
            'is-multi-page': isMultiPage(item),
            'is-hidden': type === 'favorite' && item.attr !== 0
          }"
          @dblclick="handlePlay(item)"
          v-show="type !== 'favorite' || item.attr === 0"
        >
          <!-- 索引/播放状态 -->
          <div class="item-index">
            <div v-if="isCurrentPlaying(item) && playerStore.playing" class="playing-indicator">
              <img src="../../assets/image/playing.gif" alt="GIF">
            </div>
            <div v-else class="index-number">{{ index + 1 }}</div>
          </div>

          <!-- 歌曲信息 -->
          <div class="item-title">
            <div class="media-cover-wrapper">
              <img 
                :src="processResourceUrl(item.cover) + '@80h'" 
                :alt="item.title" 
                class="media-cover"
                loading="lazy"
                :data-src="processResourceUrl(item.cover)"
              >
              <div class="cover-overlay">
                <i 
                  v-if="!isCurrentPlaying(item) || !playerStore.playing" 
                  class="ri-play-fill play-icon" 
                  @click.stop="handlePlay(item)"
                ></i>
                <i v-else class="ri-music-line playing-icon"></i>
              </div>
            </div>
            <div class="title-info">
              <div class="media-title" :class="{ 'playing': isCurrentPlaying(item) }">
                {{ item.title }}
              </div>
              <div v-if="isMultiPage(item)" class="multi-page-tag">
                <i class="ri-file-list-line"></i>
                <span>{{ item.page }}P</span>
              </div>
            </div>
          </div>

          <!-- UP主 -->
          <div 
            v-if="type === 'favorite'" 
            class="item-uploader"
            @click="goToUploader(item.upper?.mid || 0)"
          >
            <span>{{ item.upper?.name || '-' }}</span>
          </div>

          <!-- 上传时间 -->
          <div v-if="type === 'season' || type === 'series'" class="item-pubtime">
            {{ formatDate(item.pubtime) }}
          </div>

          <!-- 时长 -->
          <div class="item-duration">
            {{ formatDuration(item.duration) }}
          </div>

          <!-- 操作按钮 -->
          <div class="item-actions">
            <el-button 
              type="primary" 
              link
              size="small"
              @click.stop="handleAdd(item)"
              title="添加到播放队列"
            >
              <i class="ri-add-circle-line"></i>
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 底部加载指示器（仅在加载更多且已有数据时显示） -->
      <div v-if="loading && mediaList.length > 0" class="media-list-loading-more">
        <el-icon class="is-loading"><i class="ri-loader-4-line"></i></el-icon>
        <span>加载更多...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlayerStore, useCurrentTrackStore } from '../../stores';
import { processResourceUrl, formatDuration, formatDate } from '../../utils';
import type { MediaItem } from '../../types';
import router from '@/router';

const props = defineProps<{
  data: MediaItem[];
  type: 'favorite' | 'season' | 'series';
  loading?: boolean;
  options?: {
    // 可扩展的选项
  }
}>();

const emit = defineEmits<{
  (e: 'play', item: MediaItem): void
  (e: 'add', item: MediaItem): void
  (e: 'play-all'): void
}>();

// 暴露 updateData 方法给父组件
defineExpose({
  updateData
});

// 获取播放器存储
const playerStore = usePlayerStore();
const currentTrackStore = useCurrentTrackStore();
const { currentTrack } = storeToRefs(currentTrackStore);

// 内部数据，与 props.data 分离
const mediaList = ref<MediaItem[]>([]);

/**
 * 更新数据方法
 * @param newItems 新的媒体项数组
 * @param replace 是否替换现有数据，默认为 false（增量更新）
 */
function updateData(newItems: MediaItem[], replace: boolean = false) {
  if (!newItems || newItems.length === 0) return;

  if (replace) {
    // 完全替换数据
    mediaList.value = [...newItems];
  } else {
    // 增量更新：只添加不存在的项
    const existingIds = new Set(mediaList.value.map(item => item.id));
    const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
    
    if (uniqueNewItems.length > 0) {
      // 使用 push 方法添加新项，避免创建新数组导致整个列表重新渲染
      // 注意：这种方式会保持DOM结构，不会影响滚动位置
      mediaList.value.push(...uniqueNewItems);
    }
  }
}

// 检查是否是多P视频
function isMultiPage(item: MediaItem): boolean {
  return typeof item.page === "number" && item.page > 1;
}

// 检查是否是当前播放的媒体
function isCurrentPlaying(item: MediaItem): boolean {
  return currentTrack.value?.id === item.id;
}

// 处理播放事件
function handlePlay(item: MediaItem): void {
  emit('play', item);
}

// 处理添加到队列事件
function handleAdd(item: MediaItem): void {
  emit('add', item);
}

// 
function goToUploader(id: number): void {
  router.push(`/user/${id}`);
}

// 初始化和数据变化时更新内部数据
watch(() => props.data, (newData) => {
  if (newData) {
    // 使用 updateData 方法更新数据
    updateData(newData, true);
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
@use '../../assets/styles/_mixins.scss';

.media-list-container {
  width: 100%;
  border-radius: 8px;
  overflow: visible;
  background-color: var(--el-bg-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

// 列表头部样式
.media-list-header {
  display: grid;
  grid-template-columns: 60px 1fr auto auto auto;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  border-radius: 8px 8px 0 0;
  font-size: 14px;
  font-weight: 500;
  position: sticky;
  top: -20px;
  z-index: 10;
  
  &.favorite {
    grid-template-columns: 60px 1fr 120px auto auto;
  }
  
  &.season, &.series {
    grid-template-columns: 60px 1fr 150px auto auto;
  }
  
  .header-index {
    text-align: center;
  }
  
  .header-title {
    padding-left: 8px;
  }
  
  .header-uploader, .header-pubtime {
    text-align: center;
  }
  
  .header-duration {
    text-align: center;
    width: 80px;
  }
  
  .header-actions {
    width: 100px;
    text-align: center;
  }
}

// 列表内容样式
.media-list-body {
  width: 100%;
}

// 列表项样式
.media-list-item {
  display: grid;
  grid-template-columns: 60px 1fr auto auto auto;
  padding: 10px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.2s;
  
  &.favorite {
    grid-template-columns: 60px 1fr 120px auto auto;
  }
  
  &.season, &.series {
    grid-template-columns: 60px 1fr 150px auto auto;
  }
  
  &.is-playing {
    background-color: var(--el-fill-color-light);
  }
  
  &.is-multi-page {
    .media-title {
      font-style: italic;
    }
  }
  
  &.is-hidden {
    display: none;
  }
}

// 索引列
.item-index {
  display: flex;
  align-items: center;
  justify-content: center;
  
  .index-number {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);
  }
  
  .playing-indicator {
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}

// 标题列
.item-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 8px;
  
  .media-cover-wrapper {
    position: relative;
    aspect-ratio: 4 / 3;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    
    .media-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.3s ease;
    }
    
    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      .play-icon, .playing-icon {
        color: white;
        font-size: 20px;
        cursor: pointer;
      }
      
      .playing-icon {
        animation: spin 2s linear infinite;
      }
    }
  }
  
  .title-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    
    .media-title {
      font-size: 14px;
      @include mixins.text-ellipsis-multi(1);
      margin-bottom: 4px;
      
      &.playing {
        color: var(--el-color-primary);
      }
    }
    
    .multi-page-tag {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: var(--el-color-info);
      
      i {
        margin-right: 4px;
        font-size: 14px;
      }
    }
  }
}

// UP主列
.item-uploader {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  width: 120px;
  @include mixins.text-ellipsis();
  cursor: pointer;
  
  &:hover {
    color: var(--el-color-primary);
  }
}

// 上传时间列
.item-pubtime {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  width: 150px;
}

// 时长列
.item-duration {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  width: 80px;
}

// 操作列
.item-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100px;
  
  i {
    font-size: 18px;
  }
}

// 加载中状态
.media-list-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  color: var(--el-text-color-secondary);
  
  .el-icon {
    margin-right: 8px;
  }
}

// 空状态
.media-list-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  color: var(--el-text-color-secondary);
  
  i {
    font-size: 48px;
    margin-bottom: 16px;
  }
}

// 加载更多状态
.media-list-loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  color: var(--el-text-color-secondary);
  
  .el-icon {
    margin-right: 8px;
  }
}

.media-list-item:hover {
  background-color: var(--el-fill-color-light);
  
  .cover-overlay {
    opacity: 1;
  }
  
  .media-cover {
    filter: brightness(0.8);
  }
}

// 动画
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
