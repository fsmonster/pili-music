
<template>
  <div class="user-card" @click="$emit('click', props.item)">
    <!-- 用户信息区域 -->
    <div class="user-info" @click.stop="goToUserPage(props.item.mid)">
      <!-- 用户头像区域 -->
      <div class="user-avatar">
        <img :src="processResourceUrl('https:' + props.item.upic)" :alt="props.item.uname" loading="lazy">
        <!-- 认证图标 -->
        <!-- <div class="verify-icon" v-if="props.item.official_verify && props.item.official_verify.type > 0">
          <i :class="verifyIconClass"></i>
        </div> -->
      </div>
      <div class="user-name" :title="props.item.uname">
        <span>{{ props.item.uname }}</span>
      </div>
      <div class="user-sign" :title="props.item.usign">{{ props.item.usign || '这个人很懒，什么都没有写~' }}</div>
      
      <div class="user-stats">
        <div class="stat-item">
          <UpIcon class="up-icon"/>
          <span>{{ formatCount(props.item.fans) }}粉丝</span>
        </div>
        <div class="stat-item">
          <i class="ri-video-line"></i>
          <span>{{ formatCount(props.item.videos) }}视频</span>
        </div>
      </div>
    </div>
    
    <!-- 推荐视频区域 -->
    <div class="recommended-videos" v-if="props.item.res && props.item.res.length > 0">
      <div class="video-title">推荐作品</div>
      <div class="video-list">
        <div 
          v-for="(video, index) in props.item.res.slice(0, 2)" 
          :key="index" 
          class="video-item"
          @click.stop="handleVideoClick(video)"
        >
          <div class="video-cover">
            <img :src="processResourceUrl('https:' + video.pic) + '@160w_100h'" :alt="video.title" loading="lazy">
            <span class="video-duration">{{ formatDuration(video.duration) }}</span>
          </div>
          <div class="video-name" :title="removeHtmlTags(video.title)" v-html="video.title"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { processResourceUrl, removeHtmlTags, formatDuration, formatCount } from '@/utils';
import type { SearchUserResult, Res } from '@/types';
import { useRouter } from 'vue-router';
import UpIcon from '@/assets/icons/up.svg'

// 定义属性
const props = defineProps<{
  item: SearchUserResult;
}>();

// 定义事件
const emit = defineEmits<{
  (e: 'click', item: SearchUserResult): void;
  (e: 'video-click', video: Res): void;
}>();

const router = useRouter();

// 跳转到用户页面
const goToUserPage = (mid: number) => {
  router.push({
    name: 'user',
    params: { mid }
  });
};

// 计算认证图标样式
const verifyIconClass = computed(() => {
  const type = props.item.official_verify?.type;
  // 0: 未认证, 1: 个人认证, 2: 企业认证
  return type === 1 ? 'ri-verified-badge-fill personal' : 'ri-building-2-fill enterprise';
});

// 处理视频点击
const handleVideoClick = (video: Res) => {
  emit('video-click', video);
};
</script>

<style lang="scss" scoped>
.user-card {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  // 用户信息区域
  .user-info {
    padding: 0 15px 15px;
    text-align: center;

      // 用户头像区域
  .user-avatar {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 20px auto 10px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      border: 3px solid #f1f1f1;
    }
    
    // 认证图标
    .verify-icon {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        font-size: 16px;
        
        &.personal {
          color: #00a1d6;
        }
        
        &.enterprise {
          color: #f25d8e;
        }
      }
    }
  }
    
    // 用户名
    .user-name {
      font-size: 16px;
      font-weight: 600;
      color: #18191c;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.keyword) {
        font-style: normal;
        color: $secondary-color;
      }
    }
    
    // 用户签名
    .user-sign {
      font-size: 12px;
      color: #9499a0;
      margin-bottom: 10px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 36px;
      line-clamp: 2; /* 标准属性 */
    }
    
    // 用户统计数据
    .user-stats {
      display: flex;
      justify-content: center;
      gap: 15px;
      
      .stat-item {
        display: flex;
        align-items: center;
        color: #9499a0;
        font-size: 12px;

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
    }

    &:hover {
      .user-name {
        color: $primary-color;
      }
    }
  }
  
  // 推荐视频区域
  .recommended-videos {
    padding: 10px 15px 15px;
    border-top: 1px solid #f1f1f1;
    
    .video-title {
      font-size: 14px;
      font-weight: 500;
      color: #18191c;
      margin-bottom: 10px;
    }
    
    .video-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      
      .video-item {
        cursor: pointer;
        
        &:hover {
          .video-name {
            color: $primary-color;
          }
          
          .video-cover img {
            transform: scale(1.05);
          }
        }
        
        .video-cover {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
          border-radius: 4px;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }
          
          .video-duration {
            position: absolute;
            bottom: 4px;
            right: 4px;
            background-color: rgba(0, 0, 0, 0.6);
            color: #fff;
            font-size: 10px;
            padding: 1px 4px;
            border-radius: 2px;
          }
        }
        
        .video-name {
          font-size: 12px;
          color: #18191c;
          margin-top: 5px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.3s ease;
          line-clamp: 1; /* 标准属性 */
          
          :deep(.keyword) {
            font-style: normal;
            color: $secondary-color;
          }
        }
      }
    }
  }
}
</style>