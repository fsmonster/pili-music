<template>
  <div 
    class="collection-item" 
    @click="handleClick"
  >
    <!-- 封面图 -->
    <div class="cover-container"
      :class="{ 'is-up': isUpType }"
    >
      <img 
        :src="processResourceUrl(item.cover)" 
        :alt="item.name" 
        loading="lazy"
        class="cover-image"
      />
    </div>
    
    <!-- 展开时显示的信息 -->
    <div class="info" v-if="!isCollapsed">
      <div class="type" :title="item.type">{{ getTypeLabel(item.type) }}</div>
      <div class="name" :title="item.name">{{ item.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { processResourceUrl } from '@/utils';
import { CollectionType } from '@/types';
import type { recentlyCollections } from '@/types';

// 定义属性
const props = defineProps<{
  item: recentlyCollections;
}>();

const isCollapsed = defineModel('is-collapsed', { type: Boolean, default: false });

// 路由
const router = useRouter();

// 判断是否为UP主类型
const isUpType = computed(() => {
  return props.item.type === CollectionType.UP;
});

// 获取类型标签
const getTypeLabel = (type: CollectionType) => {
  switch (type) {
    case CollectionType.Favorite:
      return '收藏夹';
    case CollectionType.Season:
      return '合集';
    case CollectionType.Series:
      return '系列';
    case CollectionType.UP:
      return 'UP主';
    default:
      return '未知';
  }
};

// 处理点击事件
const handleClick = () => {
  switch (props.item.type) {
    case CollectionType.Favorite:
      router.push(`/favorite/${props.item.id}`);
      break;
    case CollectionType.Season:
      router.push(`/season/${props.item.id}`);
      break;
    case CollectionType.Series:
      router.push(`/series/${props.item.id}`);
      break;
    case CollectionType.UP:
      router.push(`/user/${props.item.id}`);
      break;
  }
};
</script>

<style lang="scss" scoped>
.collection-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-bottom: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  .cover-container {
    height: 56px;
    border-radius: 4px;
    overflow: hidden;
    
    // 歌单封面 4:3
    &:not(.is-up) {
      aspect-ratio: 4/3;
    }
    
    // UP主头像 1:1
    &.is-up {
      aspect-ratio: 1/1;
      
      .cover-image {
        border-radius: 50%;
      }
    }
    
    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .type {
      font-size: 12px;
      color: $text-color-secondary;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .name {
      font-size: 12px;
      color: $text-color;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  
  // UP主样式特殊处理
  &.is-up {
    .cover-container {
      .cover-image {
        border-radius: 50%;
      }
    }
  }
}
</style>
