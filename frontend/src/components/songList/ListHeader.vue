# 列表头部组件
<template>
  <div class="playlist-header">
    <div class="playlist-header-inner">
      <div class="cover">
        <div v-if="!cover" class="skeleton">
          <el-skeleton :rows="3" animated />
        </div>
        <img 
          v-else 
          :src="processResourceUrl(cover)" 
          :alt="title"
        >
      </div>
      <div class="info">
        <h1>{{ title }}</h1>
        <p>{{ count }}个内容</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { processResourceUrl } from '../../utils/processResoureUrl';

defineProps<{
  title?: string
  cover?: string
  count?: number
}>();
</script>

<style lang="scss" scoped>
.playlist-header {
  margin-bottom: 20px;
}

.playlist-header-inner {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.cover {
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  background-color: rgb(64 158 255 / 4%);
  .skeleton {
    padding: 10px; 
  }
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.info p {
  margin: 0;
  color: #666;
}
</style>
