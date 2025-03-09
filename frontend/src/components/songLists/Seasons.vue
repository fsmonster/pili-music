<template>
  <ContentSection 
    title="订阅合集" 
    :show-manage="true" 
    :isEmpty="!seasonStore.seasons.length && !seasonStore.loading"
    @manage="showManageDialog = true"
  >
    <template #icon>
      <i class="ri-stack-line"></i>
    </template>

    <!-- 标题后缀 -->
    <template #title-suffix>
      <span class="count-badge" v-if="seasonStore.seasons.length">
        {{ seasonStore.seasons.length }}
      </span>
    </template>

    <!-- 自定义操作按钮 -->
    <template #customActions>

    </template>

    <template #content>
      <div class="music-grid">
        <div 
          v-for="item in seasonStore.seasons" 
          :key="item.id" 
          class="music-item"
          @click="goToPlaylist('season', item.id)"
        >
          <div class="cover">
            <el-skeleton v-if="seasonStore.loading || !item.cover" :rows="1" animated>
            </el-skeleton>
            <img v-else :src="processResourceUrl(item.cover)" :alt="item.title">
            <div class="play-overlay">
              <i class="ri-play-fill"></i>
            </div>
          </div>
          <div class="info">
            <div class="title">{{ item.title }}</div>
            <div class="count">{{ item.media_count }}个内容</div>
          </div>
        </div>
      </div>
    </template>

    <!-- 空状态提示 -->
    <template #empty>
      <div class="empty-tip">
        <p>点击右上角的<i class="ri-settings-3-line"></i>添加订阅合集</p>
      </div>
    </template>

    <!-- 底部内容 -->
    <template #footer v-if="seasonStore.seasons.length > 9">
      <div class="view-more">
        <el-button link type="primary" @click="showManageDialog = true">
          查看更多订阅合集
          <i class="ri-arrow-right-line"></i>
        </el-button>
      </div>
    </template>
  </ContentSection>

      <!-- 管理对话框 -->
      <el-dialog 
      v-model="showManageDialog" 
      title="管理订阅合集" 
      width="500px"
      :close-on-click-modal="false"
      @open="onDialogOpen"
    >
      <div class="seasons-manage">
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
const goToPlaylist = (type: 'favorite' | 'season', id: number) => {
  router.push(`/playlist/${type}/${id}`);
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
@use './styles/music-grid.scss';

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  padding: 40px;

  p {
    margin: 0 0 16px;
  }
}

.seasons-manage {
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

.count-badge {
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 4px;
}

.view-more {
  text-align: center;
  margin-top: 8px;
}
</style>
