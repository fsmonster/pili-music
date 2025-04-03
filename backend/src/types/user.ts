/**
 * B站用户数据接口
 */
export interface BilibiliUserData {
    mid: string;
    uname: string;
    face: string;
    [key: string]: any;
  }
  
/**
 * 用户偏好设置接口
 */
export interface UserPreferences {
theme?: string;
audioQuality?: string;
showLyrics?: boolean;
[key: string]: any;
}