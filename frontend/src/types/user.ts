/**
 * B站用户信息接口（仅保留必要字段）
 * 从B站API获取的原始用户数据结构
 */
export interface BiliUserInfo {
    isLogin: boolean  // 登录状态
    face: string      // 头像URL
    mid: number       // 用户ID
    uname: string     // 用户名
}

/**
 * 本地存储的精简用户状态
 * 只保存必要的用户信息，减少存储空间占用
 */
export interface UserInfo {
    isLoggedIn: boolean
    userInfo: {
        avatar: string    // 经过处理的头像URL（已转换为代理URL）
        username: string  // 用户名
        uid: number      // 用户ID
    } | null
}