import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { AuthRequest, JwtPayload } from '../types/index.js';

// JWT 密钥，实际应用中应该存储在环境变量中
const JWT_SECRET: string = config.jwt.secret;

/**
 * 生成 JWT token
 * @param {JwtPayload} payload - 要包含在 token 中的数据
 * @param {string} expiresIn - token 过期时间
 * @returns {string} JWT token
 */
export const generateToken = (payload: JwtPayload, expiresIn: string = config.jwt.expiresIn): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * 验证 JWT token
 * @param {string} token - JWT token
 * @returns {JwtPayload|null} 解析后的 payload 或 null（如果验证失败）
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('JWT 验证失败:', error instanceof Error ? error.message : String(error));
    return null;
  }
};

/**
 * 从请求中提取 token
 * @param { AuthRequest } req - 认证请求对象
 * @returns {string|null} JWT token 或 null
 */
export const getTokenFromRequest = (req: AuthRequest): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

/**
 * JWT 认证中间件
 * 验证请求中的 JWT token，并将用户信息添加到请求对象
 * @param { AuthRequest } req - 认证请求对象
 * @param { Response } res - 响应对象
 * @param { NextFunction } next - 下一个中间件
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    res.status(401).json({ 
      code: 401, 
      message: '未提供认证令牌' 
    });
    return;
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    res.status(401).json({ 
      code: 401, 
      message: '无效的认证令牌或令牌已过期' 
    });
    return;
  }
  
  // 将解码后的用户信息添加到请求对象
  req.auth = {
    mid: decoded.mid,
    sessdata: decoded.sessdata,
    ckMd5: decoded.ckMd5,
    biliJct: decoded.biliJct
  };
  next();
};

/**
 * 可选鉴权中间件
 * 验证请求中的 JWT token，并将用户信息添加到请求对象
 * @param { AuthRequest } req - 认证请求对象
 * @param { Response } res - 响应对象
 * @param { NextFunction } next - 下一个中间件
 */
export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = getTokenFromRequest(req);
  
  if (token) {
    const decoded = verifyToken(token);
    
    if (decoded) {
      // 将解码后的用户信息添加到请求对象
      req.auth = {
        mid: decoded.mid,
        sessdata: decoded.sessdata,
        ckMd5: decoded.ckMd5,
        biliJct: decoded.biliJct
      };
    }
  }
  next();
};

export default authMiddleware;
