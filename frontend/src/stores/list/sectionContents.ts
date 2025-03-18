import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from '../user/user';
import * as favoriteApi from '../../api/favorite';
import * as sectionApi from '../../api/section';
import type { MediaItem, SectionContentState } from '../../types';

/**
 * @desc 分区内容状态管理
 */
export const useSectionContentsStore = defineStore('sectionContents', () => {
  // 用户状态
  const userStore = useUserStore();
  const isLoggedIn = computed(() => userStore.isLoggedIn);

  // 存储所有分区的收藏夹内容
  // 键为分区ID，值为该分区的收藏夹列表及状态
  const sectionContents = ref<Record<string, SectionContentState>>({});
  
  // 当前选中的分区ID
  const currentSectionId = ref<string | null>(null);
  
  // 获取当前分区的内容
  const currentSectionContent = computed(() => {
    if (!currentSectionId.value || !sectionContents.value[currentSectionId.value]) {
      return {
        favorites: [],
        loading: false,
        error: ''
      };
    }
    return sectionContents.value[currentSectionId.value];
  });
  
  /**
   * @desc 获取分区内容（收藏夹列表）
   * @param sectionId 分区ID
   */
  const fetchSectionContent = async (sectionId: string) => {
    if (!isLoggedIn.value) return;
    
    // 初始化或重置该分区的状态
    sectionContents.value[sectionId] = {
      favorites: [],
      loading: true,
      error: ''
    };
    
    currentSectionId.value = sectionId;
    
    try {
      // 获取分区内容
      const sectionContent = await sectionApi.getSectionContent(sectionId);
      
      // 如果分区没有收藏夹，直接返回
      if (!sectionContent || sectionContent.mediaIds.length === 0) {
        sectionContents.value[sectionId].loading = false;
        return;
      }
      
      // 获取分区内收藏夹信息
      const folderItems: MediaItem[] = [];
      
      // 对每个收藏夹ID单独获取信息
      for (const mediaId of sectionContent.mediaIds) {
        try {
          // 使用收藏夹API获取收藏夹信息
          const folderInfo = await favoriteApi.getFavoriteInfo({
            media_id: mediaId
          });
          
          if (folderInfo) {
            // 将收藏夹信息转换为MediaItem类型
            folderItems.push({
              id: folderInfo.id,
              title: folderInfo.title,
              cover: folderInfo.cover || '',
              bv_id: '', // 收藏夹没有bv_id
              bvid: '', // 收藏夹没有bvid
              cnt_info: {
                play: folderInfo.cnt_info?.play || 0,
                danmaku: 0,
                reply: 0,
                collect: folderInfo.cnt_info?.collect || 0, // 收藏数
                play_switch: 0,
                view_text_1: '',
                vt: 0
              },
              duration: 0, // 收藏夹没有时长
              pubtime: folderInfo.ctime || 0,
              media_count: folderInfo.media_count || 0,
              upper: {
                mid: folderInfo.upper?.mid || 0,
                name: folderInfo.upper?.name || '',
                face: folderInfo.upper?.face || ''
              }
            });
          }
        } catch (error) {
          console.error(`获取收藏夹 ${mediaId} 信息失败:`, error);
        }
      }
      
      // 更新该分区的收藏夹列表
      sectionContents.value[sectionId].favorites = folderItems;
      
    } catch (error) {
      sectionContents.value[sectionId].error = error instanceof Error ? error.message : '获取分区内容失败';
      console.error('获取分区内容失败:', error);
    } finally {
      sectionContents.value[sectionId].loading = false;
    }
  };
  
  /**
   * @desc 从URL中提取收藏夹ID
   * @param url 收藏夹URL
   * @returns 收藏夹ID
   */
  const extractFavoriteIdFromUrl = (url: string): number => {
    // 匹配 bilibili 收藏夹 URL 格式
    // 例如: https://space.bilibili.com/123456789/favlist?fid=123456789
    // 或者: https://www.bilibili.com/medialist/detail/ml123456789
    let match = url.match(/[?&]fid=(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    
    match = url.match(/\/medialist\/detail\/ml(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    
    // 尝试直接解析为数字
    const numericId = parseInt(url);
    if (!isNaN(numericId)) {
      return numericId;
    }
    
    return 0; // 无法提取有效ID
  };
  
  /**
   * @desc 重置状态
   */
  const reset = () => {
    sectionContents.value = {};
    currentSectionId.value = null;
  };
  
  return {
    // 状态
    sectionContents,
    currentSectionId,
    currentSectionContent,
    
    // 方法
    fetchSectionContent,
    extractFavoriteIdFromUrl,
    reset
  };
},{
  persist: true
});