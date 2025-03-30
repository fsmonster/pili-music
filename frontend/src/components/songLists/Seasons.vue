<template>
  <ContentSection 
    title="订阅合集" 
    :show-manage="true" 
    :show-refresh="true" 
    :isEmpty="!seasons.length && !seasonStore.loading"
    @manage="showManageDialog = true"
    @refresh="seasonStore.refreshSeasons()">
    <template #icon>
      <i class="ri-stack-line"></i>
    </template>

    <!-- 标题后缀 -->
    <template #title-suffix>
      <span class="count-badge" v-if="seasons.length">
        {{ seasons.length }}
      </span>
    </template>

    <template #content>
      <div class="music-grid">
        <div 
        v-for="item in seasons" 
        :key="item.id" 
        class="music-item" 
        @click="goToPlaylist(item.id)">
          <div class="cover">
            <el-skeleton v-if="seasonStore.loading || !item.cover" :rows="1" animated>
            </el-skeleton>
            <img v-else :src="processResourceUrl(item.cover) + '@250h'" :alt="item.title">
            <div class="play-button" @click.stop="playSeason(item.id)">
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
        <template v-for="item in seasonStore.allSeasons" :key="item.id">
          <el-checkbox 
            v-if="item.attr !== 1"
            :value="item.id">
            <div class="title">{{ item.title }}</div>
            <div class="count">({{ item.media_count }}个内容)</div>
          </el-checkbox>
        </template>
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
import { storeToRefs } from 'pinia';
import ContentSection from './ContentSection.vue';
import { useUserStore, useSeasonStore, useSeasonContentStore, useQueueStore, usePlayerStore, useLazyLoadStore } from '@/stores';
import { processResourceUrl } from '@/utils';
import type { SeasonList } from '@/types';
import { getSeasonCover } from '@/api';

const router = useRouter();
const seasonStore = useSeasonStore();
const seasonContentStore = useSeasonContentStore();
const userStore = useUserStore();
const queueStore = useQueueStore();
const playerStore = usePlayerStore();
const lazyLoad = useLazyLoadStore();

// 订阅合集
const seasons = ref<SeasonList[]>([]);
// 对话框显示状态
const showManageDialog = ref(false);
// 选中的合集ID列表
const checkedSeasons = ref<number[]>([]);

// 选中的订阅合集内容
const { medias } = storeToRefs(seasonContentStore);

// 跳转到播放列表
const goToPlaylist = (id: number) => {
  router.push(`/season/${id}`);
};

// 播放订阅合集内容
const playSeason = async (id: number) => {
  try {
    // 集合不需要懒加载
    lazyLoad.reset();
    // 完整加载订阅合集内容
    await seasonContentStore.fetchAllSeasonContent(Number(id));
    if (medias.value.length > 0) {
      queueStore.setQueue(medias.value);
      playerStore.play(medias.value[0]);
    }
  } catch (error) {
    console.error('播放订阅合集失败:', error);
    ElMessage.error('播放订阅合集失败');
  }
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

// 监听 `displaySeasonIds`，只在 `displaySeasonIds` 变化时更新数据
watch(seasonStore.displaySeasonIds, async (newIds) => {
  if (!newIds.length) return; // 没有需要展示的合集，直接返回

  const filteredSeasons = seasonStore.allSeasons.filter((s) =>
    newIds.includes(s.id)
  );

  // 异步处理封面
  seasons.value = await Promise.all(
    filteredSeasons.map(async (season) => {
      if (season.cover.includes("viedeo_material_default.png")) {
        try {
          return { ...season, cover: await getSeasonCover(season.id) };
        } catch (error) {
          console.error(`获取封面失败: ${season.id}`, error);
          return season; // 出错时保持原数据
        }
      }
      return season;
    })
  );
}, { immediate: true }); // 立即执行一次

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
}
</style>
