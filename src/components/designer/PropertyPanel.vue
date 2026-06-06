<template>
  <div class="prop-panel">
    <div class="prop-title">属性</div>
    <div class="section">
      <div class="section-header" @click="toggleSection('basic')">
        <span class="section-arrow" :class="{ open: openSections.basic }">▸</span>基础
      </div>
      <div v-show="openSections.basic" class="section-body">
        <div class="prop-row">
          <label>标签</label><el-input v-model="comp.label" size="small" @input="emitUpdate" />
        </div>
        <div class="prop-row">
          <label>字段名</label><el-input v-model="comp.field" size="small" @input="emitUpdate" />
        </div>
        <div class="prop-row">
          <label>描述</label
          ><el-input v-model="comp.description" size="small" placeholder="占位提示" @input="emitUpdate" />
        </div>
        <div class="prop-row">
          <label>必填</label><el-switch v-model="comp.required" size="small" @change="emitUpdate" />
        </div>
        <div class="prop-row">
          <label>隐藏</label><el-switch v-model="comp.hidden" size="small" @change="emitUpdate" />
        </div>
        <div class="prop-row">
          <label>可编辑</label><el-switch v-model="comp.editable" size="small" @change="emitUpdate" />
        </div>
        <div class="prop-row">
          <label>排列</label
          ><el-select v-model="comp.colspan" size="small" @change="emitUpdate"
            ><el-option :value="1" label="单列" /><el-option :value="2" label="双列" /><el-option
              :value="3"
              label="三列" /><el-option :value="4" label="长标题"
          /></el-select>
        </div>
      </div>
    </div>
    <div v-if="hasOptions" class="section">
      <div class="section-header" @click="toggleSection('options')">
        <span class="section-arrow" :class="{ open: openSections.options }">▸</span>选项
      </div>
      <div v-show="openSections.options" class="section-body">
        <div v-for="(opt, i) in optionList" :key="i" class="option-row">
          <el-input v-model="opt.label" size="small" placeholder="选项名" @input="emitUpdate" />
          <el-input v-model="opt.value" size="small" placeholder="值" @input="emitUpdate" />
          <el-button link type="danger" size="small" @click="removeOption(i)">×</el-button>
        </div>
        <el-button link type="primary" size="small" @click="addOption">+ 添加选项</el-button>
        <div class="prop-row" style="margin-top:8px">
          <label>默认值</label>
          <el-select v-model="comp.defaultValue" size="small" clearable @change="emitUpdate">
            <el-option v-for="opt in optionList" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-header" @click="toggleSection('validation')">
        <span class="section-arrow" :class="{ open: openSections.validation }">▸</span>校验
      </div>
      <div v-show="openSections.validation" class="section-body">
        <div v-if="hasTextLimit" class="prop-row">
          <label>字数限制</label
          ><el-input-number v-model="maxLen" :min="0" :max="10000" size="small" @change="onMaxLenChange" />
        </div>
        <div v-if="isNumeric" class="prop-row">
          <label>最小值</label><el-input-number v-model="numMin" size="small" @change="onNumRangeChange" />
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-header" @click="toggleSection('advanced')">
        <span class="section-arrow" :class="{ open: openSections.advanced }">▸</span>高级
      </div>
      <div v-show="openSections.advanced" class="section-body">
        <TriggerRuleEditor v-if="hasOptions" :component="comp" :all-components="allComponents" @update="(p) => emit('update', p)" />
        <RateEditor v-if="comp.type === 'rate'" :component="comp" @update="(p) => emit('update', p)" />
      </div>
    </div>
    <div v-if="comp.type === 'table'" class="section">
      <div class="section-header" @click="toggleSection('table')">
        <span class="section-arrow" :class="{ open: openSections.table }">▸</span>表格列管理
      </div>
      <div v-show="openSections.table" class="section-body">
        <div v-for="(col, i) in tableColumns" :key="i" class="table-col-item">
          <div class="col-header">
            <el-select v-model="col.type" size="small" @change="onColTypeChange(i)" style="width:90px">
              <el-option v-for="t in colTypes" :key="t" :label="t" :value="t" />
            </el-select>
            <el-input v-model="col.title" size="small" placeholder="列标题" style="flex:1" @input="emitUpdate" />
            <el-button link type="danger" size="small" @click="removeTableCol(i)">×</el-button>
          </div>
          <div class="col-body">
            <div class="prop-row"><label>宽度</label><el-input-number v-model="col.width" :min="60" :max="600" size="small" @change="emitUpdate" /></div>
            <div class="prop-row"><label>必填</label><el-switch v-model="col.required" size="small" @change="emitUpdate" /></div>
          </div>
        </div>
        <el-button link type="primary" size="small" @click="addTableCol">+ 添加字段</el-button>
        <div style="border-top:1px solid var(--color-border);margin:12px 0;padding-top:8px">
          <div class="prop-row"><label>显示序号</label><el-switch v-model="tableShowIndex" size="small" @change="onTableShowIndexChange" /></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { ComponentSchema } from '@/types'
