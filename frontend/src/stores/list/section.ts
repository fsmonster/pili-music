import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from '../user/user';
import * as sectionApi from '../../api/section';
import * as favoriteApi from '../../api/favorite';
import * as seasonApi from '../../api/season';
import * as seriesApi from '../../api/series';
import type { Section, CollocationType } from '../../types';

/**
 * 📦 自定义分区 - 用户创建的，用于组织收藏夹 合集 系列
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
  const sections = ref<Section[]>([]);
  const isLoaded = ref(false);
  
  /**
   * @desc 获取用户所有 📦 自定义分区
   */
  const fetchSections = async () => {
    if (!isLoggedIn.value) return;
    
    try {
      // 获取分区列表
      const sectionList = await sectionApi.getUserSections();
      
      // 转换为内部格式并初始化 collocation_count 为 collocationIds 的长度
      sections.value = sectionList.map(section => ({
        ...section,
        name: section.name,
        collocationIds: section.collocationIds,
        // collocationList: section.collocationList,
        collocation_count: section.collocationIds.length,
      }));
      
      isLoaded.value = true;
    } catch (error) {
      console.error('获取分区列表失败:', error);
    }
  };
  
  /**
   * @desc 获取 📦 分区内容
   * @param sectionId 分区 ID
   * @param sectionData 可选的分区数据，如果提供则不会重复请求
   * @returns 资源项列表
   */
  const fetchSectionContent = async (sectionId: string, sectionData?: Section) => {
    if (!isLoggedIn.value) return [];
    
    try {
      // 首先检查持久化的 sections 中是否已有该分区的资源项信息
      const existingSection = sections.value.find(s => s._id === sectionId);
      if (existingSection && existingSection.collocationList && existingSection.collocationList.length > 0) {
        console.log('使用缓存的资源项信息:', existingSection.collocationList);
        return existingSection.collocationList;
      }
      
      // 获取分区基本信息（如果没有提供）
      const section = sectionData || await sectionApi.getSectionById(sectionId);
      
      // 获取资源项基本信息
      const collocationIds = section.collocationIds;
      const collocationList = section.collocationList || [];
      
      // 直接获取资源项信息
      for (const collocationId of collocationIds) {
        try {
          if (collocationId.type === 'favorite') {
            // 获取收藏夹基本信息
            const favoriteInfo = await favoriteApi.getFavoriteInfo({ media_id: collocationId.id });
            if (favoriteInfo) {
              collocationList.push({ type: 'favorite', favoriteInfo });
            }
          } else if (collocationId.type === 'season') {
            // 获取季信息
            const seasonInfo = await seasonApi.getSeasonMeta(collocationId.id);
            if (seasonInfo) {
              collocationList.push({ type: 'season', seasonInfo });
            }
          } else if (collocationId.type === 'series') {
            // 获取系列信息
            const seriesInfo = await seriesApi.getSeriesMeta(collocationId.id);
            seriesInfo.cover = seriesInfo.cover ?? (await seriesApi.getSeriesCover(collocationId.id, seriesInfo.mid));
            if (seriesInfo) {
              collocationList.push({ type: 'series', seriesInfo });
            }
          }
        } catch (error) {
          console.error(`获取资源项 ${collocationId.id} 信息失败:`, error);
        }
      }
      
      // 更新持久化的 sections 数据
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        sections.value[index] = {
          ...sections.value[index],
          collocationList
        };
      }
      
      return collocationList;
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
        collocation_count: 0,
        collocationIds: [],
        collocationList: [] // 添加空的 collocationList 数组
      });
      
      return newSection;
    } catch (error) {
      console.error('创建分区失败:', error);
      throw error;
    }
  };
  
  /**
   * @desc 更新 📦 自定义分区 - 暂时没用到
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
          collocation_count: updatedSection.collocationIds.length,
          collocationIds: updatedSection.collocationIds,
          // collocationList: updatedSection.collocationList
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
   * @desc 添加资源到 📦 自定义分区
   * @param sectionId 分区ID
   * @param type 资源类型
   * @param collocationId 资源ID
   * @returns 更新后的分区
   */
  const addCollocationToSection = async (sectionId: string, type: CollocationType, collocationId: number) => {
    try {
      // 添加资源到分区
      const updatedSection = await sectionApi.addCollocationToSection(sectionId, type, collocationId);
      
      // 更新列表中的分区
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        const updatedSectionData = {
          ...updatedSection,
          name: updatedSection.name,
          collocation_count: updatedSection.collocationIds.length,
          collocationIds: updatedSection.collocationIds,
          // collocationList: updatedSection.collocationList
        };
        sections.value[index] = updatedSectionData;
      }
      return updatedSection;
    } catch (error) {
      console.error('添加资源到分区失败:', error);
      throw error;
    }
  };
  
  /**
   * @desc 从 📦 自定义分区移除
   * @param sectionId 分区ID
   * @param type 资源类型
   * @param collocationId 资源ID
   * @returns 更新后的分区
   */
  const removeCollocationFromSection = async (sectionId: string, type: CollocationType, collocationId: number) => {
    try {
      // 从分区移除资源
      const updatedSection = await sectionApi.removeCollocationFromSection(sectionId, type,collocationId);
      
      // 更新列表中的分区
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        const updatedSectionData = {
          ...updatedSection,
          name: updatedSection.name,
          collocation_count: updatedSection.collocationIds.length,
          collocationIds: updatedSection.collocationIds,
          // collocationList: updatedSection.collocationList
        };
        sections.value[index] = updatedSectionData;
      }
      return updatedSection;
    } catch (error) {
      console.error('从分区移除资源失败:', error);
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
      const updatedSection = await sectionApi.clearSectionCollocations(sectionId);
      
      // 更新列表中的分区
      const index = sections.value.findIndex(s => s._id === sectionId);
      if (index !== -1) {
        sections.value[index] = {
          ...updatedSection,
          name: updatedSection.name,
          collocation_count: 0,
          collocationIds: [],
          // collocationList: []
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
    addCollocationToSection,
    removeCollocationFromSection,
    clearSectionMedia,
    fetchSectionsIfNeeded,
    refreshSections,
    reset
  };
}, {
  persist: true
});