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
        <div v-if="!isSeparator" class="prop-row">
          <label>描述</label
          ><el-input v-model="comp.description" size="small" placeholder="占位提示" @input="emitUpdate" />
        </div>
        <div v-if="!isSeparator && !isDecorative" class="prop-row">
          <label>必填</label><el-switch v-model="comp.required" size="small" @change="emitUpdate" />
        </div>
        <div v-if="!isSeparator" class="prop-row">
          <label>隐藏</label><el-switch v-model="comp.hidden" size="small" @change="emitUpdate" />
        </div>
        <div v-if="!isSeparator && !isDecorative" class="prop-row">
          <label>可编辑</label><el-switch v-model="comp.editable" size="small" @change="emitUpdate" />
        </div>
        <div v-if="hasColspan" class="prop-row">
          <label>排列</label
          ><el-select v-model="comp.colspan" size="small" @change="emitUpdate"
            ><el-option :value="1" label="单列" /><el-option :value="2" label="双列" /><el-option
              :value="3"
              label="三列" /><el-option :value="4" label="长标题"
          /></el-select>
        </div>
        <div v-if="hasAppStyle" class="prop-row">
          <label>APP排版</label
          ><el-radio-group v-model="comp.appStyle" size="small" @change="emitUpdate"
            ><el-radio :value="0">左右</el-radio><el-radio :value="1">上下</el-radio></el-radio-group
          >
        </div>
        <div v-if="!isSeparator && !isDecorative && !isTable && !isCrossTable" class="prop-row">
          <label>默认值</label
          ><el-input v-model="comp.defaultValue" size="small" placeholder="字段初始值" @input="emitUpdate" />
        </div>
        <div v-if="hasTooltip" class="prop-row">
          <label>提示信息</label
          ><el-input v-model="comp.tooltip" size="small" placeholder="填写提示（tooltip）" @input="emitUpdate" />
        </div>
      </div>
    </div>
    <div v-if="hasOptions && !isDecorative" class="section">
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
    <div v-if="hasValidation" class="section">
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
        <div v-if="hasMax" class="prop-row">
          <label>最大值</label><el-input-number v-model="numMax" size="small" @change="onNumMaxChange" />
        </div>
        <div v-if="hasRadix" class="prop-row">
          <label>小数位数</label><el-input-number v-model="numRadix" :min="0" :max="10" size="small" @change="onNumRadixChange" />
        </div>
        <div v-if="hasUnit" class="prop-row">
          <label>单位</label><el-input v-model="numUnit" size="small" placeholder="如：元、个" @input="onNumUnitChange" />
        </div>
        <div v-if="hasAutoWrap" class="prop-row">
          <label>自动换行</label><el-switch v-model="autoWrap" size="small" @change="onAutoWrapChange" />
        </div>
        <div v-if="hasRareChars" class="prop-row">
          <label>允许生僻字</label><el-switch v-model="allowRare" size="small" @change="onRareChange" />
        </div>
        <div v-if="hasDateType" class="prop-row">
          <label>日期类型</label>
          <el-select v-model="dateType" size="small" @change="onDateTypeChange">
            <el-option value="year" label="年" />
            <el-option value="month" label="月" />
            <el-option value="date" label="日" />
            <el-option value="datetime" label="日期时间" />
            <el-option value="timeperiod" label="时间段" />
          </el-select>
        </div>
        <div v-if="hasImageSize" class="prop-row">
          <label>最大上传数</label><el-input-number v-model="maxCount" :min="1" size="small" @change="onMaxCountChange" />
        </div>
        <div v-if="hasImageSize" class="prop-row">
          <label>文件大小上限</label><el-input-number v-model="maxSize" :min="0" size="small" @change="onMaxSizeChange" /><span style="font-size:12px;color:var(--color-text-muted);margin-left:4px">KB</span>
        </div>
        <div v-if="hasImageSize" class="prop-row">
          <label>文件类型</label><el-input v-model="fileTypes" size="small" placeholder=".jpg;.png" @input="onFileTypesChange" />
        </div>
        <div v-if="hasHideWhenEmpty" class="prop-row">
          <label>无值时隐藏</label><el-switch v-model="hideWhenEmpty" size="small" @change="onHideWhenEmptyChange" />
        </div>
        <div v-if="hasEnableSearch" class="prop-row">
          <label>树形检索</label><el-switch v-model="enableSearch" size="small" @change="onEnableSearchChange" />
        </div>
        <div v-if="hasEnableSingle" class="prop-row">
          <label>树形单选</label><el-switch v-model="enableSingle" size="small" @change="onEnableSingleChange" />
        </div>
      </div>
    </div>
    <div v-if="hasAdvanced" class="section">
      <div class="section-header" @click="toggleSection('advanced')">
        <span class="section-arrow" :class="{ open: openSections.advanced }">▸</span>高级
      </div>
      <div v-show="openSections.advanced" class="section-body">
        <TriggerRuleEditor v-if="hasOptions" :component="comp" :all-components="allComponents" @update="(p) => emit('update', p)" />
        <CalcEditor v-if="calcTypes.includes(comp.type)" :component="comp" @update="(p) => emit('update', p)" />
        <RateEditor v-if="comp.type === 'rate'" :component="comp" @update="(p) => emit('update', p)" />
        <RelationEditor v-if="comp.type === 'relation'" :component="comp" @update="(p) => emit('update', p)" />
        <SignatureEditor v-if="comp.type === 'signature'" :component="comp" @update="(p) => emit('update', p)" />
        <QRCodeEditor v-if="comp.type === 'QRCode'" :component="comp" @update="(p) => emit('update', p)" />
        <DecorationEditor v-if="isDecorative" :component="comp" @update="(p) => emit('update', p)" />
      </div>
    </div>
    <div v-if="comp.type === 'table' || comp.type === 'cross-table'" class="section">
      <div class="section-header" @click="toggleSection('table')">
        <span class="section-arrow" :class="{ open: openSections.table }">▸</span>{{ comp.type === 'cross-table' ? '交叉表管理' : '表格列管理' }}
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
import CalcEditor from './CalcEditor.vue'
import RelationEditor from './RelationEditor.vue'
import SignatureEditor from './SignatureEditor.vue'
import QRCodeEditor from './QRCodeEditor.vue'
import DecorationEditor from './DecorationEditor.vue'

