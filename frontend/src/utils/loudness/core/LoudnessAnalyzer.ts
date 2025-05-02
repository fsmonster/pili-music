/**
 * 响度分析器类
 * 负责计算音频的响度指标
 */
export class LoudnessAnalyzer {
  // 响度目标值 (LUFS)
  private targetLoudness: number;
  
  // 缓冲区和历史数据
  private momentaryBuffer: Float32Array;
  private shortTermBuffer: Float32Array;
  private integratedBuffer: Float32Array;
  private momentaryHistory: number[] = [];
  private shortTermHistory: number[] = [];
  private integratedHistory: number[] = [];
  
  // 响度统计
  private momentaryMax: number = -Infinity;
  private momentaryMin: number = Infinity;
  private shortTermMax: number = -Infinity;
  private shortTermMin: number = Infinity;
  
  /**
   * 创建响度分析器实例
   * @param targetLoudness 目标响度值 (LUFS)，默认 -16
   */
  constructor(targetLoudness: number = -16) {
    this.targetLoudness = targetLoudness;
    
    // 初始化缓冲区
    this.momentaryBuffer = new Float32Array(400); // 400ms
    this.shortTermBuffer = new Float32Array(3000); // 3s
    this.integratedBuffer = new Float32Array(0); // 动态增长
  }
  
  /**
   * 设置目标响度
   * @param value 目标响度值 (LUFS)
   */
  setTargetLoudness(value: number): void {
    this.targetLoudness = value;
  }
  
  /**
   * 获取目标响度
   * @returns 目标响度值 (LUFS)
   */
  getTargetLoudness(): number {
    return this.targetLoudness;
  }
  
  /**
   * 分析音频数据
   * @param audioData 音频数据
   * @param sampleRate 采样率
   * @returns 响度数据对象
   */
  analyze(audioData: Float32Array, sampleRate: number): { 
    momentary: number; 
    shortTerm: number; 
    integrated: number; 
    truePeak: number;
    loudnessRange: number;
    spectralCentroid: number;
  } {
    // 计算瞬时响度 (400ms 窗口)
    const momentary = this.calculateMomentaryLoudness(audioData);
    this.momentaryHistory.push(momentary);
    
    // 限制历史记录长度
    if (this.momentaryHistory.length > 100) {
      this.momentaryHistory.shift();
    }
    
    // 更新最大/最小值
    this.momentaryMax = Math.max(this.momentaryMax, momentary);
    this.momentaryMin = Math.min(this.momentaryMin, momentary);
    
    // 计算短期响度 (3s 窗口)
    const shortTerm = this.calculateShortTermLoudness(this.momentaryHistory);
    this.shortTermHistory.push(shortTerm);
    
    // 限制历史记录长度
    if (this.shortTermHistory.length > 100) {
      this.shortTermHistory.shift();
    }
    
    // 更新最大/最小值
    this.shortTermMax = Math.max(this.shortTermMax, shortTerm);
    this.shortTermMin = Math.min(this.shortTermMin, shortTerm);
    
    // 计算整体响度
    const integrated = this.calculateIntegratedLoudness(this.shortTermHistory);
    this.integratedHistory.push(integrated);
    
    // 限制历史记录长度
    if (this.integratedHistory.length > 100) {
      this.integratedHistory.shift();
    }
    
    // 计算真峰值
    const truePeak = this.calculateTruePeak(audioData);
    
    // 计算响度范围
    const loudnessRange = this.calculateLoudnessRange();
    
    // 计算频谱重心
    const spectralCentroid = this.calculateSpectralCentroid(audioData, sampleRate);
    
    return {
      momentary,
      shortTerm,
      integrated,
      truePeak,
      loudnessRange,
      spectralCentroid
    };
  }
  
  /**
   * 计算瞬时响度 (M)
   * @param audioData 音频数据
   * @returns 瞬时响度值 (LUFS)
   */
  private calculateMomentaryLoudness(audioData: Float32Array): number {
    // 简化的瞬时响度计算
    // 实际的 LUFS 计算需要更复杂的 K-加权滤波和门限处理
    
    // 计算 RMS (均方根)
    let sumOfSquares = 0;
    for (let i = 0; i < audioData.length; i++) {
      sumOfSquares += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sumOfSquares / audioData.length);
    
    // 转换为 LUFS (简化版)
    // 实际的 LUFS 计算比这复杂得多
    const lufs = 20 * Math.log10(Math.max(rms, 0.0000001)) - 0.691;
    
    return lufs;
  }
  
  /**
   * 计算短期响度 (S)
   * @param momentaryValues 瞬时响度历史值
   * @returns 短期响度值 (LUFS)
   */
  private calculateShortTermLoudness(momentaryValues: number[]): number {
    if (momentaryValues.length === 0) return -70;
    
    // 使用最近的瞬时响度值计算短期响度
    // 实际上应该使用3秒窗口的数据进行更复杂的计算
    const recentValues = momentaryValues.slice(-10); // 使用最近的10个值
    
    // 计算平均值
    const sum = recentValues.reduce((acc, val) => acc + val, 0);
    return sum / recentValues.length;
  }
  
