/**
 * 自定义播放列表状态管理
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CustomPlaylist, MediaItem, CreatePlaylistParams, UpdatePlaylistParams } from '../../types';
import * as playlistApi from '../../api';

export const usePlaylistStore = defineStore('customPlaylist', () => {
  // 状态
  const playlists = ref<CustomPlaylist[]>([]);
  const currentPlaylist = ref<CustomPlaylist | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 获取用户的所有自建歌单
  async function fetchUserPlaylists() {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await playlistApi.getUserPlaylists();
      playlists.value = data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取歌单失败';
      console.error('获取歌单失败:', err);
    } finally {
      loading.value = false;
    }
  }

  // 获取单个歌单详情
  async function fetchPlaylistById(playlistId: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await playlistApi.getPlaylistById(playlistId);
      currentPlaylist.value = data;
      
      // 更新本地缓存的歌单列表
      const index = playlists.value.findIndex(p => p._id === playlistId);
      if (index !== -1) {
        playlists.value[index] = data;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取歌单详情失败';
      console.error('获取歌单详情失败:', err);
    } finally {
      loading.value = false;
    }
  }

  // 创建新歌单
  async function createPlaylist(playlistData: CreatePlaylistParams) {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await playlistApi.createPlaylist(playlistData);
      playlists.value.unshift(data); // 添加到列表开头
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建歌单失败';
      console.error('创建歌单失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 更新歌单信息
  async function updatePlaylist(playlistId: string, updateData: UpdatePlaylistParams) {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await playlistApi.updatePlaylist(playlistId, updateData);
      
      // 更新本地缓存
      const index = playlists.value.findIndex(p => p._id === playlistId);
      if (index !== -1) {
        playlists.value[index] = data;
      }
      
      // 如果正在查看该歌单，也更新当前歌单
      if (currentPlaylist.value && currentPlaylist.value._id === playlistId) {
        currentPlaylist.value = data;
      }
      
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新歌单失败';
      console.error('更新歌单失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 删除歌单
  async function deletePlaylist(playlistId: string) {
    loading.value = true;
    error.value = null;
    
    try {
      await playlistApi.deletePlaylist(playlistId);
      
      // 从本地缓存中移除
      playlists.value = playlists.value.filter(p => p._id !== playlistId);
      
      // 如果正在查看该歌单，清空当前歌单
      if (currentPlaylist.value && currentPlaylist.value._id === playlistId) {
        currentPlaylist.value = null;
      }
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除歌单失败';
      console.error('删除歌单失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 向歌单添加媒体
  async function addMediaToPlaylist(playlistId: string, mediaItem: MediaItem) {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await playlistApi.addMediaToPlaylist(playlistId, mediaItem);
      
      // 更新本地缓存
      const index = playlists.value.findIndex(p => p._id === playlistId);
      if (index !== -1) {
        playlists.value[index] = data;
      }
      
      // 如果正在查看该歌单，也更新当前歌单
      if (currentPlaylist.value && currentPlaylist.value._id === playlistId) {
        currentPlaylist.value = data;
      }
      
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加媒体到歌单失败';
      console.error('添加媒体到歌单失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 从歌单移除媒体
  async function removeMediaFromPlaylist(playlistId: string, bvid: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await playlistApi.removeMediaFromPlaylist(playlistId, bvid);
      
      // 更新本地缓存
      const index = playlists.value.findIndex(p => p._id === playlistId);
      if (index !== -1) {
        playlists.value[index] = data;
      }
      
      // 如果正在查看该歌单，也更新当前歌单
      if (currentPlaylist.value && currentPlaylist.value._id === playlistId) {
        currentPlaylist.value = data;
      }
      
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '从歌单移除媒体失败';
      console.error('从歌单移除媒体失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 设置当前歌单
  function setCurrentPlaylist(playlist: CustomPlaylist | null) {
    currentPlaylist.value = playlist;
  }

  return {
    // 状态
    playlists,
    currentPlaylist,
    loading,
    error,
    
    // 计算属性
    playlistCount: computed(() => playlists.value.length),
    
    // 方法
    fetchUserPlaylists,
    fetchPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addMediaToPlaylist,
    removeMediaFromPlaylist,
    setCurrentPlaylist,
  };
});
