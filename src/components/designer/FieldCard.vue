<template>
  <div class="field-card" :class="{ selected }" @click.stop="$emit('select')">
    <div class="card-header">
      <span class="drag-handle">⠿</span>
      <span class="card-label">{{ schema.label }}</span>
      <span v-if="schema.required" class="required-star">*</span>
      <span class="type-tag">{{ typeLabel }}</span>
      <button class="btn-delete" @click.stop="$emit('remove')">×</button>
    </div>
    <div class="card-preview">
      <span v-if="isTextLike" class="preview-input">{{ schema.description || '请输入' }}</span>
      <span v-else-if="isSelectLike" class="preview-select">请选择 ▾</span>
      <span v-else-if="isDate" class="preview-input">____/__/__</span>
      <span v-else-if="schema.type === 'table'" class="preview-table">表格 ({{ (schema.subComponents?.length ?? 0) }} 列)</span>
      <span v-else-if="schema.type === 'signature'" class="preview-sign">签名区</span>
      <span v-else class="preview-input">{{ schema.type }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ schema: ComponentSchema; selected: boolean }>()
defineEmits<{ select: []; remove: [] }>()

const isTextLike = computed(() => ['input', 'textarea', 'numeric', 'serial-number'].includes(props.schema.type))
const isSelectLike = computed(() => ['chooser', 'multi-chooser', 'selection', 'cascader', 'tree', 'region', 'map-location', 'user-tree', 'org-tree'].includes(props.schema.type))
const isDate = computed(() => ['date', 'date-range'].includes(props.schema.type))

const typeLabel = computed(() => {
  const m: Record<string, string> = {
    input: '入', textarea: '多', numeric: '#', 'serial-number': 'NO', chooser: '○', 'multi-chooser': '☐', selection: '▾',
    cascader: '└→', tree: '🌳', date: '日', 'date-range': '日↔', image: '📎', singleImage: '🖼', signature: '✍',
    rate: '★', table: '表', 'cross-table': '交', relation: '链', commitment: '☑', region: '地', 'map-location': '📍',
    'user-tree': '👤', 'org-tree': '🏢', 'signature-name': '签', QRCode: '码', title: 'T', subtitle: 't', 'group-title': 'G',
    separator: '—', 'point-out': 'ⓘ',
  }
  return m[props.schema.type] ?? props.schema.type
})
</script>

<style scoped>
.field-card { background: #fff; border: 1px solid #E8E5E0; border-radius: 8px; overflow: hidden; transition: border-color .15s, box-shadow .15s; }
.field-card:hover { border-color: #C8C4BD; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
.field-card.selected { border: 2px solid #2858C8; box-shadow: 0 0 0 4px rgba(40,88,200,.08); }
.card-header { height: 32px; display: flex; align-items: center; padding: 0 8px; background: #FAFAF8; border-bottom: 1px solid #F0EFEC; gap: 4px; }
.drag-handle { color: #9C9790; font-size: 12px; cursor: grab; width: 16px; text-align: center; }
.card-label { font-size: 13px; font-weight: 500; color: #1A1814; }
.required-star { color: #B54A3A; font-size: 11px; margin-left: 2px; }
.type-tag { margin-left: auto; font-size: 11px; color: #9C9790; background: #F0EFEC; border-radius: 3px; padding: 1px 6px; }
.btn-delete { border: none; background: none; color: #9C9790; font-size: 16px; cursor: pointer; padding: 0 4px; line-height: 1; }
.btn-delete:hover { color: #B54A3A; }
.card-preview { padding: 8px 12px 12px; min-height: 36px; display: flex; align-items: center; }
.preview-input { color: #9C9790; font-size: 13px; }
.preview-select { color: #9C9790; font-size: 13px; }
.preview-table { color: #9C9790; font-size: 13px; }
.preview-sign { color: #9C9790; font-size: 13px; }
</style>
