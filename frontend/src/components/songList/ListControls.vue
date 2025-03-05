# 控制栏组件
<template>
  <div class="controls-sticky">
    <div class="controls">
      <div class="left">
        <button 
          class="play-all" 
          @click="$emit('play-all')"
          :disabled="disabled"
        >
          <i class="ri-play-fill"></i>
          播放全部
        </button>
      </div>
      <div class="right">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  search?: string
  sort?: string
  disabled?: boolean
}>();

defineEmits<{
  (e: 'play-all'): void
}>();
</script>

<style lang="scss" scoped>
.controls-sticky {
  position: sticky;
  top: -20px;
  background: var(--el-bg-color);
  padding: 20px 0;
  margin: 0;
  z-index: 2;
  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .left {
    .play-all {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background-color: var(--el-color-primary);
      color: white;
      cursor: pointer;
    }

    .play-all:disabled {
      background-color: var(--el-color-primary-light-5);
      cursor: not-allowed;
    }
  }
  .right {
    display: flex;
    gap: 10px;
  }
}
</style>
