import type { Buvid } from '../api/auth';

/**
 * Buvid Cookie 相关工具函数
 */

// Cookie 名称
const BUVID3_COOKIE_NAME = 'buvid3';
const BUVID4_COOKIE_NAME = 'buvid4';

/**
 * 设置 Cookie
 * @param name Cookie 名称
 * @param value Cookie 值
 * @param days Cookie 有效期（天）
 */
const setCookie = (name: string, value: string, days = 365): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=None; Secure`;
};

/**
 * 获取 Cookie
 * @param name Cookie 名称
 * @returns Cookie 值，不存在则返回空字符串
 */
const getCookie = (name: string): string => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return '';
};

/**
 * 将 Buvid 保存到 Cookie
 * @param buvid Buvid 对象
 */
export const saveBuvid = (buvid: Buvid): void => {
  try {
    if (buvid.b_3) {
      setCookie(BUVID3_COOKIE_NAME, buvid.b_3);
    }
    if (buvid.b_4) {
      setCookie(BUVID4_COOKIE_NAME, buvid.b_4);
    }
  } catch (error) {
    console.error('保存 Buvid 到 Cookie 失败:', error);
  }
};

/**
 * 从 Cookie 获取 Buvid
 * @returns 存储的 Buvid 对象，如果不存在则返回 null
 */
export const getBuvidFromCookie = (): Buvid | null => {
  try {
    const b_3 = getCookie(BUVID3_COOKIE_NAME);
    const b_4 = getCookie(BUVID4_COOKIE_NAME);
    
    if (!b_3 && !b_4) return null;
    
    return { b_3, b_4 };
  } catch (error) {
    console.error('从 Cookie 获取 Buvid 失败:', error);
    return null;
  }
};

/**
 * 检查 Cookie 中是否存在有效的 Buvid
 * @returns 是否存在有效的 Buvid
 */
export const hasBuvid = (): boolean => {
  const buvid = getBuvidFromCookie();
  return buvid !== null && (!!buvid.b_3 || !!buvid.b_4);
};

/**
 * 从 Cookie 中删除 Buvid
 */
export const removeBuvid = (): void => {
  try {
    // 设置过期时间为过去的时间，使 Cookie 立即失效
    document.cookie = `${BUVID3_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${BUVID4_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } catch (error) {
    console.error('从 Cookie 删除 Buvid 失败:', error);
  }
};
