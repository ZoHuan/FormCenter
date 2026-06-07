<template>
  <el-date-picker
    :model-value="modelValue"
    @update:model-value="(v) => $emit('update:modelValue', v)"
    :type="comp.type === 'date-range' ? 'daterange' : 'date'"
    :placeholder="comp.description"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</template>
<script setup lang="ts">
import type { ComponentSchema } from '@/types'
defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
</script>
