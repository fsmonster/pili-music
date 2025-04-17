<!-- 分区弹窗组件 -->
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    @closed="handleClose"
  >
    <div class="section-modal-container">
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading"><i class="ri-loader-4-line"></i></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 未登录状态 -->
      <div v-else-if="!userStore.isLoggedIn" class="login-required">
        <i class="ri-lock-line"></i>
        <span>请先登录后再进行添加操作</span>
        <el-button type="primary" @click="handleLogin">立即登录</el-button>
      </div>

      <!-- 分区列表 -->
      <template v-else>
        <div v-if="sections.length === 0" class="empty-state">
          <i class="ri-folder-add-line"></i>
          <span>您还没有创建分区</span>
          <el-button type="primary" @click="createNewSection">创建分区</el-button>
        </div>

        <div v-else class="section-list">
          <el-checkbox-group v-model="selectedSections">
            <div 
              v-for="section in sections" 
              :key="section._id"
              class="section-item"
            >
              <el-checkbox :value="section._id">
                <div class="section-info">
                  <span class="section-title">{{ section.name }}</span>
                  <span class="section-count">{{ section.collocationIds?.length || 0 }}个内容</span>
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
import { useUserStore } from '../../stores';
import { ElMessage } from 'element-plus';
import * as sectionApi from '../../api/section';
import { CollectionType } from '../../types';
import type { Section, CollocationParams } from '../../types';

const props = defineProps<{
  modelValue: boolean;
  type: CollectionType;
  mediaId: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}>();

// 状态
const userStore = useUserStore();

const visible = ref(props.modelValue);
const loading = ref(false);
const submitting = ref(false);
const sections = ref<Section[]>([]);
const selectedSections = ref<string[]>([]);
const initialSections = ref<string[]>([]);

// 计算属性
const title = computed(() => '添加到分区');

// 监听 visible 变化
watch(() => props.modelValue, val => {
  visible.value = val;
  if (val) {
    loadSections();
  }
});

// 监听 visible 变化，同步到父组件
watch(() => visible.value, val => {
  emit('update:modelValue', val);
});

// 加载分区列表和当前媒体所在分区
async function loadSections() {
  if (!userStore.isLoggedIn) return;
  
  loading.value = true;
  
  try {
    // 获取所有分区
    const allSections = await sectionApi.getUserSections();
    sections.value = allSections;
    
    // 获取当前媒体所在的分区
    const mediaSections = await sectionApi.getSectionsByTypeAndId(
      props.type,
      props.mediaId
    );
    
    // 找出已添加的分区ID
    const sectionIds = mediaSections.map(section => section._id);
    
    selectedSections.value = sectionIds;
    initialSections.value = [...sectionIds];
  } catch (error) {
    console.error('加载分区状态失败:', error);
    ElMessage.error('加载分区状态失败');
  } finally {
    loading.value = false;
  }
}

// 处理确认
async function handleConfirm() {
  if (!userStore.isLoggedIn) return;
  
  submitting.value = true;
  
  try {
    // 计算需要添加和删除的分区ID
    const toAdd = selectedSections.value.filter(id => !initialSections.value.includes(id));
    const toRemove = initialSections.value.filter(id => !selectedSections.value.includes(id));
    
    // 添加到分区
    if (toAdd.length > 0) {
      for (const sectionId of toAdd) {
        const params: CollocationParams = {
          sectionId,
          resources: [{
            type: props.type,
            id: props.mediaId
          }]
        };
        
        await sectionApi.addCollocationToSection(params);
      }
    }
    
    // 从分区移除
    if (toRemove.length > 0) {
      for (const sectionId of toRemove) {
        const params: CollocationParams = {
          sectionId,
          resources: [{
            type: props.type,
            id: props.mediaId
          }]
        };
        
        await sectionApi.removeCollocationFromSection(params);
      }
    }
    
    // 关闭弹窗
    visible.value = false;
    
    // 提示成功
    if (toAdd.length > 0 && toRemove.length === 0) {
      ElMessage.success('添加到分区成功');
    } else if (toAdd.length === 0 && toRemove.length > 0) {
      ElMessage.success('从分区移除成功');
    } else {
      ElMessage.success('分区更新成功');
    }
    
    // 触发成功事件
    emit('success');
  } catch (error) {
    console.error('更新分区失败:', error);
    ElMessage.error('更新分区失败');
  } finally {
    submitting.value = false;
  }
}

// 处理关闭
function handleClose() {
  selectedSections.value = [];
  initialSections.value = [];
}

// 处理登录
function handleLogin() {
  visible.value = false;
  // TODO: 未登录提示登录弹窗
}

// 创建新分区
function createNewSection() {
  // 这里可以添加创建新分区的逻辑
  ElMessage.info('创建分区功能暂未实现');
}
</script>

<style scoped lang="scss">
.section-modal-container {
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
  
  .section-list {
    max-height: 300px;
    overflow-y: auto;
    
    .section-item {
      padding: 10px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      &:last-child {
        border-bottom: none;
      }
      
      .section-info {
        display: flex;
        align-items: center;
        margin-left: 8px;
        
        .section-title {
          font-size: 14px;
          font-weight: 500;
          margin-right: 8px;
        }
        
        .section-count {
          font-size: 12px;
          color: var(--el-text-color-secondary);
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
