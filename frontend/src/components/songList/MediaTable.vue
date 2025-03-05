# 媒体表格组件
<template>
  <el-table
    :data="data"
    style="width: 100%"
    :max-height="maxHeight"
    :border="false"
    :highlight-current-row="true"
    :empty-text="loading ? '加载中...' : '暂无数据'"
    v-loading="loading"
    @row-dblclick="handleRowDblClick"
  >
    <el-table-column type="index" width="50" />
    <el-table-column label="歌曲" min-width="70" width="70">
      <template #default="{ row }">
        <div class="media-info">
          <div class="media-cover-container">
            <img :src="processResourceUrl(row.cover)" :alt="row.title" class="media-cover">
            <div class="media-cover-overlay">
              <i class="ri-play-fill play-icon" @click.stop="$emit('play', row)"></i>
            </div>
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column min-width="250">
      <template #default="{ row }">
        <div class="media-text">
            <div class="media-title">{{ row.title }}</div>
          </div>
      </template>
    </el-table-column>

    <el-table-column label="up" min-width="50">
      <template #default="{ row }">
        <div class="media-up">{{ row.upper?.name }}</div>
      </template>
    </el-table-column>

    <el-table-column label="时长" width="120">
      <template #default="{ row }">
        {{ formatDuration(row.duration) }}
        <el-button 
          type="primary" 
          link
          @click="$emit('add', row)"
          class="add-button"
        >
          <i class="ri-add-circle-line"></i>
          <!-- <i v-if="row.added" class="ri-add-circle-line"></i>
          <i v-else class="ri-check-fill"></i> -->
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { processResourceUrl } from '../../utils/processResoureUrl';
import type { MediaItem } from '../../types';

defineProps<{
  data: MediaItem[];
  loading?: boolean;
  maxHeight?: number;
}>();

const emit = defineEmits<{
  (e: 'play', item: MediaItem): void
  (e: 'add', item: MediaItem): void
  (e: 'play-all'): void
}>();

// 格式化时长
function formatDuration(seconds: number) {
  if (!seconds) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 处理双击行事件
function handleRowDblClick(row: MediaItem) {
  emit('play', row);
}
</script>

<style lang="scss" scoped>
@use '../../assets/styles/_mixins.scss';
.media-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  
  .media-cover-container {
    position: relative;
    width: 40px;
    height: 40px;
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
    }    
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
  } 
  .media-subtitle {
    font-size: 12px;
    color: #666;
  }
}

.media-up {
  font-size: 13px;
  color: #666;
  @include mixins.text-ellipsis();
}

.add-button {
  padding: 10px 10px 10px 20px; 
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
</style>
