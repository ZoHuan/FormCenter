<template>
  <div class="prop-panel">
    <div class="prop-title">属性</div>
    <div class="section">
      <div class="section-header" @click="toggleSection('basic')">
        <ChevronRight :size="14" class="section-arrow" :class="{ open: openSections.basic }" />基础
      </div>
      <div class="section-body" :class="{ collapsed: !openSections.basic }">
        <div class="prop-row">
          <label>标签</label><el-input v-model="comp.label" size="small" @input="emitUpdate" />
        </div>
        <div v-if="!isSeparator && !isDecorative" class="prop-row">
          <label>必填</label><el-switch v-model="comp.required" size="small" @change="emitUpdate" />
        </div>
        <div v-if="!isSeparator" class="prop-row">
          <label>描述</label
          ><el-input v-model="comp.description" size="small" placeholder="占位提示" @input="emitUpdate" />
        </div>
        <div v-if="hasColspan" class="prop-row">
          <label>排列</label
          ><el-select v-model="comp.colspan" size="small" @change="emitUpdate"
            ><el-option :value="1" label="单列" /><el-option :value="2" label="双列" /><el-option
              :value="3"
              label="三列" /><el-option :value="4" label="长标题"
          /></el-select>
        </div>
        <div class="prop-row">
          <label>字段名</label><el-input v-model="comp.field" size="small" @input="emitUpdate" />
        </div>
        <div v-if="!isSeparator && !isDecorative && !isTable && !isCrossTable" class="prop-row">
          <label>默认值</label
          ><el-input v-model="comp.defaultValue" size="small" placeholder="字段初始值" @input="emitUpdate" />
        </div>
        <div v-if="hasAppStyle" class="prop-row">
          <label>APP排版</label
          ><el-radio-group v-model="comp.appStyle" size="small" @change="emitUpdate"
            ><el-radio :value="0">左右</el-radio><el-radio :value="1">上下</el-radio></el-radio-group
          >
        </div>
        <div v-if="hasTooltip" class="prop-row">
          <label>提示信息</label
          ><el-input v-model="comp.tooltip" size="small" placeholder="填写提示（tooltip）" @input="emitUpdate" />
        </div>
        <div v-if="!isSeparator" class="prop-row">
          <label>隐藏</label><el-switch v-model="comp.hidden" size="small" @change="emitUpdate" />
        </div>
        <div v-if="!isSeparator && !isDecorative" class="prop-row">
          <label>可编辑</label><el-switch v-model="comp.editable" size="small" @change="emitUpdate" />
        </div>
      </div>
    </div>
    <div v-if="hasOptions && !isDecorative" class="section">
      <div class="section-header" @click="toggleSection('options')">
        <ChevronRight :size="14" class="section-arrow" :class="{ open: openSections.options }" />选项
      </div>
      <div :class="{ collapsed: !openSections.options }" class="section-body">
        <!-- 树形选项编辑器（级联 / 树结构） -->
        <div v-if="isNestedOptions" class="options-list">
          <OptionTreeNode
            :nodes="optionList"
            :depth="0"
            :path="[]"
            :allowNested="true"
            :collapsed="collapsedNodes"
            @update="emitUpdate"
            @addChild="addChildOption"
            @remove="removeOption"
          />
        </div>
        <!-- 平铺选项编辑器（单选 / 多选 / 下拉） -->
        <div v-else class="options-list">
          <div v-for="(opt, i) in optionList" :key="i" class="option-row">
            <span class="opt-num">{{ i + 1 }}</span>
            <el-input v-model="opt.label" size="small" placeholder="选项名" @input="emitUpdate" />
            <el-input v-model="opt.value" size="small" placeholder="值" @input="emitUpdate" />
            <el-button link class="btn-del" @click="removeOption([i])"><X :size="14" /></el-button>
          </div>
        </div>
        <el-button class="btn-add" @click="addOption"><Plus :size="14" />添加选项</el-button>
        <div class="opt-default">
          <label>默认值</label>
          <el-select v-model="comp.defaultValue" size="small" clearable @change="emitUpdate">
            <el-option v-for="opt in optionList" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
      </div>
    </div>
    <div v-if="hasValidation" class="section">
      <div class="section-header" @click="toggleSection('validation')">
        <ChevronRight :size="14" class="section-arrow" :class="{ open: openSections.validation }" />校验
      </div>
      <div :class="{ collapsed: !openSections.validation }" class="section-body">
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
          <label>小数位数</label
          ><el-input-number v-model="numRadix" :min="0" :max="10" size="small" @change="onNumRadixChange" />
        </div>
        <div v-if="hasUnit" class="prop-row">
          <label>单位</label
          ><el-input v-model="numUnit" size="small" placeholder="如：元、个" @input="onNumUnitChange" />
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
          <label>最大上传数</label
          ><el-input-number v-model="maxCount" :min="1" size="small" @change="onMaxCountChange" />
        </div>
        <div v-if="hasImageSize" class="prop-row">
          <label>文件大小上限</label
          ><span class="input-with-unit"
            ><el-input-number v-model="maxSize" :min="0" size="small" @change="onMaxSizeChange" /><span
              class="unit-label"
              >KB</span
            ></span
          >
        </div>
        <div v-if="hasImageSize" class="prop-row">
          <label>文件类型</label
          ><el-input v-model="fileTypes" size="small" placeholder=".jpg;.png" @input="onFileTypesChange" />
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
        <ChevronRight :size="14" class="section-arrow" :class="{ open: openSections.advanced }" />高级
      </div>
      <div :class="{ collapsed: !openSections.advanced }" class="section-body">
        <TriggerRuleEditor
          v-if="hasOptions"
          :component="comp"
          :all-components="allComponents"
          @update="(p) => emit('update', p)"
        />
        <CalcEditor v-if="calcTypes.includes(comp.type)" :component="comp" @update="(p) => emit('update', p)" />
        <RateEditor v-if="comp.type === 'rate'" :component="comp" @update="(p) => emit('update', p)" />
        <RelationEditor v-if="comp.type === 'relation'" :component="comp" @update="(p) => emit('update', p)" />
        <SignatureEditor v-if="comp.type === 'signature'" :component="comp" @update="(p) => emit('update', p)" />
        <QRCodeEditor v-if="comp.type === 'QRCode'" :component="comp" @update="(p) => emit('update', p)" />
        <DecorationEditor v-if="isDecorative" :component="comp" @update="(p) => emit('update', p)" />
      </div>
    </div>
    <div v-if="comp.type === 'cross-table'" class="section">
      <div class="section-header" @click="toggleSection('crossTable')">
        <ChevronRight :size="14" class="section-arrow" :class="{ open: openSections.crossTable }" />交叉表配置
      </div>
      <div :class="{ collapsed: !openSections.crossTable }" class="section-body">
        <div class="prop-row">
          <label>行标签</label>
          <span class="label-count">{{ (crossRowLabels as any[]).length }}项</span>
        </div>
        <div class="options-list" style="margin-bottom: 6px">
          <div v-for="(opt, i) in crossRowLabels" :key="i" class="option-row">
            <span class="opt-num">{{ i + 1 }}</span>
            <el-input v-model="opt.label" size="small" placeholder="行名" @input="emitUpdate" />
            <el-input v-model="opt.value" size="small" placeholder="值" @input="emitUpdate" />
            <el-button link class="btn-del" @click="removeCrossRowLabel(i)"><X :size="14" /></el-button>
          </div>
        </div>
        <el-button class="btn-add" @click="addCrossRowLabel"><Plus :size="14" />添加行标签</el-button>
        <div class="prop-row" style="margin-top: 12px">
          <label>列标签</label>
          <span class="label-count">{{ (crossColLabels as any[]).length }}项</span>
        </div>
        <div class="options-list" style="margin-bottom: 6px">
          <div v-for="(opt, i) in crossColLabels" :key="i" class="option-row">
            <span class="opt-num">{{ i + 1 }}</span>
            <el-input v-model="opt.label" size="small" placeholder="列名" @input="emitUpdate" />
            <el-input v-model="opt.value" size="small" placeholder="值" @input="emitUpdate" />
            <el-button link class="btn-del" @click="removeCrossColLabel(i)"><X :size="14" /></el-button>
          </div>
        </div>
        <el-button class="btn-add" @click="addCrossColLabel"><Plus :size="14" />添加列标签</el-button>
        <div class="table-footer">
          <div class="prop-row">
            <label>显示序号</label
            ><el-switch v-model="crossTableShowIndex" size="small" @change="onCrossTableShowIndexChange" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="comp.type === 'table'" class="section">
      <div class="section-header" @click="toggleSection('table')">
        <ChevronRight :size="14" class="section-arrow" :class="{ open: openSections.table }" />表格列管理
      </div>
      <div :class="{ collapsed: !openSections.table }" class="section-body">
        <div v-for="(col, i) in tableColumns" :key="i" class="table-col-item">
          <div class="col-header">
            <span class="col-index">{{ i + 1 }}</span>
            <el-select v-model="col.type" size="small" @change="onColTypeChange(i)">
              <template #label="{ label }">{{ colTypeLabels[label] ?? label }}</template>
              <el-option v-for="t in colTypes" :key="t" :label="colTypeLabels[t]" :value="t" />
            </el-select>
            <el-input v-model="col.title" size="small" placeholder="列标题" @input="emitUpdate" />
            <el-button link class="col-del" @click="removeTableCol(i)"><X :size="14" /></el-button>
          </div>
          <div class="col-body">
            <div class="prop-row">
              <label>宽度</label
              ><el-input-number v-model="col.width" :min="60" :max="600" size="small" @change="emitUpdate" />
            </div>
            <div class="prop-row">
              <label>必填</label><el-switch v-model="col.required" size="small" @change="emitUpdate" />
            </div>
          </div>
        </div>
        <el-button class="btn-add-col" @click="addTableCol"><Plus :size="14" />添加字段</el-button>
        <div class="table-footer">
          <div class="prop-row">
            <label>显示序号</label><el-switch v-model="tableShowIndex" size="small" @change="onTableShowIndexChange" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { ChevronRight, X, Plus } from 'lucide-vue-next'