import TriggerRuleEditor from './TriggerRuleEditor.vue'
import RateEditor from './RateEditor.vue'

const props = defineProps<{ component: ComponentSchema; allComponents?: ComponentSchema[] }>()
const allComponents = computed(() => props.allComponents ?? [])
const emit = defineEmits<{ update: [patch: Partial<ComponentSchema>] }>()
const comp = reactive({ ...props.component })
watch(
  () => props.component,
  (val) => Object.assign(comp, val),
  { deep: true },
)
const openSections = reactive<Record<string, boolean>>({ basic: true, options: false, validation: false, advanced: false, table: true })

const colTypes = ['input', 'textarea', 'numeric', 'date', 'selection', 'chooser', 'multi-chooser', 'image']
function toggleSection(key: string) {
  ;(openSections as Record<string, boolean>)[key] = !(openSections as Record<string, boolean>)[key]
}
function emitUpdate() {
  emit('update', { ...comp })
}
const hasOptions = computed(() => ['chooser', 'multi-chooser', 'selection', 'cascader', 'tree'].includes(comp.type))
const hasTextLimit = computed(() => ['input', 'textarea'].includes(comp.type))
const isNumeric = computed(() => comp.type === 'numeric')

const optionList = computed<{ label: string; value: string }[]>({
  get: () => ((comp.props as Record<string, unknown>)?.options as Array<{ label: string; value: string }>) ?? [],
  set: () => {},
})

function addOption() {
  const list = [...optionList.value, { label: `选项${optionList.value.length + 1}`, value: `${optionList.value.length}` }]
  ;(comp.props as Record<string, unknown>).options = list
  emitUpdate()
}

function removeOption(index: number) {
  const list = optionList.value.filter((_: unknown, i: number) => i !== index)
  ;(comp.props as Record<string, unknown>).options = list
  emitUpdate()
}

const tableColumns = computed<Array<{ title: string; type: string; width?: number; required?: boolean }>>({
  get: () => ((comp.props as Record<string, unknown>)?.columns as Array<{ title: string; type: string; width?: number; required?: boolean }>) ?? [],
  set: () => {},
})

const tableShowIndex = computed({
  get: () => (comp.props as Record<string, unknown>)?.showIndex as boolean ?? false,
  set: () => {},
})

function addTableCol() {
  const cols = [...tableColumns.value, { title: `列${tableColumns.value.length + 1}`, type: 'input', width: 120, required: false }]
  ;(comp.props as Record<string, unknown>).columns = cols
  emitUpdate()
}

function removeTableCol(index: number) {
  const cols = tableColumns.value.filter((_: unknown, i: number) => i !== index)
  ;(comp.props as Record<string, unknown>).columns = cols
  emitUpdate()
}

function onColTypeChange(index: number) {
  emitUpdate()
}

function onTableShowIndexChange(v: boolean) {
  ;(comp.props as Record<string, unknown>).showIndex = v
  emitUpdate()
}
const maxLen = computed({
  get: () => ((comp.props as Record<string, unknown>)?.maxLength as number) ?? 0,
  set: () => {},
})
const numMin = computed({ get: () => ((comp.props as Record<string, unknown>)?.min as number) ?? 0, set: () => {} })
function onMaxLenChange(v: number | undefined) {
  ;(comp.props as Record<string, unknown>).maxLength = v ?? 0
  emitUpdate()
}
function onNumRangeChange() {
  ;(comp.props as Record<string, unknown>).min = numMin.value
  emitUpdate()
}
</script>

<style scoped lang="scss">
.prop-panel {
  padding: 16px;
}
.prop-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.section {
  margin-bottom: 4px;
}

.section-header {
  font-size: 13px;
  font-weight: 500;
  padding: 8px 0;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid var(--color-canvas);
}

.section-arrow {
  font-size: 10px;
  color: var(--color-text-muted);
  transition: transform 0.2s;
  display: inline-block;
}
.section-arrow.open {
  transform: rotate(90deg);
}
.section-body {
  padding: 8px 0;
}

.prop-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  label {
    font-size: 12px;
    color: var(--color-text-secondary);
    width: 60px;
    flex-shrink: 0;
  }
}
</style>

.table-col-item {
  margin-bottom: 12px;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-primary-bg);

  .col-header { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; }
  .col-body { padding-left: 4px; }
}

.option-row { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
