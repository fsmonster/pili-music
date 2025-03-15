/**
 * @desc 音频流信息
 */
export interface AudioStream {
    id: number;
    baseUrl: string;
    bandwidth: number;
    mimeType: string;
    codecs: string;
}

/**
 * @desc 音频质量枚举
 */
export enum AudioQuality {
    STANDARD = 30216,  // 64K
    MEDIUM = 30232,    // 132K
    HIGH = 30280,      // 192K
    DOLBY = 30250,     // 杜比全景声
    HIRES = 30251      // Hi-Res无损
}

/**
 * @desc 音频质量信息
 */
export interface AudioQualityInfo {
    id: AudioQuality;
    label: string;
    description: string;
}

/**
 * @desc 音频质量选项列表
 */
export const AUDIO_QUALITY_OPTIONS: AudioQualityInfo[] = [
    { id: AudioQuality.STANDARD, label: '标准', description: '64K' },
    { id: AudioQuality.MEDIUM, label: '中等', description: '132K' },
    { id: AudioQuality.HIGH, label: '高质量', description: '192K' },
    { id: AudioQuality.DOLBY, label: '杜比全景声', description: '杜比全景声' },
    { id: AudioQuality.HIRES, label: 'Hi-Res无损', description: 'Hi-Res无损' }
];

/**
 * @desc DASH 格式音频响应
 */
export interface DashAudioResponse {
    code: number;
    message: string;
    ttl: number;
    data: DashAudio[];
}

/**
 * @desc DASH 格式音频
 */
export interface DashAudio {
    id: number;          // 音质代码
    baseUrl: string;     // 主URL
    base_url: string;    // 主URL (兼容)
    backupUrl: string[]; // 备用URL列表
    backup_url: string[]; // 备用URL列表 (兼容)
    bandwidth: number;   // 带宽
    mimeType: string;    // MIME类型
    mime_type: string;   // MIME类型 (兼容)
    codecs: string;      // 编码
    width: number;       // 宽度
    height: number;      // 高度
    frameRate: string;   // 帧率
    frame_rate: string;  // 帧率 (兼容)
    codecid: number;     // 编码ID
    size: number;        // 大小
    startWithSap: number;
    start_with_sap: number;
    sar: string;
}