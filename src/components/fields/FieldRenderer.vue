<template>
  <div class="field-renderer">
    <DecorRenderer v-if="decorTypes.includes(comp.type)" :comp="comp" />
    <InputRenderer v-else-if="inputTypes.includes(comp.type)" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <SelectRenderer v-else-if="selectTypes.includes(comp.type)" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <DateRenderer v-else-if="dateTypes.includes(comp.type)" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <ImageRenderer v-else-if="imageTypes.includes(comp.type)" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <SignatureRenderer v-else-if="comp.type === 'signature'" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <RateRenderer v-else-if="comp.type === 'rate'" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <TableRenderer v-else-if="comp.type === 'table'" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <CrossTableRenderer v-else-if="comp.type === 'cross-table'" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <RelationRenderer v-else-if="comp.type === 'relation'" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <CommitmentRenderer v-else-if="comp.type === 'commitment'" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <RegionRenderer v-else-if="comp.type === 'region'" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <TreeRenderer v-else-if="comp.type === 'tree-structure' || comp.type === 'tree'" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <QRCodeRenderer v-else-if="comp.type === 'QRCode'" :comp="comp" :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" />
    <el-input v-else :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :placeholder="comp.description" />
  </div>
</template>

<script setup lang="ts">
import type { ComponentSchema } from '@/types'
import DecorRenderer from './DecorRenderer.vue'
import InputRenderer from './InputRenderer.vue'
import SelectRenderer from './SelectRenderer.vue'
import DateRenderer from './DateRenderer.vue'
import ImageRenderer from './ImageRenderer.vue'
import SignatureRenderer from './SignatureRenderer.vue'
import RateRenderer from './RateRenderer.vue'
import TableRenderer from './TableRenderer.vue'
import CrossTableRenderer from './CrossTableRenderer.vue'
import RelationRenderer from './RelationRenderer.vue'
import CommitmentRenderer from './CommitmentRenderer.vue'
import RegionRenderer from './RegionRenderer.vue'
import TreeRenderer from './TreeRenderer.vue'
import QRCodeRenderer from './QRCodeRenderer.vue'

defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()

const decorTypes = ['title', 'subtitle', 'group-title', 'separator', 'point-out']
const inputTypes = ['input', 'textarea', 'numeric', 'serial-number']
const selectTypes = ['chooser', 'multi-chooser', 'selection', 'cascader']
const dateTypes = ['date', 'date-range']
const imageTypes = ['image', 'singleImage']
</script>
