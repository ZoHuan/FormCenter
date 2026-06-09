<template>
  <div class="field-card" :class="{ selected }" @click.stop="$emit('select')">
    <div class="card-header">
      <component :is="typeIcon" class="card-type-icon" :size="14" />
      <span class="card-label">{{ schema.label }}</span>
      <span v-if="schema.required" class="required-star">*</span>
      <button class="btn-copy" @click.stop="$emit('copy')" title="复制组件">
        <Copy :size="14" />
      </button>
      <button class="btn-delete" @click.stop="$emit('remove')" title="删除组件">
        <X :size="14" />
      </button>
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
import { Copy, X } from 'lucide-vue-next'
import {
  Type, Layers, Minus, Info,
  TextCursorInput, AlignLeft, Hash, ListOrdered,
  CircleDot, CheckSquare, ChevronDown, ArrowRightLeft, FolderTree,
  Calendar, CalendarRange,
  Paperclip, Image, PenLine,
  Star, Table2, Link2, CheckCheck,
  MapPin, Users, Building2, UserCheck, QrCode,
} from 'lucide-vue-next'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ schema: ComponentSchema; selected: boolean }>()
defineEmits<{ select: []; remove: []; copy: [] }>()

const iconMap: Record<string, any> = {
  title: Type, subtitle: Type, 'group-title': Layers, separator: Minus, 'point-out': Info,
  input: TextCursorInput, textarea: AlignLeft, numeric: Hash, 'serial-number': ListOrdered,
  chooser: CircleDot, 'multi-chooser': CheckSquare, selection: ChevronDown,
  cascader: ArrowRightLeft, tree: FolderTree,
  date: Calendar, 'date-range': CalendarRange,
  image: Paperclip, singleImage: Image, signature: PenLine,
  rate: Star, table: Table2, 'cross-table': Table2, relation: Link2, commitment: CheckCheck,
  region: MapPin, 'map-location': MapPin,
  'user-tree': Users, 'org-tree': Building2, 'signature-name': UserCheck,
  QRCode: QrCode,
}
const typeIcon = computed(() => iconMap[props.schema.type] ?? Type)

const isTextLike = computed(() => ['input', 'textarea', 'numeric', 'serial-number'].includes(props.schema.type))
const isSelectLike = computed(() =>
  ['chooser', 'multi-chooser', 'selection', 'cascader', 'tree', 'region', 'tree-structure'].includes(props.schema.type),
)
const isDate = computed(() => ['date', 'date-range'].includes(props.schema.type))
</script>

<style scoped lang="scss">
.field-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: grab;
  transition: all 0.2s ease-out;

  &:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-xs);
  }

  &:active {
    cursor: grabbing;
  }

  &.selected {
    border: 2px solid var(--color-primary);
    box-shadow: var(--shadow-focus);

    .card-header {
      background: var(--color-primary-bg);
    }
  }
}

.card-header {
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  background: var(--color-page);
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
