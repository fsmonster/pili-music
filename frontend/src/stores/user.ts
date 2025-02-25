import { defineStore } from 'pinia'

/**
 * B站用户信息接口（仅保留必要字段）
 * 从B站API获取的原始用户数据结构
 */
interface BiliUserInfo {
  isLogin: boolean  // 登录状态
  face: string      // 头像URL
  mid: number       // 用户ID
  uname: string     // 用户名
}

/**
 * 本地存储的精简用户状态
 * 只保存必要的用户信息，减少存储空间占用
 */
interface UserState {
  isLoggedIn: boolean
  userInfo: {
    avatar: string    // 经过处理的头像URL（已转换为代理URL）
    username: string  // 用户名
    uid: number      // 用户ID
  } | null
}

/**
 * 处理B站图片URL，将原始URL转换为本地代理URL
 * @param url B站原始图片URL
 * @returns 处理后的本地代理URL
 */
function processBiliImageUrl(url: string): string {
  if (!url) return '';
  // 已经是代理URL则直接返回
  if (url.startsWith('/biliimg/')) return url;
  // 提取域名编号（i0、i1、i2等）
  const match = url.match(/https:\/\/(i[0-2])\.hdslb\.com\/(.*)/);
  if (!match) return url;
  // 转换为本地代理URL
  return `/biliimg/${match[1]}/${match[2]}`;
}

/**
 * 用户状态管理
 * 使用pinia-plugin-persistedstate插件实现状态持久化
 */
export const useUserStore = defineStore('user', {
  // 初始状态
  state: (): UserState => ({
    isLoggedIn: false,
    userInfo: null
  }),
  
  actions: {
    /**
     * 设置用户信息
     * 只保存必要的用户数据，并处理头像URL
     */
    setUserInfo(info: BiliUserInfo) {
      this.isLoggedIn = info.isLogin;
      if (info.isLogin) {
        this.userInfo = {
          avatar: processBiliImageUrl(info.face),
          username: info.uname,
          uid: info.mid
        };
      } else {
        this.userInfo = null;
      }
    },
    
    /**
     * 退出登录
     * 清除所有用户信息
     */
    logout() {
      this.userInfo = null;
      this.isLoggedIn = false;
    }
  },

  getters: {
    // 获取用户头像
    avatar: (state): string => state.userInfo?.avatar || '',
    // 获取用户名
    username: (state): string => state.userInfo?.username || '',
    // 获取用户ID
    uid: (state): number | null => state.userInfo?.uid || null
  },

  // 开启状态持久化
  persist: true
})
