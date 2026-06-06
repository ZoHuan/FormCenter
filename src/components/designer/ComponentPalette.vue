<template>
  <div class="palette">
    <div class="palette-title">组件库</div>
    <div v-for="group in COMPONENT_MENU" :key="group.category" class="group">
      <div class="group-title" @click="toggle(group.category)">
        <span class="arrow" :class="{ open: openGroups.has(group.category) }">▸</span>
        {{ group.category }} ({{ group.items.length }})
      </div>
      <div v-show="openGroups.has(group.category)" class="group-items">
        <div v-for="type in group.items" :key="type" class="palette-item" draggable="true" @dragstart="onDragStart($event, type)" @click="$emit('add', type)">
          {{ typeLabel(type) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { COMPONENT_MENU } from '@/registry'
import type { ComponentType } from '@/types'

defineEmits<{ add: [type: ComponentType] }>()

const openGroups = ref(new Set(['装饰', '输入']))

function toggle(cat: string) {
  if (openGroups.value.has(cat)) openGroups.value.delete(cat)
  else openGroups.value.add(cat)
}

function onDragStart(e: DragEvent, type: ComponentType) {
  e.dataTransfer?.setData('componentType', type)
}

const labels: Record<string, string> = {
  title: '大标题', subtitle: '小标题', 'group-title': '分组标题', separator: '分隔符', 'point-out': '提示',
  input: '单行文本', textarea: '多行文本', numeric: '数字', 'serial-number': '编号',
  chooser: '单选框', 'multi-chooser': '复选框', selection: '下拉框', cascader: '级联选框', tree: '树形选框',
  date: '日期', 'date-range': '日期区间',
  image: '文件附件', singleImage: '图片', signature: '签名',
  rate: '评分',
  table: '表格', 'cross-table': '交叉表', relation: '关联查询', commitment: '承诺说明',
  region: '行政区划', 'map-location': '地图定位',
  'user-tree': '用户选择', 'org-tree': '组织选择', 'signature-name': '签名人',
  QRCode: '二维码',
}
function typeLabel(t: string) { return labels[t] ?? t }
</script>

<style scoped>
.palette { padding: 12px 8px; }
.palette-title { font-size: 13px; font-weight: 600; padding: 4px 8px 12px; }
.group-title { font-size: 11px; font-weight: 500; color: #6B6560; padding: 6px 8px; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 4px; }
.group-title:hover { background: #F0EFEC; border-radius: 4px; }
.arrow { font-size: 10px; color: #9C9790; transition: transform .2s; display: inline-block; }
.arrow.open { transform: rotate(90deg); }
.palette-item { height: 40px; display: flex; align-items: center; padding: 0 12px; font-size: 13px; cursor: grab; border-radius: 6px; margin: 2px 0; transition: background .15s; }
.palette-item:hover { background: #EBF1FB; }
</style>
