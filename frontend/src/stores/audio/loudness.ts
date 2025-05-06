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

    try {
      // 获取当前音频实例
      let audioInstance = playerStore.getAudioInstance();
      if (!audioInstance) return;
      
      // 检查音频元素是否已经被连接过
      // 如果已经被连接过，则创建一个新的音频元素
      if ((audioInstance as any)._sourceNode) {
        console.log('音频元素已经被连接过，创建新的音频元素');
        audioInstance = playerStore.createNewAudioInstance();
      }
      
      // 加载音频到分析器
      analyzer.value.loadAudio(audioInstance)
        .then(() => {
          analyzer.value.startAnalysis();
        })
        .catch((error: any) => {
          console.error('连接音频到响度分析器失败:', error);
          
          // 如果连接失败，可能是因为音频元素已经被连接过
          // 尝试创建新的音频元素并重新连接
          const newAudioInstance = playerStore.createNewAudioInstance();
          
          // 重新尝试连接
          analyzer.value.loadAudio(newAudioInstance)
            .then(() => {
              analyzer.value.startAnalysis();
            })
            .catch((retryError: any) => {
              console.error('重新连接音频到响度分析器仍然失败:', retryError);
            });
        });
    } catch (error) {
      console.error('连接音频到响度分析器时发生异常:', error);
    }
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
  watch(() => playerStore.playing, (isPlaying) => {
    // 当播放器状态变化时，检查是否需要连接分析器
    if (isPlaying) {
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
