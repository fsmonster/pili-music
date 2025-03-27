import type { ApiResponse, UpInfoCardResponse, Upper } from "../types";
import { biliRequest } from "../utils/request";

/**
 * 获取用户信息
 */
export async function getUserInfo(mid: number): Promise<Upper> {
  try {
    const response = await biliRequest.get<ApiResponse<UpInfoCardResponse>>('/web-interface/card',
      { params: { mid } });
    if (response.data.code !== 0) {
      throw new Error(response.data.message || '获取用户信息失败');
    }
    const card = response.data.data.card;
    return {
      mid: card.mid,
      name: card.name,
      face: card.face
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}