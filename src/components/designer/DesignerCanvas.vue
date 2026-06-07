<template>
  <div class="canvas" @drop.prevent="onDrop" @dragover.prevent @click="$emit('select', null)">
    <div v-if="components.length === 0" class="canvas-empty">
      <div class="empty-box"><p>拖拽组件到此处开始设计</p></div>
    </div>
    <draggable
      v-else
      :list="localComponents"
      item-key="id"
      class="canvas-list"
      ghost-class="ghost"
      :animation="300"
      @change="onSortChange"
    >
      <template #item="{ element: comp }">
        <div class="canvas-row" :style="{ width: widthPct(comp.colspan) }">
          <FieldCard
            :schema="comp"
            :selected="comp.id === selectedId"
            @select="$emit('select', comp.id)"
            @remove="$emit('remove', comp.id)"
            @copy="$emit('copy', comp.id)"
          />
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import draggable from 'vuedraggable'
import type { ComponentType, ComponentSchema } from '@/types'
import FieldCard from './FieldCard.vue'

const props = defineProps<{ components: ComponentSchema[]; selectedId: string | null }>()
const emit = defineEmits<{ select: [id: string | null]; remove: [id: string]; move: [from: number, to: number] }>()

const localComponents = computed(() => [...props.components])

function onSortChange(e: { moved?: { oldIndex: number; newIndex: number } }) {
  if (e.moved) emit('move', e.moved.oldIndex, e.moved.newIndex)
}

function onDrop(e: DragEvent) {
  const type = e.dataTransfer?.getData('componentType') as ComponentType
  if (type) window.dispatchEvent(new CustomEvent('palette-drop', { detail: { type } }))
}
function widthPct(c: number): string {
  if (c === 2) return '50%'
  if (c === 3) return '33.3%'
  return '100%'
}
</script>

<style scoped lang="scss">
.canvas {
  min-height: 400px;
}

.canvas-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.empty-box {
  border: 2px dashed var(--color-border-hover);
  border-radius: var(--radius-lg);
  padding: 32px 48px;
  text-align: center;

  p {
    color: var(--color-text-muted);
    font-size: 14px;
  }
}

.canvas-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.canvas-row {
  margin-bottom: 4px;
  animation: card-enter 0.5s cubic-bezier(0.2, 0.8, 0.2, 1.2);
}

.ghost {
  opacity: 0.4;
  border: 2px dashed var(--color-primary-light) !important;
  border-radius: var(--radius-md);
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
