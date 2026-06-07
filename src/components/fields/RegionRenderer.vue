<template>
  <el-cascader :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :options="regionTree" :placeholder="comp.description" clearable />
</template>
<script setup lang="ts">
import type { ComponentSchema } from '@/types'
import { regionTree } from '@/mock/region'
defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
</script>
