<template>
  <div class="relation-field">
    <el-select
      :model-value="modelValue"
      @update:model-value="(v) => $emit('update:modelValue', v)"
      :placeholder="comp.description"
      clearable
    >
      <el-option v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
    </el-select>
    <div v-if="modelValue && outputFields.length" class="relation-info">
      <span v-for="f in outputFields" :key="f.field">{{ f.label }}: 示例数据</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
const options = computed(
  () => ((props.comp.props as Record<string, unknown>)?.options as Array<{ label: string; value: string }>) ?? [],
)
const outputFields = computed(
  () => ((props.comp.props as Record<string, unknown>)?.outputFields as Array<{ field: string; label: string }>) ?? [],
)
</script>
<style scoped>
.relation-info {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
