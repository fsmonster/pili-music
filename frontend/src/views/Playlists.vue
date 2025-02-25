<template>
  <!-- 不用了，大部分东西在Home.vue显示 -->
  <div class="playlists">
    <el-row :gutter="20">
      <el-col v-for="playlist in playlists" :key="playlist.id" :span="6">
        <el-card :body-style="{ padding: '0px' }" class="playlist-card">
          <img :src="playlist.cover" class="cover" />
          <div class="info">
            <h3>{{ playlist.title }}</h3>
            <p>{{ playlist.count }} 个视频</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Playlist {
  id: string
  title: string
  cover: string
  count: number
}

const playlists = ref<Playlist[]>([])

// TODO: 获取收藏夹列表
const getPlaylists = async () => {
  try {
    // const response = await request.get('/playlists')
    // playlists.value = response.data
  } catch (error) {
    console.error('获取收藏夹列表失败:', error)
  }
}
</script>

<style scoped>
.playlists {
  padding: 20px;
}

.playlist-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.playlist-card:hover {
  transform: translateY(-5px);
}

.cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.info {
  padding: 14px;
}

.info h3 {
  margin: 0;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #909399;
}
</style>
