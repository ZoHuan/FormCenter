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
  display: flex;
  align-items: center;

  :deep(.el-checkbox) {
    display: flex;
    align-items: start;
    gap: 8px;
    height: auto;

    .el-checkbox__input {
      display: flex;
      align-items: center;
      height: 30px;
    }
  }

  :deep(.el-checkbox__label) {
    white-space: normal;
    line-height: 30px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }
}
</style>