const calcTypes = ['numeric', 'date']

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
const isDecorative = computed(() => ['title', 'subtitle', 'group-title', 'separator', 'point-out'].includes(comp.type))
const isSeparator = computed(() => comp.type === 'separator')
const isTable = computed(() => comp.type === 'table')
const isCrossTable = computed(() => comp.type === 'cross-table')
const hasTooltip = computed(() => ['input', 'textarea', 'numeric', 'chooser', 'multi-chooser', 'selection', 'image', 'singleImage', 'commitment'].includes(comp.type))
const hasColspan = computed(() => !['title', 'subtitle', 'group-title', 'point-out', 'separator', 'signature', 'relation', 'region', 'QRCode', 'table', 'cross-table'].includes(comp.type))
const hasAppStyle = computed(() => !['separator', 'table', 'cross-table', 'QRCode'].includes(comp.type))
const hasMax = computed(() => isNumeric.value)
const hasRadix = computed(() => isNumeric.value)
const hasUnit = computed(() => isNumeric.value)
const hasAutoWrap = computed(() => comp.type === 'textarea')
const hasRareChars = computed(() => comp.type === 'textarea')
const hasDateType = computed(() => ['date', 'date-range'].includes(comp.type))
const hasImageSize = computed(() => ['image', 'singleImage'].includes(comp.type))
const hasHideWhenEmpty = computed(() => comp.type === 'point-out')
const hasEnableSearch = computed(() => comp.type === 'tree' || comp.type === 'tree-structure')
const hasEnableSingle = computed(() => comp.type === 'tree' || comp.type === 'tree-structure')
const hasValidation = computed(() =>
  hasTextLimit.value || isNumeric.value || hasAutoWrap.value || hasRareChars.value ||
  hasDateType.value || hasImageSize.value || hasHideWhenEmpty.value ||
  hasEnableSearch.value || hasEnableSingle.value
)
const hasAdvanced = computed(() =>
  hasOptions.value || calcTypes.includes(comp.type) || comp.type === 'rate' ||
  comp.type === 'relation' || comp.type === 'signature' || comp.type === 'QRCode' || isDecorative.value
)

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
const numMax = computed({ get: () => ((comp.props as Record<string, unknown>)?.max as number) ?? 0, set: () => {} })
const numRadix = computed({ get: () => ((comp.props as Record<string, unknown>)?.decimalPlaces as number) ?? 0, set: () => {} })
const numUnit = computed({ get: () => ((comp.props as Record<string, unknown>)?.unit as string) ?? '', set: () => {} })
const autoWrap = computed({ get: () => ((comp.props as Record<string, unknown>)?.autoSize as boolean) ?? false, set: () => {} })
const allowRare = computed({ get: () => ((comp.props as Record<string, unknown>)?.allowRareChars as boolean) ?? false, set: () => {} })
const dateType = computed({ get: () => ((comp.props as Record<string, unknown>)?.dateType as string) ?? 'date', set: () => {} })
const maxCount = computed({ get: () => ((comp.props as Record<string, unknown>)?.maxCount as number) ?? 3, set: () => {} })
const maxSize = computed({ get: () => ((comp.props as Record<string, unknown>)?.maxSize as number) ?? 0, set: () => {} })
const fileTypes = computed({ get: () => ((comp.props as Record<string, unknown>)?.fileTypes as string) ?? '', set: () => {} })
const hideWhenEmpty = computed({ get: () => ((comp.props as Record<string, unknown>)?.hideWhenEmpty as boolean) ?? false, set: () => {} })
const enableSearch = computed({ get: () => ((comp.props as Record<string, unknown>)?.enableSearch as boolean) ?? false, set: () => {} })
const enableSingle = computed({ get: () => ((comp.props as Record<string, unknown>)?.enableSingle as boolean) ?? false, set: () => {} })

