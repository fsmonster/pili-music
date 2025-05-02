/**
 * 响度分析器库 - 主入口文件
 * 提供音频响度分析与可选的可视化功能
 */

// 导出类型定义
export * from './types';

// 导入核心组件
import { EventEmitter, linearToDb } from './utils';
import { AudioProcessor } from './core/AudioProcessor';
import { LoudnessAnalyzer as LoudnessAnalyzerCore } from './core/LoudnessAnalyzer';
import { GainController } from './core/GainController';
import { Visualizer } from './visualization/Visualizer';

// 导入类型
import { AudioSourceType } from './types';
import type { LoudnessOptions, LoudnessData } from './types';

/**
 * 响度分析器主类
 * 提供音频响度分析与可选的可视化功能
 */
class LoudnessAnalyzer extends EventEmitter {
  // 核心组件
  private audioProcessor: AudioProcessor;
  private loudnessAnalyzer: LoudnessAnalyzerCore;
  private gainController: GainController;
  public visualizer: Visualizer | null = null;
  
  // 音频元素
  private audioElement: HTMLAudioElement | null = null;
  
  // 分析器配置
  private options: LoudnessOptions;
  private isAnalyzing: boolean = false;
  private animationFrameId: number | null = null;
  
  // 定时器
  private updateInterval: number = 50; // 更新间隔（毫秒）
  private updateTimerId: number | null = null;
  
  /**
   * 创建响度分析器实例
   * @param options 配置选项
   */
  constructor(options: LoudnessOptions = {}) {
    super();
    
    // 合并默认选项
    this.options = {
      targetLoudness: -16,
      gain: {
        continuousAutoGain: true,     // 默认开启持续自动增益
        isLockGain: false,      // 默认不锁定增益
        lockDuration: 30,    // 默认30秒后锁定
        enableCompressor: true,       // 默认开启压缩器
        gainRange: { min: 0.01, max: 2.0 }, // 增益范围
        smoothingFactor: 0.98         // 平滑因子
      },
      ...options
    };
    
    // 初始化核心组件
    this.audioProcessor = new AudioProcessor();
    this.loudnessAnalyzer = new LoudnessAnalyzerCore(this.options.targetLoudness);
    
    // 使用新的配置初始化增益控制器
    this.gainController = new GainController({
      continuousAutoGain: this.options.gain?.continuousAutoGain,
      isLockGain: this.options.gain?.isLockGain,
      lockDuration: this.options.gain?.lockDuration,
      enableCompressor: this.options.gain?.enableCompressor,
      gainRange: this.options.gain?.gainRange,
      smoothingFactor: this.options.gain?.smoothingFactor
    });
    
    // 初始化可视化（如果配置了）
    if (this.options.visualization) {
      this.initVisualizer(this.options.visualization);
    }
    
    console.log('响度分析器初始化完成', this.options);
  }
  
  /**
   * 初始化可视化组件
   * @param visualizationOptions 可视化配置
   */
  private initVisualizer(visualizationOptions: LoudnessOptions['visualization']): void {
    if (!visualizationOptions) return;
    
    try {
      // 创建可视化器实例
      this.visualizer = new Visualizer(
        visualizationOptions.container,
        visualizationOptions.options
      );
      
      // 设置初始目标响度
      if (this.visualizer && this.options.targetLoudness) {
        this.visualizer.setTargetLoudness(this.options.targetLoudness);
      }
      
      console.log('可视化组件初始化成功');
    } catch (error) {
      console.error('初始化可视化组件失败:', error);
      this.emit('error', {
        message: '初始化可视化组件失败',
        error
      });
    }
  }
  
  /**
   * 加载音频
   * @param source 音频源（文件、URL或音频元素）
   * @returns Promise，加载完成后解析
   */
  async loadAudio(source: string | File | HTMLAudioElement): Promise<void> {
    // 停止当前分析
    this.stopAnalysis();
    
    // 如果已有音频元素，先释放资源
    // if (this.audioElement) {
    //   this.audioElement.pause();
    //   this.audioElement.src = '';
    //   this.audioElement.removeAttribute('src');
    //   this.audioElement = null;
    // }
    
    // 根据源类型创建或使用音频元素
    let audioElement: HTMLAudioElement;
    let sourceType: AudioSourceType;
    
    if (source instanceof HTMLAudioElement) {
      // 直接使用提供的音频元素
      audioElement = source;
      sourceType = AudioSourceType.ELEMENT;
    } else {
      // 创建新的音频元素
      audioElement = new Audio();
      
      if (typeof source === 'string') {
        // URL源
        audioElement.src = source;
        sourceType = AudioSourceType.URL;
      } else {
        // 文件源
        const objectUrl = URL.createObjectURL(source);
        audioElement.src = objectUrl;
        sourceType = AudioSourceType.FILE;
      }
    }
    
    // 返回一个Promise，在音频加载完成或出错时解析
    return new Promise((resolve, reject) => {
      const onLoaded = () => {
        this.audioElement = audioElement;
        this.emit('audioLoaded', { element: audioElement, type: sourceType });
        resolve();
        
        // 移除事件监听器
        audioElement.removeEventListener('canplaythrough', onLoaded);
        audioElement.removeEventListener('error', onError);
      };
      
      const onError = (e: Event) => {
        const error = new Error('加载音频失败');
        this.emit('error', { message: '加载音频失败', error });
        reject(error);
        
        // 移除事件监听器
        audioElement.removeEventListener('canplaythrough', onLoaded);
        audioElement.removeEventListener('error', onError);
      };
      
      // 添加事件监听器
      audioElement.addEventListener('canplaythrough', onLoaded);
      audioElement.addEventListener('error', onError);
      
      // 如果音频已经可以播放，直接触发加载完成
      if (audioElement.readyState >= 3) {
        onLoaded();
      }
    });
  }
  
