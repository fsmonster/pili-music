<template>
  <div 
    class="volume-bar-container"
    ref="barRef"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
  >
    <div class="volume-bar">
      <div class="volume-bar-background"></div>
      <div 
        class="volume-bar-fill" 
        :style="{ width: `${value}%` }"
      ></div>
      <div 
        class="volume-bar-handle" 
        :style="{ left: `${value}%` }"
        :class="{ 'is-active': isDragging || isHovering }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue';

// 定义组件属性
const props = defineProps({
  // 当前值（0-100）
  modelValue: {
    type: Number,
    default: 0
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'change', 'input']);

// 内部状态
const value = ref(props.modelValue);
const isDragging = ref(false);
const isHovering = ref(false);
const barRef = ref<HTMLElement | null>(null);

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (!isDragging.value) {
    value.value = newVal;
  }
});

// 鼠标按下事件处理
function handleMouseDown(e: MouseEvent) {
  if (props.disabled) return;
  
  isDragging.value = true;
  updateValueFromEvent(e);
  
  // 添加全局事件监听
  document.addEventListener('mousemove', handleGlobalMouseMove);
  document.addEventListener('mouseup', handleGlobalMouseUp);
}

// 鼠标移动事件处理
function handleMouseMove(_e: MouseEvent) {
  if (props.disabled) return;
  isHovering.value = true;
}

// 鼠标松开事件处理
function handleMouseUp(e: MouseEvent) {
  if (props.disabled || !isDragging.value) return;
  
  updateValueFromEvent(e);
  isDragging.value = false;
  emit('change', value.value);
}

// 鼠标离开事件处理
function handleMouseLeave() {
  if (!isDragging.value) {
    isHovering.value = false;
  }
}

// 全局鼠标移动事件处理
function handleGlobalMouseMove(e: MouseEvent) {
  if (isDragging.value) {
    updateValueFromEvent(e);
    // 在拖动过程中就触发音量变化事件
    emit('input', value.value);
    emit('change', value.value);
  }
}

// 全局鼠标松开事件处理
function handleGlobalMouseUp(e: MouseEvent) {
  if (isDragging.value) {
    updateValueFromEvent(e);
    isDragging.value = false;
    isHovering.value = false;
    emit('change', value.value);
    
    // 移除全局事件监听
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }
}

// 根据鼠标事件更新值
function updateValueFromEvent(e: MouseEvent) {
  if (!barRef.value) return;
  
  const rect = barRef.value.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
  
  value.value = percentage;
  emit('update:modelValue', percentage);
}

// 组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', handleGlobalMouseMove);
  document.removeEventListener('mouseup', handleGlobalMouseUp);
});
</script>

<style lang="scss" scoped>
.volume-bar-container {
  width: 100%;
  height: 20px; // 增大可点击区域
  display: flex;
  align-items: center;
  cursor: pointer;
  
  .volume-bar {
    position: relative;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    overflow: visible;
    
    .volume-bar-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--el-border-color);
      border-radius: 2px;
    }
    
    .volume-bar-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: var(--el-color-primary);
      border-radius: 2px;
      transition: width 0.1s;
    }
    
    .volume-bar-handle {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: white;
      border: 1px solid var(--el-color-primary);
      opacity: 0;
      transition: opacity 0.2s, transform 0.2s;
      z-index: 1;
      
      &.is-active {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
  }
  
  &:hover {
    .volume-bar {
      height: 6px;
      
      .volume-bar-fill {
        height: 100%;
      }
      
      .volume-bar-handle {
        opacity: 1;
      }
    }
  }
}
</style>
