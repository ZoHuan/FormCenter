<template>
  <el-cascader
    :model-value="modelValue"
    @update:model-value="(v) => $emit('update:modelValue', v)"
    :options="options"
    :placeholder="comp.description"
    clearable
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
const options = computed(() => ((props.comp.props as Record<string, unknown>)?.options as any[]) ?? [])
</script>