  /**
   * 开始分析
   */
  startAnalysis(): void {
    // 如果已经在分析，不做任何操作
    if (this.isAnalyzing) return;
    
    // 确保有音频元素
    if (!this.audioElement) {
      const error = new Error('没有加载音频');
      this.emit('error', { message: '没有加载音频', error });
      return;
    }
    
    try {
      // 连接音频元素到处理器
      this.audioProcessor.connectAudioElement(this.audioElement);
      
      // 初始化增益控制器
      const gainNode = this.audioProcessor.getGainNode();
      if (gainNode) {
        this.gainController.init(this.audioProcessor.getAudioContext()!, gainNode);
      }
      
      // 重置分析器状态
      this.loudnessAnalyzer.reset();
      this.gainController.reset();
      
      // 开始播放
      this.audioElement.play().catch(error => {
        this.emit('error', { message: '播放音频失败', error });
      });
      
      // 设置分析状态
      this.isAnalyzing = true;
      
      // 开始定时更新
      this.startUpdateTimer();
      
      // 触发事件
      this.emit('analysisStarted');
      
      console.log('开始分析');
    } catch (error) {
      this.emit('error', { message: '开始分析失败', error });
    }
  }
  
  /**
   * 开始定时更新
   */
  private startUpdateTimer(): void {
    // 清除可能存在的旧定时器
    if (this.updateTimerId !== null) {
      window.clearInterval(this.updateTimerId);
    }
    
    // 设置新定时器
    this.updateTimerId = window.setInterval(() => {
      this.updateAnalysis();
    }, this.updateInterval) as unknown as number;
  }
  
  /**
   * 更新分析数据
   */
  private updateAnalysis(): void {
    if (!this.isAnalyzing) return;
    
    // 获取音频数据
    const timeData = this.audioProcessor.getTimeData();
    if (timeData.length === 0) return;
    
    // 获取采样率
    const sampleRate = this.audioProcessor.getSampleRate();
    
    // 分析响度
    const loudnessData = this.loudnessAnalyzer.analyze(timeData, sampleRate);
    
    // 计算建议的增益值
    const suggestedGain = this.loudnessAnalyzer.calculateGain(loudnessData.shortTerm);
    
    // 应用自动增益
    this.gainController.applyAutoGain(suggestedGain, loudnessData.shortTerm);
    
    // 获取当前增益值
    const currentGain = this.gainController.getCurrentGain();
    const currentGainDB = this.gainController.getCurrentGainDB();
    
    // 创建完整的响度数据对象
    const fullData: LoudnessData & { gain: number; gainDB: number } = {
      ...loudnessData,
      gain: currentGain,
      gainDB: currentGainDB
    };
    
    // 更新可视化
    if (this.visualizer) {
      this.visualizer.update(fullData, this.loudnessAnalyzer.getHistory());
    }
    
    // 触发数据更新事件
    this.emit('dataUpdate', fullData);
  }
  
  /**
   * 停止分析
   */
  stopAnalysis(): void {
    // 如果没有在分析，不做任何操作
    if (!this.isAnalyzing) return;
    
    // 停止定时器
    if (this.updateTimerId !== null) {
      window.clearInterval(this.updateTimerId);
      this.updateTimerId = null;
    }
    
    // 停止动画帧
    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // 如果有音频元素，暂停播放
    if (this.audioElement) {
      this.audioElement.pause();
    }
    
    // 断开音频处理器
    this.audioProcessor.disconnect();
    
    // 设置分析状态
    this.isAnalyzing = false;
    
    // 触发事件
    this.emit('analysisStopped');
    
    console.log('停止分析');
  }
  
  /**
   * 设置目标响度
   * @param value 目标响度值（LUFS）
   */
  setTargetLoudness(value: number): void {
    // 更新响度分析器的目标响度
    this.loudnessAnalyzer.setTargetLoudness(value);
    
    // 更新选项
    this.options.targetLoudness = value;
    
    // 更新可视化器的目标响度
    if (this.visualizer) {
      this.visualizer.setTargetLoudness(value);
    }
    
    console.log('设置目标响度:', value);
    
    // 触发事件
    this.emit('targetLoudnessChanged', value);
  }
  
