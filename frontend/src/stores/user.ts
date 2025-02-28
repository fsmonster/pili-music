import { defineStore } from 'pinia'
import { processResourceUrl } from '../utils/processResoureUrl';
import type { BiliUserInfo, UserState } from '../types/user';

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
          avatar: processResourceUrl(info.face),
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
