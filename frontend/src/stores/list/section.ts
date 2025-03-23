import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from '../user/user';
import * as sectionApi from '../../api/section';
import * as favoriteApi from '../../api/favorite';
import type { Section, SectionWithFavorites } from '../../types';

/**
 * 📦 自定义分区项目（包含 📂 收藏夹信息）
 * 📦 自定义分区 - 用户创建的分类，用于组织 📂 收藏夹
 * 📂 收藏夹 - B站的收藏夹，包含多个 🎵 媒体
 * 🎵 媒体 - 具体的视频/音频内容
 */

/**
 * @desc 📦 自定义分区状态管理
 */
export const useSectionStore = defineStore('section', () => {
  // 用户状态
  const userStore = useUserStore();
  const isLoggedIn = computed(() => userStore.isLoggedIn);
  
  // 📦 自定义分区特有状态
  const sections = ref<SectionWithFavorites[]>([]);
  const isLoaded = ref(false);
  
  /**
   * @desc 获取用户所有 📦 自定义分区
   */
  const fetchSections = async () => {
    if (!isLoggedIn.value) return;
    
    try {
      // 获取分区列表
      const sectionList = await sectionApi.getUserSections();
      
      // 转换为内部格式并初始化 media_count 为 mediaIds 的长度
      sections.value = sectionList.map(section => ({
        ...section,
        name: section.name,
        media_count: section.mediaIds.length,
        favorites: [] // 添加空的 favorites 数组
      }));
      
      isLoaded.value = true;
    } catch (error) {
      console.error('获取分区列表失败:', error);
    }
  };
  
  /**
   * @desc 获取 📦 分区内容（📂 收藏夹 列表）
   * @param sectionId 分区 ID
   * @param sectionData 可选的分区数据，如果提供则不会重复请求
   * @returns 收藏夹ID列表
   */
  const fetchSectionContent = async (sectionId: string, sectionData?: Section) => {
    if (!isLoggedIn.value) return [];
    
    try {
      // 首先检查持久化的 sections 中是否已有该分区的收藏夹信息
      const existingSection = sections.value.find(s => s._id === sectionId);
      if (existingSection && existingSection.favorites && existingSection.favorites.length > 0) {
        console.log('使用缓存的收藏夹信息:', existingSection.favorites);
        return existingSection.favorites;
      }
      
      // 获取分区基本信息（如果没有提供）
      const section = sectionData || await sectionApi.getSectionById(sectionId);
      
      // 获取收藏夹基本信息
      const favoriteIds = section.mediaIds;
      const favorites: SectionWithFavorites['favorites'] = [];
      
      // 直接获取收藏夹信息
      for (const id of favoriteIds) {
        try {
          // 获取收藏夹基本信息
          const favoriteInfo = await favoriteApi.getFavoriteInfo({ media_id: id });
          if (favoriteInfo) {
            favorites.push(favoriteInfo);
          }
        } catch (error) {
          console.error(`获取收藏夹 ${id} 信息失败:`, error);
        }
      }
      
      // 更新持久化的 sections 数据
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        sections.value[index] = {
          ...sections.value[index],
          favorites
        };
      }
      
      return favorites;
    } catch (error) {
      console.error('获取分区内容失败:', error);
      throw error;
    }
  };
  
  /**
   * @desc 创建 📦 自定义分区
   * @param name 分区名称
   * @param description 分区描述
   * @returns 创建的分区
   */
  const createSection = async (name: string, description: string = '') => {
    try {
      // 创建分区
      const newSection = await sectionApi.createSection({
        name,
        description
      });
      
      // 添加到列表
      sections.value.push({
        ...newSection,
        name: newSection.name,
        media_count: 0,
        favorites: [] // 添加空的 favorites 数组
      });
      
      return newSection;
    } catch (error) {
      console.error('创建分区失败:', error);
      throw error;
    }
  };
  
  /**
   * @desc 更新 📦 自定义分区
   * @param sectionId 分区ID
   * @param name 分区名称
   * @param description 分区描述
   * @returns 更新后的分区
   */
  const updateSection = async (sectionId: string, name: string, description: string) => {
    try {
      // 更新分区
      const updatedSection = await sectionApi.updateSection(sectionId, {
        name,
        description
      });
      
      // 更新列表中的分区
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        sections.value[index] = {
          ...updatedSection,
          name: updatedSection.name,
          media_count: updatedSection.mediaIds.length,
          favorites: sections.value[index].favorites || [] // 保留原有的 favorites 或使用空数组
        };
      }
      return updatedSection;
    } catch (error) {
      console.error('更新分区失败:', error);
      throw error;
    }
  };
  
  /**
   * @desc 删除 📦 自定义分区
   * @param sectionId 分区ID
   */
  const deleteSection = async (sectionId: string) => {
    try {
      // 删除分区
      await sectionApi.deleteSection(sectionId);
      
      // 从列表中移除
      sections.value = sections.value.filter(s => s._id !== sectionId);
    } catch (error) {
      console.error('删除分区失败:', error);
      throw error;
    }
  };
  
  /**
   * @desc 添加 📂 收藏夹到 📦 自定义分区
   * @param sectionId 分区ID
   * @param mediaIds 收藏夹ID列表
   * @returns 更新后的分区
   */
  const addMediaToSection = async (sectionId: string, mediaIds: number[]) => {
    try {
      // 添加收藏夹到分区
      const updatedSection = await sectionApi.addMediaToSection(sectionId, mediaIds);
      
      // 更新列表中的分区
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        const updatedSectionData = {
          ...updatedSection,
          name: updatedSection.name,
          media_count: updatedSection.mediaIds.length,
          favorites: sections.value[index].favorites || [] // 保留原有的 favorites 或使用空数组
        };
        sections.value[index] = updatedSectionData;
      }
      return updatedSection;
    } catch (error) {
      console.error('添加收藏夹到分区失败:', error);
      throw error;
    }
  };
  
  /**
   * @desc 从 📦 自定义分区移除 📂 收藏夹
   * @param sectionId 分区ID
   * @param mediaIds 收藏夹ID列表
   * @returns 更新后的分区
   */
  const removeMediaFromSection = async (sectionId: string, mediaIds: number[]) => {
    try {
      // 从分区移除收藏夹
      const updatedSection = await sectionApi.removeMediaFromSection(sectionId, mediaIds);
      
      // 更新列表中的分区
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        const updatedSectionData = {
          ...updatedSection,
          name: updatedSection.name,
          media_count: updatedSection.mediaIds.length,
          favorites: sections.value[index].favorites || [] // 保留原有的 favorites 或使用空数组
        };
        sections.value[index] = updatedSectionData;
      }
      return updatedSection;
    } catch (error) {
      console.error('从分区移除收藏夹失败:', error);
      throw error;
    }
  };
  
  /**
   * @desc 清空 📦 自定义分区内容
   * @param sectionId 分区ID
   * @returns 更新后的分区
   */
  const clearSectionMedia = async (sectionId: string) => {
    try {
      // 清空分区
      const updatedSection = await sectionApi.clearSectionMedia(sectionId);
      
      // 更新列表中的分区
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        sections.value[index] = {
          ...updatedSection,
          name: updatedSection.name,
          media_count: 0,
          favorites: [] // 清空 favorites 数组
        };
      }
      
      return updatedSection;
    } catch (error) {
      console.error('清空分区失败:', error);
      throw error;
    }
  };

  /**
   * @desc 刷新自定义分区列表
   */
  const refreshSections = async () => {
    isLoaded.value = false;
    await fetchSections();
  };
  
  /**
   * @desc 获取用户所有 📦 自定义分区（如果未加载）
   */
  const fetchSectionsIfNeeded = async () => {
    if (isLoggedIn.value && !isLoaded.value) {
      await fetchSections();
    }
  };
  
  /**
   * @desc 重置状态
   */
  const reset = () => {
    sections.value = [];
    isLoaded.value = false;
  };
  
  return {
    // 📦 自定义分区特有状态
    sections,
    isLoaded,
    
    // 方法
    fetchSections,
    fetchSectionContent,
    createSection,
    updateSection,
    deleteSection,
    addMediaToSection,
    removeMediaFromSection,
    clearSectionMedia,
    fetchSectionsIfNeeded,
    refreshSections,
    reset
  };
}, {
  persist: true
});