import OptionTreeNode from './OptionTreeNode.vue'
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
const openSections = reactive<Record<string, boolean>>({
  basic: true,
  options: false,
  validation: false,
  advanced: false,
  table: true,
  crossTable: true,
})

const colTypes = ['input', 'textarea', 'numeric', 'date', 'selection', 'chooser', 'multi-chooser', 'image']
const colTypeLabels: Record<string, string> = {
  input: '单行文本',
  textarea: '多行文本',
  numeric: '数字',
  date: '日期',
  selection: '下拉框',
  chooser: '单选框',
  'multi-chooser': '复选框',
  image: '图片',
}
function toggleSection(key: string) {
  const isOpen = openSections[key]
  // 手风琴模式：先关闭全部
  Object.keys(openSections).forEach((k) => {
    openSections[k] = false
  })
  // 如果之前是关闭的，则打开；如果之前是打开的，保持关闭（折叠回去）
  openSections[key] = !isOpen
}
function emitUpdate() {
  emit('update', { ...comp })
}
const hasOptions = computed(() =>
  ['chooser', 'multi-chooser', 'selection', 'cascader', 'tree-structure'].includes(comp.type),
)
const hasTextLimit = computed(() => ['input', 'textarea'].includes(comp.type))
const isNumeric = computed(() => comp.type === 'numeric')
const isDecorative = computed(() => ['title', 'subtitle', 'group-title', 'separator', 'point-out'].includes(comp.type))
const isSeparator = computed(() => comp.type === 'separator')
const isTable = computed(() => comp.type === 'table')
const isCrossTable = computed(() => comp.type === 'cross-table')
const hasTooltip = computed(() =>
  [
    'input',
    'textarea',
    'numeric',
    'chooser',
    'multi-chooser',
    'selection',
    'image',
    'singleImage',
    'commitment',
  ].includes(comp.type),
)
const hasColspan = computed(
  () =>
    ![
      'title',
      'subtitle',
      'group-title',
      'point-out',
      'separator',
      'signature',
      'relation',
      'QRCode',
      'table',
      'cross-table',
    ].includes(comp.type),
)
const hasAppStyle = computed(() => !['separator', 'table', 'cross-table', 'QRCode'].includes(comp.type))
const hasMax = computed(() => isNumeric.value)
const hasRadix = computed(() => isNumeric.value)
const hasUnit = computed(() => isNumeric.value)
const hasAutoWrap = computed(() => comp.type === 'textarea')
const hasRareChars = computed(() => comp.type === 'textarea')
const hasDateType = computed(() => ['date', 'date-range'].includes(comp.type))
const hasImageSize = computed(() => ['image', 'singleImage'].includes(comp.type))
const hasHideWhenEmpty = computed(() => comp.type === 'point-out')
const hasEnableSearch = computed(() => comp.type === 'tree-structure')
const hasEnableSingle = computed(() => comp.type === 'tree-structure')
const hasValidation = computed(
  () =>
    hasTextLimit.value ||
    isNumeric.value ||
    hasAutoWrap.value ||
    hasRareChars.value ||
    hasDateType.value ||
    hasImageSize.value ||
    hasHideWhenEmpty.value ||
    hasEnableSearch.value ||
    hasEnableSingle.value,
)
const hasAdvanced = computed(
  () =>
    hasOptions.value ||
    calcTypes.includes(comp.type) ||
    comp.type === 'rate' ||
    comp.type === 'relation' ||
    comp.type === 'signature' ||
    comp.type === 'QRCode' ||
    isDecorative.value,
)

