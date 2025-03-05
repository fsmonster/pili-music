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
        <div class="music-item">
          <div class="cover">
            <img :src="loveCover" alt="最近播放">
            <div class="play-overlay">
              <i class="ri-play-circle-fill"></i>
            </div>
          </div>
          <div class="info">
            <div class="title">最近播放</div>
            <div class="count">{{ likedSongs.length }}首歌曲</div>
          </div>
        </div>
        <!-- 我喜欢的音乐 -->
        <div class="music-item">
          <div class="cover">
            <img :src="loveCover" alt="我喜欢的音乐">
            <div class="play-overlay">
              <i class="ri-play-circle-fill"></i>
            </div>
          </div>
          <div class="info">
            <div class="title">我的喜欢</div>
            <div class="count">{{ likedSongs.length }}首歌曲</div>
          </div>
        </div>
        <!-- 其他歌单 -->
        <div v-for="playlist in playlists" :key="playlist.id" class="music-item">
          <div class="cover">
            <img :src="playlist.cover" :alt="playlist.title">
            <div class="play-overlay">
              <i class="ri-play-circle-fill"></i>
            </div>
          </div>
          <div class="info">
            <div class="title">{{ playlist.title }}</div>
            <div class="count">{{ playlist.count }}首歌曲</div>
          </div>
        </div>
      </div>
    </template>

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
        <el-button type="primary" @click="saveNewPlaylist">创建</el-button>
      </template>
    </el-dialog>
  </ContentSection>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ContentSection from './ContentSection.vue';
import defaultCover from '@/assets/image/default_cover.avif';
import loveCover from '@/assets/image/love.avif';

// 假数据 - 喜欢的音乐
const likedSongs = ref([
  {
    id: 1,
    title: 'Sparkle',
    artist: 'RADWIMPS',
    cover: defaultCover,
  },
  {
    id: 2,
    title: '前前前世',
    artist: 'RADWIMPS',
    cover: defaultCover,
  },
]);

// 假数据 - 创建的歌单
const playlists = ref([
  {
    id: 1,
    title: '我的日语歌单',
    count: 25,
    cover: defaultCover,
  },
]);

// 创建歌单相关
const showCreateDialog = ref(false);
const newPlaylist = ref({
  title: '',
  description: '',
});

const createPlaylist = () => {
  showCreateDialog.value = true;
  newPlaylist.value = {
    title: '',
    description: '',
  };
};

const saveNewPlaylist = () => {
  // TODO: 实际保存歌单
  playlists.value.push({
    id: Date.now(),
    title: newPlaylist.value.title,
    count: 0,
    cover: defaultCover,
  });
  showCreateDialog.value = false;
};
</script>

<style lang="scss" scoped>
@use './styles/music-grid.scss';
</style>