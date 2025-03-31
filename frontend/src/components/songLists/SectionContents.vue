<template>
  <ContentSection 
    :title="section?.name || ''" 
    :show-manage="true" 
    :show-refresh="true" 
    :isEmpty="!collocations.length && !loading"
    @manage="showManageDialog = true"
  >
    <!-- 图标插槽 -->
    <template #icon>
      <i class="ri-folder-line"></i>
    </template>

    <!-- 标题后缀 -->
    <template #title-suffix>
      <span class="count-badge" v-if="collocations.length">
        {{ collocations.length }}
      </span>
    </template>

    <!-- 收藏夹列表 -->
    <template #content>
      <div class="music-grid">
        <div 
          v-for="collocation in collocations" 
          :key="`${collocation.type}-${getCollocationId(collocation)}`" 
          class="music-item" 
          @click="goToCollocation(collocation.type, getCollocationId(collocation))"
        >
          <div class="cover">
            <el-skeleton v-if="loading" :rows="1" animated />
            <div v-else-if="!getCollocationCover(collocation)">
              <i class="ri-star-line"></i>
            </div>
            <img v-else 
              :src="processResourceUrl(getCollocationCover(collocation)) + '@250h'" 
              :alt="getCollocationName(collocation)">
            <div class="play-button" @click.stop="playCollocation(collocation.type, getCollocationId(collocation))">
              <i class="ri-play-fill"></i>
            </div>
          </div>
          <div class="info">
            <div class="title">
              {{ getCollocationName(collocation) }}
            </div>
            <div class="count">
              <i v-if="collocation.type === 'favorite'" class="ri-star-line"></i>
              <i v-else-if="collocation.type === 'season'" class="ri-stack-line"></i>
              <i v-else-if="collocation.type === 'series'" class="ri-list-check-2"></i>
              {{ getCollocationCount(collocation) }}个视频
            </div>
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
      <!-- 添加资源 -->
      <el-tab-pane label="添加资源" name="add">
        <el-form @submit.prevent="addCollocation">
          <el-form-item label="资源ID或链接">
            <el-input
              v-model="collocationUrl"
              placeholder="输入资源ID或完整链接"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addCollocation">添加</el-button>
          </el-form-item>
        </el-form>
        <div class="help-text">
          <p>如何获取收藏夹ID？(合集、系列同理)</p>
          <ol>
            <li>打开B站收藏夹页面</li>
            <li>复制地址栏中的链接，例如：https://space.bilibili.com/123456789/favlist?fid=123456789</li>
            <li>粘贴到上方输入框</li>
          </ol>
        </div>
      </el-tab-pane>
      
      <!-- 管理已有收藏夹 -->
      <el-tab-pane label="管理资源" name="manage">
        <el-table :data="collocations" style="width: 100%">
          <el-table-column prop="title" label="资源名称">
            <template #default="{ row }">
              <span>{{ getCollocationName(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                @click="confirmRemoveCollocation(row.type, getCollocationId(row))"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!collocations.length" class="empty-tip">
          <p>暂无资源，请先添加</p>
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
    <p>确定要从此分区移除该资源吗？</p>
    <p>这不会删除资源本身，只会从当前分区中移除。</p>
    <template #footer>
      <el-button @click="showConfirmDialog = false">取消</el-button>
      <el-button type="danger" @click="removeCollocation">确认移除</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ContentSection from '../songLists/ContentSection.vue';
import type { Section, CollocationType,CollocationItem } from '../../types';
import { useSectionStore, 
  useFavoriteContentStore, 
  useSeasonContentStore,
  useSeriesContentStore,
  useQueueStore, 
  usePlayerStore,
  useLazyLoadStore 
} from '../../stores';
import { processResourceUrl, 
  extractIdAndType, 
  getCollocationId, 
  getCollocationCover, 
  getCollocationName, 
  getCollocationCount 
} from '../../utils';

// 接收分区ID参数
const props = defineProps<{
  sectionId?: string;
}>();

// 路由
const router = useRouter();

// Store
const sectionStore = useSectionStore();
const favoriteStore = useFavoriteContentStore();
const seasonStore = useSeasonContentStore();
const seriesStore = useSeriesContentStore();

const queueStore = useQueueStore();
const playerStore = usePlayerStore();
const lazyLoad = useLazyLoadStore();

// 状态
const section = ref<Section | null>(null);
const loading = ref(false);
const collocationUrl = ref('');

// 对话框状态
const showManageDialog = ref(false);
const showConfirmDialog = ref(false);
const activeTab = ref('add');

// 要移除的收藏夹类型和ID
const typeToRemove = ref<CollocationType | null>(null);
const idToRemove = ref<number | null>(null);

// 计算属性：资源列表
const collocations = computed<CollocationItem[]>(() => {
  return section.value?.collocationList || [];
});

// 跳转到资源详情
const goToCollocation = async (type: CollocationType, id: number) => {
  switch (type) {
    case 'favorite':
      router.push(`/favorite/${id}`);
      // 获取收藏夹内容...
      break;
    case 'season':
      router.push(`/season/${id}`);
      await seasonStore.fetchAllSeasonContent(id);
      break;
    case 'series':
      router.push(`/series/${id}`);
      await seriesStore.fetchSeriesArchives(id);
      break;
    default:
      console.warn('未知的资源类型:', type);
  }
};

// 播放资源内容
const playCollocation = async (type: CollocationType, id: number) => {
  try {
    if(type === lazyLoad.type && id === lazyLoad.id) {
      queueStore.setCurrentIndex(0);
      playerStore.replay();
      return;
    }
    else lazyLoad.reset();
    if (type === 'favorite') {
      // 完整加载收藏夹内容
      await favoriteStore.fetchFavoriteContent(id);
      if (favoriteStore.medias.length > 0) {
        queueStore.setQueue(favoriteStore.medias);
        queueStore.total = favoriteStore.totalCount;
        queueStore.setCurrentIndex(0);
        playerStore.replay();
        lazyLoad.set({ type, id });
      }
    } else if (type === 'season') {
      // 完整加载合集内容
      await seasonStore.fetchAllSeasonContent(id);
      if (seasonStore.medias.length > 0) {
        queueStore.setQueue(seasonStore.medias);
        queueStore.total = seasonStore.medias.length;
        queueStore.setCurrentIndex(0);
        playerStore.replay();
      }
    } else if (type === 'series') {
      // 完整加载系列内容
      // 暂时这么处理吧
      await seriesStore.fetchSeriesArchives(id);
      if (seriesStore.seriesArchives.length > 0) {
        queueStore.setQueue(seriesStore.medias);
        queueStore.total = seriesStore.medias.length;
        queueStore.setCurrentIndex(0);
        playerStore.replay();
      }
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
    
    // 获取分区详情
    const sectionData = sectionStore.currentSection(props.sectionId);
    if (sectionData) {
      section.value = sectionData;
      
      // 如果没有信息或资源列表为空，则加载资源列表
      if (!sectionData.collocationList || sectionData.collocationList.length === 0) {
        // 加载分区的资源列表
        await sectionStore.fetchSectionContent(props.sectionId);
      }
    }
  } catch (error) {
    console.error('加载分区数据失败:', error);
    ElMessage.error('加载分区数据失败');
  } finally {
    loading.value = false;
  }
};

// 添加资源到分区
const addCollocation = async () => {
  if (!props.sectionId || !collocationUrl.value) {
    ElMessage.warning('请输入资源ID或链接');
    return;
  }
  try {
    loading.value = true;
    
    // 提取资源ID
    const { id, type } = extractIdAndType(collocationUrl.value);
    
    if (!id && !type) {
      ElMessage.error('无效的资源ID或链接');
      return;
    }
    // 检查资源是否已存在
    if (section.value?.collocationList?.some(c => getCollocationId(c) === id && c.type === type)) {
      ElMessage.warning('资源已存在');
      return;
    }
    // 添加资源到分区
    await sectionStore.addCollocationToSection(props.sectionId, type, id);
    
    // 清空输入框
    collocationUrl.value = '';
    
    ElMessage.success('添加资源成功');
  } catch (error) {
    console.error('添加资源失败:', error);
    ElMessage.error('添加资源失败');
  } finally {
    loading.value = false;
  }
};

// 确认移除收藏夹
const confirmRemoveCollocation = (type: CollocationType, id: number) => {
  typeToRemove.value = type;
  idToRemove.value = id;
  showConfirmDialog.value = true;
};

// 移除收藏夹
const removeCollocation = async () => {
  if (!props.sectionId || !idToRemove.value || !typeToRemove.value) return;
  
  try {
    // 从分区移除收藏夹
    await sectionStore.removeCollocationFromSection(props.sectionId, typeToRemove.value, idToRemove.value);
    
    ElMessage.success('移除资源成功');
    showConfirmDialog.value = false;
  } catch (error) {
    console.error('移除资源失败:', error);
    ElMessage.error('移除资源失败');
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
@use './styles/music-grid.scss';

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