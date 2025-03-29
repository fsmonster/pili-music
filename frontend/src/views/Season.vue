<template>
  <Layout>
    <template #main>
      <div class="playlist-container">
        <div class="playlist-scroll">
          <!-- 列表头部 -->
          <ListHeader 
            v-if="info"
            :mid="info.upper.mid"
            :title="info.title"
            :cover="coverUrl"
            :count="info.media_count"
          />

          <!-- 播放列表内容 -->
          <div class="playlist-content">
            <!-- 控制栏 -->
            <ListControls
              :disabled="!medias.length"
              @update:sort="handleSort"
              @play-all="handlePlayAll"
              @sort="handleSort"
            />

            <!-- 表格 -->
            <MediaTable
              type="season"
              :data="medias"
              :loading="seasonStore.loading"
              @play="handlePlay"
            />

            <!-- 加载状态 -->
            <div v-if="seasonStore.loading" class="loading-more">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>

            <!-- 无数据 -->
            <div v-if="!seasonStore.loading && medias.length === 0" class="empty-data">
              暂无数据
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onBeforeMount, onMounted, onUnmounted, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useSeasonStore, useSeasonContentStore, usePlayerStore, useQueueStore } from '../stores';
import Layout from '../layout/Layout.vue';
import ListHeader from '../components/songList/ListHeader.vue';
import ListControls from '../components/songList/ListControls.vue';
import { Loading } from '@element-plus/icons-vue';
import type { MediaItem } from '../types';
import MediaTable from '../components/songList/MediaTable.vue';
import { getSeasonCover } from '@/api/season';

const route = useRoute();
const playerStore = usePlayerStore();
const queueStore = useQueueStore();
const seasonStore = useSeasonStore();
const seasonContentStore = useSeasonContentStore();

const { id } = route.params;

const { info, medias } = storeToRefs(seasonContentStore);
const coverUrl = ref(""); // 存储最终封面 URL

/**
 * @desc 加载内容
 */
async function loadContent() {  
  if (!id) return;
  await seasonContentStore.fetchAllSeasonContent(Number(id));
}

/**
 * @desc 播放全部
 */
function handlePlayAll() {
  if (medias.value.length > 0) {
    queueStore.setQueue(medias.value);
    playerStore.play(medias.value[0]);
  }
}

/**
 * @desc 播放单曲
 */
function handlePlay(item: MediaItem) {
  queueStore.setQueue(medias.value);
  playerStore.play(item);
}

/**
 * @desc 排序处理
 */
function handleSort(value: 'desc' | 'asc') {
  console.log(value);  
  // 重新加载数据
  loadContent();
}

// 表格最大高度
const tableMaxHeight = ref(500);

// 计算表格高度
function calculateTableHeight() {
  // 获取视窗高度
  const windowHeight = window.innerHeight;
  // 减去其他元素的高度（头部、控制栏、分页等）
  // 预留 padding 和其他元素的空间
  tableMaxHeight.value = windowHeight - 400; // 根据实际情况调整
}

// 监听窗口大小变化
function handleResize() {
  calculateTableHeight();
}

/**
 * @desc 移除内容
 */
function removeContent() {
  seasonContentStore.reset();
}

watchEffect(async () => {
  if (!info.value) return; // 避免 info 未初始化时报错

  if (info.value.cover.includes("viedeo_material_default.png")) {
    try {
      coverUrl.value = await getSeasonCover(info.value.id); // 等待 Promise 解析
    } catch (error) {
      console.error("获取封面失败", error);
      coverUrl.value = info.value.cover; // 获取失败时使用原封面
    }
  } else {
    coverUrl.value = info.value.cover;
  }
});
onBeforeMount(() => {
  calculateTableHeight();
  window.addEventListener('resize', handleResize);
});

onMounted(() => {
  loadContent();
});

onUnmounted(() => {
  removeContent();
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
@use './style/playlist.scss';
</style>
