import { linearToDb, clamp } from '../utils';

/**
 * 增益控制器类
 * 负责处理音频的增益调整
 */
export class GainController {
  private gainNode: GainNode | null = null;
  private audioContext: AudioContext | null = null;
  
  // 增益控制相关参数
  private continuousAutoGainEnabled: boolean = true;  // 默认开启持续自动增益
  private isLockGain: boolean = true;          // 默认30秒后锁定增益
  private lockDuration: number = 30;          // 默认30秒后锁定
  private enableCompressor: boolean = true;           // 默认开启压缩器
  private currentGain: number = 1.0;
  private targetGain: number = 1.0;
  private smoothingFactor: number = 0.98; // 平滑因子
  
  // 增益锁定相关参数
  private gainLocked: boolean = false;    // 增益锁定状态
  private lockedGainValue: number = 1.0;  // 锁定的增益值
  private startTime: number = 0;          // 开始时间
  private lockTimeoutId: number | null = null; // 锁定定时器ID
  
  // 响度跳变预警相关参数
  private previousLoudness: number = -100; // 初始值设置为一个很低的值
  private loudnessHistory: number[] = [];
  private spikeThreshold: number = 10; // 响度跳变阈值（dB）
  private spikeDetected: boolean = false;
  private spikeRecoveryTime: number = 2000; // 响度跳变恢复时间（毫秒）
  private spikeDetectedTime: number = 0;
  
  // 动态压缩相关参数
  private compressionThreshold: number = -10; // 压缩阈值（LUFS）
  private compressionRatio: number = 4; // 压缩比例
  
  /**
   * 📊 增益单位换算参考：
   *
   * ┌───────────────┬─────────────┬──────────────────────┐
   * │   分贝 (dB)     │  线性倍率     │      感知音量变化       │
   * ├───────────────┼─────────────┼──────────────────────┤
   * │     0 dB      │     1.0     │ 无增益（原始音量）     │
   * │    -6 dB      │    ~0.5     │ 音量减半              │
   * │   -12 dB      │    ~0.25    │ 音量大幅减弱          │
   * │   +6 dB       │    ~2.0     │ 音量翻倍              │
   * │   +12 dB      │    ~4.0     │ 非常明显地增大        │
   * │   -∞ dB       │     0       │ 完全静音              │
   * └───────────────┴─────────────┴──────────────────────┘
   */

  // 增益范围限制，公开以便外部访问
  public gainRange: { min: number; max: number } = { min: 0.01, max: 2.0 };
  
  /**
   * 创建增益控制器实例
   * @param options 增益控制器配置选项
   */
  constructor(options: {
    continuousAutoGain?: boolean;
    isLockGain?: boolean;
    lockDuration?: number;
    enableCompressor?: boolean;
    gainRange?: { min: number; max: number };
    smoothingFactor?: number;
  } = {}) {
    // 设置持续自动增益
    this.continuousAutoGainEnabled = options.continuousAutoGain ?? true;
    
    // 设置是否锁定增益
    this.isLockGain = options.isLockGain ?? true;
    
    // 设置锁定增益的秒数
    this.lockDuration = options.lockDuration ?? 30;
    
    // 设置是否启用压缩器
    this.enableCompressor = options.enableCompressor ?? true;
    
    // 设置增益范围
    if (options.gainRange) {
      this.gainRange = options.gainRange;
    }
    
    // 设置平滑因子
    if (options.smoothingFactor !== undefined) {
      this.smoothingFactor = clamp(options.smoothingFactor, 0, 0.99);
    }
    
    console.log('增益控制器初始化，持续自动增益:', this.continuousAutoGainEnabled, 
                `${this.lockDuration}秒后锁定增益: ${this.isLockGain}`);
  }
  
