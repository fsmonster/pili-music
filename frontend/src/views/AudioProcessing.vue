<template>
  <Layout>
    <template #main>
      <div class="audio-processing-container">
        <div class="header">
          <h2>音频处理</h2>
          <p class="description">调整音频响度和增益以获得更好的聆听体验</p>
        </div>
        
        <div class="controls-section">
          <el-card class="control-card">
            <template #header>
              <div class="card-header">
                <h3>响度设置</h3>
              </div>
            </template>
            
            <div class="control-item">
              <span class="label">目标响度 (LUFS)</span>
              <div class="control">
                <el-slider
                  v-model="loudnessStore.targetLoudness"
                  :min="-30"
                  :max="-10"
                  :step="1"
                  :marks="loudnessMarks"
                  @change="updateTargetLoudness"
                />
                <span class="value">{{ loudnessStore.targetLoudness }} LUFS</span>
              </div>
            </div>
            
            <div class="control-item">
              <span class="label">持续自动增益</span>
              <div class="control">
                <el-switch
                  v-model="loudnessStore.continuousAutoGain"
                  @change="updateGainSettings"
                />
                <span class="hint">实时调整音频增益以匹配目标响度</span>
              </div>
            </div>
            
            <div class="control-item">
              <span class="label">锁定增益</span>
              <div class="control">
                <el-switch
                  v-model="loudnessStore.isLockGain"
                  @change="updateGainSettings"
                />
                <span class="hint">锁定当前增益值，不再自动调整</span>
              </div>
            </div>
            
            <div class="control-item">
              <span class="label">锁定延迟 (秒)</span>
              <div class="control">
                <el-slider
                  v-model="loudnessStore.lockDuration"
                  :min="5"
                  :max="60"
                  :step="5"
                  :disabled="!loudnessStore.continuousAutoGain || loudnessStore.isLockGain"
                  @change="updateGainSettings"
                />
                <span class="value">{{ loudnessStore.lockDuration }}秒</span>
              </div>
            </div>
            
            <div class="control-item">
              <span class="label">启用压缩器</span>
              <div class="control">
                <el-switch
                  v-model="loudnessStore.enableCompressor"
                  @change="updateGainSettings"
                />
                <span class="hint">减少音量峰值，使声音更均衡</span>
              </div>
            </div>
            
            <div class="control-item">
              <span class="label">增益范围</span>
              <div class="control">
                <el-slider
                  v-model="loudnessStore.gainRange"
                  range
                  :min="0"
                  :max="4"
                  :step="0.1"
                  @change="updateGainSettings"
                />
                <span class="value">{{ loudnessStore.gainRange[0] }} - {{ loudnessStore.gainRange[1] }}</span>
              </div>
            </div>
            
            <div class="control-item">
              <span class="label">平滑因子</span>
              <div class="control">
                <el-slider
                  v-model="loudnessStore.smoothingFactor"
                  :min="0.5"
                  :max="0.99"
                  :step="0.01"
                  @change="updateGainSettings"
                />
                <span class="value">{{ loudnessStore.smoothingFactor }}</span>
              </div>
            </div>
          </el-card>
        </div>
        
        <div class="visualization-section">
          <el-card class="visualization-card">
            <template #header>
              <div class="card-header">
                <h3>响度可视化</h3>
                <el-button-group>
                  <el-button 
                    :type="loudnessStore.showMomentary ? 'primary' : 'default'" 
                    size="small"
                    @click="toggleVisualization('momentary')"
                  >
                    瞬时
                  </el-button>
                  <el-button 
                    :type="loudnessStore.showShortTerm ? 'primary' : 'default'" 
                    size="small"
                    @click="toggleVisualization('shortTerm')"
                  >
                    短期
                  </el-button>
                  <el-button 
                    :type="loudnessStore.showIntegrated ? 'primary' : 'default'" 
                    size="small"
                    @click="toggleVisualization('integrated')"
                  >
                    整体
                  </el-button>
                  <el-button 
                    :type="loudnessStore.showTarget ? 'primary' : 'default'" 
                    size="small"
                    @click="toggleVisualization('target')"
                  >
                    目标
                  </el-button>
                  <el-button 
                    :type="loudnessStore.showGain ? 'primary' : 'default'" 
                    size="small"
                    @click="toggleVisualization('gain')"
                  >
                    增益
                  </el-button>
                </el-button-group>
              </div>
            </template>
            
            <div ref="visualizerContainer" class="visualizer-container"></div>
          </el-card>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Layout from '../layout/Layout.vue';
import { useLoudnessStore } from '@/stores';

// 可视化容器
const visualizerContainer = ref<HTMLElement | null>(null);

// 响度处理 store
const loudnessStore = useLoudnessStore();

// 响度标记
const loudnessMarks = {
  '-30': '-30',
  '-24': '-24',
  '-18': '-18',
  '-16': '-16',
  '-14': '-14',
  '-10': '-10'
};

// 初始化响度分析器
// onMounted(() => {
//   if (visualizerContainer.value) {
//     // 初始化响度分析器
//     loudnessStore.initAnalyzer(visualizerContainer.value);
//   }
// });

// 在组件销毁时停止分析
// onUnmounted(() => {
//   loudnessStore.destroyAnalyzer();
// });

// 更新目标响度
function updateTargetLoudness(value: number) {
  loudnessStore.updateTargetLoudness(value);
}

// 更新增益设置
function updateGainSettings() {
  loudnessStore.updateGainSettings();
}

// 切换可视化显示
function toggleVisualization(type: string) {
  loudnessStore.toggleVisualization(type);
}
</script>

<style lang="scss" scoped>
.audio-processing-container {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  
  .header {
    margin-bottom: 24px;
    
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    .description {
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }
  
  .controls-section {
    margin-bottom: 24px;
    
    .control-card {
      margin-bottom: 16px;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
        }
      }
      
      .control-item {
        display: flex;
        margin-bottom: 16px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          width: 120px;
          flex-shrink: 0;
          padding-top: 8px;
        }
        
        .control {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          
          .el-slider {
            margin-top: 8px;
          }
          
          .value {
            margin-top: 4px;
            color: var(--el-text-color-secondary);
            font-size: 14px;
          }
          
          .hint {
            margin-top: 4px;
            color: var(--el-text-color-secondary);
            font-size: 12px;
          }
        }
      }
    }
  }
  
  .visualization-section {
    .visualization-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
        }
      }
      
      .visualizer-container {
        height: 300px;
        width: 100%;
        background-color: #f5f7fa;
        border-radius: 4px;
      }
    }
  }
}
</style>
