<template>
  <div class="canvas" :class="{ 'drag-over': isDragOver }" @drop.prevent="onDrop" @dragover.prevent="onDragOver" @dragleave="onDragLeave" @click="$emit('select', null)">
    <div v-if="components.length === 0" class="canvas-empty">
      <div class="empty-box">
        <div class="empty-icon"><Layers :size="32" /></div>
        <p class="empty-main">拖拽组件到此处</p>
        <p class="empty-sub">从左侧组件库选择需要的字段开始设计</p>
      </div>
    </div>
    <div v-else class="canvas-card">
      <draggable
        :list="localComponents"
        item-key="id"
        class="canvas-list"
        ghost-class="ghost"
        :animation="300"
        @change="onSortChange"
      >
        <template #item="{ element: comp }">
          <div class="canvas-row" :style="{ gridColumn: gridSpan(comp.colspan) }">
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Layers } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import type { ComponentType, ComponentSchema } from '@/types'
import FieldCard from './FieldCard.vue'

const props = defineProps<{ components: ComponentSchema[]; selectedId: string | null }>()
const emit = defineEmits<{ select: [id: string | null]; remove: [id: string]; move: [from: number, to: number] }>()

const isDragOver = ref(false)
const localComponents = computed(() => [...props.components])

function onDragOver() { isDragOver.value = true }
function onDragLeave(e: DragEvent) {
  if (!(e.currentTarget as HTMLElement)?.contains(e.relatedTarget as HTMLElement)) {
    isDragOver.value = false
  }
}

function onSortChange(e: { moved?: { oldIndex: number; newIndex: number } }) {
  if (e.moved) emit('move', e.moved.oldIndex, e.moved.newIndex)
}

function onDrop(e: DragEvent) {
  isDragOver.value = false
  const type = e.dataTransfer?.getData('componentType') as ComponentType
  if (type) window.dispatchEvent(new CustomEvent('palette-drop', { detail: { type } }))
}
function gridSpan(colspan: number): string {
  if (colspan === 1) return 'span 12'
  if (colspan === 2) return 'span 6'
  if (colspan === 3) return 'span 4'
  return 'span 12'
}
</script>

<style scoped lang="scss">
.canvas { min-height: 400px; }

.canvas-empty {
  display: flex; align-items: center; justify-content: center;
  min-height: 350px; border-radius: var(--radius-lg);
  background: var(--color-card); box-shadow: var(--shadow-xs);
}

.empty-box {
  border: 2px dashed var(--color-primary-light);
  border-radius: var(--radius-lg); padding: 56px 64px; text-align: center;
  transition: all 0.3s;

  .empty-icon {
    color: var(--color-primary-light); margin-bottom: 16px;
    display: flex; justify-content: center; opacity: 0.6;
    animation: float 3s ease-in-out infinite;
  }

  p { color: var(--color-text-muted); font-size: 14px; line-height: 1.6; margin: 0; }
  .empty-main { font-size: 16px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 6px; }
  .empty-sub { font-size: 13px; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.canvas-card {
  background: var(--color-card); border-radius: var(--radius-lg);
  padding: 28px; box-shadow: 0 2px 12px rgba(28, 25, 23, 0.06);
  min-height: 400px; border: 1px solid rgba(45, 106, 79, 0.06);
}

.canvas-list {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 12px;
  align-items: start;
}
.canvas-row {
  animation: card-enter 0.5s cubic-bezier(0.2, 0.8, 0.2, 1.2);
  min-width: 0;
}

.ghost {
  opacity: 0.5;
  background: var(--color-card) !important;
  border: 2px dashed var(--color-primary-light) !important;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transform: scale(1.02);
}

.canvas.drag-over {
  .canvas-card {
    border-color: var(--color-primary-light);
    box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.1);
  }
  .canvas-empty .empty-box {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(45, 106, 79, 0); }
  50% { box-shadow: 0 0 0 8px rgba(45, 106, 79, 0.05); }
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
