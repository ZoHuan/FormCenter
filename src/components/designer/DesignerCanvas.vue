<template>
  <div
    class="canvas"
    @drop.prevent="onDrop"
    @dragover.prevent
    @click="$emit('select', null)"
  >
    <div v-if="components.length === 0" class="canvas-empty">
      <div class="empty-box">
        <p>拖拽组件到此处开始设计</p>
      </div>
    </div>
    <div v-else class="canvas-list">
      <div
        v-for="(comp, idx) in components"
        :key="comp.id"
        class="canvas-row"
        :class="{ 'w-half': comp.colspan === 2, 'w-third': comp.colspan === 3 }"
        :style="{ width: widthPct(comp.colspan) }"
      >
        <FieldCard
          :schema="comp"
          :selected="comp.id === selectedId"
          @select="$emit('select', comp.id)"
          @remove="$emit('remove', comp.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentType, ComponentSchema } from '@/types'
import FieldCard from './FieldCard.vue'

defineProps<{ components: ComponentSchema[]; selectedId: string | null }>()
defineEmits<{ select: [id: string | null]; remove: [id: string]; move: [from: number, to: number] }>()

function onDrop(e: DragEvent) {
  const type = e.dataTransfer?.getData('componentType') as ComponentType
  if (type) {
    const event = new CustomEvent('palette-drop', { detail: { type } })
    window.dispatchEvent(event)
  }
}

function widthPct(c: number): string {
  if (c === 2) return '50%'
  if (c === 3) return '33.3%'
  return '100%'
}
</script>

<style scoped lang="scss">
.canvas { min-height: 400px; }
.canvas-empty { display: flex; align-items: center; justify-content: center; min-height: 300px; }
.empty-box { border: 2px dashed #C8C4BD; border-radius: 12px; padding: 32px 48px; text-align: center; }
.empty-box p { color: #9C9790; font-size: 14px; }
.canvas-list { display: flex; flex-wrap: wrap; gap: 8px; }
.canvas-row { margin-bottom: 4px; }
.w-half { width: calc(50% - 4px); }
.w-third { width: calc(33.3% - 6px); }
</style>
