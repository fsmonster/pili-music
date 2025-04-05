<template>
  <div class="video-card" @click="$emit('click', item)">
    <!-- 封面区域 -->
    <div class="video-cover">
      <img :src="processResourceUrl('https:' + item.pic) + '@672w_378h'" :alt="item.title" loading="lazy">
      
      <!-- 视频信息覆盖层 -->
      <div class="video-overlay">
        <!-- 播放按钮 -->
        <div class="play-icon">
          <i class="ri-play-circle-fill"></i>
        </div>
        
        <!-- 视频数据信息 -->
        <div class="video-stats">
          <span class="play-count">
            <i class="ri-headphone-line"></i>
            {{ formatCount(item.play) }}
          </span>
          <span class="duration">
            <i class="ri-time-line"></i>
            {{ formatDuration(item.duration) }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- 视频信息区域 -->
    <div class="video-info">
      <div class="video-title" :title="removeHtmlTags(item.title)" v-html="item.title"></div>
      <div class="video-meta">
        <div class="uploader" @click.stop="goToUserPage(item.mid)">
          <UpIcon class="up-icon"/>
          <span>{{ item.author }}</span>
        </div>
        <div class="publish-date">
          <!-- <i class="ri-time-line"></i> -->
          <span>{{ formatDate3(item.pubdate) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchVideoResult } from '@/types';
import UpIcon from '@/assets/icons/up.svg'
import { 
  processResourceUrl,
  removeHtmlTags,
  formatDate3,
  formatCount,
  formatDuration } from '@/utils';
import { useRouter } from 'vue-router';

// 定义属性
defineProps<{
  item: SearchVideoResult;
}>();

// 定义事件
defineEmits<{
  (e: 'click', item: SearchVideoResult): void;
}>();

const router = useRouter();

// 跳转到用户页面
const goToUserPage = (mid: number) => {
  router.push({
    name: 'user',
    params: { mid }
  });
};
</script>

<style lang="scss" scoped>
.video-card {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    
    .play-icon {
      opacity: 1;
      transform: scale(1);
    }
    
    .video-cover img {
      transform: scale(1.05);
    }
  }
  
  // 封面区域
  .video-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    
    // 视频信息覆盖层
    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.42) 0%, rgba(0, 0, 0, 0) 37%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 10px;
      box-sizing: border-box;
      
      // 播放按钮
      .play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0;
        transition: all 0.3s ease;
        
        i {
          font-size: 50px;
          color: #fff;
          filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
        }
      }
      
      // 视频数据信息
      .video-stats {
        position: absolute;
        bottom: 4px;
        display: flex;
        justify-content: space-between;
        color: #fff;
        font-size: 12px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        
        span {
          display: flex;
          align-items: center;
          
          i {
            margin-right: 4px;
            font-size: 14px;
          }
        }
      }
    }
  }
  
  // 视频信息区域
  .video-info {
    padding: 12px;
    
    // 视频标题
    .video-title {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
      margin-bottom: 8px;
      color: #18191c;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 40px;

      :deep(.keyword) {
        font-style: normal;
        color: $secondary-color;
      }
    }
    
    // 视频元数据
    .video-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #9499a0;
      
      .uploader, .publish-date {
        display: flex;
        align-items: center;
        
        .up-icon {
          display: inline-block;
          width: 18px;
          height: 18px;
          background-size: 20px 20px;
          margin-right: 4px;
        }
        
        span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      
      .uploader {
        max-width: 60%;
        &:hover {
          color: $primary-color;
        }
      }
    }
  }
}
</style>