const optionList = computed<any[]>({
  get: () => ((comp.props as Record<string, unknown>)?.options as any[]) ?? [],
  set: () => {},
})

const isNestedOptions = computed(() => ['cascader', 'tree-structure'].includes(comp.type))
const collapsedNodes = reactive(new Set<string>())

function ensureProps(): Record<string, unknown> {
  if (!comp.props) {
    ;(comp as unknown as Record<string, unknown>).props = {}
  }
  return comp.props as Record<string, unknown>
}

function cloneOptions(opts: any[]): any[] {
  return opts.map((opt) => ({
    label: opt.label,
    value: opt.value,
    ...(opt.children ? { children: cloneOptions(opt.children) } : {}),
  }))
}

function addOption() {
  const list = [
    ...optionList.value,
    { label: `选项${optionList.value.length + 1}`, value: `${optionList.value.length}` },
  ]
  ensureProps().options = list
  emitUpdate()
}

function addChildOption(path: number[]) {
  // auto-expand parent node so new child is visible
  if (path.length > 0) collapsedNodes.delete(nodeKey(path))
  else collapsedNodes.delete('root')

  const list = cloneOptions(optionList.value)
  let node = list[path[0]]
  for (let i = 1; i < path.length; i++) {
    node = node.children![path[i]]
  }
  if (!node.children) node.children = []
  node.children.push({
    label: `子选项${node.children.length + 1}`,
    value: `${node.value}-${node.children.length}`,
  })
  ensureProps().options = list
  emitUpdate()
}

