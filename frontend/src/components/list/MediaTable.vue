# 媒体表格组件
<template>
  <el-table
    :data="data"
    :loading="loading"
    style="width: 100%"
  >
    <el-table-column type="index" width="50" />
    
    <el-table-column label="标题" min-width="300">
      <template #default="{ row }">
        <div class="media-info">
          <img 
            :src="processResourceUrl(row.cover)" 
            :alt="row.title"
            class="media-cover"
          >
          <div class="media-text">
            <div class="media-title">{{ row.title }}</div>
            <div class="media-subtitle">{{ row.upper?.name }}</div>
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="时长" width="100">
      <template #default="{ row }">
        {{ formatDuration(row.duration) }}
      </template>
    </el-table-column>

    <el-table-column label="操作" width="100">
      <template #default="{ row }">
        <el-button 
          type="primary" 
          link
          @click="$emit('play', row)"
        >
          播放
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { processResourceUrl } from '../../utils/processResoureUrl';
import type { MediaItem } from '../../types/types';

// 格式化时长
function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

defineProps<{
  data: MediaItem[]
  loading?: boolean
}>();

defineEmits<{
  (e: 'play', item: MediaItem): void
}>();
</script>

<style scoped>
.media-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.media-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.media-text {
  display: flex;
  flex-direction: column;
}

.media-title {
  font-size: 14px;
  margin-bottom: 4px;
}

.media-subtitle {
  font-size: 12px;
  color: #666;
}
</style>
