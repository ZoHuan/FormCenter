<template>
  <div class="cross-table-field">
    <table class="matrix-table">
      <thead>
        <tr>
          <th class="corner-cell"><span v-if="showIndex">#</span></th>
          <th v-for="col in colLabels" :key="col.value" class="col-header-cell">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, ri) in rowLabels" :key="row.value">
          <td class="row-header-cell">
            <span v-if="showIndex" class="row-index">{{ ri + 1 }}</span>
            {{ row.label }}
          </td>
          <td v-for="col in colLabels" :key="col.value" class="data-cell">
            <el-select
              :model-value="getCellValue(row.value, col.value)"
              size="small"
              placeholder="选择"
              clearable
              @update:model-value="(v) => setCellValue(row.value, col.value, v)"
            >
              <el-option v-for="o in ratingOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const compProps = computed(() => (props.comp.props as Record<string, unknown>) || {})
const rowLabels = computed(() => (compProps.value.rowLabels as Array<{ label: string; value: string }>) ?? [])
const colLabels = computed(() => (compProps.value.colLabels as Array<{ label: string; value: string }>) ?? [])
const showIndex = computed(() => (compProps.value.showIndex as boolean) ?? true)

const ratingOptions = [
  { label: '✓', value: 'checked' },
  { label: '✗', value: 'unchecked' },
  { label: '-', value: 'na' },
]

const matrixData = ref<Record<string, Record<string, string>>>({})

onMounted(() => {
  if (props.modelValue && typeof props.modelValue === 'object') {
    matrixData.value = { ...(props.modelValue as Record<string, Record<string, string>>) }
  }
})

function getCellValue(rowKey: string, colKey: string): string {
  return matrixData.value[rowKey]?.[colKey] ?? ''
}

function setCellValue(rowKey: string, colKey: string, val: unknown) {
  if (!matrixData.value[rowKey]) matrixData.value[rowKey] = {}
  matrixData.value[rowKey][colKey] = val as string
  emit('update:modelValue', { ...matrixData.value })
}
</script>

<style scoped lang="scss">
.cross-table-field {
  width: 100%;
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    border: 1px solid var(--color-border);
    padding: 6px 8px;
    text-align: center;
  }

  .corner-cell {
    background: var(--color-canvas);
    width: 40px;
    color: var(--color-text-muted);
  }

  .col-header-cell {
    background: var(--color-canvas);
    font-weight: 500;
    white-space: nowrap;
    min-width: 80px;
  }

  .row-header-cell {
    background: var(--color-canvas);
    font-weight: 500;
    text-align: left;
    white-space: nowrap;

    .row-index {
      font-size: 11px;
      color: var(--color-text-muted);
      margin-right: 6px;
    }
  }

  .data-cell {
    :deep(.el-select) {
      width: 100%;
    }
  }
}
</style>
