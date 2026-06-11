<template>
  <div class="decoration-editor">
    <div class="prop-row">
      <label>字体</label>
      <el-select v-model="propsData.fontFamily" size="small" @change="emitUpdate">
        <el-option v-for="f in fonts" :key="f.value" :label="f.label" :value="f.value" />
      </el-select>
    </div>
    <div class="prop-row">
      <label>字号</label>
      <el-select v-model="propsData.fontSize" size="small" @change="emitUpdate">
        <el-option v-for="s in sizes" :key="s" :label="s + 'px'" :value="s" />
      </el-select>
    </div>
    <div class="prop-row">
      <label>对齐</label>
      <el-radio-group v-model="propsData.textAlign" size="small" @change="emitUpdate">
        <el-radio-button value="left">左</el-radio-button>
        <el-radio-button value="center">中</el-radio-button>
        <el-radio-button value="right">右</el-radio-button>
      </el-radio-group>
    </div>
    <div class="prop-row">
      <label>颜色</label>
      <el-color-picker v-model="propsData.color" size="small" @change="emitUpdate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ component: ComponentSchema }>()
const emit = defineEmits<{ update: [patch: Partial<ComponentSchema>] }>()

const fonts = [
  { label: '默认', value: '' },
  { label: '微软雅黑', value: 'Microsoft YaHei' },
  { label: '苹方', value: 'PingFangSC-Regular' },
  { label: '仿宋', value: 'FangSong' },
  { label: '黑体', value: 'SimHei' },
  { label: '楷体', value: 'KaiTi' },
  { label: '宋体', value: 'SimSun' },
]
const sizes = [12, 14, 16, 18, 20, 22, 24, 26]

const propsData = reactive<Record<string, unknown>>({})
watch(
  () => props.component.props,
  (val) => {
    Object.assign(propsData, val || {})
  },
  { immediate: true, deep: true },
)

function emitUpdate() {
  emit('update', { ...props.component, props: { ...propsData } })
}
</script>

<style scoped lang="scss">
.decoration-editor .prop-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  padding: 6px 0;
  gap: 8px;
}
.decoration-editor .prop-row label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  width: 72px;
  flex-shrink: 0;
  white-space: nowrap;
}
.decoration-editor :deep(.el-radio-button--small .el-radio-button__inner) {
  width: 100%;
}
</style>