function setProp(key: string, val: unknown) {
  ;(comp.props as Record<string, unknown>)[key] = val
  emitUpdate()
}

function onMaxLenChange(v: number | undefined) { setProp('maxLength', v ?? 0) }
function onNumRangeChange() { setProp('min', numMin.value) }
function onNumMaxChange(v: number | undefined) { setProp('max', v ?? 0) }
function onNumRadixChange(v: number | undefined) { setProp('decimalPlaces', v ?? 0) }
function onNumUnitChange(v: string) { setProp('unit', v) }
function onAutoWrapChange(v: boolean) { setProp('autoSize', v) }
function onRareChange(v: boolean) { setProp('allowRareChars', v) }
function onDateTypeChange(v: string) { setProp('dateType', v) }
function onMaxCountChange(v: number | undefined) { setProp('maxCount', v ?? 3) }
function onMaxSizeChange(v: number | undefined) { setProp('maxSize', v ?? 0) }
function onFileTypesChange(v: string) { setProp('fileTypes', v) }
function onHideWhenEmptyChange(v: boolean) { setProp('hideWhenEmpty', v) }
function onEnableSearchChange(v: boolean) { setProp('enableSearch', v) }
function onEnableSingleChange(v: boolean) { setProp('enableSingle', v) }
</script>

<style scoped lang="scss">
.prop-panel {
  padding: 16px;
  background: var(--color-card);
  height: 100%;
  overflow-y: auto;
}
.prop-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text);
}

.section {
  margin-bottom: 4px;
}

.section-header {
  font-size: 13px;
  font-weight: 500;
  padding: 10px 0;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid var(--color-canvas);
  color: var(--color-text);
  transition: color 0.15s;

  &:hover {
    color: var(--color-primary);
  }
}

.section-arrow {
  font-size: 10px;
  color: var(--color-text-muted);
  transition: transform 0.2s;
  display: inline-block;
}
.section-arrow.open {
  transform: rotate(90deg);
  color: var(--color-primary);
}
.section-body {
  padding: 10px 0;
}

.prop-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 8px;

  label {
    font-size: 12px;
    font-weight: 500;
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
