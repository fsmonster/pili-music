/**
 * 音频处理器类
 * 负责音频信号的处理和分析
 */
export class AudioProcessor {
  // 音频处理相关节点
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  
  // 分析器配置
  private fftSize: number = 2048;
  private smoothingTimeConstant: number = 0.8;
  
  // 状态标志
  private isProcessing: boolean = false;
  private mediaElementSourceConnected: boolean = false;
  
  // 缓冲区
  private timeDataArray: Float32Array | null = null;
  private frequencyDataArray: Float32Array | null = null;
  
  /**
   * 创建音频处理器实例
   * @param fftSize FFT大小，必须是2的幂，默认2048
   * @param smoothing 平滑时间常数，0-1之间，默认0.8
   */
  constructor(fftSize: number = 2048, smoothing: number = 0.8) {
    this.fftSize = fftSize;
    this.smoothingTimeConstant = Math.max(0, Math.min(1, smoothing));
  }
  
  /**
   * 初始化音频上下文
   * @returns 创建的音频上下文
   */
  initAudioContext(): AudioContext {
    if (!this.audioContext) {
      try {
        // 创建音频上下文，兼容不同浏览器
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('音频上下文已初始化，采样率:', this.audioContext.sampleRate);
      } catch (error) {
        console.error('创建音频上下文失败:', error);
        throw new Error('创建音频上下文失败，您的浏览器可能不支持 Web Audio API');
      }
    }
    return this.audioContext;
  }
  
  /**
   * 连接音频元素
   * @param audioElement 要连接的音频元素
   * @returns 创建的音频源节点
   * @throws 如果音频元素已连接到其他音频上下文
   */
  connectAudioElement(audioElement: HTMLAudioElement): MediaElementAudioSourceNode {
    // 确保音频上下文已初始化
    const context = this.initAudioContext();
    
    // 如果已有连接，先断开
    if (this.sourceNode) {
      this.disconnect();
    }
    
    try {
      // 创建音频源节点
      this.sourceNode = context.createMediaElementSource(audioElement);
      this.mediaElementSourceConnected = true;
      
      // 创建分析器节点
      this.analyserNode = context.createAnalyser();
      this.analyserNode.fftSize = this.fftSize;
      this.analyserNode.smoothingTimeConstant = this.smoothingTimeConstant;
      
      // 创建增益节点
      this.gainNode = context.createGain();
      
      // 初始化数据缓冲区
      this.timeDataArray = new Float32Array(this.analyserNode.fftSize);
      this.frequencyDataArray = new Float32Array(this.analyserNode.frequencyBinCount);
      
      // 连接节点链
      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(context.destination);
      
      this.isProcessing = true;
      
      console.log('音频元素已连接，FFT大小:', this.fftSize);
      return this.sourceNode;
    } catch (error) {
      console.error('连接音频元素失败:', error);
      throw new Error('连接音频元素失败，可能该元素已连接到其他音频上下文');
    }
  }
  
