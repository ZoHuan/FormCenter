<template>
  <div class="palette">
    <div class="palette-title">组件库</div>
    <div v-for="group in COMPONENT_MENU" :key="group.category" class="group">
      <div class="group-title" @click="toggle(group.category)">
        <ChevronRight :size="12" class="arrow-icon" :class="{ open: openGroups.has(group.category) }" />
        <span class="group-label">{{ group.category }}</span>
        <span class="group-count">{{ group.items.length }}</span>
      </div>
      <div v-show="openGroups.has(group.category)" class="group-items">
        <div
          v-for="type in group.items"
          :key="type"
          class="palette-item"
          draggable="true"
          @dragstart="onDragStart($event, type)"
          @click="$emit('add', type)"
        >
          <component :is="typeIcon(type)" class="item-icon" :size="16" />
          <span class="item-label">{{ typeLabel(type) }}</span>
          <GripVertical :size="12" class="item-grip" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Type, Layers, Minus, Info,
  TextCursorInput, AlignLeft, Hash, ListOrdered,
  CircleDot, CheckSquare, ChevronDown, ChevronRight, ArrowRightLeft, FolderTree,
  Calendar, CalendarRange,
  Paperclip, Image, PenLine,
  Star,
  Table2, Link2, CheckCheck,
  MapPin, Users, Building2, UserCheck,
  QrCode, GripVertical,
} from 'lucide-vue-next'
import { COMPONENT_MENU } from '@/registry'
import type { ComponentType } from '@/types'

defineEmits<{ add: [type: ComponentType] }>()
const openGroups = ref(new Set(['基础字段', '展示布局']))
function toggle(cat: string) {
  if (openGroups.value.has(cat)) openGroups.value.delete(cat)
  else openGroups.value.add(cat)
}
function onDragStart(e: DragEvent, type: ComponentType) {
  e.dataTransfer?.setData('componentType', type)
}

const icons: Record<string, any> = {
  title: Type, subtitle: Type, 'group-title': Layers, separator: Minus, 'point-out': Info,
  input: TextCursorInput, textarea: AlignLeft, numeric: Hash, 'serial-number': ListOrdered,
  chooser: CircleDot, 'multi-chooser': CheckSquare, selection: ChevronDown, cascader: ArrowRightLeft, tree: FolderTree,
  date: Calendar, 'date-range': CalendarRange,
  image: Paperclip, singleImage: Image, signature: PenLine,
  rate: Star,
  table: Table2, 'cross-table': Table2, relation: Link2, commitment: CheckCheck,
  region: MapPin, 'tree-structure': FolderTree,
  QRCode: QrCode,
}
function typeIcon(t: string) { return icons[t] ?? Type }

const labels: Record<string, string> = {
  title: '大标题', subtitle: '小标题', 'group-title': '分组标题', separator: '分隔符', 'point-out': '提示',
  input: '单行文本', textarea: '多行文本', numeric: '数字', 'serial-number': '编号',
  chooser: '单选框', 'multi-chooser': '复选框', selection: '下拉框', cascader: '级联选框', tree: '树形选框',
  date: '日期', 'date-range': '日期区间',
  image: '文件附件', singleImage: '图片', signature: '签名',
  rate: '评分',
  table: '表格', 'cross-table': '交叉表', relation: '关联查询', commitment: '承诺说明',
  region: '行政区划', 'tree-structure': '树结构',
  QRCode: '二维码',
}
function typeLabel(t: string) { return labels[t] ?? t }
</script>

<style scoped lang="scss">
.palette {
  padding: 0;
  background: var(--color-page);
  height: 100%;
  overflow-y: auto;
}
.palette-title {
  font-size: 14px;
  font-weight: 600;
  padding: 16px 16px 12px;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-page);
  z-index: 2;
}

.group {
  border-bottom: 1px solid var(--color-canvas);
  &:first-of-type { margin-top: 0; }
}

.group-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  padding: 10px 16px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;
  letter-spacing: 0;

  &:hover { background: var(--color-canvas); }
  text-transform: none;
}

.arrow-icon {
  color: var(--color-text-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
  &.open { transform: rotate(90deg); }
}

.group-label { flex: 1; }
.group-count {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: var(--color-canvas);
  border-radius: 10px;
  padding: 1px 8px;
  min-width: 20px;
  text-align: center;
}

.group-items {
  padding: 4px 12px 8px;
}

.palette-item {
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 10px 0 12px;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text);
  cursor: grab;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease-out;

  .item-icon {
    color: var(--color-text-muted);
    flex-shrink: 0;
    transition: color 0.15s;
  }

  .item-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-grip {
    color: var(--color-border-hover);
    opacity: 0;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }

  &:hover {
    background: var(--color-primary-bg);
    transform: translateX(2px);

    .item-icon { color: var(--color-primary); }
    .item-grip { opacity: 1; }
  }

  &:active {
    cursor: grabbing;
    opacity: 0.5;
    transform: none;
  }
}
</style>
