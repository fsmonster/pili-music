import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { usePlayerStore } from '../play/player';
import LoudnessAnalyzer from '@/utils/loudness';

export const useLoudnessStore = defineStore('loudness', () => {
  // 播放器 store
  const playerStore = usePlayerStore();
  
  // 响度分析器实例
  const analyzer = ref<any>(null);
  
  // 响度设置
  const targetLoudness = ref(-16);
  const continuousAutoGain = ref(true);
  const isLockGain = ref(false);
  const lockDuration = ref(30);
  const enableCompressor = ref(true);
  const gainRange = ref([0.01, 2.0]);
  const smoothingFactor = ref(0.98);
  
  // 可视化设置
  const showMomentary = ref(true);
  const showShortTerm = ref(true);
  const showIntegrated = ref(true);
  const showTarget = ref(true);
  const showGain = ref(true);
  
  // 初始化响度分析器
  function initAnalyzer(container?: HTMLElement) {
    if (analyzer.value) {
      // 如果已经存在实例，先销毁
      destroyAnalyzer();
    }
    
    if(!!container){
      // 创建新的响度分析器实例
      analyzer.value = new LoudnessAnalyzer({
        targetLoudness: targetLoudness.value,
        gain: {
          continuousAutoGain: continuousAutoGain.value,
          isLockGain: isLockGain.value,
          lockDuration: lockDuration.value,
          enableCompressor: enableCompressor.value,
          gainRange: { min: gainRange.value[0], max: gainRange.value[1] },
          smoothingFactor: smoothingFactor.value
        },
        visualization: {
          container,
          options: {
            show: {
              momentary: showMomentary.value,
              shortTerm: showShortTerm.value,
              integrated: showIntegrated.value,
              target: showTarget.value,
              gain: showGain.value
            }
          }
        }
      });
    }else {
      analyzer.value = new LoudnessAnalyzer({
        targetLoudness: targetLoudness.value,
        gain: {
          continuousAutoGain: continuousAutoGain.value,
          isLockGain: isLockGain.value,
          lockDuration: lockDuration.value,
          enableCompressor: enableCompressor.value,
          gainRange: { min: gainRange.value[0], max: gainRange.value[1] },
          smoothingFactor: smoothingFactor.value
        },
      });
    }
    // 连接当前音频
    connectAudioToAnalyzer();
  }
  
  // 销毁响度分析器
  function destroyAnalyzer() {
    if (analyzer.value) {
      analyzer.value.stopAnalysis();
      if (analyzer.value.visualizer) {
        analyzer.value.visualizer.destroy();
      }
      analyzer.value = null;
    }
  }

  // 是否初始化
  function isInit(){
    return !!analyzer.value;
  }
  
  // 连接音频到分析器
  function connectAudioToAnalyzer() {
    if (!analyzer.value || !isInit()) return;

    const audioInstance = playerStore.getAudioInstance();
    if (!audioInstance) return;
  
    analyzer.value.loadAudio(audioInstance)
      .then(() => {
        analyzer.value.startAnalysis();
      })
      .catch((error: any) => {
        console.error('连接音频到响度分析器失败:', error);
    });
  }
  
  // 更新目标响度
  function updateTargetLoudness(value: number) {
    targetLoudness.value = value;
    if (analyzer.value) {
      analyzer.value.setTargetLoudness(value);
    }
  }
  
  // 更新增益设置
  function updateGainSettings() {
    if (analyzer.value) {
      analyzer.value.updateGainSettings({
        continuousAutoGain: continuousAutoGain.value,
        isLockGain: isLockGain.value,
        lockDuration: lockDuration.value,
        enableCompressor: enableCompressor.value,
        gainRange: { min: gainRange.value[0], max: gainRange.value[1] },
        smoothingFactor: smoothingFactor.value
      });
    }
  }
  
  // 更新可视化设置
  function updateVisualizationSettings() {
    if (analyzer.value && analyzer.value.visualizer) {
      analyzer.value.visualizer.updateSettings({
        showMomentary: showMomentary.value,
        showShortTerm: showShortTerm.value,
        showIntegrated: showIntegrated.value,
        showTarget: showTarget.value,
        showGain: showGain.value
      });
    }
  }
  
  // 切换可视化显示
  function toggleVisualization(type: string) {
    switch (type) {
      case 'momentary':
        showMomentary.value = !showMomentary.value;
        break;
      case 'shortTerm':
        showShortTerm.value = !showShortTerm.value;
        break;
      case 'integrated':
        showIntegrated.value = !showIntegrated.value;
        break;
      case 'target':
        showTarget.value = !showTarget.value;
        break;
      case 'gain':
        showGain.value = !showGain.value;
        break;
    }
    
    updateVisualizationSettings();
  }
  
  // 监听播放器状态变化
  watch(() => playerStore.activeAudioUrl, () => {
    // 当播放器当前时间变化时，检查是否需要连接分析器
    if (playerStore.playing) {
      if(isInit()) connectAudioToAnalyzer();
      else {
        initAnalyzer();
      }
    }
  });
  
  return {
    analyzer,
    targetLoudness,
    continuousAutoGain,
    isLockGain,
    lockDuration,
    enableCompressor,
    gainRange,
    smoothingFactor,
    showMomentary,
    showShortTerm,
    showIntegrated,
    showTarget,
    showGain,
    initAnalyzer,
    destroyAnalyzer,
    connectAudioToAnalyzer,
    updateTargetLoudness,
    updateGainSettings,
    updateVisualizationSettings,
    toggleVisualization
  };
});