  /**
   * 设置持续自动增益状态
   * @param enabled 是否启用持续自动增益
   */
  setContinuousAutoGain(enabled: boolean): void {
    // 更新增益控制器的持续自动增益状态
    this.gainController.setContinuousAutoGainEnabled(enabled);
    
    // 更新选项
    if (!this.options.gain) {
      this.options.gain = {};
    }
    this.options.gain.continuousAutoGain = enabled;
    
    console.log('设置持续自动增益:', enabled ? '启用' : '禁用');
    
    // 触发事件
    this.emit('continuousAutoGainChanged', enabled);
  }
  
  /**
   * 设置锁定增益状态
   * @param enabled 是否启用锁定增益
   */
  setLockGain(enabled: boolean): void {
    // 更新增益控制器的锁定增益状态
    this.gainController.setLockGain(enabled);
    
    // 更新选项
    if (!this.options.gain) {
      this.options.gain = {};
    }
    this.options.gain.isLockGain = enabled;
    
    console.log('设置锁定增益:', enabled ? '启用' : '禁用');
    
    // 触发事件
    this.emit('isLockGainChanged', enabled);
  }
  
  /**
   * 设置压缩器状态
   * @param enabled 是否启用压缩器
   */
  setCompressorEnabled(enabled: boolean): void {
    // 更新增益控制器的压缩器状态
    this.gainController.setCompressorEnabled(enabled);
    
    // 更新选项
    if (!this.options.gain) {
      this.options.gain = {};
    }
    this.options.gain.enableCompressor = enabled;
    
    console.log('设置压缩器:', enabled ? '启用' : '禁用');
    
    // 触发事件
    this.emit('compressorEnabledChanged', enabled);
  }
  
  /**
   * 手动设置增益值
   * @param value 增益值（线性，非dB）
   */
  setGain(value: number): void {
    // 如果增益已锁定，先解锁
    if (this.gainController.isGainLocked()) {
      this.gainController.unlockGain();
    }
    
    // 如果启用了持续自动增益，先禁用
    if (this.gainController.isContinuousAutoGainEnabled()) {
      this.setContinuousAutoGain(false);
    }
    
    // 设置增益值
    this.gainController.setGain(value);
    
    // 触发事件
    this.emit('gainChanged', {
      gain: value,
      gainDB: linearToDb(value)
    });
  }
  
  /**
   * 锁定当前增益值
   */
  lockGain(): void {
    this.gainController.lockGain();
    this.emit('gainLocked', this.gainController.getCurrentGain());
  }
  
  /**
   * 解锁增益值
   */
  unlockGain(): void {
    this.gainController.unlockGain();
    this.emit('gainUnlocked');
  }
  
  /**
   * 获取当前响度分析结果的历史数据
   * @returns 包含各类响度历史数据的对象
   */
  getLoudnessHistory() {
    return this.loudnessAnalyzer.getHistory();
  }
  
  /**
   * 获取内部音频元素
   * @returns 当前音频元素
   */
  getAudioElement(): HTMLAudioElement | null {
    return this.audioElement;
  }
  
  /**
   * 获取当前目标响度
   * @returns 目标响度值（LUFS）
   */
  getTargetLoudness(): number {
    return this.loudnessAnalyzer.getTargetLoudness();
  }
  
  /**
   * 重置分析器
   */
  reset(): void {
    // 停止当前分析
    this.stopAnalysis();
    
    // 重置响度分析器
    this.loudnessAnalyzer.reset();
    
    // 重置增益控制器
    this.gainController.reset();
    
    // 重置可视化（如果存在）
    if (this.visualizer) {
      this.visualizer.clear();
    }
    
    console.log('分析器已重置');
    
    // 触发事件
    this.emit('reset');
  }
  
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
  }): void {
    if (!this.visualizer) {
      console.warn('可视化器不存在，无法更新设置');
      return;
    }
    
    // 直接调用可视化器的 updateSettings 方法
    this.visualizer.updateSettings(settings);
    
    console.log('可视化设置已更新:', settings);
  }
  
  /**
   * 销毁分析器实例，释放资源
   */
  destroy(): void {
    // 停止分析
    this.stopAnalysis();
    
    // 断开音频连接
    this.audioProcessor.disconnect();
    
    // 关闭音频上下文
    this.audioProcessor.closeAudioContext();
    
    // 释放音频元素
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement.removeAttribute('src');
      this.audioElement = null;
    }
    
    // 销毁可视化器
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }
    
    // 清除所有事件监听器
    this.removeAllListeners();
    
    console.log('分析器已销毁');
  }
}

// 导出主类
export default LoudnessAnalyzer;
