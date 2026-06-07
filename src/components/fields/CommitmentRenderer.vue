<template>
  <el-checkbox :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :label="comp.description" />
</template>
<script setup lang="ts">
import type { ComponentSchema } from '@/types'
defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
</script>
