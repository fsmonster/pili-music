import { biliRequest } from './request';
import type { ApiResponse } from '../types';
import md5 from 'md5';

/**
 * WBI 鉴权相关工具函数
 */

// 用于混合 key 的索引表
const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
];

// 缓存 WBI Keys 和过期时间
let cachedWbiKeys: { img_key: string; sub_key: string; mixin_key: string } | null = null;
let wbiKeysExpireTime = 0;

/**
 * 获取 WBI Keys
 * @returns 包含 img_key、sub_key 和 mixin_key 的对象
 */
export const getWbiKeys = async (): Promise<{ img_key: string; sub_key: string; mixin_key: string }> => {
  // 如果缓存有效且未过期，直接返回缓存
  const now = Math.floor(Date.now() / 1000);
  if (cachedWbiKeys && now < wbiKeysExpireTime) {
    return cachedWbiKeys;
  }

  try {
    // 请求导航接口获取 WBI Keys
    const response = await biliRequest.get<ApiResponse<any>>('/web-interface/nav');
    if (response.data.code !== 0 && response.data.code !== -101) {
      throw new Error(`获取 WBI Keys 失败: ${response.data.message}`);
    }

    const { wbi_img } = response.data.data;
    const img_url = wbi_img.img_url;
    const sub_url = wbi_img.sub_url;

    // 提取 img_key 和 sub_key
    const img_key = img_url.substring(img_url.lastIndexOf('/') + 1, img_url.lastIndexOf('.'));
    const sub_key = sub_url.substring(sub_url.lastIndexOf('/') + 1, sub_url.lastIndexOf('.'));
    
    // 生成 mixin_key
    const mixin_key = getMixinKey(img_key + sub_key);

    // 更新缓存，设置过期时间为 24 小时
    cachedWbiKeys = { img_key, sub_key, mixin_key };
    wbiKeysExpireTime = now + 24 * 60 * 60;

    return cachedWbiKeys;
  } catch (error) {
    console.error('获取 WBI Keys 失败:', error);
    throw error;
  }
};

/**
 * 根据原始字符串生成混合密钥
 * @param orig 原始字符串 (img_key + sub_key)
 * @returns 混合密钥
 */
const getMixinKey = (orig: string): string => {
  let t = '';
  for (let i = 0; i < mixinKeyEncTab.length; i++) {
    t += orig[mixinKeyEncTab[i]];
  }
  return t.substring(0, 32);
};

/**
 * 使用 WBI 签名对参数进行编码
 * @param params 原始参数对象
 * @returns 包含签名的查询字符串
 */
export const encWbi = async (params: Record<string, any>): Promise<string> => {
  try {
    // 获取 WBI Keys
    const { mixin_key } = await getWbiKeys();
    
    // 创建参数副本，添加时间戳
    const newParams: Record<string, any> = { ...params, wts: Math.floor(Date.now() / 1000) };
    
    // 过滤特殊字符
    const filteredParams: Record<string, string> = {};
    for (const key in newParams) {
      if (Object.prototype.hasOwnProperty.call(newParams, key)) {
        // 将值转为字符串并过滤特殊字符
        let value = String(newParams[key]);
        value = value.replace(/[!'()*]/g, '');
        filteredParams[key] = value;
      }
    }
    
    // 按键名升序排序
    const sortedKeys = Object.keys(filteredParams).sort();
    
    // 构建查询字符串
    const queryParts: string[] = [];
    for (const key of sortedKeys) {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(filteredParams[key])}`);
    }
    
    const queryString = queryParts.join('&');
    
    // 计算 w_rid
    const wRid = md5(queryString + mixin_key);
    
    // 返回最终的查询字符串
    return `${queryString}&w_rid=${wRid}`;
  } catch (error) {
    console.error('WBI 签名失败:', error);
    throw error;
  }
};

/**
 * 使用 WBI 签名构建完整的请求 URL
 * @param baseUrl 基础 URL
 * @param params 参数对象
 * @returns 完整的请求 URL
 */
export const buildWbiUrl = async (baseUrl: string, params: Record<string, any>): Promise<string> => {
  const queryString = await encWbi(params);
  return `${baseUrl}?${queryString}`;
};

/**
 * 使用 WBI 签名发送 GET 请求
 * @param url 请求 URL
 * @param params 请求参数
 * @returns 请求结果
 */
export const wbiRequest = async <T>(url: string, params: Record<string, any>): Promise<ApiResponse<T>> => {
  try {
    const fullUrl = await buildWbiUrl(url, params);
    const response = await biliRequest.get<ApiResponse<T>>(fullUrl);
    return response.data;
  } catch (error) {
    console.error('WBI 请求失败:', error);
    throw error;
  }
};
