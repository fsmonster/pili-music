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
              :type="CollectionType.Season"
              @play-all="handlePlayAll"
            />

            <!-- 表格 -->
            <!-- <MediaTable
              type="season"
              :data="medias"
              :loading="seasonStore.loading"
              @play="handlePlay"
            /> -->
            <MediaList
              type="season"
              :data="medias"
              :loading="seasonStore.loading"
              @play="handlePlay"
            />

            <!-- 加载状态 -->
            <div v-if="seasonStore.loading" class="loading">
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
import { ref, computed, onMounted, onUnmounted, watchEffect, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSeasonStore, useSeasonContentStore, usePlayerStore } from '../stores';
import Layout from '../layout/Layout.vue';
import ListHeader from '../components/songList/ListHeader.vue';
import ListControls from '../components/songList/ListControls.vue';
import { Loading } from '@element-plus/icons-vue';
import { CollectionType } from '@/types';
import type { MediaItem } from '../types';
import MediaList from '../components/songList/MediaList.vue';
import { getSeasonCover } from '@/api/season';

const route = useRoute();
const playerStore = usePlayerStore();
const seasonStore = useSeasonStore();
const seasonContentStore = useSeasonContentStore();

const { info, medias } = storeToRefs(seasonContentStore);
const coverUrl = ref(""); // 存储最终封面 URL

const id = computed(() => route.params.id);

/**
 * @desc 加载内容
 */
async function loadContent() {  
  if (!id.value) return;
  await seasonContentStore.fetchAllSeasonContent(Number(id.value));
}

/**
 * @desc 构建播放选项
 */
function buildPlayOptionsPartial() {
  const id = info.value?.id ?? 0;
  const title = info.value?.title ?? '';
  const cover = medias.value[0]?.cover ?? '';

  return {
    collection: {
      type: CollectionType.Season,
      id,
      name: title,
      cover
    }
  };
}

/**
 * @desc 播放全部
 */
function handlePlayAll() {
  if (medias.value.length > 0) {
    playerStore.playMedia({
      queue: medias.value,
      total: info.value?.media_count ?? 0,
      ...buildPlayOptionsPartial()
    });
  }
}

/**
 * @desc 播放单曲
 */
function handlePlay(item: MediaItem) {
  playerStore.playMedia({
    queue: medias.value,
    total: info.value?.media_count ?? 0,
    currentTrack: item,
    ...buildPlayOptionsPartial()
  });
}

/**
 * @desc 移除内容
 */
function removeContent() {
  seasonContentStore.reset();
}

watch(() => id.value, () => {
  removeContent();
  loadContent();
}, { immediate: true });

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

onUnmounted(() => {
  removeContent();
});
</script>

<style lang="scss" scoped>
@use './style/playlist.scss';
</style>