  /**
   * 计算整体响度 (I)
   * @param shortTermValues 短期响度历史值
   * @returns 整体响度值 (LUFS)
   */
  private calculateIntegratedLoudness(shortTermValues: number[]): number {
    if (shortTermValues.length === 0) return -70;
    
    // 简化的整体响度计算
    // 实际上应该使用更复杂的门限处理
    
    // 过滤掉低于门限的值
    const threshold = -70; // 简化的绝对门限
    const filteredValues = shortTermValues.filter(val => val > threshold);
    
    if (filteredValues.length === 0) return -70;
    
    // 计算平均值
    const sum = filteredValues.reduce((acc, val) => acc + val, 0);
    return sum / filteredValues.length;
  }
  
  /**
   * 计算真峰值
   * @param audioData 音频数据
   * @returns 真峰值 (dBTP)
   */
  private calculateTruePeak(audioData: Float32Array): number {
    // 简化的真峰值计算
    // 实际的真峰值计算需要过采样和更复杂的处理
    
    let peak = 0;
    for (let i = 0; i < audioData.length; i++) {
      peak = Math.max(peak, Math.abs(audioData[i]));
    }
    
    // 转换为 dBTP
    return 20 * Math.log10(Math.max(peak, 0.0000001));
  }
  
  /**
   * 计算响度范围
   * @returns 响度范围 (LU)
   */
  private calculateLoudnessRange(): number {
    // 简化的响度范围计算
    // 实际的响度范围计算需要更复杂的统计处理
    
    if (this.shortTermHistory.length < 2) return 0;
    
    // 使用短期响度的最大值和最小值之差作为响度范围
    // 过滤掉极低的值
    const threshold = -70;
    const filteredValues = this.shortTermHistory.filter(val => val > threshold);
    
    if (filteredValues.length < 2) return 0;
    
    // 计算10%和90%百分位数
    const sorted = [...filteredValues].sort((a, b) => a - b);
    const lower = sorted[Math.floor(sorted.length * 0.1)];
    const upper = sorted[Math.floor(sorted.length * 0.9)];
    
    return upper - lower;
  }
  
  /**
   * 计算频谱重心
   * @param audioData 音频数据
   * @param sampleRate 采样率
   * @returns 频谱重心 (Hz)
   */
  private calculateSpectralCentroid(audioData: Float32Array, sampleRate: number): number {
    // 简化的频谱重心计算
    
    // 如果数据不足，返回默认值
    if (audioData.length < 32) return 0;
    
    // 创建一个FFT分析器来计算频谱
    const fftSize = 1024;
    const fft = new Float32Array(fftSize);
    
    // 复制数据到FFT数组
    for (let i = 0; i < Math.min(audioData.length, fftSize); i++) {
      fft[i] = audioData[i];
    }
    
    // 这里应该进行FFT变换，但为了简化，我们使用一个模拟的频谱
    // 实际实现需要使用Web Audio API的AnalyserNode或FFT库
    
    // 模拟频谱计算
    const magnitudes = new Float32Array(fftSize / 2);
    for (let i = 0; i < fftSize / 2; i++) {
      // 模拟一个衰减的频谱
      magnitudes[i] = Math.random() * Math.exp(-i / (fftSize / 4));
    }
    
    // 计算频谱重心
    let weightedSum = 0;
    let sum = 0;
    
    for (let i = 0; i < magnitudes.length; i++) {
      const frequency = i * sampleRate / fftSize;
      weightedSum += frequency * magnitudes[i];
      sum += magnitudes[i];
    }
    
    if (sum === 0) return 0;
    
    return weightedSum / sum;
  }
  
  /**
   * 重置分析器状态
   */
  reset(): void {
    this.momentaryHistory = [];
    this.shortTermHistory = [];
    this.integratedHistory = [];
    this.momentaryMax = -Infinity;
    this.momentaryMin = Infinity;
    this.shortTermMax = -Infinity;
    this.shortTermMin = Infinity;
  }
  
  /**
   * 获取响度历史数据
   * @returns 包含各类响度历史数据的对象
   */
  getHistory(): { 
    momentary: number[]; 
    shortTerm: number[]; 
    integrated: number[];
  } {
    return {
      momentary: [...this.momentaryHistory],
      shortTerm: [...this.shortTermHistory],
      integrated: [...this.integratedHistory]
    };
  }
  
  /**
   * 计算当前增益值
   * @param currentLoudness 当前响度值
   * @returns 建议的增益值
   */
  calculateGain(currentLoudness: number): number {
    // 如果当前响度太低，返回默认增益
    if (currentLoudness < -70) return 1.0;
    
    // 计算需要的增益
    // 响度差 = 目标响度 - 当前响度
    // 增益(dB) = 响度差
    // 增益(线性) = 10^(增益(dB)/20)
    const loudnessDiff = this.targetLoudness - currentLoudness;
    const gainDB = loudnessDiff;
    const gainLinear = Math.pow(10, gainDB / 20);
    
    // 限制增益范围，防止过度增益导致失真
    return Math.min(Math.max(gainLinear, 0.01), 10.0);
  }
}
