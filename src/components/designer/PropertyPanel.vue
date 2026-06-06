<template>
  <div class="prop-panel">
    <div class="prop-title">属性</div>
    <div class="section">
      <div class="section-header" @click="toggleSection('basic')"><span class="section-arrow" :class="{ open: openSections.basic }">▸</span>基础</div>
      <div v-show="openSections.basic" class="section-body">
        <div class="prop-row"><label>标签</label><el-input v-model="comp.label" size="small" @input="emitUpdate" /></div>
        <div class="prop-row"><label>字段名</label><el-input v-model="comp.field" size="small" @input="emitUpdate" /></div>
        <div class="prop-row"><label>描述</label><el-input v-model="comp.description" size="small" placeholder="占位提示" @input="emitUpdate" /></div>
        <div class="prop-row"><label>必填</label><el-switch v-model="comp.required" size="small" @change="emitUpdate" /></div>
        <div class="prop-row"><label>隐藏</label><el-switch v-model="comp.hidden" size="small" @change="emitUpdate" /></div>
        <div class="prop-row"><label>可编辑</label><el-switch v-model="comp.editable" size="small" @change="emitUpdate" /></div>
        <div class="prop-row"><label>排列</label><el-select v-model="comp.colspan" size="small" @change="emitUpdate"><el-option :value="1" label="单列"/><el-option :value="2" label="双列"/><el-option :value="3" label="三列"/><el-option :value="4" label="长标题"/></el-select></div>
      </div>
    </div>
    <div v-if="hasOptions" class="section">
      <div class="section-header" @click="toggleSection('options')"><span class="section-arrow" :class="{ open: openSections.options }">▸</span>选项</div>
      <div v-show="openSections.options" class="section-body"><div class="prop-row"><label>默认值</label><el-input v-model="comp.defaultValue" size="small" @input="emitUpdate" /></div></div>
    </div>
    <div class="section">
      <div class="section-header" @click="toggleSection('validation')"><span class="section-arrow" :class="{ open: openSections.validation }">▸</span>校验</div>
      <div v-show="openSections.validation" class="section-body">
        <div v-if="hasTextLimit" class="prop-row"><label>字数限制</label><el-input-number v-model="maxLen" :min="0" :max="10000" size="small" @change="onMaxLenChange" /></div>
        <div v-if="isNumeric" class="prop-row"><label>最小值</label><el-input-number v-model="numMin" size="small" @change="onNumRangeChange" /></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ component: ComponentSchema }>()
const emit = defineEmits<{ update: [patch: Partial<ComponentSchema>] }>()
const comp = reactive({ ...props.component })
watch(() => props.component, (val) => Object.assign(comp, val), { deep: true })
const openSections = reactive({ basic: true, options: false, validation: false })
function toggleSection(key: string) { (openSections as Record<string, boolean>)[key] = !(openSections as Record<string, boolean>)[key] }
function emitUpdate() { emit('update', { ...comp }) }
const hasOptions = computed(() => ['chooser','multi-chooser','selection','cascader','tree'].includes(comp.type))
const hasTextLimit = computed(() => ['input','textarea'].includes(comp.type))
const isNumeric = computed(() => comp.type === 'numeric')
const maxLen = computed({ get: () => (comp.props as Record<string, unknown>)?.maxLength as number ?? 0, set: () => {} })
const numMin = computed({ get: () => (comp.props as Record<string, unknown>)?.min as number ?? 0, set: () => {} })
function onMaxLenChange(v: number | undefined) { (comp.props as Record<string, unknown>).maxLength = v ?? 0; emitUpdate() }
function onNumRangeChange() { (comp.props as Record<string, unknown>).min = numMin.value; emitUpdate() }
</script>

<style scoped lang="scss">
.prop-panel { padding: 16px; }
.prop-title { font-size: 14px; font-weight: 600; margin-bottom: 16px; }

.section { margin-bottom: 4px; }

.section-header {
  font-size: 13px; font-weight: 500; padding: 8px 0;
  cursor: pointer; user-select: none;
  display: flex; align-items: center; gap: 4px;
  border-bottom: 1px solid var(--color-canvas);
}

.section-arrow { font-size: 10px; color: var(--color-text-muted); transition: transform .2s; display: inline-block; }
.section-arrow.open { transform: rotate(90deg); }
.section-body { padding: 8px 0; }

.prop-row {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;

  label { font-size: 12px; color: var(--color-text-secondary); width: 60px; flex-shrink: 0; }
}
</style>