function nodeKey(path: number[]) {
  return path.length > 0 ? `root-${path.join('-')}` : 'root'
}

function removeOption(path: number[]) {
  // clear collapse state for removed node and its descendants
  for (const k of collapsedNodes) {
    if (k.startsWith(`root-${path.join('-')}`)) collapsedNodes.delete(k)
  }
  const list = cloneOptions(optionList.value)
  let arr: any[] = list
  for (let i = 0; i < path.length - 1; i++) {
    arr = arr[path[i]].children!
  }
  arr.splice(path[path.length - 1], 1)
  ensureProps().options = list
  emitUpdate()
}

const tableColumns = computed<Array<{ title: string; type: string; width?: number; required?: boolean }>>({
  get: () =>
    ((comp.props as Record<string, unknown>)?.columns as Array<{
      title: string
      type: string
      width?: number
      required?: boolean
    }>) ?? [],
  set: () => {},
})

const tableShowIndex = computed({
  get: () => ((comp.props as Record<string, unknown>)?.showIndex as boolean) ?? false,
  set: () => {},
})

function addTableCol() {
  const cols = [
    ...tableColumns.value,
    { title: `列${tableColumns.value.length + 1}`, type: 'input', width: 120, required: false },
  ]
  ensureProps().columns = cols
  emitUpdate()
}

function removeTableCol(index: number) {
  const cols = tableColumns.value.filter((_: unknown, i: number) => i !== index)
  ensureProps().columns = cols
  emitUpdate()
}

function onColTypeChange(index: number) {
  emitUpdate()
}

function onTableShowIndexChange(v: boolean) {
  ensureProps().showIndex = v
  emitUpdate()
}

// ── 交叉表 ──
const crossRowLabels = computed<any[]>({
  get: () => ((comp.props as Record<string, unknown>)?.rowLabels as any[]) ?? [],
  set: () => {},
})

const crossColLabels = computed<any[]>({
  get: () => ((comp.props as Record<string, unknown>)?.colLabels as any[]) ?? [],
  set: () => {},
})

const crossTableShowIndex = computed({
  get: () => ((comp.props as Record<string, unknown>)?.showIndex as boolean) ?? true,
  set: () => {},
})

