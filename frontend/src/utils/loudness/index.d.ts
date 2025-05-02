/**
 * 响度分析器库 - 主入口文件
 * 提供音频响度分析与可选的可视化功能
 */

import { EventEmitter } from './utils';
import { Visualizer } from './visualization/Visualizer';

/**
 * 响度数据接口
 */
export interface LoudnessData {
  /** 瞬时响度 (LUFS) */
  momentary: number;
  /** 短期响度 (LUFS) */
  shortTerm: number;
  /** 整体响度 (LUFS) */
  integrated: number;
  /** 真峰值 (dBTP) */
  truePeak: number;
  /** 响度范围 (LU) */
  loudnessRange: number;
  /** 频谱重心 (Hz) */
  spectralCentroid: number;
}

/**
 * 增益配置选项
 */
export interface GainOptions {
  /** 是否启用持续自动增益，默认 true */
  continuousAutoGain?: boolean;
  
  /** 是否在N秒后锁定增益，默认 true */
  isLockGain?: boolean;

  /** 锁定增益的秒数，默认 30 */
  lockDuration?: number;
  
  /** 是否启用压缩器，默认 true */
  enableCompressor?: boolean;
  
  /** 增益范围限制 */
  gainRange?: {
    /** 最小增益值，默认 0.01 */
    min: number;
    /** 最大增益值，默认 2.0 */
    max: number;
  };
  
  /** 平滑因子，控制增益变化速度，默认 0.98 */
  smoothingFactor?: number;
}

/**
 * 可视化配置选项
 */
export interface VisualizationOptions {
  /** 颜色配置 */
  colors?: {
    /** 背景色，默认 '#ffffff' */
    background?: string;
    /** 瞬时响度线颜色，默认 '#00e6ff' */
    momentary?: string;
    /** 短期响度线颜色，默认 '#81c784' */
    shortTerm?: string;
    /** 整体响度线颜色，默认 '#ffb74d' */
    integrated?: string;
    /** 目标响度线颜色，默认 '#f44336' */
    target?: string;
    /** 增益线颜色，默认 '#9c27b0' */
    gain?: string;
  };
  
  /** 是否显示图例，默认 true */
  showLegend?: boolean;
  
  /** 图表高度，默认 300 */
  height?: number;
  
  /** 是否显示瞬时响度，默认 true */
  showMomentary?: boolean;
  
  /** 是否显示短期响度，默认 true */
  showShortTerm?: boolean;
  
  /** 是否显示整体响度，默认 true */
  showIntegrated?: boolean;
  
  /** 是否显示目标响度，默认 true */
  showTarget?: boolean;
  
  /** 是否显示增益，默认 true */
  showGain?: boolean;
}

/**
 * 响度分析器配置选项
 */
export interface LoudnessOptions {
  /** 目标响度值 (LUFS)，默认 -21 */
  targetLoudness?: number;
  
  /** 增益控制选项 */
  gain?: GainOptions;
  
  /** 可视化配置，如不提供则不启用可视化 */
  visualization?: {
    /** 容器元素或选择器 */
    container: string | HTMLElement;
    
    /** 可视化选项 */
    options?: VisualizationOptions;
  };
}

/**
 * 音频源类型枚举
 */
export enum AudioSourceType {
  /** 文件 */
  FILE = 'file',
  /** URL */
  URL = 'url',
  /** 音频元素 */
  ELEMENT = 'element'
}

/**
 * 响度分析器主类
 * 提供音频响度分析与可选的可视化功能
 */
declare class LoudnessAnalyzer extends EventEmitter {
  /** 可视化组件实例 */
  visualizer: Visualizer | null;
  
  /** 是否正在分析 */
  isAnalyzing: boolean;
  
  /**
   * 创建响度分析器实例
   * @param options 配置选项
   */
  constructor(options?: LoudnessOptions);
  
  /**
   * 加载音频
   * @param source 音频源（文件、URL或音频元素）
   * @returns Promise，加载完成后解析
   */
  loadAudio(source: string | File | HTMLAudioElement): Promise<void>;
  
  /**
   * 开始分析
   */
  startAnalysis(): void;
  
  /**
   * 停止分析
   */
  stopAnalysis(): void;
  
  /**
   * 设置目标响度
   * @param value 目标响度值（LUFS）
   */
  setTargetLoudness(value: number): void;
  
  /**
   * 设置持续自动增益状态
   * @param enabled 是否启用持续自动增益
   */
  setContinuousAutoGain(enabled: boolean): void;
  
  /**
   * 设置锁定增益状态
   * @param enabled 是否启用锁定增益
   */
  setLockGain(enabled: boolean): void;
  
  /**
   * 设置压缩器状态
   * @param enabled 是否启用压缩器
   */
  setCompressorEnabled(enabled: boolean): void;
  
  /**
   * 手动设置增益值
   * @param value 增益值（线性，非dB）
   */
  setGain(value: number): void;
  
  /**
   * 锁定当前增益值
   */
  lockGain(): void;
  
  /**
   * 解锁增益值
   */
  unlockGain(): void;
  
  /**
   * 获取当前响度分析结果的历史数据
   * @returns 包含各类响度历史数据的对象
   */
  getLoudnessHistory(): {
    momentary: number[];
    shortTerm: number[];
    integrated: number[];
  };
  
  /**
   * 获取当前目标响度
   * @returns 目标响度值（LUFS）
   */
  getTargetLoudness(): number;
  
  /**
   * 重置分析器
   */
  reset(): void;
  
  /**
   * 更新可视化设置
   * @param settings 可视化设置选项
   */
  updateVisualizationSettings(settings: {
    showMomentary?: boolean;
    showShortTerm?: boolean;
    showIntegrated?: boolean;
    showTarget?: boolean;
    showGain?: boolean;
  }): void;
  
  /**
   * 销毁分析器实例，释放资源
   */
  destroy(): void;
}

export default LoudnessAnalyzer;
