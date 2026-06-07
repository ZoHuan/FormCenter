<template>
  <div class="field-card" :class="{ selected }" @click.stop="$emit('select')">
    <div class="card-header" :class="{ 'drag-handle': selected }">
      <span v-if="!selected" class="drag-icon">⠿</span>
      <span class="card-label">{{ schema.label }}</span>
      <span v-if="schema.required" class="required-star">*</span>
      <button class="btn-copy" @click.stop="$emit('copy')" title="复制组件">复制</button>
      <button class="btn-delete" @click.stop="$emit('remove')" title="删除组件">✕</button>
    </div>
    <div class="card-preview">
      <span v-if="isTextLike" class="preview-input">{{ schema.description || '请输入' }}</span>
      <span v-else-if="isSelectLike" class="preview-select">请选择 ▾</span>
      <span v-else-if="isDate" class="preview-input">____/__/__</span>
      <span v-else-if="schema.type === 'table'" class="preview-table"
        >表格 ({{ schema.subComponents?.length ?? 0 }} 列)</span
      >
      <span v-else-if="schema.type === 'signature'" class="preview-sign">签名区</span>
      <span v-else class="preview-input">{{ schema.type }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ schema: ComponentSchema; selected: boolean }>()
defineEmits<{ select: []; remove: []; copy: [] }>()

const isTextLike = computed(() => ['input', 'textarea', 'numeric', 'serial-number'].includes(props.schema.type))
const isSelectLike = computed(() =>
  ['chooser', 'multi-chooser', 'selection', 'cascader', 'tree', 'region', 'map-location', 'user-tree', 'org-tree'].includes(props.schema.type),
)
const isDate = computed(() => ['date', 'date-range'].includes(props.schema.type))
</script>

<style scoped lang="scss">
.field-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-xs);
  }

  &.selected {
    border: 2px solid var(--color-primary);
    box-shadow: var(--shadow-focus);
  }
}

.card-header {
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  background: var(--color-primary-bg);
  border-bottom: 1px solid var(--color-canvas);
  gap: 8px;
}

.drag-handle {
  color: var(--color-text-muted);
  font-size: 14px;
  cursor: grab;
  width: 24px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.required-star {
  color: var(--color-error);
  font-size: 11px;
  margin-left: 2px;
  flex-shrink: 0;
}

.btn-copy {
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover { background: var(--color-primary-bg); }
}

.btn-delete {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 14px;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  transition: all 0.15s;

  &:hover { color: var(--color-error); background: rgba(181,74,58,0.08); }
}

.card-preview {
  padding: 8px 12px 12px;
  min-height: 36px;
  display: flex;
  align-items: center;
}

.preview-input,
.preview-select,
.preview-table,
.preview-sign {
  color: var(--color-text-muted);
  font-size: 13px;
}
</style>
