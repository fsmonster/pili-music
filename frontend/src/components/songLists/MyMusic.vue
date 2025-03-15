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
        <RecentlyPlayed
          :count="recentPlayStore.recentPlayCount"
          @navigateToRecentPlays="navigateToRecentPlays"
        />
        <!-- 我喜欢的音乐 -->
        <LikedMusic 
          :count="likeStore.likedCount"
          @navigateToLikedMusic="navigateToLikedMusic"/>
        <!-- 其他歌单 -->
         <CustomPlaylistItem
          v-for="playlist in customStore.customPlaylists" 
          :key="playlist._id" 
          :playlist="playlist"
          @navigateToPlaylist="navigateToPlaylist(playlist)"
        />
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
import type { CreateCustomParams, Custom } from '@/types';
import { useLikeStore,useRecentPlayStore,useCustomStore } from '@/stores';
import LikedMusic from './MyMusic/LikedMusic.vue';
import RecentlyPlayed from './MyMusic/RecentlyPlayed.vue';
import CustomPlaylistItem from './MyMusic/CustomPlaylistItem.vue';


// 引入状态管理
const customStore = useCustomStore();
const likeStore = useLikeStore();
const recentPlayStore = useRecentPlayStore();
const router = useRouter();

// 加载状态
const creating = ref(false);

// 创建歌单对话框
const showCreateDialog = ref(false);
const newPlaylist = ref<CreateCustomParams>({
  title: '',
  cover: '',
  description: ''
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
    await customStore.createPlaylist(newPlaylist.value);
    ElMessage.success('歌单创建成功');
    showCreateDialog.value = false;
  } catch (error) {
    console.error('创建歌单失败:', error);
    ElMessage.error('创建歌单失败');
  } finally {
    creating.value = false;
  }
}

// 导航到最近播放详情页
const navigateToRecentPlays = () => {
  router.push('/recent');
};

// 导航到喜欢的音乐详情页
const navigateToLikedMusic = () => {
  router.push('/liked');
};

// 导航到播放列表详情页
const navigateToPlaylist = (playlist: Custom) => {
  // 设置当前查看的播放列表
  customStore.setCurrentPlaylist(playlist);
  router.push(`/playlist/${playlist._id}`);
};

// 组件挂载时获取数据
onMounted(() => {
  // 获取喜欢的音乐
  likeStore.fetchLikedIfNeeded();
  // 获取最近播放
  recentPlayStore.fetchRecentIfNeeded();
  // 获取用户歌单
  customStore.fetchUserPlaylistsIfNeeded();  
});
</script>

<style lang="scss">
@use './styles/music-grid.scss';
</style>