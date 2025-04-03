import { Request } from 'express';

// 用户JWT载荷
export interface JwtPayload {
  mid: number;           // DedeUserID
  sessdata: string;
  ckMd5: string;         // DedeUserID__ckMd5
  biliJct: string;       // bili_jct
  iat?: number;
  exp?: number;
}

/**
 * 用户认证请求接口扩展
 */
export interface AuthRequest extends Request {
  auth: {
    mid: number;
    sessdata: string;
    ckMd5: string;
    biliJct: string;
  };
}

export interface QRCodeStatusData {
  code: number;
  message: string;
  refresh_token: string;
  timestamp: number;
  url: string;
  [property: string]: any;
}
