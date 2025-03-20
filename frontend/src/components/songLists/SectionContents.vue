<template>
  <ContentSection 
    :title="section?.name || ''" 
    :show-manage="true" 
    :isEmpty="!favorites.length"
    @manage="showManageDialog = true"
  >
    <!-- 图标插槽 -->
    <template #icon>
      <i class="ri-folder-line"></i>
    </template>

    <!-- 标题后缀 -->
    <template #title-suffix>
      <span class="count-badge" v-if="favorites.length">
        {{ favorites.length }}
      </span>
    </template>

    <!-- 收藏夹列表 -->
    <template #content>
      <div class="music-grid">
        <div 
          v-for="favorite in favorites" 
          :key="favorite.id" 
          class="music-item" 
          @click="goToFavorite(favorite.id)"
        >
          <div class="cover">
            <el-skeleton v-if="loading" :rows="1" animated />
            <div v-else-if="!favorite.cover">
              <i class="ri-star-line"></i>
            </div>
            <img v-else :src="processResourceUrl(favorite.cover)" :alt="favorite.title">
            <div class="play-button" @click.stop="playFavorite(favorite.id)">
              <i class="ri-play-fill"></i>
            </div>
          </div>
          <div class="info">
            <div class="title">{{ favorite.title }}</div>
            <div class="count">{{ favorite.media_count || 0 }}个视频</div>
          </div>
        </div>
      </div>
    </template>
  </ContentSection>

  <!-- 管理收藏夹对话框 -->
  <el-dialog
    v-model="showManageDialog"
    title="管理收藏夹"
    width="500px"
    destroy-on-close
  >
    <el-tabs v-model="activeTab">
      <!-- 添加收藏夹 -->
      <el-tab-pane label="添加收藏夹" name="add">
        <el-form @submit.prevent="addFavorite">
          <el-form-item label="收藏夹ID或链接">
            <el-input
              v-model="favoriteUrl"
              placeholder="输入收藏夹ID或完整链接"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addFavorite">添加</el-button>
          </el-form-item>
        </el-form>
        <div class="help-text">
          <p>如何获取收藏夹ID？</p>
          <ol>
            <li>打开B站收藏夹页面</li>
            <li>复制地址栏中的链接，例如：https://space.bilibili.com/123456789/favlist?fid=123456789</li>
            <li>粘贴到上方输入框</li>
          </ol>
        </div>
      </el-tab-pane>
      
      <!-- 管理已有收藏夹 -->
      <el-tab-pane label="管理收藏夹" name="manage">
        <el-table :data="favorites" style="width: 100%">
          <el-table-column prop="title" label="收藏夹名称" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="confirmRemoveFavorite(scope.row.id)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!favorites.length" class="empty-tip">
          <p>暂无收藏夹，请先添加</p>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>

  <!-- 确认删除对话框 -->
  <el-dialog
    v-model="showConfirmDialog"
    title="确认移除"
    width="300px"
  >
    <p>确定要从此分区移除该收藏夹吗？</p>
    <p>这不会删除收藏夹本身，只会从当前分区中移除。</p>
    <template #footer>
      <el-button @click="showConfirmDialog = false">取消</el-button>
      <el-button type="danger" @click="removeFavorite">确认移除</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ContentSection from '../songLists/ContentSection.vue';
import { useSectionStore, useFavoriteContentStore, useQueueStore, usePlayerStore } from '../../stores';
import { processResourceUrl, extractFavoriteIdFromUrl } from '../../utils';
import type { FavoriteInfo, SectionWithFavorites } from '../../types';

// 接收分区ID参数
const props = defineProps<{
  sectionId?: string;
}>();

// 路由
const router = useRouter();

// Store
const sectionStore = useSectionStore();
const favoriteStore = useFavoriteContentStore();
const queueStore = useQueueStore();
const playerStore = usePlayerStore();

// 状态
const section = ref<SectionWithFavorites | null>(null);
const loading = ref(false);
const favoriteUrl = ref('');

// 对话框状态
const showManageDialog = ref(false);
const showConfirmDialog = ref(false);
const activeTab = ref('add');
const favoriteToRemove = ref<number | null>(null);

// 计算属性：收藏夹列表
const favorites = computed<FavoriteInfo[]>(() => {
  return section.value?.favorites || [];
});

// 跳转到收藏夹详情
const goToFavorite = (id: number) => {
  router.push(`/favorite/${id}`);
};

// 播放收藏夹内容
const playFavorite = async (id: number) => {
  try {
    // 完整加载收藏夹内容
    await favoriteStore.fetchFavoriteContent(Number(id), true);
    if (favoriteStore.medias.length > 0) {
      queueStore.setQueue(favoriteStore.medias);
      playerStore.play(favoriteStore.medias[0]);
    }
  } catch (error) {
    console.error('播放收藏夹失败:', error);
    ElMessage.error('播放收藏夹失败');
  }
};

// 加载分区数据
const loadSectionData = async () => {
  if (!props.sectionId) return;
  
  try {
    loading.value = true;
    
    // 获取分区详情（包含收藏夹信息）
    // const sectionData = await sectionStore.getSectionById(props.sectionId);
    const sectionData = sectionStore.sections.find(s => s._id === props.sectionId);
    if (sectionData) {
      section.value = sectionData;
    }
    
  } catch (error) {
    console.error('加载分区数据失败:', error);
    ElMessage.error('加载分区数据失败');
  } finally {
    loading.value = false;
  }
};

// 添加收藏夹到分区
const addFavorite = async () => {
  if (!props.sectionId || !favoriteUrl.value) {
    ElMessage.warning('请输入收藏夹ID或链接');
    return;
  }
  
  try {
    loading.value = true;
    
    // 提取收藏夹ID
    const favoriteId = extractFavoriteIdFromUrl(favoriteUrl.value);
    
    if (!favoriteId) {
      // 尝试直接将输入内容作为ID
      const directId = parseInt(favoriteUrl.value);
      if (isNaN(directId)) {
        ElMessage.error('无效的收藏夹ID或链接');
        return;
      }
      
      // 添加收藏夹到分区
      await sectionStore.addMediaToSection(props.sectionId, [directId]);
    } else {
      // 添加收藏夹到分区
      await sectionStore.addMediaToSection(props.sectionId, [favoriteId]);
    }
    
    // 重新加载分区数据
    await loadSectionData();
    
    // 清空输入框
    favoriteUrl.value = '';
    
    ElMessage.success('添加收藏夹成功');
  } catch (error) {
    console.error('添加收藏夹失败:', error);
    ElMessage.error('添加收藏夹失败');
  } finally {
    loading.value = false;
  }
};

// 确认移除收藏夹
const confirmRemoveFavorite = (id: number) => {
  favoriteToRemove.value = id;
  showConfirmDialog.value = true;
};

// 移除收藏夹
const removeFavorite = async () => {
  if (!props.sectionId || !favoriteToRemove.value) return;
  
  try {
    // 从分区移除收藏夹
    await sectionStore.removeMediaFromSection(props.sectionId, [favoriteToRemove.value]);
    
    // 重新加载分区数据
    await loadSectionData();
    
    ElMessage.success('移除收藏夹成功');
    showConfirmDialog.value = false;
  } catch (error) {
    console.error('移除收藏夹失败:', error);
    ElMessage.error('移除收藏夹失败');
  }
};

// 监听分区ID变化
watch(() => props.sectionId, (newId) => {
  if (newId) {
    loadSectionData();
  }
});

// 组件挂载时加载数据
onMounted(() => {
  if (props.sectionId) {
    loadSectionData();
  }
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