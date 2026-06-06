<template>
  <el-input
    v-if="comp.type !== 'numeric'"
    :model-value="modelValue"
    @update:model-value="(v) => $emit('update:modelValue', v)"
    :type="comp.type === 'textarea' ? 'textarea' : 'text'"
    :placeholder="comp.description"
    :disabled="comp.type === 'serial-number'"
    :maxlength="(comp.props as Record<string, unknown>)?.maxLength as number"
  />
  <el-input-number v-else :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :placeholder="comp.description" />
</template>

<script setup lang="ts">
import type { ComponentSchema } from '@/types'
defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
</script>
