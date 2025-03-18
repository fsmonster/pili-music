import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from '../user/user';
import { createBaseListStore } from './baseList';
import * as sectionApi from '../../api/section';
import * as favoriteApi from '../../api/favorite';
import type { Section, SectionContent } from '../../types';
import type { MediaItem } from '../../types';

/**
 * 📦 自定义分区项目（包含 📂 收藏夹信息）
 * 📦 自定义分区 - 用户创建的分类，用于组织 📂 收藏夹
 * 📂 收藏夹 - B站的收藏夹，包含多个 🎵 媒体
 * 🎵 媒体 - 具体的视频/音频内容
 */
interface SectionWithInfo extends Section {
  cover?: string;
  title?: string;
  media_count?: number;
}

/**
 * @desc 📦 自定义分区状态管理
 */
export const useSectionStore = defineStore('section', () => {
  // 用户状态
  const userStore = useUserStore();
  const isLoggedIn = computed(() => userStore.isLoggedIn);

  // 基础 🎵 媒体列表功能
  const baseList = createBaseListStore();
  
  // 📦 自定义分区特有状态
  const sections = ref<SectionWithInfo[]>([]);
  const currentSection = ref<SectionWithInfo | null>(null);
  const currentSectionId = ref<string | null>(null);
  const isLoaded = ref(false);
  
  // 存储分区内容
  const sectionContents = ref<Record<string, SectionContent>>({});
  
  /**
   * @desc 获取用户所有 📦 自定义分区
   */
  const fetchSections = async () => {
    if (!isLoggedIn.value) return;
    
    baseList.loading.value = true;
    baseList.error.value = '';
    
    try {
      // 获取分区列表
      const sectionList = await sectionApi.getUserSections();
      
      // 转换为内部格式并初始化 media_count 为 0
      // 实际的 media_count 需要在获取分区内容后更新
      sections.value = sectionList.map(section => ({
        ...section,
        title: section.name,
        media_count: 0
      }));
      
      // 获取每个分区的内容以更新 media_count
      for (const section of sections.value) {
        try {
          const content = await sectionApi.getSectionContent(section._id);
          sectionContents.value[section._id] = content;
          section.media_count = content.mediaIds.length;
        } catch (error) {
          console.error(`获取分区 ${section._id} 内容失败:`, error);
        }
      }
      
      isLoaded.value = true;
    } catch (error) {
      baseList.error.value = error instanceof Error ? error.message : '获取分区列表失败';
      console.error('获取分区列表失败:', error);
    } finally {
      baseList.loading.value = false;
    }
  };
  
  /**
   * @desc 获取 📦 分区内容（📂 收藏夹 列表）
   * @param sectionId 分区 ID
   */
  const fetchSectionContent = async (sectionId: string) => {
    if (!isLoggedIn.value) return;
    
    baseList.loading.value = true;
    baseList.error.value = '';
    baseList.items.value = []; // 清空当前列表
    currentSectionId.value = sectionId;
    
    try {
      // 获取分区基本信息
      const section = await sectionApi.getSectionById(sectionId);
      
      // 获取分区内容
      const content = await sectionApi.getSectionContent(sectionId);
      sectionContents.value[sectionId] = content;
      
      // 更新当前分区信息
      currentSection.value = {
        ...section,
        title: section.name,
        media_count: content.mediaIds.length
      };
      
      // 如果分区没有 📂 收藏夹，直接返回
      if (content.mediaIds.length === 0) {
        baseList.loading.value = false;
        return;
      }
      
      // 获取分区内 📂 收藏夹 信息
      const folderItems: MediaItem[] = [];
      
      // 对每个收藏夹ID单独获取信息
      for (const mediaId of content.mediaIds) {
        try {
          // 使用 📂 收藏夹 API 获取 📂 收藏夹 信息
          const folderInfo = await favoriteApi.getFavoriteInfo({
            media_id: mediaId
          });
          
          if (folderInfo) {
            // 将收藏夹信息转换为 MediaItem 类型
            // 注意：收藏夹和视频是不同的类型，这里我们只保留必要的字段
            folderItems.push({
              id: folderInfo.id,
              title: folderInfo.title,
              cover: folderInfo.cover || '',
              bv_id: '', // 收藏夹没有 bv_id
              bvid: '', // 收藏夹没有 bvid
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
      
      // 更新收藏夹列表
      baseList.setItems(folderItems);
      
    } catch (error) {
      baseList.error.value = error instanceof Error ? error.message : '获取分区内容失败';
      console.error('获取分区内容失败:', error);
    } finally {
      baseList.loading.value = false;
    }
  };
  
  /**
   * @desc 获取指定分区详情
   * @param sectionId 分区ID
   * @returns 分区详情
   */
  const getSectionById = async (sectionId: string) => {
    try {
      // 先检查缓存中是否有该分区
      const cachedSection = sections.value.find(s => s._id === sectionId);
      if (cachedSection) {
        return cachedSection;
      }
      
      // 如果缓存中没有，则从服务器获取
      const section = await sectionApi.getSectionById(sectionId);
      
      // 获取分区内容以更新 media_count
      try {
        const content = await sectionApi.getSectionContent(sectionId);
        sectionContents.value[sectionId] = content;
        return {
          ...section,
          title: section.name,
          media_count: content.mediaIds.length
        };
      } catch (error) {
        console.error(`获取分区 ${sectionId} 内容失败:`, error);
        return {
          ...section,
          title: section.name,
          media_count: 0
        };
      }
    } catch (error) {
      console.error('获取分区详情失败:', error);
      throw error;
    }
  };
  
  /**
   * @desc 创建新 📦 分区
   * @param name 分区名称
   * @param description 分区描述
   */
  const createSection = async (name: string, description: string = '') => {
    if (!isLoggedIn.value) return;
    
    baseList.loading.value = true;
    baseList.error.value = '';
    
    try {
      const newSection = await sectionApi.createSection({ name, description });
      
      // 添加到分区列表
      sections.value.push({
        ...newSection,
        title: newSection.name,
        media_count: 0
      });
      
      return newSection;
    } catch (error) {
      baseList.error.value = error instanceof Error ? error.message : '创建分区失败';
      console.error('创建分区失败:', error);
      throw error;
    } finally {
      baseList.loading.value = false;
    }
  };
  
  /**
   * @desc 更新 📦 分区信息
   * @param sectionId 分区 ID
   * @param name 分区名称
   * @param description 分区描述
   */
  const updateSection = async (sectionId: string, name?: string, description?: string) => {
    if (!isLoggedIn.value) return;
    
    baseList.loading.value = true;
    baseList.error.value = '';
    
    try {
      // 构建更新参数
      const updateParams: { name?: string; description?: string } = {};
      if (name !== undefined) updateParams.name = name;
      if (description !== undefined) updateParams.description = description;
      
      // 更新分区
      const updatedSection = await sectionApi.updateSection(sectionId, updateParams);
      
      // 更新本地缓存
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        // 保留原有的 media_count
        const mediaCount = sections.value[index].media_count || 0;
        
        sections.value[index] = {
          ...updatedSection,
          title: updatedSection.name,
          media_count: mediaCount
        };
      }
      
      // 如果更新的是当前分区，也更新 currentSection
      if (currentSectionId.value === sectionId && currentSection.value) {
        currentSection.value = {
          ...updatedSection,
          title: updatedSection.name,
          media_count: currentSection.value.media_count || 0
        };
      }
      
      return updatedSection;
    } catch (error) {
      baseList.error.value = error instanceof Error ? error.message : '更新分区失败';
      console.error('更新分区失败:', error);
      throw error;
    } finally {
      baseList.loading.value = false;
    }
  };
  
  /**
   * @desc 删除 📦 分区
   * @param sectionId 分区 ID
   */
  const deleteSection = async (sectionId: string) => {
    if (!isLoggedIn.value) return;
    
    baseList.loading.value = true;
    baseList.error.value = '';
    
    try {
      // 删除分区
      await sectionApi.deleteSection(sectionId);
      
      // 从本地缓存中移除
      sections.value = sections.value.filter(s => s._id !== sectionId);
      
      // 如果删除的是当前分区，重置当前分区
      if (currentSectionId.value === sectionId) {
        currentSectionId.value = null;
        currentSection.value = null;
        baseList.items.value = [];
      }
      
      // 从分区内容缓存中移除
      if (sectionContents.value[sectionId]) {
        delete sectionContents.value[sectionId];
      }
      
      return true;
    } catch (error) {
      baseList.error.value = error instanceof Error ? error.message : '删除分区失败';
      console.error('删除分区失败:', error);
      throw error;
    } finally {
      baseList.loading.value = false;
    }
  };
  
  /**
   * @desc 添加 📂 收藏夹 到 📦 分区
   * @param sectionId 分区 ID
   * @param folderIds 📂 收藏夹 ID 列表
   */
  const addMediaToSection = async (sectionId: string, folderIds: number[]) => {
    if (!isLoggedIn.value || !folderIds.length) return;
    
    baseList.loading.value = true;
    baseList.error.value = '';
    
    try {
      // 添加收藏夹到分区
      const updatedContent = await sectionApi.addMediaToSection(sectionId, folderIds);
      
      // 更新本地缓存
      sectionContents.value[sectionId] = updatedContent;
      
      // 更新分区的 media_count
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        sections.value[index].media_count = updatedContent.mediaIds.length;
      }
      
      // 如果添加到当前分区，刷新分区内容
      if (currentSectionId.value === sectionId) {
        await fetchSectionContent(sectionId);
      }
      
      return updatedContent;
    } catch (error) {
      baseList.error.value = error instanceof Error ? error.message : '添加收藏夹失败';
      console.error('添加收藏夹失败:', error);
      throw error;
    } finally {
      baseList.loading.value = false;
    }
  };
  
  /**
   * @desc 从 📦 分区 移除 📂 收藏夹
   * @param sectionId 分区 ID
   * @param folderIds 📂 收藏夹 ID 列表
   */
  const removeMediaFromSection = async (sectionId: string, folderIds: number[]) => {
    if (!isLoggedIn.value || !folderIds.length) return;
    
    baseList.loading.value = true;
    baseList.error.value = '';
    
    try {
      // 从分区移除收藏夹
      const updatedContent = await sectionApi.removeMediaFromSection(sectionId, folderIds);
      
      // 更新本地缓存
      sectionContents.value[sectionId] = updatedContent;
      
      // 更新分区的 media_count
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        sections.value[index].media_count = updatedContent.mediaIds.length;
      }
      
      // 如果从当前分区移除，更新当前分区的 media_count
      if (currentSectionId.value === sectionId && currentSection.value) {
        currentSection.value.media_count = updatedContent.mediaIds.length;
        
        // 从当前列表中移除
        baseList.items.value = baseList.items.value.filter(
          item => !folderIds.includes(Number(item.id))
        );
      }
      
      return updatedContent;
    } catch (error) {
      baseList.error.value = error instanceof Error ? error.message : '移除收藏夹失败';
      console.error('移除收藏夹失败:', error);
      throw error;
    } finally {
      baseList.loading.value = false;
    }
  };
  
  /**
   * @desc 清空 📦 分区 内的所有 📂 收藏夹
   * @param sectionId 分区 ID
   */
  const clearSectionMedia = async (sectionId: string) => {
    if (!isLoggedIn.value) return;
    
    baseList.loading.value = true;
    baseList.error.value = '';
    
    try {
      // 清空分区内的所有收藏夹
      const updatedContent = await sectionApi.clearSectionMedia(sectionId);
      
      // 更新本地缓存
      sectionContents.value[sectionId] = updatedContent;
      
      // 更新分区的 media_count
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        sections.value[index].media_count = 0;
      }
      
      // 如果清空当前分区，更新当前分区的 media_count 并清空列表
      if (currentSectionId.value === sectionId && currentSection.value) {
        currentSection.value.media_count = 0;
        baseList.items.value = [];
      }
      
      return updatedContent;
    } catch (error) {
      baseList.error.value = error instanceof Error ? error.message : '清空分区失败';
      console.error('清空分区失败:', error);
      throw error;
    } finally {
      baseList.loading.value = false;
    }
  };
  
  /**
   * @desc 如果需要，获取 📦 分区 列表
   */
  const fetchSectionsIfNeeded = async () => {
    if (!isLoaded.value && isLoggedIn.value) {
      await fetchSections();
    }
  };
  
  /**
   * @desc 重置状态
   */
  const reset = () => {
    sections.value = [];
    currentSection.value = null;
    currentSectionId.value = null;
    isLoaded.value = false;
    sectionContents.value = {};
    baseList.reset();
  };
  
  return {
    ...baseList, // 导出基础列表功能
    
    // 📦 自定义分区特有状态
    sections,
    currentSection,
    currentSectionId,
    isLoaded,
    sectionContents,
    
    // 方法
    fetchSections,
    fetchSectionContent,
    getSectionById,
    createSection,
    updateSection,
    deleteSection,
    addMediaToSection,
    removeMediaFromSection,
    clearSectionMedia,
    fetchSectionsIfNeeded,
    reset
  };
},{
  persist: true
});
