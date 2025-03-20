# 支持多P视频展示的媒体表格组件
<template>
  <el-table
    :data="data"
    :max-height="maxHeight"
    :border="false"
    :highlight-current-row="true"
    :empty-text="loading ? '加载中...' : '暂无数据'"
    :type="type"
    style="width: 100%"
    v-loading="loading"
    @row-dblclick="handleRowDblClick"
    row-key="id"
    :expand-row-keys="expandedRows"
  >
    <!-- 索引列 -->
    <el-table-column type="index" width="50">
      <template #default="scope">
        <div v-if="isCurrentPlaying(scope.row)" class="playing-indicator">
          <img src="../../assets/image/play.gif?random=123" alt="play">
        </div>
        <span v-else>{{ scope.$index + 1 }}</span>
      </template>
    </el-table-column>

    <!-- 封面列 -->
    <el-table-column label="歌曲" min-width="70" width="70">
      <template #default="{ row }">
        <div class="media-info">
          <div class="media-cover-container">
            <img 
              :src="processResourceUrl(row.cover)" 
              :alt="row.title" 
              class="media-cover"
              loading="lazy"
              :data-src="processResourceUrl(row.cover)"
            >
            <div class="media-cover-overlay">
              <i v-if="!isCurrentPlaying(row)" class="ri-play-fill play-icon" @click.stop="$emit('play', row)"></i>
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
      v-if="type === 'season'"
      label="上传时间" 
      min-width="120"
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
        <div v-if="isMultiPage(row)" class="multi-page-content">
          <!-- 多P内容表格 -->
          <el-table
            :data="paginatedPageList"
            style="width: 100%"
            :border="false"
            :show-header="false"
            class="sub-table"
          >
            <!-- 索引列 -->
            <el-table-column width="60">
              <template #default="{ row: pageItem }">
                <div v-if="isCurrentPlayingPage(pageItem)" class="playing-indicator">
                  <!-- <div class="living-sprite"></div> -->
                </div>
                <div v-else class="page-index">P{{ pageItem.page }}</div>
              </template>
            </el-table-column>

            <!-- 空白列 - 替代封面 -->
            <el-table-column width="70">
              <template #default="{ row: pageItem }">
                <div class="play-button-container">
                  <el-button 
                    type="primary" 
                    circle 
                    size="small"
                    @click="playPage(row, pageItem)"
                  >
                    <i class="ri-play-fill"></i>
                    <i v-if="isCurrentPlayingPage(pageItem)" class="ri-music-line playing-icon"></i>
                  </el-button>
                </div>
              </template>
            </el-table-column>

            <!-- 分P标题列 -->
            <el-table-column min-width="250">
              <template #default="{ row: pageItem }">
                <div class="page-title">{{ pageItem.part }}</div>
              </template>
            </el-table-column>

            <!-- 空白列 - 替代up主 -->
            <el-table-column min-width="50">
              <template #default>
                <div></div>
              </template>
            </el-table-column>

            <!-- 时长列 -->
            <el-table-column width="120">
              <template #default="{ row: pageItem }">
                {{ formatDuration(pageItem.duration) }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页器 -->
          <div v-if="pageList.length > pageSize" class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              layout="prev, pager, next"
              :total="pageList.length"
              @current-change="handlePageChange"
              background
              small
            />
          </div>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { processResourceUrl } from '../../utils/processResoureUrl';
import { getCid } from '../../api';
import { usePlayerStore, useMultiPageQueueStore } from '../../stores';
import type { MediaItem, CidInfo } from '../../types';

const props = defineProps<{
  data: MediaItem[];
  type:'favorite' | 'season'
  loading?: boolean;
  maxHeight?: number;
  options?: {
    // 可扩展的选项
  }
}>();

const emit = defineEmits<{
  (e: 'play', item: MediaItem): void
  (e: 'add', item: MediaItem): void
  (e: 'play-all'): void
}>();

// 获取播放器和多P队列存储
const playerStore = usePlayerStore();
const multiPageQueueStore = useMultiPageQueueStore();

// 展开行的ID数组
const expandedRows = ref<string[]>([]);

// 当前选中的多P视频
const currentMultiPageItem = ref<MediaItem | null>(null);

// 分P列表
const pageList = ref<CidInfo[]>([]);

// 分页相关
const pageSize = 20; // 每页显示20条
const currentPage = ref(1);

// 计算当前页的分P列表
const paginatedPageList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return pageList.value.slice(start, end);
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
  return playerStore.currentItem?.id === item.id;
}

// 检查是否是当前播放的分P
function isCurrentPlayingPage(pageItem: CidInfo): boolean {
  if (!isCurrentPlaying(currentMultiPageItem.value as MediaItem)) return false;
  return multiPageQueueStore.selectedPage === pageItem.page;
}

// 切换展开/折叠状态
async function toggleExpand(item: MediaItem) {
  const itemId = item.id.toString();
  const index = expandedRows.value.indexOf(itemId);
  
  if (index === -1) {
    // 展开
    expandedRows.value.push(itemId);
    currentMultiPageItem.value = item;
    currentPage.value = 1; // 重置分页
    
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

// 播放指定分P
async function playPage(item: MediaItem, pageItem: CidInfo) {
  // 设置多P播放队列
  multiPageQueueStore.setPageList(item.id, pageList.value);
  
  // 设置当前选中的分P
  multiPageQueueStore.setSelectedPage(pageItem.page);
  
  // 播放
  playerStore.play(item);
}

// 处理分页变化
function handlePageChange(page: number) {
  currentPage.value = page;
}

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

// 监听数据变化，重置展开状态
watch(() => props.data, () => {
  expandedRows.value = [];
  currentMultiPageItem.value = null;
  pageList.value = [];
  currentPage.value = 1;
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
}

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
    &.playing:hover {
      text-decoration: underline;
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

/* 多P内容样式 */
.multi-page-content {
  padding: 0 20px 20px 50px; // 左侧缩进
  
  .sub-table {
    background-color: var(--el-bg-color-page); // 略微暗一点的背景色
    border-radius: 4px;
    margin-bottom: 10px;
    
    .page-index {
      text-align: center;
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
    
    .play-button-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .page-title {
      font-size: 13px;
      @include mixins.text-ellipsis();
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
}

:deep(.el-table__expand-icon) {
  display: none; // 隐藏默认的展开图标
}
</style>
