<!-- 控制栏组件 -->
<template>
  <div class="controls-sticky">
    <div class="controls">
      <div class="left">
        <div 
          class="play-all"
          @click="$emit('play-all')"
          :disabled="disabled"
        >
          <i class="ri-play-fill"></i>
        </div>
      </div>
      <div class="right">
        <!-- 收藏 filter -->
        <!-- 收藏时间:mtime；按播放量: view；按投稿时间：pubtime -->
        <!-- 合集 没有 filter-->
        <!-- 系列 filter -->
        <!-- desc: 默认排序 asc: 升序排序 -->
        <div class="filter">
          <div 
            v-for="item in sortOptions"
            class="sort"
            :class="{ active: sort?.order === item.value }"
            :key="item.value"
            @click="$emit('sort', item.value)"
          >
            {{ item.label }}
          </div>
        </div>

        <!-- 添加进分区 -->
        <div 
          class="add"
          @click="$emit('add')"
        >
          <i class="ri-add-fill"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="TSort extends PropertyKey">
import { defineProps, defineEmits } from 'vue';
import { CollectionType } from '@/types';

export interface SortOption<T> {
  label: string;
  value: T;
}

defineProps<{
  disabled: boolean;
  type: CollectionType;
  sort?: { type: CollectionType; order: TSort } | null;
  sortOptions?: SortOption<TSort>[];
}>();

defineEmits<{
  (e: 'play-all'): void;
  (e: 'add'): void;
  (e: 'sort', order: TSort): void; 
}>();
</script>

<style lang="scss" scoped>
.controls-sticky {
  padding: 20px 0;
  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .left {
    display: flex;
    gap: 10px;
    padding-left: 8px;
    .play-all {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1 / 1;
      border-radius: 50%;
      overflow: hidden;
      padding: 14px;
      color: #fff;
      background-color: rgba($primary-color, 0.9);
      cursor: pointer;
      .ri-play-fill {
        font-size: 24px;
      }
      &:hover {
        background-color: $primary-color;
      }
    }
  }
  .right {
    display: flex;
    gap: 10px;
    align-items: center;
    .filter {
      display: flex;
      gap: 10px;
      align-items: center;
      height: 80%;
      .sort {
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px 8px;
        color: $text-color-secondary;
        background-color: $background-color;
        border-radius: 6px;
        &.active {
          color: #fff;
          background-color: rgba($primary-color, 0.8);
        }
      }
    }
    .add {
      padding-left: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1 / 1;
      border-radius: 50%;
      overflow: hidden;
      padding: 8px;
      color: $text-color-secondary;
      cursor: pointer;
      .ri-add-fill {
        font-size: 24px;
      }
      &:hover {
        background-color: rgba($background-color, 0.8);
      }
    }
  }
}
</style>
