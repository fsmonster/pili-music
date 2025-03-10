import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/index.js';

// JWT 密钥，实际应用中应该存储在环境变量中
const JWT_SECRET: string = process.env.JWT_SECRET || 'bili-music-secret-key';

/**
 * 生成 JWT token
 * @param {Object} payload - 要包含在 token 中的数据
 * @param {string} expiresIn - token 过期时间
 * @returns {string} JWT token
 */
export const generateToken = (payload: JwtPayload, expiresIn: string = '7d'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * 验证 JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} 解析后的 payload 或 null（如果验证失败）
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
 * @param {Request} req - Express 请求对象
 * @returns {string|null} JWT token 或 null
 */
export const getTokenFromRequest = (req: Request): string | null => {
  // 1. 首先尝试从 Authorization 头中获取
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 2. 如果没有 Authorization 头，尝试从 URL 参数中获取
  if (req.query && req.query.token) {
    return req.query.token as string;
  }
  
  return null;
};

/**
 * JWT 认证中间件
 * 验证请求中的 JWT token，并将用户信息添加到 req.user
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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
  req.user = {
    userId: decoded.userId,
    mid: decoded.mid
  };
  next();
};

export default authMiddleware;
