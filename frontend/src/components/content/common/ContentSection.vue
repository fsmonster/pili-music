<template>
  <div class="content-section">
    <div class="section-header">
      <div class="title">
        <slot name="icon">
          <i class="ri-folder-music-line"></i>
        </slot>
        <h3>{{ title }}</h3>
      </div>
      <div class="actions">
        <slot name="actions">
          <template v-if="showManage">
            <el-button type="text" @click="$emit('manage')">
              <i class="ri-settings-3-line"></i>
              管理
            </el-button>
          </template>
        </slot>
        <slot name="customActions"></slot>
      </div>
    </div>
    <div class="section-content">
      <slot></slot>
      <div v-if="isEmpty" class="empty-hint">
        <slot name="empty">
          暂无内容 (｡•́︿•̀｡)
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  showManage?: boolean;
  isEmpty?: boolean;
}>();

defineEmits<{
  (e: 'manage'): void;
}>();
</script>

<style lang="scss" scoped>
.content-section {
  margin-bottom: 32px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .title {
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        font-size: 20px;
      }

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .section-content {
    position: relative;
  }

  .empty-hint {
    text-align: center;
    color: var(--el-text-color-secondary);
    padding: 32px 0;
  }
}
</style>
