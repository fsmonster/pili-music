<!-- 删除历史记录弹窗 -->
<template>
  <el-dialog
    v-model="visible"
    title="清空历史记录"
    width="400px"
    :close-on-click-modal="false"
    @closed="handleClose"
  >
    <div class="delete-history-modal-container">
      <!-- 确认内容 -->
      <div class="confirm-content">
        <div class="confirm-text">
          <p class="title">确定要清空历史记录吗？</p>
          <!-- 也没有必要很谨慎， 但是AI觉得要谨慎一点 -->
          <p class="desc">清空后将无法恢复哦~</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="danger" @click="handleConfirm" :loading="submitting">确定清空</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRecentlyStore } from '@/stores';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

// 状态
const recentlyStore = useRecentlyStore();
const visible = ref(props.modelValue);
const submitting = ref(false);

// 监听 visible 变化
watch(() => props.modelValue, val => {
  visible.value = val;
});

// 监听 visible 变化，同步到父组件
watch(() => visible.value, val => {
  emit('update:modelValue', val);
});

// 处理确认删除
async function handleConfirm() {
  submitting.value = true;
  
  try {
    // 清空历史记录
    recentlyStore.clearRecentCollections();
    
    // 关闭弹窗
    visible.value = false;
    
    // 提示成功
    ElMessage.success('历史记录已清空');
  } catch (error) {
    console.error('清空历史记录失败:', error);
    ElMessage.error('清空历史记录失败');
  } finally {
    submitting.value = false;
  }
}

// 处理关闭
function handleClose() {
  // 重置状态
  submitting.value = false;
}
</script>

<style lang="scss" scoped>
.delete-history-modal-container {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  
  .confirm-content {
    display: flex;
    align-items: center;
    padding: 20px 0;
    
    .confirm-text {
      .title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
      }
      
      .desc {
        font-size: 14px;
        color: var(--el-text-color-secondary);
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