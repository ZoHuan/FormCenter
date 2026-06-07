<template>
  <div class="commitment-field">
    <div class="commitment-content">
      <el-checkbox
        :model-value="isChecked"
        @update:model-value="handleChange"
      >
        <span class="commitment-text">{{ comp.description || '本人确认以上信息属实' }}</span>
      </el-checkbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.length > 0
  }
  return !!props.modelValue
})

function handleChange(checked: boolean) {
  if (checked) {
    emit('update:modelValue', [{ value: '1' }])
  } else {
    emit('update:modelValue', [])
  }
}
</script>

<style scoped lang="scss">
.commitment-field {
  width: 100%;
}

.commitment-content {
  padding: 12px 16px;
  background: var(--color-primary-bg);
  border-radius: 8px;
  border: 1px solid var(--color-border);

  :deep(.el-checkbox) {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  :deep(.el-checkbox__label) {
    white-space: normal;
    line-height: 1.5;
  }
}

.commitment-text {
  font-size: 14px;
  color: var(--color-text);
}
</style>
