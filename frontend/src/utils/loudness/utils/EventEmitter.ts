/**
 * 事件发射器类
 * 提供基本的事件订阅和发布功能
 */
export class EventEmitter {
  // 事件监听器映射
  private listeners: Map<string, Function[]> = new Map();
  
  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param callback 回调函数
   * @returns 当前实例，用于链式调用
   */
  on(event: string, callback: Function): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);
    return this;
  }
  
  /**
   * 添加一次性事件监听器
   * @param event 事件名称
   * @param callback 回调函数
   * @returns 当前实例，用于链式调用
   */
  once(event: string, callback: Function): this {
    // 创建一个包装函数，在调用后自动移除
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(event, wrapper);
    };
    
    return this.on(event, wrapper);
  }
  
  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param callback 要移除的回调函数，如不提供则移除该事件的所有监听器
   * @returns 当前实例，用于链式调用
   */
  off(event: string, callback?: Function): this {
    if (!this.listeners.has(event)) {
      return this;
    }
    
    if (!callback) {
      // 移除该事件的所有监听器
      this.listeners.delete(event);
    } else {
      // 移除特定的监听器
      const listeners = this.listeners.get(event)!;
      const index = listeners.indexOf(callback);
      
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      
      // 如果没有监听器了，删除该事件
      if (listeners.length === 0) {
        this.listeners.delete(event);
      }
    }
    
    return this;
  }
  
  /**
   * 触发事件
   * @param event 事件名称
   * @param args 传递给监听器的参数
   * @returns 当前实例，用于链式调用
   */
  emit(event: string, ...args: any[]): this {
    if (this.listeners.has(event)) {
      // 创建副本，防止在回调中修改监听器列表
      const callbacks = [...this.listeners.get(event)!];
      
      for (const callback of callbacks) {
        try {
          callback(...args);
        } catch (error) {
          console.error(`事件处理器错误 [${event}]:`, error);
        }
      }
    }
    
    return this;
  }
  
  /**
   * 移除所有事件监听器
   * @returns 当前实例，用于链式调用
   */
  removeAllListeners(): this {
    this.listeners.clear();
    return this;
  }
  
  /**
   * 获取特定事件的监听器数量
   * @param event 事件名称
   * @returns 监听器数量
   */
  listenerCount(event: string): number {
    return this.listeners.has(event) ? this.listeners.get(event)!.length : 0;
  }
}
