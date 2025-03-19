<template>
  <ContentSection 
    title="订阅合集" 
    :show-manage="true" 
    :show-refresh="true" 
    :isEmpty="!seasonStore.seasons.length && !seasonStore.loading"
    @manage="showManageDialog = true"
    @refresh="seasonStore.fetchSeasonsIfNeeded()">
    <template #icon>
      <i class="ri-stack-line"></i>
    </template>

    <!-- 标题后缀 -->
    <template #title-suffix>
      <span class="count-badge" v-if="seasonStore.seasons.length">
        {{ seasonStore.seasons.length }}
      </span>
    </template>

    <template #content>
      <div class="music-grid">
        <div 
        v-for="item in seasonStore.seasons" 
        :key="item.id" 
        class="music-item" 
        @click="goToPlaylist(item.id)">
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
          :value="item.id">
          <div class="title">{{ item.title }}</div>
          <div class="count">({{ item.media_count }}个内容)</div>
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="dialog-footer">
      <el-button @click="cancelManage">取消</el-button>
      <el-button type="primary" @click="saveSubscriptionsSettings">确定</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ContentSection from './ContentSection.vue';
import { useUserStore, useSeasonStore } from '@/stores';
import { processResourceUrl } from '@/utils/processResoureUrl';

const router = useRouter();
const seasonStore = useSeasonStore();
const userStore = useUserStore();

// 对话框显示状态
const showManageDialog = ref(false);
// 选中的合集ID列表
const checkedSeasons = ref<number[]>([]);

// 跳转到播放列表
const goToPlaylist = (id: number) => {
  router.push(`/season/${id}`);
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
  initManageDialog();
};

onMounted(() => {
  seasonStore.fetchSeasonsIfNeeded();
});

watch(() => userStore.isLoggedIn, seasonStore.fetchSeasonsIfNeeded);

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
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .el-checkbox__label {
      display: flex;
      width: 100%;
      align-items: center;
      .title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .count {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        margin-left: 4px;
      }
    }
  }
}

.dialog-footer {
  text-align: right;
  margin-top: 16px;
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
