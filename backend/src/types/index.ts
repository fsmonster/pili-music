/**
 * 通用类型定义
 */

// 通用响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 分页请求参数
export interface PaginationParams {
  page: number;
  limit: number;
}

// 分页响应结果
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 用户JWT载荷
export interface JwtPayload {
  userId: string;
  mid: string;
  iat?: number;
  exp?: number;
}

// 请求中的用户信息
export interface RequestUser {
  userId: string;
  mid: string;
}

// 扩展Express请求对象，添加用户信息
declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}
