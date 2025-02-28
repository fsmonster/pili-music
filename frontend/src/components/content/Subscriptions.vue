<template>
  <ContentSection title="订阅合集" :show-manage="true" @manage="showManageDialog = true">
    <template #icon>
      <i class="ri-stack-line"></i>
    </template>
    <div class="music-grid">
      <div 
        v-for="item in seasonStore.seasons" 
        :key="item.id" 
        class="music-item"
        @click="goToPlaylist(item.id)"
      >
        <div class="cover">
          <el-skeleton v-if="seasonStore.loading || !item.cover" :rows="1" animated>
          </el-skeleton>
          <img v-else :src="processResourceUrl(item.cover)" :alt="item.title">
        </div>
        <div class="info">
          <div class="title">{{ item.title }}</div>
          <div class="count">{{ item.media_count }}个内容</div>
        </div>
      </div>

      <!-- 无订阅时的提示 -->
      <div v-if="!seasonStore.seasons.length && !seasonStore.loading" class="empty-tip">
        <p>还没有订阅的合集</p>
      </div>
    </div>

    <!-- 管理对话框 -->
    <el-dialog 
      v-model="showManageDialog" 
      title="管理订阅合集" 
      width="500px"
      :close-on-click-modal="false"
      @open="onDialogOpen"
    >
      <div class="subscriptions-manage">
        <el-checkbox-group v-model="checkedSeasons">
          <el-checkbox 
            v-for="item in seasonStore.allSeasons" 
            :key="item.id" 
            :value="item.id"
          >
            {{ item.title }}
            <span class="count">({{ item.media_count }}个内容)</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="cancelManage">取消</el-button>
        <el-button type="primary" @click="saveSubscriptionsSettings">确定</el-button>
      </template>
    </el-dialog>
  </ContentSection>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ContentSection from './ContentSection.vue';
import { useSeasonStore } from '@/stores';
import { processResourceUrl } from '@/utils/processResoureUrl';

const router = useRouter();
const seasonStore = useSeasonStore();

// 对话框显示状态
const showManageDialog = ref(false);
// 选中的合集ID列表
const checkedSeasons = ref<number[]>([]);

// 跳转到播放列表
const goToPlaylist = (id: number) => {
  router.push(`/playlist/${id}/season`);
};

// 打开管理对话框时，初始化选中状态
const initManageDialog = () => {
  checkedSeasons.value = [...seasonStore.displaySeasonIds] 
};

// 取消管理
const cancelManage = () => {
  showManageDialog.value = false;
  // 重置选中状态
  initManageDialog();
};

// 保存订阅合集显示设置
const saveSubscriptionsSettings = async () => {
  seasonStore.updateSeasonSettings(checkedSeasons.value);
  showManageDialog.value = false;
  ElMessage.success('设置已保存');
};

// 监听对话框打开
const onDialogOpen = () => {
  console.log('dialog open');  
  initManageDialog();
};

onMounted(async () => {
  // 获取订阅合集列表
  await seasonStore.fetchSeasons();
});

// 监听对话框
defineExpose({
  onDialogOpen
});
</script>

<style lang="scss" scoped>
@import './styles/music-grid.scss';

.empty-tip {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);

  p {
    margin: 0 0 16px;
  }
}

.subscriptions-manage {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 20px;

  :deep(.el-checkbox) {
    display: block;
    margin-bottom: 12px;
    
    .count {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      margin-left: 4px;
    }
  }
}
</style>
