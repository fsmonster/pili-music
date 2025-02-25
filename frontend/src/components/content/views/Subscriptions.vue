<template>
  <ContentSection title="订阅合集" :show-manage="true" @manage="showManageDialog = true">
    <template #icon>
      <i class="ri-folder-received-line"></i>
    </template>
    <div class="music-grid">
      <div v-for="item in subscriptions" :key="item.id" class="music-item">
        <div class="cover">
          <img :src="item.cover" :alt="item.title">
          <div class="play-overlay">
            <i class="ri-play-circle-fill"></i>
          </div>
        </div>
        <div class="info">
          <div class="title">{{ item.title }}</div>
          <div class="creator">by {{ item.creator }}</div>
          <div class="count">{{ item.count }}个内容</div>
        </div>
      </div>
    </div>

    <!-- 管理对话框 -->
    <el-dialog v-model="showManageDialog" title="管理订阅合集" width="500px">
      <div class="subscriptions-manage">
        <el-checkbox-group v-model="checkedSubscriptions">
          <el-checkbox 
            v-for="item in allSubscriptions" 
            :key="item.id" 
            :label="item.id"
          >
            {{ item.title }}
            <span class="creator">by {{ item.creator }}</span>
            <span class="count">({{ item.count }}个内容)</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="showManageDialog = false">取消</el-button>
        <el-button type="primary" @click="saveSubscriptionsSettings">确定</el-button>
      </template>
    </el-dialog>
  </ContentSection>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ContentSection from '../common/ContentSection.vue';
import defaultCover from '@/assets/image/default_cover.avif';

// 假数据
const allSubscriptions = ref([
  {
    id: 1,
    title: '日语歌曲精选',
    creator: '音乐推荐官',
    count: 156,
    cover: defaultCover,
  },
  {
    id: 2,
    title: '经典动漫歌曲',
    creator: 'AnimeMusic',
    count: 89,
    cover: defaultCover,
  },
  {
    id: 3,
    title: '流行音乐合集',
    creator: 'PopMusic',
    count: 203,
    cover: defaultCover,
  },
]);

const subscriptions = ref(allSubscriptions.value);
const checkedSubscriptions = ref(allSubscriptions.value.map(s => s.id));
const showManageDialog = ref(false);

// 保存订阅合集显示设置
const saveSubscriptionsSettings = () => {
  subscriptions.value = allSubscriptions.value.filter(s => checkedSubscriptions.value.includes(s.id));
  showManageDialog.value = false;
};
</script>

<style lang="scss" scoped>
@import '../styles/music-grid.scss';

.subscriptions-manage {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 20px;

  :deep(.el-checkbox) {
    display: block;
    margin-bottom: 12px;
    
    .creator {
      color: var(--el-text-color-regular);
      font-size: 12px;
      margin-left: 4px;
    }
    
    .count {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      margin-left: 4px;
    }
  }
}
</style>
