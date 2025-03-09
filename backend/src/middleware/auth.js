import jwt from 'jsonwebtoken';

// JWT 密钥，实际应用中应该存储在环境变量中
const JWT_SECRET = process.env.JWT_SECRET || 'bili-music-secret-key';

/**
 * 生成 JWT token
 * @param {Object} payload - 要包含在 token 中的数据
 * @param {string} expiresIn - token 过期时间
 * @returns {string} JWT token
 */
export const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * 验证 JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} 解析后的 payload 或 null（如果验证失败）
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT 验证失败:', error.message);
    return null;
  }
};

/**
 * 从请求中提取 token
 * @param {Object} req - Express 请求对象
 * @returns {string|null} JWT token 或 null
 */
export const getTokenFromRequest = (req) => {
  // 1. 首先尝试从 Authorization 头中获取
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 2. 如果没有 Authorization 头，尝试从 URL 参数中获取
  if (req.query && req.query.token) {
    return req.query.token;
  }
  
  return null;
};

/**
 * JWT 认证中间件
 * 验证请求中的 JWT token，并将用户信息添加到 req.user
 */
export const authMiddleware = (req, res, next) => {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    return res.status(401).json({ 
      code: 401, 
      message: '未提供认证令牌' 
    });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ 
      code: 401, 
      message: '无效的认证令牌或令牌已过期' 
    });
  }
  
  // 将解码后的用户信息添加到请求对象
  req.user = decoded;
  next();
};

export default authMiddleware;