  /**
   * 断开并清理音频连接
   */
  disconnect(): void {
    // 按照连接的反向顺序断开连接
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
        console.log('音频源节点已断开');
      } catch (error) {
        console.warn('断开音频源连接时出错:', error);
      }
      this.sourceNode = null;
    }
    
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (error) {
        console.warn('断开增益节点连接时出错:', error);
      }
      this.gainNode = null;
    }
    
    if (this.analyserNode) {
      try {
        this.analyserNode.disconnect();
      } catch (error) {
        console.warn('断开分析器节点连接时出错:', error);
      }
      this.analyserNode = null;
    }
    
    this.isProcessing = false;
    this.mediaElementSourceConnected = false;
    
    console.log('所有音频连接已断开');
  }
  
  /**
   * 关闭音频上下文
   */
  closeAudioContext(): void {
    if (this.audioContext) {
      // 先断开所有连接
      this.disconnect();
      
      // 关闭音频上下文
      try {
        this.audioContext.close();
        console.log('音频上下文已关闭');
      } catch (error) {
        console.error('关闭音频上下文时出错:', error);
      }
      
      this.audioContext = null;
    }
  }
  
  /**
   * 获取音频分析器节点
   * @returns 分析器节点或null
   */
  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }
  
  /**
   * 获取增益节点
   * @returns 增益节点或null
   */
  getGainNode(): GainNode | null {
    return this.gainNode;
  }
  
  /**
   * 获取时域数据
   * @returns 时域数据数组
   */
  getTimeData(): Float32Array {
    if (!this.analyserNode || !this.timeDataArray) {
      return new Float32Array(0);
    }
    
    this.analyserNode.getFloatTimeDomainData(this.timeDataArray);
    return this.timeDataArray;
  }
  
  /**
   * 获取频域数据
   * @returns 频域数据数组
   */
  getFrequencyData(): Float32Array {
    if (!this.analyserNode || !this.frequencyDataArray) {
      return new Float32Array(0);
    }
    
    this.analyserNode.getFloatFrequencyData(this.frequencyDataArray);
    return this.frequencyDataArray;
  }
  
  /**
   * 设置增益值
   * @param value 增益值 (线性，非dB)
   */
  setGain(value: number): void {
    if (this.gainNode && this.audioContext) {
      // 限制增益范围，防止过度增益导致失真
      const limitedValue = Math.min(Math.max(value, 0.01), 10.0);
      
      // 应用增益值
      this.gainNode.gain.setValueAtTime(limitedValue, this.audioContext.currentTime);
      
      // 记录当前增益值（dB）用于调试
      const gainInDecibels = 20 * Math.log10(Math.max(0.0001, limitedValue));
      console.log(`设置增益: ${limitedValue.toFixed(2)} (${gainInDecibels.toFixed(1)} dB)`);
    }
  }
  
  /**
   * 平滑设置增益值
   * @param value 目标增益值 (线性，非dB)
   * @param timeConstant 时间常数，值越大过渡越慢
   */
  setGainWithRamp(value: number, timeConstant: number = 0.1): void {
    if (this.gainNode && this.audioContext) {
      // 限制增益范围
      const limitedValue = Math.min(Math.max(value, 0.01), 10.0);
      
      // 计算dB值用于调试
      const gainInDecibels = 20 * Math.log10(Math.max(0.0001, limitedValue));
      console.log(`平滑设置增益: ${limitedValue.toFixed(2)} (${gainInDecibels.toFixed(1)} dB)`);
      
      // 平滑过渡到新增益
      this.gainNode.gain.setTargetAtTime(
        limitedValue,
        this.audioContext.currentTime,
        timeConstant
      );
    }
  }
  
  /**
   * 应用淡入效果
   * @param durationMs 淡入持续时间（毫秒）
   */
  applyFadeIn(durationMs: number = 50): void {
    if (this.gainNode && this.audioContext) {
      const currentTime = this.audioContext.currentTime;
      const currentGain = this.gainNode.gain.value;
      
      // 先将增益设为很小的值（不是0，避免爆音）
      this.gainNode.gain.setValueAtTime(0.001, currentTime);
      
      // 在指定时间内线性增加到当前增益
      this.gainNode.gain.linearRampToValueAtTime(
        currentGain,
        currentTime + durationMs / 1000
      );
    }
  }
  
  /**
   * 获取当前音频上下文
   * @returns 音频上下文或null
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }
  
  /**
   * 获取当前采样率
   * @returns 采样率或0
   */
  getSampleRate(): number {
    return this.audioContext ? this.audioContext.sampleRate : 0;
  }
  
  /**
   * 检查是否正在处理音频
   * @returns 处理状态
   */
  isActive(): boolean {
    return this.isProcessing && !!this.audioContext && !!this.analyserNode;
  }
  
  /**
   * 设置FFT大小
   * @param size FFT大小，必须是2的幂
   */
  setFFTSize(size: number): void {
    // 确保是2的幂
    const validSizes = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
    if (!validSizes.includes(size)) {
      console.error('无效的FFT大小，必须是2的幂');
      return;
    }
    
    this.fftSize = size;
    
    // 如果分析器节点已存在，更新其FFT大小
    if (this.analyserNode) {
      this.analyserNode.fftSize = size;
      
      // 重新创建数据缓冲区
      this.timeDataArray = new Float32Array(size);
      this.frequencyDataArray = new Float32Array(this.analyserNode.frequencyBinCount);
    }
  }
  
  /**
   * 设置平滑时间常数
   * @param value 平滑时间常数，0-1之间
   */
  setSmoothingTimeConstant(value: number): void {
    // 限制范围
    this.smoothingTimeConstant = Math.max(0, Math.min(1, value));
    
    // 如果分析器节点已存在，更新其平滑时间常数
    if (this.analyserNode) {
      this.analyserNode.smoothingTimeConstant = this.smoothingTimeConstant;
    }
  }
}
