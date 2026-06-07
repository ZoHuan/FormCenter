<template>
  <div class="cross-table-field">
    <table class="inner-table">
      <thead><tr><th v-for="col in columns" :key="col.field">{{ col.title }}</th></tr></thead>
      <tbody>
        <tr v-for="(row, ri) in tableData" :key="ri">
          <td v-for="col in columns" :key="col.field">
            <el-input v-model="row[col.field]" size="small" :placeholder="col.description" @input="onRowChange" />
          </td>
        </tr>
      </tbody>
    </table>
    <el-button size="small" @click="addRow">添加行</el-button>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentSchema } from '@/types'
const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()
const columns = computed(() => (props.comp.props as Record<string, unknown>)?.columns as Array<{ field: string; title: string; description?: string }> ?? [])
const initialRows = computed(() => (props.comp.props as Record<string, unknown>)?.initialRows as number ?? 3)
const tableData = ref<Array<Record<string, unknown>>>(Array.from({ length: initialRows.value }, () => ({})))
function addRow() { tableData.value.push({}); onRowChange() }
function onRowChange() { emit('update:modelValue', tableData.value) }
</script>
<style scoped>
.cross-table-field .inner-table { width: 100%; border-collapse: collapse; }
.cross-table-field th, .cross-table-field td { border: 1px solid var(--color-border); padding: 4px 8px; }
.cross-table-field th { background: var(--color-canvas); font-size: 12px; }
</style>