  /**
   * 初始化增益控制器
   * @param audioContext 音频上下文
   * @param existingGainNode 可选的已存在的增益节点
   * @returns 创建或使用的增益节点
   */
  init(audioContext: AudioContext, existingGainNode?: GainNode): GainNode {
    this.audioContext = audioContext;
    
    // 如果提供了外部增益节点，使用它
    if (existingGainNode) {
      console.log('使用外部提供的增益节点');
      this.gainNode = existingGainNode;
    } else {
      // 否则创建新的增益节点
      this.gainNode = audioContext.createGain();
      console.log('创建新的增益节点');
    }
    
    // 记录开始时间，用于锁定增益
    this.startTime = Date.now();
    
    // 如果启用了锁定增益，设置定时器
    if (this.isLockGain) {
      this.setupGainLockTimer();
    }
    
    return this.gainNode;
  }
  
  /**
   * 设置锁定增益的定时器
   */
  private setupGainLockTimer(): void {
    // 清除可能存在的旧定时器
    if (this.lockTimeoutId !== null) {
      window.clearTimeout(this.lockTimeoutId);
    }
    
    // 设置新定时器，锁定时间后锁定增益
    this.lockTimeoutId = window.setTimeout(() => {
      if (this.continuousAutoGainEnabled && !this.gainLocked) {
        console.log(`增益范围: ${this.gainRange.min.toFixed(2)} - ${this.gainRange.max.toFixed(2)}`);
        console.log('锁定时间到，锁定当前增益值:', this.currentGain.toFixed(2));
        this.lockGain();
      }
    }, this.lockDuration * 1000) as unknown as number;
  }
  
  /**
   * 获取增益节点
   * @returns 增益节点
   */
  getGainNode(): GainNode | null {
    return this.gainNode;
  }
  
  /**
   * 设置增益值
   * @param value 增益值（线性，非dB）
   */
  setGain(value: number): void {
    // 如果增益已锁定且不是手动设置，则不允许更改
    if (this.gainLocked) {
      console.log('增益已锁定，当前值:', this.lockedGainValue.toFixed(2));
      
      // 如果有增益节点，确保它使用锁定的值
      if (this.gainNode && this.audioContext) {
        this.gainNode.gain.setValueAtTime(
          this.lockedGainValue,
          this.audioContext.currentTime
        );
      }
      
      return;
    }
    
    // 限制增益范围
    const limitedValue = clamp(value, this.gainRange.min, this.gainRange.max);
    
    // 更新目标增益值
    this.targetGain = limitedValue;
    
    // 如果没有启用持续自动增益，直接应用增益
    if (!this.continuousAutoGainEnabled) {
      this.currentGain = limitedValue;
      
      if (this.gainNode && this.audioContext) {
        this.gainNode.gain.setValueAtTime(
          limitedValue,
          this.audioContext.currentTime
        );
        
        // 记录当前增益值（dB）用于调试
        const gainInDecibels = linearToDb(limitedValue);
        console.log(`手动设置增益: ${limitedValue.toFixed(2)} (${gainInDecibels.toFixed(1)} dB)`);
      }
    }
  }
  
  /**
   * 锁定增益值，防止后续变化
   * @param gainValue 锁定的增益值，如果不指定则使用当前增益值
   */
  lockGain(gainValue?: number): void {
    // 如果已经锁定，不做任何操作
    if (this.gainLocked) return;
    
    // 确定要锁定的增益值
    const valueToLock = gainValue !== undefined ? gainValue : this.currentGain;
    
    // 限制范围
    this.lockedGainValue = clamp(valueToLock, this.gainRange.min, this.gainRange.max);
    
    // 设置锁定状态
    this.gainLocked = true;
    
    // 应用锁定的增益值
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(
        this.lockedGainValue,
        this.audioContext.currentTime
      );
    }
    
