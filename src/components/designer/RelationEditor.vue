<template>
  <div class="relation-section">
    <div class="prop-row"><label>API 名称</label><el-input v-model="apiName" size="small" placeholder="输入 Mock API 名称" @input="emitUpdate" /></div>
    <div class="prop-row"><label>API URL</label><el-input v-model="apiUrl" size="small" placeholder="/api/search" @input="emitUpdate" /></div>
    <div class="prop-row"><label>可编辑</label><el-switch v-model="allowEdit" size="small" @change="emitUpdate" /></div>
    <el-button link type="primary" size="small" @click="addOutputField">+ 添加展示字段</el-button>
    <div v-for="(f, i) in outputFields" :key="i" class="output-row">
      <el-input v-model="f.label" size="small" placeholder="字段名" style="flex:1" @input="emitUpdate" />
      <el-input-number v-model="f.width" :min="60" :max="300" size="small" placeholder="宽" @change="emitUpdate" />
      <el-button link type="danger" size="small" @click="removeOutputField(i)">×</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ component: ComponentSchema }>()
const emit = defineEmits<{ update: [patch: Partial<ComponentSchema>] }>()
const p = computed(() => props.component.props as Record<string, unknown>)
const apiName = computed({ get: () => (p.value?.apiName as string) ?? '', set: (v) => { p.value.apiName = v; emitUpdate() } })
const apiUrl = computed({ get: () => (p.value?.apiUrl as string) ?? '', set: (v) => { p.value.apiUrl = v; emitUpdate() } })
const allowEdit = computed({ get: () => (p.value?.allowEdit as boolean) ?? false, set: (v) => { p.value.allowEdit = v; emitUpdate() } })
const outputFields = computed<Array<{ label: string; width: number }>>({ get: () => (p.value?.outputFields as Array<{ label: string; width: number }>) ?? [], set: () => {} })
function addOutputField() { const list = [...outputFields.value, { label: '', width: 120 }]; p.value.outputFields = list; emitUpdate() }
function removeOutputField(i: number) { const list = outputFields.value.filter((_: unknown, idx: number) => idx !== i); p.value.outputFields = list; emitUpdate() }
function emitUpdate() { emit('update', { ...props.component }) }
</script>

<style scoped lang="scss">
.relation-section { margin-top: 8px; }
.output-row { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
</style>
