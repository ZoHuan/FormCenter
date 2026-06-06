<template>
  <div class="field-renderer">
    <InputRenderer v-if="types.includes(comp.type)" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <SelectRenderer v-else-if="selectTypes.includes(comp.type)" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <el-date-picker v-else-if="comp.type === 'date' || comp.type === 'date-range'" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :type="comp.type === 'date-range' ? 'daterange' : 'date'" />
    <el-rate v-else-if="comp.type === 'rate'" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <el-checkbox v-else-if="comp.type === 'commitment'" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :label="comp.description" />
    <div v-else-if="comp.type === 'QRCode'" class="qr-placeholder">二维码内容：{{ modelValue || '未设置' }}</div>
    <el-input v-else :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :placeholder="comp.description" />
  </div>
</template>

<script setup lang="ts">
import type { ComponentSchema } from '@/types'
import InputRenderer from './InputRenderer.vue'
import SelectRenderer from './SelectRenderer.vue'

defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()

const types = ['input', 'textarea', 'numeric', 'serial-number']
const selectTypes = ['chooser', 'multi-chooser', 'selection', 'cascader', 'tree', 'user-tree', 'org-tree', 'region']
</script>
