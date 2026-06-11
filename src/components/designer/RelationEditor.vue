<template>
  <div class="relation-section">
    <div class="prop-row">
      <label>API 名称</label
      ><el-input v-model="apiName" size="small" placeholder="输入 Mock API 名称" @input="emitUpdate" />
    </div>
    <div class="prop-row">
      <label>API URL</label><el-input v-model="apiUrl" size="small" placeholder="/api/search" @input="emitUpdate" />
    </div>
    <div class="prop-row"><label>可编辑</label><el-switch v-model="allowEdit" size="small" @change="emitUpdate" /></div>
    <el-button class="btn-add-out" @click="addOutputField"><Plus :size="14" />添加展示字段</el-button>
    <div v-for="(f, i) in outputFields" :key="i" class="output-row">
      <el-input v-model="f.label" size="small" placeholder="字段名" style="flex: 1" @input="emitUpdate" />
      <el-input-number v-model="f.width" :min="60" :max="300" size="small" placeholder="宽" @change="emitUpdate" />
      <el-button link class="btn-out-del" @click="removeOutputField(i)"><X :size="14" /></el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ component: ComponentSchema }>()
const emit = defineEmits<{ update: [patch: Partial<ComponentSchema>] }>()
const p = computed(() => props.component.props as Record<string, unknown>)
const apiName = computed({
  get: () => (p.value?.apiName as string) ?? '',
  set: (v) => {
    p.value.apiName = v
    emitUpdate()
  },
})
const apiUrl = computed({
  get: () => (p.value?.apiUrl as string) ?? '',
  set: (v) => {
    p.value.apiUrl = v
    emitUpdate()
  },
})
const allowEdit = computed({
  get: () => (p.value?.allowEdit as boolean) ?? false,
  set: (v) => {
    p.value.allowEdit = v
    emitUpdate()
  },
})
const outputFields = computed<Array<{ label: string; width: number }>>({
  get: () => (p.value?.outputFields as Array<{ label: string; width: number }>) ?? [],
  set: () => {},
})
function addOutputField() {
  const list = [...outputFields.value, { label: '', width: 120 }]
  p.value.outputFields = list
  emitUpdate()
}
function removeOutputField(i: number) {
  const list = outputFields.value.filter((_: unknown, idx: number) => idx !== i)
  p.value.outputFields = list
  emitUpdate()
}
function emitUpdate() {
  emit('update', { ...props.component })
}
</script>

<style scoped lang="scss">
.relation-section .prop-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  padding: 6px 0;
  gap: 8px;
}
.relation-section .prop-row label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  width: 72px;
  flex-shrink: 0;
  white-space: nowrap;
}

.output-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);

  &:hover {
    background: var(--color-primary-bg);
  }

  :deep(.el-input) {
    flex: 1;
    min-width: 0;
  }
  :deep(.el-input-number) {
    width: 80px;
    flex-shrink: 0;
  }
}

.btn-out-del {
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: color 0.15s;

  &:hover {
    color: var(--color-error);
  }
}

.btn-add-out {
  margin-top: 8px;
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
</style>
