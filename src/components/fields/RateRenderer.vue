<template>
  <div class="rate-field">
    <el-rate :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" :max="max" :colors="colors" />
    <p v-if="prompts?.[Number(modelValue) - 1]" class="rate-hint">{{ prompts[Number(modelValue) - 1] }}</p>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
const max = computed(() => (props.comp.props as Record<string, unknown>)?.maxScore as number ?? 5)
const prompts = computed(() => (props.comp.props as Record<string, unknown>)?.prompts as string[] ?? [])
const colors = ['#F7BA2A', '#F7BA2A', '#F7BA2A']
</script>
<style scoped>
.rate-hint { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }
</style>
