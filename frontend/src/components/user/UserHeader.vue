<template>
  <div class="user-header">
    <div class="user-info">
      <div class="user-avatar">
        <img :src="processResourceUrl(avatar) + `@100h`" alt="用户头像" />
      </div>
      <div class="user-details">
        <h2 class="user-name">{{ name }}</h2>
        <div class="user-id">UID: {{ mid }}</div>
        <div class="user-actions">
          <a :href="`https://space.bilibili.com/${mid}`" target="_blank" class="bili-link">
            <i class="ri-external-link-line"></i> 前往B站空间
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { processResourceUrl } from '@/utils';

// 定义组件属性
defineProps<{
  avatar: string;
  name: string;
  mid: number;
}>();
</script>

<style lang="scss" scoped>
.user-header {
  margin-bottom: 24px;
  padding: 24px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  margin-right: 24px;
  
  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
  }
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
}

.user-id {
  margin-bottom: 12px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.user-actions {
  display: flex;
  gap: 12px;
  
  .bili-link {
    display: inline-flex;
    align-items: center;
    color: var(--el-color-primary);
    text-decoration: none;
    
    i {
      margin-right: 4px;
    }
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
