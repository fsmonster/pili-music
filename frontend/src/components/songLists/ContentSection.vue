<template>
  <div class="content-section">
    <div class="section-header">
      <div class="title">
        <!-- 图标插槽 -->
        <slot name="icon">
          <i class="ri-folder-music-line"></i>
        </slot>
        <h3>{{ title }}</h3>
        <slot name="title-suffix"></slot>
      </div>
      <div class="actions">
        <!-- 操作按钮插槽 -->
        <slot name="actions">
          <template v-if="showManage">
            <el-button @click="$emit('manage')">
              <i class="ri-settings-3-line"></i>
              管理
            </el-button>
          </template>
        </slot>
        <!-- 自定义操作按钮插槽 -->
        <slot name="customActions"></slot>
      </div>
    </div>
    <div class="section-content">
      <!-- 内容插槽 -->
      <slot name="content"></slot>
      <div v-if="isEmpty" class="empty-hint">
        <!-- 空状态提示插槽 -->
        <slot name="empty">
          暂无内容 (｡•́︿•̀｡)
        </slot>
      </div>
    </div>
    <div class="section-footer">
      <!-- 底部插槽 -->
      <slot name="footer"></slot>
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

defineSlots<{
  icon?: (props: { }) => any;
  content?: (props: { }) => any;
  actions?: (props: { }) => any;
  empty?: (props: { }) => any;
  customActions?: (props: { }) => any;
  'title-suffix'?: (props: { }) => any;
  footer?: (props: { }) => any;
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

  .section-footer {
    margin-top: 16px;
  }

  .empty-hint {
    text-align: center;
    color: var(--el-text-color-secondary);
    padding: 32px 0;
  }
}
</style>
