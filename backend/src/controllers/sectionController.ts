import { Section as SectionModel } from '../models/section.js';
import { Section, 
  CollocationType, 
  SectionParams, 
  UpdateSectionParams, 
  CollocationParams } from '../types/section.js';

/**
 * @desc 获取用户所有自定义分区
 * @param {number} mid - 用户ID
 * @returns {Promise<Section[]>} 自定义分区列表
 */
export const getUserSections = async (mid: number): Promise<Section[]> => {
  try {
    // 获取用户所有自定义分区
    const sections = await SectionModel.find({ mid });
    return sections;
  } catch (error) {
    console.error('获取用户自定义分区失败:', error);
    throw new Error('获取用户自定义分区失败');
  }
};

/**
 * @desc 获取指定自定义分区
 * @param {number} mid - 用户ID
 * @param {string} sectionId - 分区ID
 * @returns {Promise<Section>} 分区信息
 */
export const getSectionById = async (mid: number, sectionId: string): Promise<Section> => {
  try {
    // 获取指定分区信息
    const section = await SectionModel.findOne({ 
      _id: sectionId,
      mid: mid
    });
    
    if (!section) {
      throw new Error('分区不存在或无权访问');
    }
    
    return section;
  } catch (error) {
    console.error('获取自定义分区信息失败:', error);
    throw error;
  }
};

/**
 * @desc 创建新的自定义分区
 * @param {SectionParams} params - 创建分区的参数
 * @returns {Promise<Section>} 创建的分区信息
 */
export const createSection = async (params: SectionParams): Promise<Section> => {
  try {
    const { mid, name, description } = params;

    // 检查是否已存在同名分区
    const existingSection = await SectionModel.findOne({ mid, name });
    if (existingSection) {
      throw new Error('已存在同名分区');
    }
    
    // 创建新分区
    const newSection = new SectionModel({
      mid,
      name,
      description,
      collocationItem: [] // 初始化为空数组
    });
    
    await newSection.save();
    
    return newSection;
  } catch (error) {
    console.error('创建自定义分区失败:', error);
    throw error;
  }
};

/**
 * @desc 更新自定义分区信息
 * @param {UpdateSectionParams} params - 更新分区的参数
 * @returns {Promise<Section>} 更新后的分区信息
 */
export const updateSection = async (params: UpdateSectionParams): Promise<Section> => {
  try {
    const { mid, sectionId, updateData } = params;
    // 检查是否存在
    const section = await SectionModel.findOne({ _id: sectionId, mid });
    if (!section) {
      throw new Error('分区不存在或无权访问');
    }
    
    // 如果要更新名称，检查新名称是否与其他分区冲突
    if (updateData.name && updateData.name !== section.name) {
      const existingSection = await SectionModel.findOne({ 
        mid, 
        name: updateData.name,
        _id: { $ne: sectionId } // 排除当前分区
      });
      
      if (existingSection) {
        throw new Error('已存在同名分区');
      }
    }
    
    // 更新分区信息
    const updatedSection = await SectionModel.findOneAndUpdate(
      { _id: sectionId, mid },
      { $set: updateData },
      { new: true }
    );

    if (!updatedSection) {
      throw new Error('更新失败，分区不存在');
    }
    
    return updatedSection;
  } catch (error) {
    console.error('更新自定义分区失败:', error);
    throw error;
  }
};

/**
 * @desc 删除自定义分区
 * @param {number} mid - 用户ID
 * @param {string} sectionId - 分区ID
 * @returns {Promise<boolean>} 是否成功删除
 */
export const deleteSection = async (mid: number, sectionId: string) => {
  try {
    // 删除分区
    const result = await SectionModel.deleteOne({ _id: sectionId, mid });
    
    if (result.deletedCount === 0) {
      throw new Error('分区不存在或无权删除');
    }
    
    return true;
  } catch (error) {
    console.error('删除自定义分区失败:', error);
    throw error;
  }
};

/**
 * @desc 获取分区内容
 * @param {number} mid - 用户ID
 * @param {string} sectionId - 分区ID
 * @returns {Promise<Section>} 分区内容信息
 */
export const getSectionContent = async (mid: number, sectionId: string) => {
  try {
    // 检查分区是否存在并获取内容
    const section = await SectionModel.findOne({ _id: sectionId, mid });
    if (!section) {
      throw new Error('分区不存在或无权访问');
    }
    
    return section;
  } catch (error) {
    console.error('获取分区内容失败:', error);
    throw error;
  }
};

/**
 * @desc 获取包含特定 ID 的所有分区 - 暂时不用
 * @param {number} mid - 用户ID
 * @param {number} id - 资源ID
 * @returns {Promise<Section[]>} 分区列表
 */
export const getSectionsByTypeAndId = async (mid: number, type: CollocationType, id: number): Promise<Section[]> => {
  try {
    // 获取包含特定 ID 的所有分区
    const sections = await getSectionsByTypeAndId(mid, type, id);
    
    return sections;
  } catch (error) {
    console.error('获取分区失败:', error);
    throw error;
  }
};

/**
 * @desc 添加资源到分区
 * @param {CollocationParams} params - 添加资源到分区的参数
 * @returns {Promise<Section>} 更新后的分区内容
 */
export const addCollocationToSection = async (params: CollocationParams) => {
  try {
    const { mid, sectionId, resources } = params;
    // 检查分区是否存在
    const section = await SectionModel.findOne({ _id: sectionId, mid });
    if (!section) {
      throw new Error('分区不存在或无权访问');
    }
    
    // 添加资源ID，确保不重复
    const updatedSection = await SectionModel.findOneAndUpdate(
      { _id: sectionId, mid },
      { $addToSet: { collocationIds: { $each: resources } } },
      { new: true }
    );
    
    return updatedSection?.collocationIds;
  } catch (error) {
    console.error('添加资源到分区失败:', error);
    throw error;
  }
};

/**
 * @desc 从分区移除资源
 * @param {CollocationParams} params - 从分区移除资源的参数
 * @returns {Promise<Section>} 更新后的分区内容
 */
export const removeCollocationFromSection = async (params: CollocationParams) => {
  try {
    const { mid, sectionId, resources } = params;
    // 检查分区是否存在
    const section = await SectionModel.findOne({ _id: sectionId, mid });
    if (!section) {
      throw new Error('分区不存在或无权访问');
    }
    
    // 移除指定的资源ID
      // 安全写法：循环删除
    for (const item of resources) {
      await SectionModel.updateOne(
        { _id: sectionId, mid },
        { $pull: { collocationIds: item } }
      );
    }

    const updatedSection = await SectionModel.findOne({ _id: sectionId, mid });
    return updatedSection?.collocationIds;
  } catch (error) {
    console.error('从分区移除资源失败:', error);
    throw error;
  }
};

/**
 * @desc 清空分区内的所有资源
 * @param {number} mid - 用户ID
 * @param {string} sectionId - 分区ID
 * @returns {Promise<Section>} 更新后的分区内容
 */
export const clearSectionCollocations = async (mid: number, sectionId: string) => {
  try {
    // 检查分区是否存在
    const section = await SectionModel.findOne({ _id: sectionId, mid });
    if (!section) {
      throw new Error('分区不存在或无权访问');
    }
    
    // 清空媒体ID列表
    const updatedSection = await SectionModel.findOneAndUpdate(
      { _id: sectionId, mid },
      { $set: { collocationIds: [] } },
      { new: true }
    );
    
    return updatedSection;
  } catch (error) {
    console.error('清空分区资源失败:', error);
    throw error;
  }
};