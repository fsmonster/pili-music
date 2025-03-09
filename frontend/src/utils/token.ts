/**
 * JWT 令牌管理工具
 * 提供令牌的存储、获取、解析和清除功能
 */

// 存储键名
const TOKEN_KEY = 'bili_music_token';

/**
 * 存储 JWT 令牌到本地存储
 * @param token JWT 令牌
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 从本地存储获取 JWT 令牌
 * @returns JWT 令牌或 null
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 清除本地存储中的 JWT 令牌
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 解析 JWT 令牌的 payload 部分
 * @param token JWT 令牌
 * @returns 解析后的 payload 对象
 */
export function parseToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('解析 JWT 令牌失败:', error);
    return null;
  }
}

/**
 * 检查令牌是否过期
 * @param token JWT 令牌
 * @returns 是否过期
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseToken(token);
  if (!payload || !payload.exp) return true;
  
  // exp 是 Unix 时间戳（秒）
  const expireTime = payload.exp * 1000; // 转换为毫秒
  return Date.now() >= expireTime;
}

/**
 * 获取令牌过期时间
 * @param token JWT 令牌
 * @returns 过期时间（毫秒时间戳）或 null
 */
export function getTokenExpireTime(token: string): number | null {
  const payload = parseToken(token);
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000; // 转换为毫秒
}
