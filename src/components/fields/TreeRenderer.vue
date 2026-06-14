<template>
  <el-tree-select
    :model-value="modelValue"
    @update:model-value="(v) => $emit('update:modelValue', v)"
    :data="treeData"
    :placeholder="comp.description"
    clearable
    check-strictly
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
const treeData = computed<Array<{ label: string; value: string; children?: unknown[] }>>(
  () =>
    ((props.comp.props as Record<string, unknown>)?.options as Array<{
      label: string
      value: string
      children?: unknown[]
    }>) ?? [],
)
</script>
