/**
 * 响度分析器配置选项
 */
export interface LoudnessOptions {
  /** 目标响度值，默认 -16 LUFS */
  targetLoudness?: number;
  
  /** 增益控制相关选项 */
  gain?: GainOptions;
  
  /** 可视化选项，如不提供则不启用可视化 */
  visualization?: {
    /** 容器元素或选择器 */
    container: string | HTMLElement;
    /** 可视化配置选项 */
    options?: VisualizationOptions;
  };
}

/**
 * 增益控制选项
 */
export interface GainOptions {
  /** 是否启用持续自动增益，默认 true */
  continuousAutoGain?: boolean;
  
  /** 是否在N秒后锁定增益，默认 false */
  isLockGain?: boolean;

  /** 锁定增益的秒数 */
  lockDuration?: number;
  
  /** 是否启用压缩器，默认 true */
  enableCompressor?: boolean;
  
  /** 增益范围限制 */
  gainRange?: {
    min: number;
    max: number;
  };
  
  /** 平滑因子，值越大过渡越慢，默认 0.98 */
  smoothingFactor?: number;
}

/**
 * 可视化配置选项
 */
export interface VisualizationOptions {
  /** 颜色配置 */
  colors?: {
    /** 背景色 */
    background?: string;
    /** 瞬时响度线颜色 */
    momentary?: string;
    /** 短期响度线颜色 */
    shortTerm?: string;
    /** 整体响度线颜色 */
    integrated?: string;
    /** 目标响度线颜色 */
    target?: string;
    /** 增益线颜色 */
    gain?: string;
    /** 网格线颜色 */
    grid?: string;
    /** 文本颜色 */
    text?: string;
  };
  
  /** 是否显示图例 */
  showLegend?: boolean;
  
  /** 最大数据点数量 */
  maxDataPoints?: number;
  
  /** 响度范围 */
  loudnessRange?: {
    min: number;
    max: number;
  };
  
  /** 增益范围 */
  gainRange?: {
    min: number;
    max: number;
  };
  
  /** 显示选项 */
  show?: {
    momentary?: boolean;
    shortTerm?: boolean;
    integrated?: boolean;
    target?: boolean;
    gain?: boolean;
  };
}

/**
 * 响度数据结构
 */
export interface LoudnessData {
  /** 瞬时响度 (M) */
  momentary: number;
  
  /** 短期响度 (S) */
  shortTerm: number;
  
  /** 整体响度 (I) */
  integrated: number;
  
  /** 真峰值 */
  truePeak: number;
  
  /** 响度范围 */
  loudnessRange: number;
  
  /** 频谱重心 */
  spectralCentroid: number;
  
  /** 当前增益值 */
  gain: number;
  
  /** 当前增益值(dB) */
  gainDB: number;
}

/**
 * 音频源类型枚举
 */
export enum AudioSourceType {
  FILE = 'file',
  URL = 'url',
  ELEMENT = 'element'
}

/**
 * 窗口类型枚举
 */
export enum WindowType {
  MOMENTARY = 'momentary',
  SHORT_TERM = 'shortTerm',
  INTEGRATED = 'integrated'
}
