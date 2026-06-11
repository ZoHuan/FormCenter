<template>
  <template v-for="(opt, i) in nodes" :key="i">
    <div class="node-row" :class="{ 'is-leaf': !opt.children?.length }" :style="{ paddingLeft: depth * 20 + 4 + 'px' }">
      <!-- expand / collapse toggle -->
      <button v-if="opt.children?.length" class="btn-toggle" @click="toggleCollapse(i)">
        <ChevronRight :size="12" class="toggle-icon" :class="{ expanded: !isCollapsed(i) }" />
      </button>
      <span v-else class="toggle-spacer"></span>

      <!-- inputs -->
      <el-input v-model="opt.label" size="small" placeholder="选项名" class="node-label" @input="$emit('update')" />
      <el-input v-model="opt.value" size="small" placeholder="值" class="node-value" @input="$emit('update')" />

      <!-- actions -->
      <el-button v-if="allowNested" link class="btn-action" @click="$emit('addChild', [...path, i])" title="添加子选项">
        <Plus :size="14" />
      </el-button>
      <el-button link class="btn-action btn-del" @click="$emit('remove', [...path, i])">
        <X :size="14" />
      </el-button>
    </div>

    <OptionTreeNode
      v-if="opt.children?.length && !isCollapsed(i)"
      :nodes="opt.children"
      :depth="depth + 1"
      :path="[...path, i]"
      :allowNested="allowNested"
      :collapsed="collapsed"
      @update="$emit('update')"
      @addChild="(p: number[]) => $emit('addChild', p)"
      @remove="(p: number[]) => $emit('remove', p)"
    />
  </template>
</template>

<script setup lang="ts">
import { ChevronRight, Plus, X } from 'lucide-vue-next'

const props = defineProps<{
  nodes: any[]
  depth: number
  path: number[]
  allowNested?: boolean
  collapsed?: Set<string>
}>()
defineEmits<{
  update: []
  addChild: [path: number[]]
  remove: [path: number[]]
}>()

function key(i: number) {
  return `root-${[...props.path, i].join('-')}`
}

function isCollapsed(i: number) {
  return props.collapsed?.has(key(i)) ?? false
}

function toggleCollapse(i: number) {
  if (!props.collapsed) return
  const k = key(i)
  if (props.collapsed.has(k)) {
    props.collapsed.delete(k)
  } else {
    props.collapsed.add(k)
  }
}
</script>

<style scoped lang="scss">
.node-row {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  transition: background 0.15s;

  &:hover {
    background: var(--color-primary-bg);
  }

  // Element Plus input overrides
  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
  :deep(.el-input) {
    display: flex !important;
  }
  :deep(.el-input__wrapper) {
    box-shadow: none !important;
    border: 1px solid var(--color-border) !important;
    border-radius: var(--radius-xs) !important;
    padding: 0 6px !important;
    background: var(--color-card) !important;
  }
  :deep(.el-input.is-focus .el-input__wrapper) {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 1px rgba(45, 106, 79, 0.12) !important;
  }

  .node-label {
    flex: 1;
    min-width: 0;
  }
  .node-value {
    width: 66px;
    flex-shrink: 0;
  }
}

// toggle button
.btn-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-xs);
  transition: all 0.15s;

  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-bg);
  }
}

.toggle-spacer {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.toggle-icon {
  transition: transform 0.2s ease;
  &.expanded {
    transform: rotate(90deg);
  }
}

// action buttons
.btn-action {
  color: var(--color-text-muted);
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  margin: 0;
  border-radius: var(--radius-sm);
  transition: all 0.15s;

  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-bg);
  }
}

.btn-del {
  &:hover {
    color: var(--color-error);
    background: rgba(181, 74, 58, 0.06);
  }
}
</style>
