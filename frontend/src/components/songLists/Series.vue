
<template>
  <ContentSection 
    title="系列" 
    :show-manage="true" 
    :show-refresh="true" 
    :isEmpty="!seriesStore.series.length && !seriesStore.loading"
    @manage="showManageDialog = true"
    @refresh="seriesStore.refreshSeries()"
  >
    <!-- 图标插槽 -->
    <template #icon>
      <i class="ri-list-check-2"></i>
    </template>

    <!-- 标题后缀 -->
    <template #title-suffix>
      <span class="count-badge" v-if="seriesStore.series.length">
        {{ seriesStore.series.length }}
      </span>
    </template>

    <!-- 系列列表 -->
    <template #content>
      <div class="music-grid">
        <div 
          v-for="item in seriesStore.series" 
          :key="item.series_id" 
          class="music-item" 
          @click="goToSeries(item.series_id)"
        >
          <div class="cover">
            <el-skeleton v-if="seriesStore.loading || !item.cover" :rows="1" animated />
            <div v-else-if="!item.cover">
              <i class="ri-list-check-2"></i>
            </div>
            <img v-else :src="processResourceUrl(item.cover)" :alt="item.name">
            <div class="play-button" @click.stop="playSeries(item.series_id)">
              <i class="ri-play-fill"></i>
            </div>
          </div>
          <div class="info">
            <div class="title">{{ item.name }}</div>
            <div class="count">{{ item.total || 0 }}个视频</div>
          </div>
        </div>
      </div>
    </template>
  </ContentSection>

  <!-- 管理系列对话框 -->
  <el-dialog
    v-model="showManageDialog"
    title="管理系列"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-tabs v-model="activeTab">
      <!-- 添加系列 -->
      <el-tab-pane label="添加系列" name="add">
        <el-form @submit.prevent="addSeries">
          <el-form-item label="系列ID或链接">
            <el-input
              v-model="seriesUrl"
              placeholder="输入系列ID或完整链接"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addSeries">添加</el-button>
          </el-form-item>
        </el-form>
        <div class="help-text">
          <p>如何获取系列ID？</p>
          <ol>
            <li>打开B站系列页面</li>
            <li>复制地址栏中的链接，例如：https://space.bilibili.com/123456789/lists/123456?type=series</li>
            <li>粘贴到上方输入框</li>
          </ol>
        </div>
      </el-tab-pane>

      <!-- 移除系列 -->
      <el-tab-pane label="移除系列" name="remove">
        <el-empty v-if="!seriesStore.series.length" description="暂无系列" />
        <el-table v-else :data="seriesStore.series" style="width: 100%">
          <el-table-column prop="name" label="系列名称" />
          <el-table-column prop="total" label="视频数" width="80" />
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                @click="confirmRemoveSeries(row.series_id)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>

  <!-- 确认移除对话框 -->
  <el-dialog
    v-model="showConfirmDialog"
    title="确认移除"
    width="400px"
  >
    <p>确定要移除该系列吗？</p>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showConfirmDialog = false">取消</el-button>
        <el-button type="danger" @click="removeSeries">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ContentSection from './ContentSection.vue';
import { useUserStore, useQueueStore, usePlayerStore } from '../../stores';
import { useSeriesStore } from '../../stores/list/series';
import { processResourceUrl } from '../../utils';
import { extractMidAndSeriesId, convertArchiveToMediaItem } from '../../utils/common';

// 路由
const router = useRouter();

// Store
const seriesStore = useSeriesStore();
const queueStore = useQueueStore();
const playerStore = usePlayerStore();
const userStore = useUserStore();

// 状态
const loading = ref(false);
const seriesUrl = ref('');

// 对话框状态
const showManageDialog = ref(false);
const showConfirmDialog = ref(false);
const activeTab = ref('add');
const seriesToRemove = ref<number | null>(null);

// 跳转到系列详情
const goToSeries = (id: number) => {
  router.push(`/series/${id}`);
};

// 获取系列的mid
const seriesMid = (seriesId: number) => {
  return seriesStore.series.find(s => s.series_id === seriesId)?.mid;
}

// 播放系列内容
const playSeries = async (id: number) => {
  try {
    if (!seriesMid(id)) {
      ElMessage.error('获取系列信息失败');
      return;
    }

    // 完整加载系列内容
    await seriesStore.fetchSeriesArchives(seriesMid(id)!, id);
    
    // 转换为媒体项目
    const medias = seriesStore.seriesArchives.map(convertArchiveToMediaItem);
    
    if (medias.length > 0) {
      queueStore.setQueue(medias);
      playerStore.play(medias[0]);
    } else {
      ElMessage.warning('该系列没有可播放的内容');
    }
  } catch (error) {
    console.error('播放系列失败:', error);
    ElMessage.error('播放系列失败');
  }
};

// 添加系列
const addSeries = async () => {
  if (!seriesUrl.value) {
    ElMessage.warning('请输入系列ID或链接');
    return;
  }
  
  try {
    loading.value = true;
    
    // 提取系列ID和用户mid
    const seriesInfo = extractMidAndSeriesId(seriesUrl.value);
    
    if (!seriesInfo) {
      // 尝试直接将输入内容作为ID
      const directId = parseInt(seriesUrl.value);
      if (isNaN(directId)) {
        ElMessage.error('无效的系列ID或链接');
        return;
      }
      
      // 添加系列
      await seriesStore.addSeries(directId);
    } else {
      // 添加系列
      await seriesStore.addSeries(parseInt(seriesInfo.series_id));
    }
    
    // 清空输入框
    seriesUrl.value = '';
    
    ElMessage.success('添加系列成功');
  } catch (error) {
    console.error('添加系列失败:', error);
    ElMessage.error('添加系列失败');
  } finally {
    loading.value = false;
  }
};

// 确认移除系列
const confirmRemoveSeries = (id: number) => {
  seriesToRemove.value = id;
  showConfirmDialog.value = true;
};

// 移除系列
const removeSeries = async () => {
  if (!seriesToRemove.value) return;

  try {
    if (!seriesToRemove.value) {
      ElMessage.error('获取系列信息失败');
      return;
    }
    
    // 从系列移除
    await seriesStore.removeSeries(seriesToRemove.value);
    
    ElMessage.success('移除系列成功');
    showConfirmDialog.value = false;
  } catch (error) {
    console.error('移除系列失败:', error);
    ElMessage.error('移除系列失败');
  }
};

// 监听登录状态变化
watch(() => userStore.isLoggedIn, seriesStore.fetchSeriesIfNeeded);

// 组件挂载时加载数据
onMounted(() => {
  seriesStore.fetchSeriesIfNeeded();
});
</script>

<style lang="scss" scoped>
@import './styles/music-grid.scss';

.empty-tip {
  text-align: center;
  padding: 20px;
  color: var(--el-text-color-secondary);
}

.help-text {
  margin-top: 16px;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 13px;
  
  p {
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  ol {
    padding-left: 20px;
  }
}
</style>