function addCrossRowLabel() {
  const list = [
    ...(crossRowLabels.value as any[]),
    {
      label: `行${(crossRowLabels.value as any[]).length + 1}`,
      value: `r${(crossRowLabels.value as any[]).length + 1}`,
    },
  ]
  ensureProps().rowLabels = list
  emitUpdate()
}

function removeCrossRowLabel(i: number) {
  const list = (crossRowLabels.value as any[]).filter((_: unknown, idx: number) => idx !== i)
  ensureProps().rowLabels = list
  emitUpdate()
}

function addCrossColLabel() {
  const list = [
    ...(crossColLabels.value as any[]),
    {
      label: `列${(crossColLabels.value as any[]).length + 1}`,
      value: `c${(crossColLabels.value as any[]).length + 1}`,
    },
  ]
  ensureProps().colLabels = list
  emitUpdate()
}

function removeCrossColLabel(i: number) {
  const list = (crossColLabels.value as any[]).filter((_: unknown, idx: number) => idx !== i)
  ensureProps().colLabels = list
  emitUpdate()
}

function onCrossTableShowIndexChange(v: boolean) {
  ensureProps().showIndex = v
  emitUpdate()
}

const maxLen = computed({
  get: () => ((comp.props as Record<string, unknown>)?.maxLength as number) ?? 0,
  set: () => {},
})
const numMin = computed({ get: () => ((comp.props as Record<string, unknown>)?.min as number) ?? 0, set: () => {} })
const numMax = computed({ get: () => ((comp.props as Record<string, unknown>)?.max as number) ?? 0, set: () => {} })
const numRadix = computed({
  get: () => ((comp.props as Record<string, unknown>)?.decimalPlaces as number) ?? 0,
  set: () => {},
})
const numUnit = computed({ get: () => ((comp.props as Record<string, unknown>)?.unit as string) ?? '', set: () => {} })
const autoWrap = computed({
  get: () => ((comp.props as Record<string, unknown>)?.autoSize as boolean) ?? false,
  set: () => {},
})
const allowRare = computed({
  get: () => ((comp.props as Record<string, unknown>)?.allowRareChars as boolean) ?? false,
  set: () => {},
})
const dateType = computed({
  get: () => ((comp.props as Record<string, unknown>)?.dateType as string) ?? 'date',
  set: () => {},
})
const maxCount = computed({
  get: () => ((comp.props as Record<string, unknown>)?.maxCount as number) ?? 3,
  set: () => {},
})
const maxSize = computed({
  get: () => ((comp.props as Record<string, unknown>)?.maxSize as number) ?? 0,
  set: () => {},
})
const fileTypes = computed({
  get: () => ((comp.props as Record<string, unknown>)?.fileTypes as string) ?? '',
  set: () => {},
})
const hideWhenEmpty = computed({
  get: () => ((comp.props as Record<string, unknown>)?.hideWhenEmpty as boolean) ?? false,
  set: () => {},
})
const enableSearch = computed({
  get: () => ((comp.props as Record<string, unknown>)?.enableSearch as boolean) ?? false,
  set: () => {},
})
const enableSingle = computed({
  get: () => ((comp.props as Record<string, unknown>)?.enableSingle as boolean) ?? false,
  set: () => {},
})

function setProp(key: string, val: unknown) {
  ensureProps()[key] = val
  emitUpdate()
}

function onMaxLenChange(v: number | undefined) {
  setProp('maxLength', v ?? 0)
}
function onNumRangeChange() {
  setProp('min', numMin.value)
}
function onNumMaxChange(v: number | undefined) {
  setProp('max', v ?? 0)
}
function onNumRadixChange(v: number | undefined) {
  setProp('decimalPlaces', v ?? 0)
}
function onNumUnitChange(v: string) {
  setProp('unit', v)
}
function onAutoWrapChange(v: boolean) {
  setProp('autoSize', v)
}
function onRareChange(v: boolean) {
  setProp('allowRareChars', v)
}
function onDateTypeChange(v: string) {
  setProp('dateType', v)
}
function onMaxCountChange(v: number | undefined) {
  setProp('maxCount', v ?? 3)
}
function onMaxSizeChange(v: number | undefined) {
  setProp('maxSize', v ?? 0)
}
function onFileTypesChange(v: string) {
  setProp('fileTypes', v)
}
function onHideWhenEmptyChange(v: boolean) {
  setProp('hideWhenEmpty', v)
}
function onEnableSearchChange(v: boolean) {
  setProp('enableSearch', v)
}
function onEnableSingleChange(v: boolean) {
  setProp('enableSingle', v)
}
</script>

