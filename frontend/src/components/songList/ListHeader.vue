<template>
  <div class="playlist-header">
    <div class="playlist-header-inner">
      <div class="cover">
        <div v-if="!cover" class="skeleton">
          <el-skeleton :rows="3" animated />
        </div>
        <img 
          v-else 
          :src="processResourceUrl(cover) + '@300h'" 
          :alt="title"
        >
      </div>
      <div class="info">
        <h1>{{ title }}</h1>
        <div class="creator-info" v-if="upperInfo?.face">
          <div 
            @click="goToUser(upperInfo?.mid)"
            class="creator-link"
          >
            <img :src="processResourceUrl(upperInfo?.face) + '@70w'" class="creator-avatar" />
            <span class="creator-name">{{ upperInfo?.name }}</span>
          </div>
        </div>
        <p>{{ count }}个内容</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { processResourceUrl } from '../../utils/processResoureUrl';
import type { Upper } from '../../types';
import { ref, onMounted } from 'vue';
import { getUserInfo } from '../../api';

const props = defineProps<{
  mid: number
  title: string
  cover: string
  count: number
}>();

const router = useRouter();

const upperInfo = ref<Upper | null>(null);

const goToUser = (mid: number) => {
  router.push(`/user/${mid}`);
};

onMounted(async () => {
  try {
    upperInfo.value = await getUserInfo(props.mid);
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
});
</script>

<style lang="scss" scoped>
.playlist-header {
  margin-bottom: 20px;
  .playlist-header-inner {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }
  .cover {
    height: 150px;
    aspect-ratio: 16/9;
    overflow: hidden;
    border-radius: 8px;
    background-color: rgb(64 158 255 / 4%);
    .skeleton {
      padding: 10px; 
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    h1 {
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    p {
      margin: 0;
      color: #666;
    }
    .creator-info {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      cursor: pointer;
      .creator-link {
        display: flex;
        align-items: center;
        color: var(--el-text-color-primary);
        transition: color 0.3s;
        
        &:hover {
          text-decoration: underline;
        }
        .creator-avatar {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          margin-right: 8px;
        }
        .creator-name {
          font-size: 15px;
        }
      }
    }
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  .tag {
  padding: 2px 8px;
    background-color: #f2f6fc;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
  }
}
</style>
