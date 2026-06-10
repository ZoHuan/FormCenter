<template>
  <div class="trigger-section">
    <div v-for="(rule, i) in rules" :key="i" class="rule-card">
      <div class="rule-line">如选中「{{ getOptionLabel(rule.sourceValue) }}」</div>
      <div class="rule-line rule-action">{{ actionLabel(rule.action) }}</div>
      <div class="rule-line rule-target">→ {{ getTargetLabels(rule.targetField).join('、') || '未选择' }}</div>
      <div class="rule-btns">
        <el-button link type="primary" size="small" @click="editRule(i)">编辑</el-button>
        <el-button link type="danger" size="small" @click="removeRule(i)">删除</el-button>
      </div>
    </div>
    <el-button v-if="hasOptions" class="btn-add" @click="addRule"><Plus :size="14" />添加触发条件</el-button>

    <el-dialog v-model="dialogVisible" :title="editingIndex >= 0 ? '编辑触发条件' : '添加触发条件'" width="480px">
      <div class="dialog-body">
        <div class="dialog-row">
          <label>触发选项</label>
          <el-select v-model="form.sourceValue" placeholder="选择选项" style="width: 100%">
            <el-option v-for="opt in optionList" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        <div class="dialog-row">
          <label>触发行为</label>
          <el-select v-model="form.action" placeholder="选择行为" style="width: 100%">
            <el-option value="show" label="隐藏的组件变为可见" />
            <el-option value="require" label="组件变为必填" />
            <el-option value="enable" label="只读组件变为可编辑" />
            <el-option value="disable" label="可编辑组件变为只读" />
          </el-select>
        </div>
        <div class="dialog-row">
          <label>目标组件</label>
          <div class="target-list">
            <el-checkbox
              v-for="c in targetComponents"
              :key="c.field"
              :model-value="form.targetField === c.field"
              @change="() => (form.targetField = c.field)"
              >{{ c.label }}</el-checkbox
            >
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRule">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Plus } from 'lucide-vue-next'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ component: ComponentSchema; allComponents: ComponentSchema[] }>()
const emit = defineEmits<{ update: [patch: Partial<ComponentSchema>] }>()

const rules = computed<Array<{ sourceValue: string; action: string; targetField: string }>>({
  get: () =>
    (props.component.triggerRules as Array<{ sourceValue: string; action: string; targetField: string }>) ?? [],
  set: () => {},
})

const hasOptions = computed(() => {
  const opts = (props.component.props as Record<string, unknown>)?.options as Array<{ label: string; value: string }>
  return opts && opts.length > 0
})

const optionList = computed(
  () => ((props.component.props as Record<string, unknown>)?.options as Array<{ label: string; value: string }>) ?? [],
)

const targetComponents = computed(() =>
  props.allComponents.filter(
    (c) =>
      c.field &&
      c.id !== props.component.id &&
      c.type !== 'title' &&
      c.type !== 'subtitle' &&
      c.type !== 'group-title' &&
      c.type !== 'separator' &&
      c.type !== 'point-out',
  ),
)

const dialogVisible = ref(false)
const editingIndex = ref(-1)
const form = reactive({ sourceValue: '', action: 'show', targetField: '' })

function getOptionLabel(val: string) {
  return optionList.value.find((o) => o.value === val)?.label ?? val
}

function actionLabel(a: string) {
  const m: Record<string, string> = {
    show: '隐藏的组件变为可见',
    require: '组件变为必填',
    enable: '只读组件变为可编辑',
    disable: '可编辑组件变为只读',
  }
  return m[a] ?? a
}

function getTargetLabels(field: string) {
  const c = targetComponents.value.find((t) => t.field === field)
  return c ? [c.label] : []
}

function addRule() {
  editingIndex.value = -1
  form.sourceValue = ''
  form.action = 'show'
  form.targetField = ''
  dialogVisible.value = true
}

function editRule(i: number) {
  editingIndex.value = i
  const r = rules.value[i]
  form.sourceValue = r.sourceValue
  form.action = r.action
  form.targetField = r.targetField
  dialogVisible.value = true
}

function removeRule(i: number) {
  const list = rules.value.filter((_: unknown, idx: number) => idx !== i)
  emit('update', { triggerRules: list as ComponentSchema['triggerRules'] })
}

function confirmRule() {
  if (!form.sourceValue || !form.targetField) return
  const list = [...rules.value]
  const entry = {
    id: Date.now().toString(),
    type: 'trigger' as const,
    sourceField: props.component.field,
    sourceValue: form.sourceValue,
    targetField: form.targetField,
    action: form.action as 'show' | 'hide' | 'require' | 'optional' | 'enable' | 'disable',
  }
  if (editingIndex.value >= 0) list[editingIndex.value] = entry
  else list.push(entry)
  emit('update', { triggerRules: list })
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.trigger-section {
  margin-top: 8px;
}

.rule-card {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-page);
  margin-bottom: 6px;
  position: relative;
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-card);
  }

  .rule-line {
    font-size: 12px;
    margin-bottom: 3px;
    color: var(--color-text);
    padding-right: 64px;
  }
  .rule-action {
    color: var(--color-text-secondary);
    font-weight: 500;
  }
  .rule-target {
    color: var(--color-primary);
    font-weight: 500;
  }
  .rule-btns {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 2px;
  }
}

.dialog-row {
  margin-bottom: 16px;
  label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 6px;
  }
}
.target-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
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
    background: var(--color-primary-bg);
  }
}
</style>