<style scoped lang="scss">
.prop-panel {
  padding: 0;
  background: var(--color-card);
  height: 100%;
  overflow-y: auto;
}
.prop-title {
  font-size: 14px;
  font-weight: 600;
  padding: 16px;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-card);
  z-index: 2;
}

.section {
  margin-bottom: 0;
  border-bottom: 1px solid var(--color-canvas);
}

.section-header {
  font-size: 13px;
  font-weight: 600;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text);
  transition: background 0.15s;

  &:hover {
    color: var(--color-primary);
    background: var(--color-canvas);
  }
}

.section-arrow {
  color: var(--color-text-muted);
  transition:
    transform 0.2s ease,
    color 0.15s;
  flex-shrink: 0;
}
.section-arrow.open {
  transform: rotate(90deg);
  color: var(--color-primary);
}
.section-body {
  padding: 8px 16px 12px;
  max-height: 600px;
  overflow: hidden;
  transition:
    max-height 0.3s cubic-bezier(0.3, 0, 0.2, 1),
    padding 0.3s ease;
  &.collapsed {
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
}

.prop-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  padding: 6px 0;
  gap: 8px;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s;

  &:last-child {
    border-bottom: none;
  }

  label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
    width: 72px;
    flex-shrink: 0;
    line-height: 1.4;
    white-space: nowrap;
  }

  :deep(.el-input__wrapper) {
    background: var(--color-page);
    border: 1px solid var(--color-border);
    box-shadow: none;
    border-radius: var(--radius-sm);
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }
  :deep(.el-input.is-focus .el-input__wrapper) {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(45, 106, 79, 0.08);
  }
  :deep(.el-input-number) {
    width: auto;
  }
  :deep(.el-input-number .el-input__wrapper) {
    padding-right: 4px;
  }
  .input-with-unit {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .unit-label {
    font-size: 12px;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }
}

/* ── 选项编辑器 ── */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  transition: background 0.15s;

  &:hover {
    background: var(--color-primary-bg);
  }

  :deep(.el-input) {
    display: flex !important;
  }
  :deep(.el-input__wrapper) {
    box-shadow: none !important;
    border: 1px solid var(--color-border) !important;
    border-radius: var(--radius-xs) !important;
    padding: 0 8px !important;
    background: var(--color-card) !important;
  }
  :deep(.el-input.is-focus .el-input__wrapper) {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 1px rgba(45, 106, 79, 0.12) !important;
  }

  .el-input:nth-child(2) {
    flex: 1;
    min-width: 0;
  }
  .el-input:nth-child(3) {
    width: 52px;
    flex-shrink: 0;
  }
}

.opt-num {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-canvas);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-del {
  color: var(--color-text-muted);
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  transition: all 0.15s;
  &:hover {
    color: var(--color-error);
    background: rgba(181, 74, 58, 0.06);
  }
}

.btn-add {
  width: 100%;
  border: 1px dashed var(--color-primary);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  height: 36px;
  transition: all 0.15s;
  &:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
  }
}

.opt-default {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-canvas);
  label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
    white-space: nowrap;
  }
}

/* ── 表格列管理 ── */
.table-col-item {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  overflow: hidden;
  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: 0 1px 4px rgba(45, 106, 79, 0.08);
  }
}
.col-index {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-canvas);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.col-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--color-canvas);
  border-bottom: 1px solid var(--color-border);

  :deep(.el-select) {
    width: 90px;
    flex-shrink: 0;
  }
  :deep(.el-input) {
    flex: 1;
    min-width: 0;
  }
}
.col-del {
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: color 0.15s;

  &:hover {
    color: var(--color-error);
  }
}
.col-body {
  padding: 4px 8px 6px;

  .prop-row {
    margin-bottom: 0;
    padding: 4px 0;
  }
  :deep(.el-input-number) {
    width: 100px;
  }
}
.table-footer {
  border-top: 1px solid var(--color-border);
  margin: 4px 0 0;
  padding-top: 8px;
}
.btn-add-col {
  width: 100%;
  border: 1px dashed var(--color-primary);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
  font-size: 13px;
  height: 36px;
  transition: all 0.15s;

  &:hover {
    background: var(--color-primary-bg);
  }
}

.label-count {
  font-size: 11px;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  padding: 1px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}
</style>
