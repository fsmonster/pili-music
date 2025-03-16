<template>
  <ContentSection 
    :title="section?.name || '自定义分区'" 
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
            <div v-else-if="!favorite.cover" class="default-cover">
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

    <!-- 空状态提示 -->
    <template #empty>
      <div class="empty-tip">
        <p>点击右上角的<i class="ri-list-settings-line"></i>添加收藏夹</p>
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
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ContentSection from '../songLists/ContentSection.vue';
import { useSectionContentsStore } from '../../stores/list/sectionContents';
import { useSectionStore } from '../../stores/list/section';
import { processResourceUrl } from '../../utils/processResoureUrl';

// 接收分区ID参数
const props = defineProps<{
  sectionId?: string;
}>();

// 路由
const router = useRouter();

// Store
const sectionStore = useSectionStore();
const sectionContentsStore = useSectionContentsStore();

// 状态
const section = ref<any>(null);
const favorites = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

// 对话框状态
const showManageDialog = ref(false);
const showConfirmDialog = ref(false);
const activeTab = ref('add');
const favoriteUrl = ref('');
const favoriteToRemove = ref<number | null>(null);

// 跳转到收藏夹详情
const goToFavorite = (id: number) => {
  router.push(`/favorite/${id}`);
};

// 播放收藏夹内容
const playFavorite = (id: number) => {
  ElMessage.success(`开始播放收藏夹 ${id}`);
};

// 加载分区数据
const loadSectionData = async () => {
  if (!props.sectionId) return;
  
  try {
    loading.value = true;
    
    // 获取分区信息
    section.value = await sectionStore.getSectionById(props.sectionId);
    
    // 获取分区内容（收藏夹列表）
    await sectionContentsStore.fetchSectionContent(props.sectionId);
    
    // 从 store 获取收藏夹列表
    const sectionContent = sectionContentsStore.sectionContents[props.sectionId];
    if (sectionContent) {
      favorites.value = sectionContent.favorites;
      error.value = sectionContent.error;
    } else {
      favorites.value = [];
      error.value = '';
    }
  } catch (err) {
    console.error('加载分区数据失败:', err);
    error.value = err instanceof Error ? err.message : '加载分区数据失败';
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
    // 从URL或ID中提取收藏夹ID
    const favoriteId = sectionContentsStore.extractFavoriteIdFromUrl(favoriteUrl.value);
    
    if (!favoriteId) {
      ElMessage.error('无法识别的收藏夹ID或链接');
      return;
    }
    
    // 检查是否已存在
    if (favorites.value.some(f => f.id === favoriteId)) {
      ElMessage.warning('该收藏夹已在此分区中');
      return;
    }
    
    // 添加收藏夹到分区
    await sectionStore.addMediaToSection(props.sectionId, [favoriteId]);
    
    // 重新加载分区数据
    await loadSectionData();
    
    ElMessage.success('添加收藏夹成功');
    favoriteUrl.value = ''; // 清空输入
  } catch (error) {
    console.error('添加收藏夹失败:', error);
    ElMessage.error('添加收藏夹失败');
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

<style scoped>
@import './styles/music-grid.scss';

.count-badge {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
}

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

.default-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color);
}

.play-button {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.music-item:hover .play-button {
  opacity: 1;
}
</style>