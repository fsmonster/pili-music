<template>
  <el-table
    :data="tableData"
    :border="false"
    :highlight-current-row="true"
    @row-dblclick="handleRowDblClick"
    @row-click="handleRowClick"
    :row-class-name="rowClassName"
    row-key="id"
    :expand-row-keys="expandedRows"
  >
    <!-- 索引列 -->
    <el-table-column type="index" width="50">
      <template #default="scope">
        <div v-if="isCurrentPlaying(scope.row) && playerStore.playing" class="playing-indicator">
          <img src="../../assets/image/playing.gif" alt="GIF">
        </div>
        <div v-else class="index">{{ scope.$index + 1 }}</div>
      </template>
    </el-table-column>

    <!-- 封面列 -->
    <el-table-column label="歌曲" min-width="70" width="70">
      <template #default="{ row }">
        <div class="media-info">
          <div class="media-cover-container">
            <img 
              :src="processResourceUrl(row.cover) + '@80w'" 
              :alt="row.title" 
              class="media-cover"
              loading="lazy"
              :data-src="processResourceUrl(row.cover)"
            >
            <div class="media-cover-overlay">
              <i v-if="!isCurrentPlaying(row) || !playerStore.playing" class="ri-play-fill play-icon" @click.stop="$emit('play', row)"></i>
              <i v-else class="ri-music-line playing-icon"></i>
            </div>
          </div>
        </div>
      </template>
    </el-table-column>

    <!-- 歌曲名列 -->
    <el-table-column min-width="250">
      <template #default="{ row }">
        <div class="media-text">
          <div class="media-title" :class="{ 'playing': isCurrentPlaying(row) }">{{ row.title }}</div>
          <!-- 如果是多P视频，显示展开按钮 -->
          <div v-if="isMultiPage(row)" class="multi-page-indicator">
            <el-button 
              type="primary" 
              link 
              size="small" 
              @click.stop="toggleExpand(row)"
            >
              <i :class="isExpanded(row) ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
              {{ isExpanded(row) ? '收起' : '查看' }} {{ row.page }} P
            </el-button>
          </div>
        </div>
      </template>
    </el-table-column>

    <!-- up主列 -->
    <el-table-column 
      v-if="type === 'favorite'"
      label="up" 
      min-width="50"
    >
      <template #default="{ row }">
        <div class="media-up">{{ row.upper?.name }}</div>
      </template>
    </el-table-column>

    <!-- 上传时间列 -->
    <el-table-column 
      v-if="type === 'season' || type === 'series'"
      label="上传时间" 
      width="150"
    >
      <template #default="{ row }">
        {{ new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(row.pubtime * 1000)) }}
      </template>
    </el-table-column>

    <!-- 时长列 -->
    <el-table-column 
      label="时长" 
      width="120"
    >
      <template #default="{ row }">
        <div class="duration-column">
          {{ formatDuration(row.duration) }}
          <el-button 
            type="primary" 
            link
            @click="$emit('add', row)"
            class="add-button"
          >
            <i class="ri-add-circle-line"></i>
          </el-button>
        </div>
      </template>
    </el-table-column>

    <!-- 展开行 - 用于显示多P内容 -->
    <el-table-column type="expand">
      <template #default="{ row }">
        <MultiPageTable 
          v-if="isMultiPage(row)" 
          :parentMedia="row" 
          :pageList="pageList"
        />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { processResourceUrl, formatDuration } from '../../utils';
import { getCid } from '../../api';
import { usePlayerStore, useCurrentTrackStore } from '../../stores';
import type { MediaItem, PageInfo } from '../../types';
import MultiPageTable from './MultiPageTable.vue';

const props = defineProps<{
  data: MediaItem[];
  type:'favorite' | 'season' | 'series'
  loading?: boolean;
  options?: {
    // 可扩展的选项
  }
}>();

const emit = defineEmits<{
  (e: 'play', item: MediaItem): void
  (e: 'add', item: MediaItem): void
  (e: 'play-all'): void
  (e: 'load-more'): void
}>();

