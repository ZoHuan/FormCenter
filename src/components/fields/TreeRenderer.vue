<template>
  <el-tree-select :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :data="treeData" :placeholder="comp.description" clearable check-strictly />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'
import { orgTree } from '@/mock/orgTree'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
const treeData = computed(() => orgTree)
</script>
