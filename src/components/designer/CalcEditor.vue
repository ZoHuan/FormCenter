<template>
  <div class="calc-section">
    <div v-for="(rule, i) in rules" :key="i" class="rule-card">
      <div class="rule-line">📐 {{ rule.description || '计算表达式' }}</div>
      <div class="rule-expr">{{ rule.expression }}</div>
      <div class="rule-btns">
        <el-button link type="primary" size="small" @click="editRule(i)">编辑</el-button>
        <el-button link type="danger" size="small" @click="removeRule(i)">删除</el-button>
      </div>
    </div>
    <el-button link type="primary" size="small" @click="addRule">+ 添加计算表达式</el-button>

    <el-dialog v-model="dialogVisible" title="计算表达式" width="520px">
      <div class="dialog-body">
        <div class="dialog-row">
          <label>规则名称</label>
          <el-input v-model="formDesc" maxlength="20" placeholder="如：总价计算" />
        </div>
        <div class="dialog-row">
          <label>表达式</label>
          <el-input v-model="formExpr" type="textarea" :rows="3" placeholder="如：${price} * ${quantity}" />
        </div>
        <p class="dialog-hint">使用 <code>${'{field}'}</code> 引用表单字段，如 <code>${'${price}'} * ${'${count}'}</code></p>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRule">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ component: ComponentSchema }>()
const emit = defineEmits<{ update: [patch: Partial<ComponentSchema>] }>()

const rules = computed<Array<{ id: string; description: string; expression: string }>>({
  get: () => (props.component.validationRules as Array<{ id: string; description: string; expression: string }>)?.filter((r) => r.type === 'calculation') ?? [],
  set: () => {},
})

const dialogVisible = ref(false)
const editingIndex = ref(-1)
const formDesc = ref('')
const formExpr = ref('')

function addRule() { editingIndex.value = -1; formDesc.value = ''; formExpr.value = ''; dialogVisible.value = true }
function editRule(i: number) { const r = rules.value[i]; editingIndex.value = i; formDesc.value = r.description ?? ''; formExpr.value = r.expression ?? ''; dialogVisible.value = true }
function removeRule(i: number) { saveRules(rules.value.filter((_: unknown, idx: number) => idx !== i)) }

function confirmRule() {
  if (!formDesc.value || !formExpr.value) return
  const list = [...rules.value]
  const entry = { id: Date.now().toString(), type: 'calculation' as const, description: formDesc.value, expression: formExpr.value }
  if (editingIndex.value >= 0) list[editingIndex.value] = entry
  else list.push(entry)
  saveRules(list)
  dialogVisible.value = false
}

function saveRules(list: Array<{ id: string; description: string; expression: string }>) {
  const all = (props.component.validationRules as Array<{ id: string; description: string; expression: string }>)?.filter((r) => r.type !== 'calculation') ?? []
  emit('update', { validationRules: [...all, ...list] })
}
</script>

<style scoped lang="scss">
.calc-section { margin-top: 8px; }
.rule-card { padding: 8px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-primary-bg); margin-bottom: 8px; position: relative; }
.rule-line { font-size: 12px; color: var(--color-text); }
.rule-expr { font-size: 12px; color: var(--color-text-muted); font-family: JetBrains Mono, monospace; margin-top: 2px; }
.rule-btns { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; }
.dialog-row { margin-bottom: 16px; label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; } }
.dialog-hint { font-size: 12px; color: var(--color-text-muted); margin-top: -8px; code { background: #f0f0f0; padding: 1px 4px; border-radius: 3px; } }
</style>