// 获取播放器存储
const playerStore = usePlayerStore();
const currentTrackStore = useCurrentTrackStore();
const { currentTrack } = storeToRefs(currentTrackStore);

// 展开行的ID数组
const expandedRows = ref<string[]>([]);
// 当前选中的多P视频
const currentMultiPageItem = ref<MediaItem | null>(null);
// 分P列表
const pageList = ref<PageInfo[]>([]);

const tableData = computed(() => {
  if (props.type === 'favorite') {
    return props.data.filter(item => item.attr === 0);
  }
  return props.data;
});

// 检查是否是多P视频
function isMultiPage(item: MediaItem): boolean {
  return typeof item.page === "number" && item.page > 1;
}

// 检查是否已展开
function isExpanded(item: MediaItem): boolean {
  return expandedRows.value.includes(item.id.toString());
}

// 检查是否是当前播放的媒体
function isCurrentPlaying(item: MediaItem): boolean {
  return currentTrack.value?.id === item.id;
}

// 切换展开/折叠状态
async function toggleExpand(item: MediaItem) {
  const itemId = item.id.toString();
  const index = expandedRows.value.indexOf(itemId);
  
  if (index === -1) {
    // 展开
    expandedRows.value.push(itemId);
    currentMultiPageItem.value = item;
    
    // 获取分P列表
    try {
      const response = await getCid({
        aid: item.id,
      }, true);
      
      if (Array.isArray(response)) {
        pageList.value = response;
      }
    } catch (error) {
      console.error('获取分P列表失败:', error);
    }
  } else {
    // 折叠
    expandedRows.value.splice(index, 1);
    if (currentMultiPageItem.value?.id === item.id) {
      currentMultiPageItem.value = null;
      pageList.value = [];
    }
  }
}

// 处理双击行事件
function handleRowDblClick(row: MediaItem) {
  emit('play', row);
}

// 处理点击行事件
function handleRowClick(row: MediaItem) {
  if (isMultiPage(row)) {
    toggleExpand(row);
  }
}

// 行样式
function rowClassName({ row }: { row: MediaItem }) {
  return isCurrentPlaying(row) ? 'current-playing-row' : '';
}

// 监听数据变化，重置展开状态
watch(() => props.data, () => {
  expandedRows.value = [];
  currentMultiPageItem.value = null;
}, { deep: true });
</script>

<style lang="scss" scoped>
@use '../../assets/styles/_mixins.scss';
/* 当前播放动画 */
.playing-indicator {
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 10px;
}

.media-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  
  .media-cover-container {
    position: relative;
    // width: 40px;
    height: 40px;
    aspect-ratio: 4/3;
    border-radius: 4px;
    overflow: hidden;
    
    .media-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.3s ease;
    }
    
    .media-cover-overlay {
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
      
      .play-icon {
        color: white;
        font-size: 20px;
        cursor: pointer;
      }
      
      .playing-icon {
        color: white;
        font-size: 20px;
        animation: spin 2s linear infinite;
      }
    }    
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.media-text {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  .media-title {
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 4px;
    @include mixins.text-ellipsis-multi(2);
    
    &.playing {
      color: var(--el-color-primary);
    }
  } 
  .multi-page-indicator {
    font-size: 12px;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
    
    i {
      margin-right: 4px;
    }
  }
}

.media-up {
  font-size: 13px;
  color: #666;
  @include mixins.text-ellipsis();
}

.duration-column {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-button {
  i {
    font-size: 18px; 
  }
}

.el-table__row:hover {
  .media-cover-overlay {
    opacity: 1;
  }
  .media-cover {
    filter: brightness(0.7);
  }
}

.playing-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  
  .playing-icon {
    color: var(--el-color-primary);
    animation: pulse 1.5s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

.media-cover {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.media-title {
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    color: var(--el-color-primary);
  }
  
  &.playing {
    color: var(--el-color-primary);
  }
}

.media-uploader {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  
  .uploader-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 6px;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

:deep(.el-table__expanded-cell) {
  padding: 0 !important;
}

:deep(.current-playing-row) {
  background-color: var(--el-fill-color-light) !important;
}
</style>
