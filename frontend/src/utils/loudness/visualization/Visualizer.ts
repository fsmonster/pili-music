/**
 * 可视化器类
 * 负责将响度数据可视化展示
 */
export class Visualizer {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  
  // 数据缓冲
  private momentaryData: number[] = [];
  private shortTermData: number[] = [];
  private integratedData: number[] = [];
  private targetLoudnessData: number[] = [];
  private gainData: number[] = [];
  
  // 配置选项
  private options = {
    colors: {
      background: '#ffffff',
      momentary: '#00e6ff',
      shortTerm: '#81c784',
      integrated: '#ffb74d',
      target: '#ff795e',
      gain: '#ff4081',
      grid: '#9e9e9e',
      text: '#000000'
    },
    showLegend: true,
    maxDataPoints: 100,
    minLoudness: -40,
    maxLoudness: 0,
    minGain: 0,
    maxGain: 4,  // 增加最大增益范围，与GainController一致
    targetLoudness: -16,  // 默认目标响度值
    
    // 可视化显示选项
    show: {
      momentary: true,
      shortTerm: true,
      integrated: true,
      target: true,
      gain: true
    }
  };
  
  /**
   * 创建可视化器实例
   * @param container 容器元素或选择器
   * @param options 可视化配置选项
   */
  constructor(container: string | HTMLElement, options: any = {}) {
    // 获取容器元素
    if (typeof container === 'string') {
      const el = document.querySelector(container);
      if (!el) {
        throw new Error(`找不到容器元素: ${container}`);
      }
      this.container = el as HTMLElement;
    } else {
      this.container = container;
    }
    
    // 合并配置选项
    this.options = { 
      ...this.options, 
      ...options,
      colors: { ...this.options.colors, ...options.colors },
      show: { ...this.options.show, ...options.show }
    };
    
    // 创建画布
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.container.appendChild(this.canvas);
    
    // 获取绘图上下文
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取 Canvas 2D 上下文');
    }
    this.ctx = ctx;
    
