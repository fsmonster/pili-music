import request from '../utils/request';
import type { ApiResponse } from '../types';

/**
 * 自定义分区接口参数
 */
export interface SectionParams {
  name?: string;
  description?: string;
}

/**
 * 自定义分区基本信息
 */
export interface Section {
  _id: string;
  mid: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 分区内容信息
 */
export interface SectionContent {
  _id: string;
  sectionId: string;
  mid: number;
  mediaIds: number[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取用户所有自定义分区
 * @returns 自定义分区列表
 */
export async function getUserSections(): Promise<Section[]> {
  try {
    const res = await request.get<ApiResponse<Section[]>>('/section');
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '获取自定义分区失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('获取自定义分区失败:', error);
    throw error;
  }
}

/**
 * 获取指定自定义分区详情
 * @param sectionId 分区ID
 * @returns 分区详情
 */
export async function getSectionById(sectionId: string): Promise<Section> {
  try {
    const res = await request.get<ApiResponse<Section>>(`/section/${sectionId}`);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '获取分区详情失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('获取分区详情失败:', error);
    throw error;
  }
}

/**
 * 获取指定自定义分区内容
 * @param sectionId 分区ID
 * @returns 分区内容
 */
export async function getSectionContent(sectionId: string): Promise<SectionContent> {
  try {
    const res = await request.get<ApiResponse<SectionContent>>(`/section/${sectionId}/content`);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '获取分区内容失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('获取分区内容失败:', error);
    throw error;
  }
}

/**
 * 创建新的自定义分区
 * @param params 分区参数
 * @returns 创建的分区信息
 */
export async function createSection(params: SectionParams): Promise<Section> {
  try {
    const res = await request.post<ApiResponse<Section>>('/section', params);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '创建分区失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('创建分区失败:', error);
    throw error;
  }
}

/**
 * 更新自定义分区信息
 * @param sectionId 分区ID
 * @param params 更新参数
 * @returns 更新后的分区信息
 */
export async function updateSection(sectionId: string, params: SectionParams): Promise<Section> {
  try {
    const res = await request.put<ApiResponse<Section>>(`/section/${sectionId}`, params);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '更新分区失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('更新分区失败:', error);
    throw error;
  }
}

/**
 * 删除自定义分区
 * @param sectionId 分区ID
 * @returns 是否成功
 */
export async function deleteSection(sectionId: string): Promise<boolean> {
  try {
    const res = await request.delete<ApiResponse<boolean>>(`/section/${sectionId}`);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '删除分区失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('删除分区失败:', error);
    throw error;
  }
}

/**
 * 添加收藏夹到分区
 * @param sectionId 分区ID
 * @param mediaIds 收藏夹ID列表
 * @returns 更新后的分区内容
 */
export async function addMediaToSection(sectionId: string, mediaIds: number[]): Promise<SectionContent> {
  try {
    const res = await request.post<ApiResponse<SectionContent>>(`/section/${sectionId}/media`, { mediaIds });
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '添加收藏夹失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('添加收藏夹失败:', error);
    throw error;
  }
}

/**
 * 从分区移除收藏夹
 * @param sectionId 分区ID
 * @param mediaIds 收藏夹ID列表
 * @returns 更新后的分区内容
 */
export async function removeMediaFromSection(sectionId: string, mediaIds: number[]): Promise<SectionContent> {
  try {
    const res = await request.delete<ApiResponse<SectionContent>>(`/section/${sectionId}/media`, { data: { mediaIds } });
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '移除收藏夹失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('移除收藏夹失败:', error);
    throw error;
  }
}

/**
 * 清空分区内的所有收藏夹
 * @param sectionId 分区ID
 * @returns 更新后的分区内容
 */
export async function clearSectionMedia(sectionId: string): Promise<SectionContent> {
  try {
    const res = await request.delete<ApiResponse<SectionContent>>(`/section/${sectionId}/media/all`);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '清空收藏夹失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('清空收藏夹失败:', error);
    throw error;
  }
}
