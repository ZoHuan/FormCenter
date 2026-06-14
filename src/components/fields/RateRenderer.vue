<template>
  <div class="rate-field">
    <el-rate
      :model-value="modelValue as number"
      @update:model-value="(v) => $emit('update:modelValue', v)"
      :max="max"
      :colors="colors"
      :allow-half="allowHalf"
      :show-text="showText"
      :texts="texts"
    />
    <p v-if="currentPrompt" class="rate-hint">{{ currentPrompt }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()

const compProps = computed(() => (props.comp.props as Record<string, unknown>) || {})

const max = computed(() => (compProps.value.maxScore as number) ?? 5)
const icon = computed(() => (compProps.value.icon as string) ?? 'star')
const iconColor = computed(() => compProps.value.iconColor as string | undefined)
const prompts = computed(() => (compProps.value.prompts as string[]) || [])
const allowHalf = computed(() => (compProps.value.allowHalf as boolean) ?? false)
const showText = computed(() => prompts.value.length > 0)

// 根据图标类型设置默认颜色
const colors = computed(() => {
  if (iconColor.value) {
    return [iconColor.value, iconColor.value, iconColor.value]
  }

  switch (icon.value) {
    case 'heart':
      return ['#FB471A', '#FB471A', '#FB471A']
    case 'smile':
      return ['#F7BA2A', '#F7BA2A', '#F7BA2A']
    case 'like':
      return ['#204CE8', '#204CE8', '#204CE8']
    case 'star':
    default:
      return ['#F7BA2A', '#F7BA2A', '#F7BA2A']
  }
})

// 评分提示文字
const texts = computed(() => {
  if (prompts.value.length > 0) {
    return prompts.value
  }
  // 默认提示文字
  return Array.from({ length: max.value }, (_, i) => `${i + 1}分`)
})

// 当前提示
const currentPrompt = computed(() => {
  const value = props.modelValue as number
  if (value && prompts.value[value - 1]) {
    return prompts.value[value - 1]
  }
  return null
})
</script>

<style scoped lang="scss">
.rate-field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  :deep(.el-rate) {
    display: flex;
    align-items: center;
  }

  :deep(.el-rate__text) {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

.rate-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
}
</style>
