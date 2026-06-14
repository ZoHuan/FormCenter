<template>
  <div class="table-field" :class="{ 'table-mobile': mode === 'mobile' }">
    <div v-if="showTitle" class="table-title">{{ comp.label }}</div>

    <!-- PC 模式：表格 -->
    <div v-if="mode !== 'mobile'" class="pc-wrapper">
      <div class="table-wrapper">
        <table class="inner-table">
          <thead>
            <tr>
              <th v-if="showIndex" class="index-col">#</th>
              <th
                v-for="col in columns"
                :key="col.field"
                :style="{
                  minWidth: col.width ? col.width + 'px' : undefined,
                  width: col.width ? col.width + 'px' : undefined,
                }"
              >
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
                  v-if="col.type === 'input'"
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
                  v-else-if="col.type === 'selection'"
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
                <el-radio-group
                  v-else-if="col.type === 'chooser'"
                  v-model="row[col.field]"
                  size="small"
                  @change="onRowChange"
                >
                  <el-radio v-for="opt in getColumnOptions(col)" :key="opt.value" :value="opt.value" size="small">{{
                    opt.label
                  }}</el-radio>
                </el-radio-group>
                <el-checkbox-group
                  v-else-if="col.type === 'multi-chooser'"
                  v-model="row[col.field]"
                  size="small"
                  @change="onRowChange"
                >
                  <el-checkbox v-for="opt in getColumnOptions(col)" :key="opt.value" :label="opt.value" size="small">{{
                    opt.label
                  }}</el-checkbox>
                </el-checkbox-group>
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
    </div>

    <!-- 移动模式 -->
    <div v-else class="mobile-rows">
      <div v-for="(row, ri) in tableData" :key="ri" class="mobile-row-card">
        <div class="mobile-row-head">
          <span class="mobile-row-num">{{ ri + 1 }}</span>
          <span v-if="rowControl" class="mobile-row-del" @click="removeRow(ri)">删除</span>
        </div>
        <van-field
          v-for="col in columns.filter((c) => c.type === 'input')"
          :key="col.field"
          :label="col.title"
          :required="col.required"
          :model-value="row[col.field]"
          :placeholder="col.description || '请输入'"
          @update:model-value="
            (v) => {
              row[col.field] = v
              onRowChange()
            }
          "
        />
        <van-field
          v-for="col in columns.filter((c) => c.type === 'numeric')"
          :key="col.field"
          :label="col.title"
          :required="col.required"
          :model-value="row[col.field]"
          type="digit"
          :placeholder="col.description || '请输入'"
          @update:model-value="
            (v) => {
              row[col.field] = v
              onRowChange()
            }
          "
        />
        <van-field
          v-for="col in columns.filter((c) => c.type === 'date')"
          :key="col.field"
          :label="col.title"
          :required="col.required"
          :model-value="row[col.field] || ''"
          readonly
          is-link
          placeholder="选择日期"
          @click="openTableDate(ri, col.field)"
        />
        <van-field
          v-for="col in columns.filter((c) => c.type === 'selection')"
          :key="col.field"
          :label="col.title"
          :required="col.required"
          :model-value="getSelectLabel(row[col.field], col)"
          readonly
          is-link
          placeholder="请选择"
          @click="openTableSelect(ri, col.field, col)"
        />
        <template v-for="col in columns.filter((c) => c.type === 'chooser')" :key="col.field">
          <van-field :label="col.title" :required="col.required">
            <template #input>
              <van-radio-group
                :model-value="row[col.field]"
                direction="horizontal"
                @update:model-value="
                  (v) => {
                    row[col.field] = v
                    onRowChange()
                  }
                "
              >
                <van-radio
                  v-for="opt in getColumnOptions(col)"
                  :key="opt.value"
                  :name="opt.value"
                  icon-size="16px"
                  checked-color="var(--color-primary)"
                  >{{ opt.label }}</van-radio
                >
              </van-radio-group>
            </template>
          </van-field>
        </template>
        <template v-for="col in columns.filter((c) => c.type === 'multi-chooser')" :key="col.field">
          <van-field :label="col.title" :required="col.required">
            <template #input>
              <van-checkbox-group
                :model-value="row[col.field]"
                direction="horizontal"
                @update:model-value="
                  (v) => {
                    row[col.field] = v
                    onRowChange()
                  }
                "
              >
                <van-checkbox
                  v-for="opt in getColumnOptions(col)"
                  :key="opt.value"
                  :name="opt.value"
                  shape="square"
                  icon-size="16px"
                  checked-color="var(--color-primary)"
                  >{{ opt.label }}</van-checkbox
                >
              </van-checkbox-group>
            </template>
          </van-field>
        </template>
        <van-field
          v-for="col in columns.filter(
            (c) => !['input', 'numeric', 'date', 'selection', 'chooser', 'multi-chooser'].includes(c.type),
          )"
          :key="col.field"
          :label="col.title"
          :required="col.required"
          :model-value="row[col.field]"
          :placeholder="col.description || '请输入'"
          @update:model-value="
            (v) => {
              row[col.field] = v
              onRowChange()
            }
          "
        />
      </div>
      <van-button v-if="rowControl" block type="primary" @click="addRow">+ 添加行</van-button>
    </div>
    <van-calendar v-if="mode === 'mobile'" v-model:show="tableDateShow" @confirm="onTableDateConfirm" />
    <van-popup v-if="mode === 'mobile'" v-model:show="tableSelectShow" round position="bottom">
      <van-picker :columns="tableSelectColumns" @confirm="onTableSelectConfirm" @cancel="tableSelectShow = false" />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import {
  Field as VanField,
  Button as VanButton,
  Calendar as VanCalendar,
  Popup as VanPopup,
  Picker as VanPicker,
  RadioGroup as VanRadioGroup,
  Radio as VanRadio,
  CheckboxGroup as VanCheckboxGroup,
  Checkbox as VanCheckbox,
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

const tableSelectShow = ref(false)
let tableSelectRow = -1,
  tableSelectField = ''
const tableSelectColumns = ref<Array<{ text: string; value: string }>>([])
function openTableSelect(ri: number, field: string, col: any) {
  tableSelectRow = ri
  tableSelectField = field
  const opts = getColumnOptions(col)
  tableSelectColumns.value = opts.map((o) => ({ text: o.label, value: o.value }))
  tableSelectShow.value = true
}
function onTableSelectConfirm({ selectedOptions }: any) {
  if (tableSelectRow >= 0 && tableSelectField) {
    tableData.value[tableSelectRow][tableSelectField] = selectedOptions[0]?.value ?? ''
    onRowChange()
  }
  tableSelectShow.value = false
}
function getSelectLabel(val: unknown, col: any): string {
  const opts = getColumnOptions(col)
  return opts.find((o) => o.value === val)?.label ?? ''
}
function getMultiSelectLabel(val: unknown, col: any): string {
  const opts = getColumnOptions(col)
  if (!Array.isArray(val)) return ''
  return (val as string[]).map((v) => opts.find((o) => o.value === v)?.label ?? v).join(', ')
}
</script>

<style scoped lang="scss">
.table-field {
  width: 100%;
  min-width: 0;
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
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;

  th,
  td {
    border: 1px solid var(--color-border);
    padding: 4px 6px;
    text-align: left;
  }

  th {
    background: var(--color-canvas);
    font-weight: 500;
    white-space: nowrap;
  }

  // 约束表格内组件宽度
  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-editor) {
    width: 100%;
    min-width: 0;
  }

  :deep(.el-input-number) {
    width: 100%;
    min-width: 0;

    .el-input__wrapper {
      padding-left: 4px;
      padding-right: 4px;
    }
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

/* ── 移动端 ── */
.mobile-rows {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-row-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mobile-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #f5f7f4;
}

.mobile-row-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  min-width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-row-del {
  font-size: 13px;
  color: var(--color-error);
  padding: 4px 8px;
  border-radius: 4px;

  &:active {
    background: rgba(181, 74, 58, 0.08);
  }
}
</style>