    // 记录锁定的增益值（dB）用于调试
    const gainInDecibels = linearToDb(this.lockedGainValue);
    console.log(`增益已锁定，实际增益: ${this.lockedGainValue.toFixed(2)} (${gainInDecibels.toFixed(1)} dB)`);
  }
  
  /**
   * 解锁增益值，允许后续变化
   */
  unlockGain(): void {
    this.gainLocked = false;
    console.log('增益已解锁，可以自由调整');
    
    // 如果启用了N秒后锁定增益，重新设置定时器
    if (this.isLockGain) {
      this.setupGainLockTimer();
    }
  }
  
  /**
   * 检查增益是否锁定
   * @returns 增益锁定状态
   */
  isGainLocked(): boolean {
    return this.gainLocked;
  }
  
  /**
   * 获取当前增益值
   * @returns 当前增益值（线性，非dB）
   */
  getCurrentGain(): number {
    return this.gainLocked ? this.lockedGainValue : this.currentGain;
  }
  
  /**
   * 获取当前增益值（dB）
   * @returns 当前增益值（dB）
   */
  getCurrentGainDB(): number {
    return linearToDb(this.getCurrentGain());
  }
  
  /**
   * 设置持续自动增益状态
   * @param enabled 是否启用持续自动增益
   */
  setContinuousAutoGainEnabled(enabled: boolean): void {
    this.continuousAutoGainEnabled = enabled;
    
    // 如果禁用持续自动增益，解锁增益
    if (!enabled && this.gainLocked) {
      this.unlockGain();
    }
    
    console.log('持续自动增益:', enabled ? '启用' : '禁用');
  }
  
  /**
   * 设置锁定增益状态
   * @param enabled 是否启用锁定增益
   */
  setLockGain(enabled: boolean): void {
    this.isLockGain = enabled;
    
    // 如果启用锁定增益，设置定时器
    if (enabled && !this.gainLocked) {
      this.setupGainLockTimer();
    } else if (!enabled && this.lockTimeoutId !== null) {
      // 如果禁用锁定增益，清除定时器
      window.clearTimeout(this.lockTimeoutId);
      this.lockTimeoutId = null;
    }
    
    console.log('锁定增益:', enabled ? '启用' : '禁用');
  }
  
  /**
   * 设置压缩器状态
   * @param enabled 是否启用压缩器
   */
  setCompressorEnabled(enabled: boolean): void {
    this.enableCompressor = enabled;
    console.log('压缩器:', enabled ? '启用' : '禁用');
  }
  
  /**
   * 检查持续自动增益是否启用
   * @returns 持续自动增益状态
   */
  isContinuousAutoGainEnabled(): boolean {
    return this.continuousAutoGainEnabled;
  }
  
  /**
   * 检查锁定增益是否启用
   * @returns 锁定增益状态
   */
  isLockGainEnabled(): boolean {
    return this.isLockGain;
  }
  
  /**
   * 检查压缩器是否启用
   * @returns 压缩器状态
   */
  isCompressorEnabled(): boolean {
    return this.enableCompressor;
  }
  
  /**
   * 应用自动增益
   * @param rawGain 原始计算的增益值
   * @param currentLoudness 当前短期响度值
   */
  applyAutoGain(rawGain: number, currentLoudness: number): void {
    // 如果增益已锁定，不做任何操作
    if (this.gainLocked) return;
    
    // 如果没有启用持续自动增益，不做任何操作
    if (!this.continuousAutoGainEnabled) return;
    
    // 检测响度跳变
    const isSpike = this.detectLoudnessSpike(currentLoudness);
    
    // 根据是否检测到响度跳变来决定目标增益
    if (isSpike && this.enableCompressor) {
      this.targetGain = this.applyDynamicCompression(rawGain, currentLoudness);
    } else {
      // 否则使用原始增益
      this.targetGain = rawGain;
    }
    
    // 平滑过渡到目标增益
    this.currentGain = this.smoothingFactor * this.currentGain + (1 - this.smoothingFactor) * this.targetGain;
    
    // 应用增益
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.value = this.currentGain;
    }
  }
  
  /**
   * 应用淡入效果
   * @param durationMs 淡入持续时间（毫秒）
   */
  applyFadeIn(durationMs: number = 50): void {
    if (!this.gainNode || !this.audioContext) return;
    
    const currentTime = this.audioContext.currentTime;
    
    // 先将增益设为0
    this.gainNode.gain.setValueAtTime(0, currentTime);
    
    // 在指定时间内线性增加到目标增益
    this.gainNode.gain.linearRampToValueAtTime(
      this.getCurrentGain(),
      currentTime + durationMs / 1000
    );
  }
  
  /**
   * 应用淡出效果
   * @param durationMs 淡出持续时间（毫秒）
   */
  applyFadeOut(durationMs: number = 50): void {
    if (!this.gainNode || !this.audioContext) return;
    
    const currentTime = this.audioContext.currentTime;
    
    // 从当前增益线性减少到0
    this.gainNode.gain.linearRampToValueAtTime(
      0,
      currentTime + durationMs / 1000
    );
  }
  
  /**
   * 检测响度跳变
   * @param currentLoudness 当前响度值（LUFS）
   * @returns 是否检测到响度跳变
   */
  private detectLoudnessSpike(currentLoudness: number): boolean {
    // 将响度值添加到历史记录中
    this.loudnessHistory.push(currentLoudness);
    
    // 限制历史记录长度
    if (this.loudnessHistory.length > 10) {
      this.loudnessHistory.shift();
    }
    
    // 如果历史记录不足，无法检测跳变
    if (this.loudnessHistory.length < 2) {
      return false;
    }
    
    // 计算响度变化
    const loudnessDiff = currentLoudness - this.previousLoudness;
    
    // 更新上一次响度值
    this.previousLoudness = currentLoudness;
    
    // 检测响度跳变
    if (loudnessDiff >= this.spikeThreshold) {
      // 记录检测到跳变的时间
      this.spikeDetected = true;
      this.spikeDetectedTime = Date.now();
      return true;
    }
    
    // 检查是否在恢复期内
    if (this.spikeDetected) {
      const currentTime = Date.now();
      if (currentTime - this.spikeDetectedTime > this.spikeRecoveryTime) {
        // 恢复期已过，重置跳变状态
        this.spikeDetected = false;
      }
      return this.spikeDetected;
    }
    
    return false;
  }
  
  /**
   * 应用动态压缩
   * @param gain 原始增益值
   * @param loudness 当前响度值（LUFS）
   * @returns 压缩后的增益值
   */
  private applyDynamicCompression(gain: number, loudness: number): number {
    // 如果响度超过压缩阈值，应用压缩
    if (loudness > this.compressionThreshold) {
      // 计算超出阈值的响度量
      const overThreshold = loudness - this.compressionThreshold;
      
      // 应用压缩比例
      const compressedOver = overThreshold / this.compressionRatio;
      
      // 计算压缩后的响度
      const compressedLoudness = this.compressionThreshold + compressedOver;
      
      // 计算响度差值
      const loudnessDiff = compressedLoudness - loudness;
      
      // 计算压缩后的增益值
      const compressedGain = gain * Math.pow(10, loudnessDiff / 20);
      
      return compressedGain;
    }
    
    return gain;
  }
  
  /**
   * 重置增益控制器
   */
  reset(): void {
    if (this.gainNode && this.audioContext) {
      this.setGain(1.0);
    }
    
    this.currentGain = 1.0;
    this.targetGain = 1.0;
    this.previousLoudness = -100;
    this.loudnessHistory = [];
    this.spikeDetected = false;
    this.gainLocked = false;
    this.lockedGainValue = 1.0;
    
    // 重置开始时间
    this.startTime = Date.now();
    
    // 清除定时器
    if (this.lockTimeoutId !== null) {
      window.clearTimeout(this.lockTimeoutId);
      this.lockTimeoutId = null;
    }
    
    // 如果启用了锁定增益，重新设置定时器
    if (this.isLockGain) {
      this.setupGainLockTimer();
    }
    
    console.log('增益控制器已重置');
  }
}
