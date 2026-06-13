<template>
  <div class="table-field" :class="{ 'table-mobile': mode === 'mobile' }">
    <div v-if="showTitle" class="table-title">{{ comp.label }}</div>

    <!-- PC 模式：表格 -->
    <template v-if="mode !== 'mobile'">
      <div class="table-wrapper">
        <table class="inner-table">
          <thead>
            <tr>
              <th v-if="showIndex" class="index-col">#</th>
              <th v-for="col in columns" :key="col.field">
                {{ col.title }}<span v-if="col.required" class="required">*</span>
              </th>
              <th v-if="rowControl" class="action-col">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in tableData" :key="ri">
              <td v-if="showIndex" class="index-col">{{ ri + 1 }}</td>
              <td v-for="col in columns" :key="col.field">
                <el-input
                  v-if="col.type === 'input' || col.type === 'textarea'"
                  v-model="row[col.field]"
                  size="small"
                  :placeholder="col.description"
                  :type="col.type === 'textarea' ? 'textarea' : 'text'"
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
                  v-else-if="col.type === 'chooser' || col.type === 'selection'"
                  v-model="row[col.field]"
                  size="small"
                  placeholder="请选择"
                  clearable
                  @change="onRowChange"
                >
                  <el-option
                    v-for="opt in getColumnOptions(col)"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-select
                  v-else-if="col.type === 'multi-chooser'"
                  v-model="row[col.field]"
                  size="small"
                  placeholder="请选择"
                  multiple
                  clearable
                  @change="onRowChange"
                >
                  <el-option
                    v-for="opt in getColumnOptions(col)"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-upload
                  v-else-if="col.type === 'file'"
                  :show-file-list="false"
                  :auto-upload="false"
                  :on-change="(file) => handleImageChange(file, row, col.field)"
                  size="small"
                >
                  <el-button size="small">上传</el-button>
                </el-upload>
                <el-input
                  v-else
                  v-model="row[col.field]"
                  size="small"
                  :placeholder="col.description"
                  @input="onRowChange"
                />
              </td>
              <td v-if="rowControl" class="action-col">
                <el-button link type="danger" size="small" @click="removeRow(ri)">删除</el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <el-button v-if="rowControl" size="small" @click="addRow"
          ><el-icon><Plus /></el-icon>添加行</el-button
        >
        <span v-if="showSummary" class="summary-info">共 {{ tableData.length }} 行</span>
      </div>
    </template>

    <!-- 移动模式：卡片列表 -->
    <div v-else class="mobile-rows">
      <van-cell-group v-for="(row, ri) in tableData" :key="ri" inset style="margin-bottom: 8px">
        <van-cell :title="'#' + (ri + 1)" :value="`共${columns.length}项`" />
        <van-field
          v-for="col in columns"
          :key="col.field"
          :label="col.title"
          :required="col.required"
          :placeholder="col.description"
        >
          <template #input>
            <van-field
              v-if="col.type === 'input' || col.type === 'textarea'"
              :model-value="row[col.field]"
              :placeholder="col.description"
              @update:model-value="
                (v) => {
                  row[col.field] = v
                  onRowChange()
                }
              "
            />
            <van-field
              v-else-if="col.type === 'numeric'"
              :model-value="row[col.field]"
              type="digit"
              @update:model-value="
                (v) => {
                  row[col.field] = v
                  onRowChange()
                }
              "
            />
            <van-field
              v-else-if="col.type === 'date'"
              :model-value="row[col.field]"
              readonly
              is-link
              placeholder="选择日期"
              @click="openTableDate(ri, col.field)"
            />
            <van-field
              v-else
              :model-value="row[col.field]"
              @update:model-value="
                (v) => {
                  row[col.field] = v
                  onRowChange()
                }
              "
            />
          </template>
        </van-field>
        <van-button v-if="rowControl" size="small" type="danger" block @click="removeRow(ri)">删除此行</van-button>
      </van-cell-group>
      <van-button v-if="rowControl" size="small" type="primary" block @click="addRow">+ 添加行</van-button>
    </div>
    <van-calendar v-if="mode === 'mobile'" v-model:show="tableDateShow" @confirm="onTableDateConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import {
  CellGroup as VanCellGroup,
  Cell as VanCell,
  Field as VanField,
  Button as VanButton,
  Calendar as VanCalendar,
} from 'vant'
import type { ComponentSchema, TableColumnSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown; mode?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const compProps = computed(() => (props.comp.props as Record<string, unknown>) || {})
const columns = computed(() => (compProps.value.columns as TableColumnSchema[]) || [])
const initialRows = computed(() => (compProps.value.initialRows as number) ?? 3)
const rowControl = computed(() => (compProps.value.rowControl as boolean) ?? true)
const showTitle = computed(() => (compProps.value.showTitle as boolean) ?? true)
const showIndex = computed(() => (compProps.value.showIndex as boolean) ?? true)
const showSummary = computed(() => (compProps.value.showSummary as boolean) ?? false)

const tableData = ref<Array<Record<string, unknown>>>([])

onMounted(() => {
  // 初始化表格数据
  if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    tableData.value = [...(props.modelValue as Array<Record<string, unknown>>)]
  } else {
    tableData.value = Array.from({ length: initialRows.value }, () => ({}))
  }
})

function addRow() {
  tableData.value.push({})
  onRowChange()
}

function removeRow(index: number) {
  tableData.value.splice(index, 1)
  onRowChange()
}

function onRowChange() {
  emit('update:modelValue', tableData.value)
}

function getColumnOptions(col: TableColumnSchema) {
  const colProps = (col.props as Record<string, unknown>) || {}
  return (colProps.options as Array<{ label: string; value: string }>) || []
}

const tableDateShow = ref(false)
let tableDateRow = -1,
  tableDateField = ''
function openTableDate(ri: number, field: string) {
  tableDateRow = ri
  tableDateField = field
  tableDateShow.value = true
}
function onTableDateConfirm(date: Date) {
  if (tableDateRow >= 0 && tableDateField) {
    const y = date.getFullYear(),
      m = String(date.getMonth() + 1).padStart(2, '0'),
      d = String(date.getDate()).padStart(2, '0')
    tableData.value[tableDateRow][tableDateField] = `${y}-${m}-${d}`
    onRowChange()
  }
  tableDateShow.value = false
}

function handleImageChange(file: { raw: File }, row: Record<string, unknown>, field: string) {
  const reader = new FileReader()
  reader.onload = (e) => {
    row[field] = e.target?.result as string
    onRowChange()
  }
  reader.readAsDataURL(file.raw)
}
</script>

<style scoped lang="scss">
.table-field {
  width: 100%;
}

.table-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
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
    padding: 8px 12px;
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

  .index-col {
    width: 40px;
    text-align: center;
    color: var(--color-text-muted);
  }

  .action-col {
    width: 60px;
    text-align: center;
  }
}

.table-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.summary-info {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
