<template>
  <div class="cross-table-field">
    <div class="table-wrapper">
      <table class="inner-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.field">
              {{ col.title }}
              <span v-if="col.required" class="required">*</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in tableData" :key="ri">
            <td v-for="col in columns" :key="col.field">
              <el-input
                v-if="col.type === 'input' || col.type === 'textarea'"
                v-model="row[col.field]"
                size="small"
                :placeholder="col.description"
                @input="onRowChange"
              />
              <el-input-number
                v-else-if="col.type === 'numeric'"
                v-model="row[col.field]"
                size="small"
                controls-position="right"
                @change="onRowChange"
              />
              <el-date-picker
                v-else-if="col.type === 'date'"
                v-model="row[col.field]"
                size="small"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="onRowChange"
              />
              <el-select
                v-else-if="col.type === 'selection' || col.type === 'chooser' || col.type === 'multi-chooser'"
                v-model="row[col.field]"
                size="small"
                placeholder="请选择"
                clearable
                :multiple="col.type === 'multi-chooser'"
                @change="onRowChange"
              >
                <el-option
                  v-for="opt in getColOptions(col)"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
              <el-input
                v-else
                v-model="row[col.field]"
                size="small"
                :placeholder="col.description"
                @input="onRowChange"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="table-footer">
      <el-button size="small" @click="addRow">添加行</el-button>
      <span class="row-count">共 {{ tableData.length }} 行</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ComponentSchema, TableColumnSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const compProps = computed(() => (props.comp.props as Record<string, unknown>) || {})
const columns = computed(() => (compProps.value.columns as TableColumnSchema[]) || [])
const initialRows = computed(() => (compProps.value.initialRows as number) ?? 3)

const tableData = ref<Array<Record<string, unknown>>>([])

onMounted(() => {
  if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    tableData.value = [...props.modelValue as Array<Record<string, unknown>>]
  } else {
    tableData.value = Array.from({ length: initialRows.value }, () => ({}))
  }
})

function addRow() { tableData.value.push({}); onRowChange() }
function onRowChange() { emit('update:modelValue', tableData.value) }

function getColOptions(col: TableColumnSchema) {
  const cp = (col.props as Record<string, unknown>) || {}
  return (cp.options as Array<{ label: string; value: string }>) || []
}
</script>

<style scoped lang="scss">
.cross-table-field {
  width: 100%;
}

.table-wrapper {
  overflow-x: auto;
}

.inner-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    border: 1px solid var(--color-border);
    padding: 6px 10px;
    text-align: left;
  }

  th {
    background: var(--color-canvas);
    font-weight: 500;
    white-space: nowrap;
  }

  .required {
    color: var(--color-error);
    margin-left: 2px;
  }
}

.table-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;

  .row-count {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}
</style>
