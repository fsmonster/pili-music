import CustomSection from '../models/custom.js';

/**
 * @desc 获取用户所有自定义分区
 * @param {number} mid - 用户ID
 * @returns {Promise<Array>} 自定义分区列表
 */
export const getUserSections = async (mid: number) => {
  try {
    // 获取用户所有自定义分区
    const sections = await CustomSection.find({ mid });
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
 * @returns {Promise<Object>} 分区信息
 */
export const getSectionById = async (mid: number, sectionId: string) => {
  try {
    // 获取指定分区信息
    const section = await CustomSection.findOne({ 
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
 * @param {number} mid - 用户ID
 * @param {string} name - 分区名称
 * @param {string} description - 分区描述
 * @returns {Promise<Object>} 创建的分区信息
 */
export const createSection = async (mid: number, name: string, description: string = '') => {
  try {
    // 检查是否已存在同名分区
    const existingSection = await CustomSection.findOne({ mid, name });
    if (existingSection) {
      throw new Error('已存在同名分区');
    }
    
    // 创建新分区
    const newSection = new CustomSection({
      mid,
      name,
      description,
      mediaIds: []
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
 * @param {number} mid - 用户ID
 * @param {string} sectionId - 分区ID
 * @param {object} updateData - 更新数据
 * @returns {Promise<Object>} 更新后的分区信息
 */
export const updateSection = async (mid: number, sectionId: string, updateData: {name?: string, description?: string}) => {
  try {
    // 检查是否存在
    const section = await CustomSection.findOne({ _id: sectionId, mid });
    if (!section) {
      throw new Error('分区不存在或无权访问');
    }
    
    // 如果要更新名称，检查新名称是否与其他分区冲突
    if (updateData.name && updateData.name !== section.name) {
      const existingSection = await CustomSection.findOne({ 
        mid, 
        name: updateData.name,
        _id: { $ne: sectionId } // 排除当前分区
      });
      
      if (existingSection) {
        throw new Error('已存在同名分区');
      }
    }
    
    // 更新分区信息
    const updatedSection = await CustomSection.findOneAndUpdate(
      { _id: sectionId, mid },
      { $set: updateData },
      { new: true }
    );
    
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
    const result = await CustomSection.deleteOne({ _id: sectionId, mid });
    
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
 * @desc 添加媒体到分区
 * @param {number} mid - 用户ID
 * @param {string} sectionId - 分区ID
 * @param {number[]} mediaIds - 要添加的媒体ID列表
 * @returns {Promise<Object>} 更新后的分区信息
 */
export const addMediaToSection = async (mid: number, sectionId: string, mediaIds: number[]) => {
  try {
    // 检查分区是否存在
    const section = await CustomSection.findOne({ _id: sectionId, mid });
    if (!section) {
      throw new Error('分区不存在或无权访问');
    }
    
    // 添加媒体ID，确保不重复
    const updatedSection = await CustomSection.findOneAndUpdate(
      { _id: sectionId, mid },
      { $addToSet: { mediaIds: { $each: mediaIds } } },
      { new: true }
    );
    
    return updatedSection;
  } catch (error) {
    console.error('添加媒体到分区失败:', error);
    throw error;
  }
};

/**
 * @desc 从分区移除媒体
 * @param {number} mid - 用户ID
 * @param {string} sectionId - 分区ID
 * @param {number[]} mediaIds - 要移除的媒体ID列表
 * @returns {Promise<Object>} 更新后的分区信息
 */
export const removeMediaFromSection = async (mid: number, sectionId: string, mediaIds: number[]) => {
  try {
    // 检查分区是否存在
    const section = await CustomSection.findOne({ _id: sectionId, mid });
    if (!section) {
      throw new Error('分区不存在或无权访问');
    }
    
    // 移除媒体ID
    const updatedSection = await CustomSection.findOneAndUpdate(
      { _id: sectionId, mid },
      { $pullAll: { mediaIds: mediaIds } },
      { new: true }
    );
    
    return updatedSection;
  } catch (error) {
    console.error('从分区移除媒体失败:', error);
    throw error;
  }
};

/**
 * @desc 清空分区内的所有媒体
 * @param {number} mid - 用户ID
 * @param {string} sectionId - 分区ID
 * @returns {Promise<Object>} 更新后的分区信息
 */
export const clearSectionMedia = async (mid: number, sectionId: string) => {
  try {
    // 检查分区是否存在
    const section = await CustomSection.findOne({ _id: sectionId, mid });
    if (!section) {
      throw new Error('分区不存在或无权访问');
    }
    
    // 清空媒体ID列表
    const updatedSection = await CustomSection.findOneAndUpdate(
      { _id: sectionId, mid },
      { $set: { mediaIds: [] } },
      { new: true }
    );
    
    return updatedSection;
  } catch (error) {
    console.error('清空分区媒体失败:', error);
    throw error;
  }
};