<template>
  <div class="commitment-field">
    <el-checkbox :model-value="isChecked" @update:model-value="handleChange">
      <span class="commitment-text">{{ comp.description || '本人确认以上信息属实' }}</span>
    </el-checkbox>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue.length > 0
  return !!props.modelValue
})

function handleChange(checked: boolean) {
  if (checked) emit('update:modelValue', [{ value: '1' }])
  else emit('update:modelValue', [])
}
</script>

<style scoped lang="scss">
.commitment-field {
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;

  :deep(.el-checkbox) {
    display: flex;
    align-items: center;
    gap: 8px;
    height: auto;
  }

  :deep(.el-checkbox__label) {
    white-space: normal;
    line-height: 1.6;
    font-size: 14px;
    color: var(--color-text-secondary);
  }
}
</style>