    // 初始化画布尺寸
    this.resizeCanvas();
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    
    // 初始绘制
    this.draw();
  }
  
  /**
   * 调整画布尺寸
   */
  private resizeCanvas(): void {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height || 300; // 默认高度
    
    // 设置画布尺寸（考虑设备像素比）
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    // 重新绘制
    this.draw();
  }
  
  /**
   * 更新响度数据
   * @param data 响度数据对象
   * @param history 响度历史数据
   */
  update(data: { 
    momentary: number; 
    shortTerm: number; 
    integrated: number;
    gain: number;
    gainDB: number;
  }, history?: { 
    momentary: number[]; 
    shortTerm: number[]; 
    integrated: number[];
  }): void {
    // 添加新数据点
    this.momentaryData.push(data.momentary);
    this.shortTermData.push(data.shortTerm);
    this.integratedData.push(data.integrated);
    this.targetLoudnessData.push(this.options.targetLoudness); // 使用当前的目标响度值
    this.gainData.push(data.gain);
    
    // 限制数据点数量
    if (this.momentaryData.length > this.options.maxDataPoints) {
      this.momentaryData.shift();
      this.shortTermData.shift();
      this.integratedData.shift();
      this.targetLoudnessData.shift();
      this.gainData.shift();
    }
    
    // 重新绘制
    this.draw();
  }
  
  /**
   * 绘制可视化图表
   */
  private draw(): void {
    const { ctx, width, height } = this;
    const { colors, minLoudness, maxLoudness, minGain, maxGain, showLegend, show } = this.options;
    
    // 确保画布已初始化
    if (!ctx || width === 0 || height === 0) {
      return;
    }
    
    // 清除画布
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);
    
    // 如果没有数据，绘制空白图表
    if (this.momentaryData.length === 0) {
      this.drawEmptyChart();
      return;
    }
    
    // 绘制网格和刻度
    const gridMargin = { top: 20, right: 50, bottom: 30, left: 50 };
    const gridWidth = width - gridMargin.left - gridMargin.right;
    const gridHeight = height - gridMargin.top - gridMargin.bottom;
    
    this.drawGrid(
      gridMargin.left, 
      gridMargin.top, 
      gridWidth, 
      gridHeight, 
      minLoudness, 
      maxLoudness,
      minGain,
      maxGain
    );
    
    // 定义绘制线条的函数
    const drawLine = (data: number[], color: string, yScale: (v: number) => number) => {
      if (data.length < 2) return;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // 计算X坐标步长
      const xStep = gridWidth / (this.options.maxDataPoints - 1);
      
      // 绘制路径
      for (let i = 0; i < data.length; i++) {
        const x = gridMargin.left + i * xStep;
        const y = yScale(data[i]);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    };
    
    // 响度值的Y坐标转换函数
    const loudnessToY = (loudness: number) => {
      const normalizedValue = (loudness - minLoudness) / (maxLoudness - minLoudness);
      return gridMargin.top + gridHeight - normalizedValue * gridHeight;
    };
    
    // 增益值的Y坐标转换函数
    const gainToY = (gain: number) => {
      const normalizedValue = (gain - minGain) / (maxGain - minGain);
      return gridMargin.top + gridHeight - normalizedValue * gridHeight;
    };
    
    // 绘制各条线
    if (show.momentary) {
      drawLine(this.momentaryData, colors.momentary, loudnessToY);
    }
    
    if (show.shortTerm) {
      drawLine(this.shortTermData, colors.shortTerm, loudnessToY);
    }
    
    if (show.integrated) {
      drawLine(this.integratedData, colors.integrated, loudnessToY);
    }
    
    if (show.target) {
      drawLine(this.targetLoudnessData, colors.target, loudnessToY);
    }
    
    if (show.gain) {
      // 增益线使用虚线
      ctx.setLineDash([5, 3]);
      drawLine(this.gainData, colors.gain, gainToY);
      ctx.setLineDash([]);
    }
    
    // 绘制图例
    if (showLegend) {
      this.drawLegend(height - gridMargin.bottom);
    }
  }
  
  /**
   * 绘制空白图表
   */
  private drawEmptyChart(): void {
    const { ctx, width, height } = this;
    const { colors } = this.options;
    
    // 绘制网格和刻度
    const gridMargin = { top: 20, right: 50, bottom: 30, left: 50 };
    const gridWidth = width - gridMargin.left - gridMargin.right;
    const gridHeight = height - gridMargin.top - gridMargin.bottom;
    
    this.drawGrid(
      gridMargin.left, 
      gridMargin.top, 
      gridWidth, 
      gridHeight, 
      this.options.minLoudness, 
      this.options.maxLoudness,
      this.options.minGain,
      this.options.maxGain
    );
    
    // 绘制提示文本
    ctx.fillStyle = colors.text;
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('等待数据...', width / 2, height / 2);
  }
  
  /**
   * 绘制网格和刻度
   */
  private drawGrid(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    minLoudness: number, 
    maxLoudness: number,
    minGain?: number,
    maxGain?: number
  ): void {
    const { ctx } = this;
    const { colors } = this.options;
    
    // 绘制网格边框
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // 绘制水平网格线和刻度
    const loudnessStep = 10; // 每10dB一条线
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = colors.text;
    
    for (let loudness = minLoudness; loudness <= maxLoudness; loudness += loudnessStep) {
      const yPos = y + height - ((loudness - minLoudness) / (maxLoudness - minLoudness)) * height;
      
      // 绘制网格线
      ctx.beginPath();
      ctx.moveTo(x, yPos);
      ctx.lineTo(x + width, yPos);
      ctx.strokeStyle = colors.grid;
      ctx.stroke();
      
      // 绘制刻度标签
      ctx.fillText(`${loudness} LUFS`, x - 3, yPos + 4);
    }
    
    // 如果提供了增益范围，绘制右侧增益刻度
    if (minGain !== undefined && maxGain !== undefined) {
      const gainStep = 1; // 每1倍一条刻度
      ctx.textAlign = 'left';
      
      for (let gain = minGain; gain <= maxGain; gain += gainStep) {
        const yPos = y + height - ((gain - minGain) / (maxGain - minGain)) * height;
        
        // 绘制刻度标签
        ctx.fillText(`${gain.toFixed(1)}x`, x + width + 5, yPos + 4);
      }
    }
    
    // 绘制垂直轴标签
    ctx.save();
    ctx.translate(67, y + height / 2); // 调整标签位置
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('响度 (LUFS)', 0, 0);
    ctx.restore();
    
    // 绘制增益轴标签
    if (minGain !== undefined && maxGain !== undefined) {
      ctx.save();
      ctx.translate(width - 15, y + height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('增益 (倍率)', 0, 0);
      ctx.restore();
    }
  }
  
  /**
   * 绘制图例
   */
  private drawLegend(yPosition: number): void {
    const { ctx, width } = this;
    const { colors, show } = this.options;
    
    // 根据设置创建图例数组
    const legends = [];
    
    if (show.momentary) {
      legends.push({ label: '瞬时', color: colors.momentary });
    }
    
    if (show.shortTerm) {
      legends.push({ label: '短期', color: colors.shortTerm });
    }
    
    if (show.integrated) {
      legends.push({ label: '整体', color: colors.integrated });
    }
    
    if (show.target) {
      legends.push({ label: '目标', color: colors.target });
    }
    
    if (show.gain) {
      legends.push({ label: '增益', color: colors.gain });
    }
    
    const legendWidth = 70;
    const totalWidth = legends.length * legendWidth;
    const startX = (width - totalWidth) / 2;
    
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    legends.forEach((legend, i) => {
      const x = startX + i * legendWidth;
      const y = yPosition + 15;
      
      // 绘制色块
      ctx.fillStyle = legend.color;
      ctx.fillRect(x, y - 5, 15, 2);
      
      // 如果是增益，绘制虚线
      if (legend.label === '增益') {
        ctx.strokeStyle = legend.color;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x + 15, y - 5);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // 绘制标签
      ctx.fillStyle = colors.text;
      ctx.fillText(legend.label, x + 20, y);
    });
  }
  
  /**
   * 设置目标响度值
   * @param value 目标响度值（LUFS）
   */
  setTargetLoudness(value: number): void {
    // 更新目标响度值
    this.options.targetLoudness = value;
    console.log('可视化器设置目标响度:', value);
    
    // 更新当前目标响度数据数组
    if (this.targetLoudnessData.length > 0) {
      // 将所有目标响度数据点更新为新值
      this.targetLoudnessData = this.targetLoudnessData.map(() => value);
      
      // 重新绘制
      this.draw();
    }
  }
  
  /**
   * 清除所有数据
   */
  clear(): void {
    this.momentaryData = [];
    this.shortTermData = [];
    this.integratedData = [];
    this.targetLoudnessData = [];
    this.gainData = [];
    
    // 重新绘制
    this.draw();
  }
  
  /**
   * 更新可视化设置
   * @param settings 要更新的设置项
   */
  updateSettings(settings: any): void {
    // 更新显示设置
    if (settings.showMomentary !== undefined) {
      this.options.show.momentary = settings.showMomentary;
    }
    
    if (settings.showShortTerm !== undefined) {
      this.options.show.shortTerm = settings.showShortTerm;
    }
    
    if (settings.showIntegrated !== undefined) {
      this.options.show.integrated = settings.showIntegrated;
    }
    
    if (settings.showTarget !== undefined) {
      this.options.show.target = settings.showTarget;
    }
    
    if (settings.showGain !== undefined) {
      this.options.show.gain = settings.showGain;
    }
    
    console.log('可视化设置已更新:', settings);
    
    // 重新绘制
    this.draw();
  }
  
  /**
   * 销毁可视化器
   */
  destroy(): void {
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}
