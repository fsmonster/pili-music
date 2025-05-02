/**
 * 工具函数集合
 */

// 重新导出 EventEmitter
export { EventEmitter } from './EventEmitter';

/**
 * 将线性增益值转换为分贝值
 * @param linear 线性增益值
 * @returns 分贝值
 */
export function linearToDb(linear: number): number {
  // 防止对0或负数取对数
  const safeLinear = Math.max(linear, 0.0000001);
  return 20 * Math.log10(safeLinear);
}

/**
 * 将分贝值转换为线性增益值
 * @param db 分贝值
 * @returns 线性增益值
 */
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * 计算数组的均方根值 (RMS)
 * @param data 数据数组
 * @returns RMS值
 */
export function calculateRMS(data: Float32Array): number {
  let sumOfSquares = 0;
  for (let i = 0; i < data.length; i++) {
    sumOfSquares += data[i] * data[i];
  }
  return Math.sqrt(sumOfSquares / data.length);
}

/**
 * 计算数组的平均值
 * @param data 数据数组
 * @returns 平均值
 */
export function calculateMean(data: number[]): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
}

/**
 * 计算数组的标准差
 * @param data 数据数组
 * @returns 标准差
 */
export function calculateStandardDeviation(data: number[]): number {
  if (data.length <= 1) return 0;
  
  const mean = calculateMean(data);
  const squaredDiffs = data.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  
  const variance = calculateMean(squaredDiffs);
  return Math.sqrt(variance);
}

/**
 * 限制值在指定范围内
 * @param value 要限制的值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 创建一个防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = window.setTimeout(later, wait) as unknown as number;
  };
}

/**
 * 格式化分贝值为字符串
 * @param db 分贝值
 * @param precision 小数位数
 * @returns 格式化后的字符串
 */
export function formatDb(db: number, precision: number = 1): string {
  return `${db.toFixed(precision)} dB`;
}

/**
 * 格式化LUFS值为字符串
 * @param lufs LUFS值
 * @param precision 小数位数
 * @returns 格式化后的字符串
 */
export function formatLUFS(lufs: number, precision: number = 1): string {
  return `${lufs.toFixed(precision)} LUFS`;
}
