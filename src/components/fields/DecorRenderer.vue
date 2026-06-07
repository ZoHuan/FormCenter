<template>
  <component :is="tag" v-if="comp.type !== 'separator'" :style="titleStyle">{{ comp.label }}</component>
  <hr v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ comp: ComponentSchema }>()
const tag = computed(() => {
  if (props.comp.type === 'title') return 'h1'
  if (props.comp.type === 'subtitle') return 'h2'
  if (props.comp.type === 'group-title') return 'h3'
  return 'p'
})
const titleStyle = computed(() => {
  const p = props.comp.props as Record<string, unknown>
  return {
    fontFamily: p?.fontFamily || 'inherit',
    fontSize: (p?.fontSize as number) + 'px' || undefined,
    textAlign: p?.textAlign || undefined,
    color: p?.color || undefined,
  }
})
</script>
