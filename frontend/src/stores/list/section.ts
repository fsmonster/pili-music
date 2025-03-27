import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from '../user/user';
import * as sectionApi from '../../api/section';
import * as favoriteApi from '../../api/favorite';
import * as seasonApi from '../../api/season';
import * as seriesApi from '../../api/series';
import type { Section, CollocationType, CollocationItem } from '../../types';
import { getCollocationId } from '../../utils';

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

  // 📦 获取指定分区
  const currentSection = (section_id: string) => sections.value.find(section => section._id === section_id);
  const currentIndex = (section_id: string) => sections.value.findIndex(section => section._id === section_id);
  
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
        collocation_count: section.collocationIds.length,
      }));
      
      isLoaded.value = true;
      
      // 并行加载所有分区内容
      await Promise.all(sections.value.map(section => fetchSectionContent(section._id)));
    } catch (error) {
      console.error('获取分区列表失败:', error);
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

  // 获取 📦 资源项
  const fetchCollocationItem = async (type: string, id: number): Promise<CollocationItem | null> => {
    let collocationItem: CollocationItem | null = null;

    if (type === 'favorite') {
      const favoriteInfo = await favoriteApi.getFavoriteInfo(id);
      if (favoriteInfo) {
        collocationItem = { type: 'favorite', favoriteInfo };
      }
    } else if (type === 'season') {
      const seasonInfo = await seasonApi.getSeasonMeta(id);
      // 如果是默认封面，获取合集第一个视频的cover - page_num: 1, page_size: 1
      // https://s1.hdslb.com/bfs/templar/york-static/viedeo_material_default.png
      seasonInfo.cover = seasonInfo.cover.includes('viedeo_material_default.png') ? (await seasonApi.getSeasonCover(id)) : seasonInfo.cover;
      if (seasonInfo) {
        collocationItem = { type: 'season', seasonInfo };
      }
    } else if (type === 'series') {
      const seriesInfo = await seriesApi.getSeriesMeta(id);
      if (seriesInfo) {
        seriesInfo.cover = seriesInfo.cover ?? (await seriesApi.getSeriesCover(id, seriesInfo.mid));
        collocationItem = { type: 'series', seriesInfo };
      }
    }

    return collocationItem;
  };

  /**
   * @desc 获取 📦 分区内容
   * @param sectionId 分区 ID
   * @returns 资源项列表
   */
  const fetchSectionContent = async (sectionId: string) => {
  if (!isLoggedIn.value) return [];

  try {
    // 获取分区基本信息
    const section = await sectionApi.getSectionById(sectionId);

    // 获取已有的 collocationList
    const existingCollocationList = currentSection(sectionId)?.collocationList ?? [];

    // 计算需要请求的 collocationIds（排除已存在的）
    const existingIdsSet = new Set(existingCollocationList.map(c => `${c.type}-${getCollocationId(c)}`));

    const collocationList: CollocationItem[] = [...existingCollocationList]; // 先填充已有数据

    // 使用 Promise.all 并行加载所有资源
    const collocationPromises = section.collocationIds
      .filter(collocationId => !existingIdsSet.has(`${collocationId.type}-${collocationId.id}`)) // 过滤掉已存在的资源
      .map(async (collocationId) => {
        try {
          return await fetchCollocationItem(collocationId.type, collocationId.id);
        } catch (error) {
          console.error(`获取资源项 ${collocationId.id} 信息失败:`, error);
          return null;
        }
      });

    // 等待所有请求完成并过滤掉 null 值
    const newCollocationItems = (await Promise.all(collocationPromises)).filter(item => item !== null) as CollocationItem[];
    collocationList.push(...newCollocationItems);

    // 更新 sections 数据
    const index = currentIndex(sectionId);
    if (index !== -1) {
      sections.value[index].collocationList = collocationList;
    }
  } catch (error) {
    console.error('获取分区内容失败:', error);
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
      const updatedCollocationIds = await sectionApi.addCollocationToSection({sectionId, type, collocationId});
      
      // 更新列表中的分区
      const index = currentIndex(sectionId);
      if (index !== -1) {
        // 更新 collocationIds
        sections.value[index].collocationIds = updatedCollocationIds;
        sections.value[index].collocation_count = updatedCollocationIds.length;
        
        // 检查是否已存在该资源
        const existingCollocationList = sections.value[index].collocationList || [];
        const existingIdsSet = new Set(existingCollocationList.map(c => `${c.type}-${getCollocationId(c)}`));
        
        // 如果资源不存在，则获取并添加到 collocationList
        if (!existingIdsSet.has(`${type}-${collocationId}`)) {
          // 获取资源项信息
          const collocationItem = await fetchCollocationItem(type, collocationId);
          
          // 如果获取成功，添加到列表
          if (collocationItem) {
            if (!sections.value[index].collocationList) {
              sections.value[index].collocationList = [];
            }
            sections.value[index].collocationList.push(collocationItem);
          }
        }
      }
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
      const updatedCollocationIds = await sectionApi.removeCollocationFromSection({sectionId, type,collocationId});
      
      // 更新列表中的分区
      const index = currentIndex(sectionId);
      if (index !== -1) {
        // 更新 collocationIds
        sections.value[index].collocationIds = updatedCollocationIds;
        sections.value[index].collocation_count = updatedCollocationIds.length;
        
        // 同时更新 collocationList，移除对应的项
        if (sections.value[index].collocationList) {
          sections.value[index].collocationList = sections.value[index].collocationList.filter(item => {
            // 如果类型不同，保留
            if (item.type !== type) return true;
            
            // 如果类型相同，检查 ID 是否匹配
            const itemId = getCollocationId(item);
            return itemId !== collocationId;
          });
        }
      }
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
      const index = currentIndex(sectionId);
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
    currentIndex,
    currentSection,
    fetchSections,
    fetchSectionContent,
    createSection,
    updateSection,
    deleteSection,
    addCollocationToSection,
    removeCollocationFromSection,
    clearSectionMedia,
    fetchSectionsIfNeeded,
    reset
  };
}, {
  persist: true
});