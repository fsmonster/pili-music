<!-- 收藏夹弹窗组件 -->
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    @closed="handleClose"
  >
    <div class="favorite-modal-container">
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading"><i class="ri-loader-4-line"></i></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 未登录状态 -->
      <div v-else-if="!userStore.isLoggedIn" class="login-required">
        <i class="ri-lock-line"></i>
        <span>请先登录后再进行收藏操作</span>
        <el-button type="primary" @click="handleLogin">立即登录</el-button>
      </div>

      <!-- 收藏夹列表 -->
      <template v-else>
        <div v-if="favoriteStore.allFavorites.length === 0" class="empty-state">
          <i class="ri-folder-add-line"></i>
          <span>您还没有创建收藏夹</span>
          <el-button type="primary" @click="createNewFavorite">创建收藏夹</el-button>
        </div>

        <div v-else class="favorite-list">
          <el-checkbox-group v-model="selectedFavorites">
            <div 
              v-for="favorite in favoriteStore.allFavorites" 
              :key="favorite.id"
              class="favorite-item"
            >
              <el-checkbox :label="favorite.id">
                <div class="favorite-info">
                  <span class="favorite-title">{{ favorite.title }}</span>
                  <span class="favorite-count">{{ favorite.media_count }}个内容</span>
                  <span 
                    v-if="favorite.attr === 23 || favorite.attr === 119" 
                    class="favorite-private"
                  >
                    <i class="ri-lock-line"></i>
                  </span>
                </div>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>

        <div class="action-buttons">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :loading="submitting">确定</el-button>
        </div>
      </template>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useFavoriteStore, useUserStore } from '../../stores';
import { useFavoriteAction } from '../../composables/useFavoriteAction';
import { useOverlayStore } from '../../stores/overlay';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: boolean;
  mediaId: number;
  mediaType?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}>();

// 状态
const userStore = useUserStore();
const favoriteStore = useFavoriteStore();
const overlayStore = useOverlayStore();
const { checkFavorites, updateFavorites } = useFavoriteAction();

const visible = ref(props.modelValue);
const loading = ref(false);
const submitting = ref(false);
const selectedFavorites = ref<number[]>([]);
const initialFavorites = ref<number[]>([]);

// 计算属性
const title = computed(() => '添加到收藏夹');

// 监听 visible 变化
watch(() => props.modelValue, val => {
  visible.value = val;
  if (val) {
    loadFavoriteStatus();
  }
});

// 监听 visible 变化，同步到父组件
watch(() => visible.value, val => {
  emit('update:modelValue', val);
});

// 加载收藏状态
async function loadFavoriteStatus() {
  if (!userStore.isLoggedIn) return;
  
  loading.value = true;
  
  try {
    // 获取收藏夹列表
    // await favoriteStore.fetchFavoritesIfNeeded();
    
    // 获取当前媒体的收藏状态
    const result = await checkFavorites(props.mediaId);
    if (result && result.length > 0) {
      // 找出已收藏的收藏夹ID
      const favoritedIds = result
        .filter(item => item.fav_state === 1)
        .map(item => item.id);
      
      selectedFavorites.value = favoritedIds;
      initialFavorites.value = [...favoritedIds];
    }
  } catch (error) {
    console.error('加载收藏状态失败:', error);
    ElMessage.error('加载收藏状态失败');
  } finally {
    loading.value = false;
  }
}

// 处理确认
async function handleConfirm() {
  if (!userStore.isLoggedIn) return;
  
  submitting.value = true;
  
  try {
    // 计算需要添加和删除的收藏夹ID
    const toAdd = selectedFavorites.value.filter(id => !initialFavorites.value.includes(id));
    const toRemove = initialFavorites.value.filter(id => !selectedFavorites.value.includes(id));
    
    // 构建参数
    const params = {
      rid: props.mediaId,
      type: props.mediaType || 2, // 默认为视频稿件
    };
    
    // 添加收藏夹
    if (toAdd.length > 0) {
      await updateFavorites({
        ...params,
        add_media_ids: toAdd
      });
    }
    
    // 删除收藏夹
    if (toRemove.length > 0) {
      await updateFavorites({
        ...params,
        del_media_ids: toRemove
      });
    }
    
    // 关闭弹窗
    visible.value = false;
    
    // 提示成功
    if (toAdd.length > 0 && toRemove.length === 0) {
      ElMessage.success('添加到收藏夹成功');
    } else if (toAdd.length === 0 && toRemove.length > 0) {
      ElMessage.success('从收藏夹移除成功');
    } else {
      ElMessage.success('收藏夹更新成功');
    }
    
    // 触发成功事件
    emit('success');
  } catch (error) {
    console.error('更新收藏夹失败:', error);
    ElMessage.error('更新收藏夹失败');
  } finally {
    submitting.value = false;
  }
}

// 处理关闭
function handleClose() {
  selectedFavorites.value = [];
  initialFavorites.value = [];
}

// 处理登录
function handleLogin() {
  visible.value = false;
  overlayStore.showLoginModal();
}

// 创建新收藏夹
function createNewFavorite() {
  // 这里可以添加创建新收藏夹的逻辑
  ElMessage.info('创建收藏夹功能暂未实现');
}
</script>

<style scoped lang="scss">
.favorite-modal-container {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  
  .loading-state, .login-required, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 0;
    gap: 16px;
    
    i {
      font-size: 36px;
      color: var(--el-text-color-secondary);
    }
    
    span {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
  
  .favorite-list {
    max-height: 300px;
    overflow-y: auto;
    
    .favorite-item {
      padding: 10px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      &:last-child {
        border-bottom: none;
      }
      
      .favorite-info {
        display: flex;
        align-items: center;
        margin-left: 8px;
        
        .favorite-title {
          font-size: 14px;
          font-weight: 500;
          margin-right: 8px;
        }
        
        .favorite-count {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
        
        .favorite-private {
          margin-left: 8px;
          color: var(--el-color-warning);
          font-size: 14px;
        }
      }
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    gap: 10px;
  }
}

:deep(.el-dialog__header) {
  margin-right: 0;
  text-align: center;
}
</style>
