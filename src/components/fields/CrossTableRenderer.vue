<template>
  <div class="cross-table-field" :class="{ 'cross-table-mobile': mode === 'mobile' }">
    <div v-if="mode !== 'mobile'" class="pc-matrix">
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
    <div v-else class="mobile-matrix">
      <!-- 列头 -->
      <div class="matrix-col-headers">
        <span v-for="col in colLabels" :key="col.value" class="matrix-col-header">{{ col.label }}</span>
      </div>
      <!-- 行 -->
      <div v-for="(row, ri) in rowLabels" :key="row.value" class="matrix-row">
        <span class="matrix-row-label">{{ row.label }}</span>
        <div class="matrix-row-cells">
          <div
            v-for="col in colLabels"
            :key="col.value"
            class="matrix-cell"
            @click="setCellValue(row.value, col.value, getNextValue(getCellValue(row.value, col.value)))"
          >
            <span class="matrix-cell-icon">{{ getIcon(getCellValue(row.value, col.value)) }}</span>
          </div>
        </div>
      </div>
      <!-- 图例 -->
      <div class="matrix-legend">
        <span v-for="o in ratingOptions" :key="o.value" class="legend-item">{{ o.icon }} {{ o.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown; mode?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const compProps = computed(() => (props.comp.props as Record<string, unknown>) || {})
const rowLabels = computed(() => (compProps.value.rowLabels as Array<{ label: string; value: string }>) ?? [])
const colLabels = computed(() => (compProps.value.colLabels as Array<{ label: string; value: string }>) ?? [])
const showIndex = computed(() => (compProps.value.showIndex as boolean) ?? true)

const ratingOptions = [
  { label: '是', value: 'checked', icon: '✓' },
  { label: '否', value: 'unchecked', icon: '✗' },
  { label: '不适用', value: 'na', icon: '-' },
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

function getIcon(val: string): string {
  if (!val) return '—'
  const opt = ratingOptions.find((o) => o.value === val)
  return opt?.icon || '—'
}

function getNextValue(current: string): string {
  if (!current) return 'checked'
  if (current === 'checked') return 'unchecked'
  if (current === 'unchecked') return 'na'
  return ''
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

.cross-table-mobile {
  .mobile-matrix {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .matrix-col-headers {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 0 4px 72px;
  }

  .matrix-col-header {
    flex: 1;
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .matrix-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .matrix-row-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-secondary);
    width: 64px;
    flex-shrink: 0;
  }

  .matrix-row-cells {
    display: flex;
    gap: 6px;
    flex: 1;
    justify-content: space-around;
  }

  .matrix-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 32px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--duration-fast);
    font-size: 14px;
    color: var(--color-text-muted);
    background: var(--color-card);

    &:hover {
      border-color: var(--color-primary);
    }
  }

  .matrix-cell-icon {
    font-weight: 600;
  }

  .matrix-legend {
    display: flex;
    gap: 16px;
    padding: 8px 0;
    font-size: 11px;
    color: var(--color-text-muted);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
