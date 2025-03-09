<template>
  <ContentSection title="我的音乐">
    <!-- 图标插槽 -->
    <template #icon>
      <i class="ri-folder-music-fill"></i>
    </template>

    <!-- 操作按钮插槽 -->
    <template #actions>
      <el-button type="primary" link @click="createPlaylist">
        <i class="ri-add-line"></i>
        新建歌单
      </el-button>
    </template>
    
    <!-- 歌单列表 -->
    <template #content>
      <div class="music-grid">
        <!-- 最近播放 -->
        <div class="music-item" @click="navigateToRecentPlays">
          <div class="cover">
            <img :src="loveCover" alt="最近播放">
            <div class="play-overlay" @click.stop="playAllRecentMusic">
              <i class="ri-play-circle-fill"></i>
            </div>
          </div>
          <div class="info">
            <div class="title">最近播放</div>
            <div class="count">{{ recentPlayStore.recentPlayCount }}首歌曲</div>
          </div>
        </div>
        <!-- 我喜欢的音乐 -->
        <div class="music-item" @click="navigateToLikedMusic">
          <div class="cover">
            <img :src="loveCover" alt="我喜欢的音乐">
            <div class="play-overlay" @click.stop="playAllLikedMusic">
              <i class="ri-play-circle-fill"></i>
            </div>
          </div>
          <div class="info">
            <div class="title">我的喜欢</div>
            <div class="count">{{ likeStore.likedCount }}首歌曲</div>
          </div>
        </div>
        <!-- 其他歌单 -->
        <div 
          v-for="playlist in playlistStore.playlists" 
          :key="playlist._id" 
          class="music-item"
          @click="navigateToPlaylist(playlist)"
        >
          <div class="cover">
            <img :src="playlist.coverUrl || defaultCover" :alt="playlist.name">
            <div class="play-overlay" @click.stop="playPlaylist(playlist)">
              <i class="ri-play-circle-fill"></i>
            </div>
          </div>
          <div class="info">
            <div class="title">{{ playlist.name }}</div>
            <div class="count">{{ playlist.mediaItems?.length || 0 }}首歌曲</div>
          </div>
        </div>
      </div>
    </template>
  </ContentSection>
  <!-- 创建歌单对话框 -->
  <el-dialog v-model="showCreateDialog" title="创建歌单" width="400px">
    <el-form :model="newPlaylist" label-width="80px">
      <el-form-item label="歌单名称">
        <el-input v-model="newPlaylist.title" placeholder="请输入歌单名称"></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input 
          v-model="newPlaylist.description" 
          type="textarea" 
          placeholder="请输入歌单描述"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showCreateDialog = false">取消</el-button>
      <el-button type="primary" @click="saveNewPlaylist" :loading="creating">创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ContentSection from './ContentSection.vue';
import defaultCover from '@/assets/image/default_cover.avif';
import loveCover from '@/assets/image/love.avif';
import { usePlaylistStore } from '@/stores/list/custom';
import { useLikeStore } from '@/stores/list/like';
import { useRecentPlayStore } from '@/stores/list/recentPlay';
// import { usePlayerStore } from '@/stores/play/player';
import type { CreatePlaylistParams, CustomPlaylist } from '@/types';

// 引入状态管理
const playlistStore = usePlaylistStore();
const likeStore = useLikeStore();
const recentPlayStore = useRecentPlayStore();
// const playerStore = usePlayerStore();
const router = useRouter();

// 加载状态
const creating = ref(false);

// 创建歌单对话框
const showCreateDialog = ref(false);
const newPlaylist = ref<CreatePlaylistParams>({
  title: '',
  cover: '',
  description: ''
});

// 组件挂载时获取数据
onMounted(async () => {
  // 获取用户歌单
  if (playlistStore.playlists.length === 0) {
    try {
      await playlistStore.fetchUserPlaylists();
    } catch (error) {
      console.error('获取用户歌单失败:', error);
    }
  }
  
  // 获取喜欢的音乐
  if (likeStore.likedCount === 0) {
    try {
      await likeStore.fetchLikedMedia();
    } catch (error) {
      console.error('获取喜欢的音乐失败:', error);
    }
  }
  
  // 获取最近播放
  if (recentPlayStore.recentPlayCount === 0) {
    try {
      await recentPlayStore.fetchRecentPlays();
    } catch (error) {
      console.error('获取最近播放记录失败:', error);
    }
  }
});

// 打开创建歌单对话框
function createPlaylist() {
  // 重置表单
  newPlaylist.value = {
    title: '',
    cover: '',
    description: ''
  };
  showCreateDialog.value = true;
}

// 保存新歌单
async function saveNewPlaylist() {
  // 表单验证
  if (!newPlaylist.value.title) {
    ElMessage.warning('请输入歌单名称');
    return;
  }
  
  creating.value = true;
  try {
    await playlistStore.createPlaylist(newPlaylist.value);
    ElMessage.success('歌单创建成功');
    showCreateDialog.value = false;
  } catch (error) {
    console.error('创建歌单失败:', error);
    ElMessage.error('创建歌单失败');
  } finally {
    creating.value = false;
  }
}

// 播放所有最近播放的音乐
const playAllRecentMusic = async (event: Event) => {
  event.stopPropagation();
  // 如果没有最近播放的音乐，不执行任何操作
  if (recentPlayStore.recentPlayCount === 0) {
    ElMessage.warning('暂无最近播放记录');
    return;
  }
  
  // TODO: 实现播放所有最近播放音乐的逻辑
  // 将最近播放的音乐添加到播放列表
  ElMessage.success('开始播放最近播放的音乐');
};

// 播放所有喜欢的音乐
const playAllLikedMusic = async (event: Event) => {
  event.stopPropagation();
  // 如果没有喜欢的音乐，不执行任何操作
  if (likeStore.likedCount === 0) {
    ElMessage.warning('暂无喜欢的音乐');
    return;
  }
  
  // TODO: 实现播放所有喜欢的音乐的逻辑
  // 需要先获取喜欢的音乐的详细信息，然后添加到播放列表
  ElMessage.success('开始播放我喜欢的音乐');
};

// 播放播放列表
const playPlaylist = async (playlist: CustomPlaylist, event: Event) => {
  event.stopPropagation();
  // 如果播放列表为空，不执行任何操作
  if (!playlist.mediaItems || playlist.mediaItems.length === 0) {
    ElMessage.warning('播放列表为空');
    return;
  }
  
  // TODO: 实现播放播放列表的逻辑
  // 将播放列表中的音乐添加到播放队列
  ElMessage.success(`开始播放"${playlist.name}"`);
};

// 导航到最近播放详情页
const navigateToRecentPlays = () => {
  router.push('/recent-plays');
};

// 导航到喜欢的音乐详情页
const navigateToLikedMusic = () => {
  router.push('/liked-music');
};

// 导航到播放列表详情页
const navigateToPlaylist = (playlist: CustomPlaylist) => {
  // 设置当前查看的播放列表
  playlistStore.setCurrentPlaylist(playlist);
  router.push(`/playlist/${playlist._id}`);
};
</script>

<style lang="scss" scoped>
@use './styles/music-grid.scss';
</style>