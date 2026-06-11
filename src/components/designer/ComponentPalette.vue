<template>
  <div class="palette">
    <div class="palette-title">组件库</div>
    <div v-for="group in COMPONENT_MENU" :key="group.category" class="group">
      <div class="group-title" @click="toggle(group.category)">
        <ChevronRight :size="12" class="arrow-icon" :class="{ open: openGroups.has(group.category) }" />
        <component :is="catIcon(group.category)" class="cat-icon" :size="14" />
        <span class="group-label">{{ group.category }}</span>
        <span class="group-count">{{ group.items.length }}</span>
      </div>
      <div class="group-items" :class="{ collapsed: !openGroups.has(group.category) }">
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
          <GripVertical :size="10" class="item-grip" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Type,
  Layers,
  Minus,
  Info,
  TextCursorInput,
  AlignLeft,
  Hash,
  ListOrdered,
  CircleDot,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ArrowRightLeft,
  FolderTree,
  Calendar,
  CalendarRange,
  Paperclip,
  Image,
  PenLine,
  Star,
  Table2,
  Link2,
  CheckCheck,
  MapPin,
  Users,
  Building2,
  UserCheck,
  QrCode,
  GripVertical,
  FormInput,
  Palette,
  Puzzle,
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

const catIcons: Record<string, any> = { 基础字段: FormInput, 展示布局: Palette, 高级组件: Puzzle }
function catIcon(cat: string) {
  return catIcons[cat] ?? Puzzle
}

const icons: Record<string, any> = {
  title: Type,
  subtitle: Type,
  'group-title': Layers,
  separator: Minus,
  'point-out': Info,
  input: TextCursorInput,
  textarea: AlignLeft,
  numeric: Hash,
  'serial-number': ListOrdered,
  chooser: CircleDot,
  'multi-chooser': CheckSquare,
  selection: ChevronDown,
  cascader: ArrowRightLeft,
  date: Calendar,
  'date-range': CalendarRange,
  image: Paperclip,
  singleImage: Image,
  signature: PenLine,
  rate: Star,
  table: Table2,
  'cross-table': Table2,
  relation: Link2,
  commitment: CheckCheck,
  'tree-structure': FolderTree,
  QRCode: QrCode,
}
function typeIcon(t: string) {
  return icons[t] ?? Type
}

const labels: Record<string, string> = {
  title: '大标题',
  subtitle: '小标题',
  'group-title': '分组标题',
  separator: '分隔符',
  'point-out': '提示',
  input: '单行文本',
  textarea: '多行文本',
  numeric: '数字',
  'serial-number': '编号',
  chooser: '单选框',
  'multi-chooser': '复选框',
  selection: '下拉框',
  cascader: '级联选框',
  date: '日期',
  'date-range': '日期区间',
  image: '文件附件',
  singleImage: '图片',
  signature: '签名',
  rate: '评分',
  table: '表格',
  'cross-table': '交叉表',
  relation: '关联查询',
  commitment: '承诺说明',
  'tree-structure': '树结构',
  QRCode: '二维码',
}
function typeLabel(t: string) {
  return labels[t] ?? t
}
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
  padding: 16px 16px 14px;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-page);
  z-index: 3;
}

.group {
  padding: 8px 0;
  border-bottom: 1px solid var(--color-canvas);
}

.group-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 6px 16px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s;
  position: sticky;
  top: 49px;
  background: var(--color-page);
  z-index: 2;
  &:hover {
    color: var(--color-primary);
  }
}

.arrow-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform 0.2s ease;
  &.open {
    transform: rotate(90deg);
    color: var(--color-primary);
  }
}
.cat-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.group-label {
  flex: 1;
}
.group-count {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-canvas);
  border-radius: 8px;
  padding: 2px 6px;
  min-width: 18px;
  text-align: center;
}

.group-items {
  padding: 2px 8px 6px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  max-height: 800px;
  overflow: hidden;
  transition:
    max-height 0.3s cubic-bezier(0.3, 0, 0.2, 1),
    padding 0.3s ease;
  &.collapsed {
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
}

.palette-item {
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  cursor: grab;
  border-radius: var(--radius-sm);
  transition: all 0.2s cubic-bezier(0.3, 0, 0.2, 1);

  .item-icon {
    color: var(--color-text-muted);
    flex-shrink: 0;
    transition: all 0.2s ease;
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
    transition: opacity 0.2s;
    flex-shrink: 0;
  }

  &:hover {
    background: var(--color-primary-bg);
    transform: translateX(3px);
    box-shadow: 0 1px 4px rgba(45, 106, 79, 0.08);
    .item-icon {
      color: var(--color-primary);
      transform: scale(1.1);
    }
    .item-grip {
      opacity: 1;
    }
  }

  &:active {
    cursor: grabbing;
    opacity: 0.6;
    transform: scale(0.97);
  }
}
</style>
