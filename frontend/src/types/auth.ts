/**
 * 二维码状态枚举
 */
export enum QRCodeStatus {
    CONFIRMED = 0,        // 已确认（有 refresh_token）
    PENDING = 86101,      // 未扫码
    SCANNED = 86090,      // 已扫码未确认
    EXPIRED = 86038,      // 已过期
}

/**
 * 二维码生成响应数据
 */
export interface QRCodeGenerateData {
    url: string;        // 二维码内容
    qrcode_key: string; // 二维码 key
}

/**
 * 二维码状态响应数据
 */
export interface QRCodeStatusData {
    url: string;           // 登录成功后的跳转链接
    refresh_token: string; // 刷新令牌
    timestamp: number;     // 时间戳
    code: number;         // 二维码状态码
    message: string;      // 状态描述
    token?: string;       // JWT 令牌
}

