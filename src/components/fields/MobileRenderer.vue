<template>
  <div class="mobile-renderer">
    <!-- ═══════ 主渲染链（v-if 连续，不可打断） ═══════ -->
    <van-field
      v-if="isInput"
      :model-value="modelValue"
      :label="comp.label"
      :required="comp.required"
      :placeholder="comp.description"
      :type="fieldType"
      :rows="comp.type === 'textarea' ? 3 : 1"
      :maxlength="hasMaxLen ? maxLen : undefined"
      @update:model-value="onChange"
    />
    <van-field
      v-else-if="comp.type === 'serial-number'"
      :model-value="modelValue"
      :label="comp.label"
      readonly
      :placeholder="comp.description"
    />
    <van-field v-else-if="comp.type === 'chooser'" :label="comp.label" :required="comp.required">
      <template #input>
        <van-radio-group
          :model-value="modelValue"
          :disabled="!comp.editable"
          direction="horizontal"
          @update:model-value="onChange"
        >
          <van-radio v-for="opt in options" :key="opt.value" :name="opt.value">{{ opt.label }}</van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field v-else-if="comp.type === 'multi-chooser'" :label="comp.label" :required="comp.required">
      <template #input>
        <van-checkbox-group
          :model-value="(modelValue as string[]) || []"
          :disabled="!comp.editable"
          direction="horizontal"
          @update:model-value="onChange"
        >
          <van-checkbox v-for="opt in options" :key="opt.value" :name="opt.value" shape="square">{{
            opt.label
          }}</van-checkbox>
        </van-checkbox-group>
      </template>
    </van-field>
    <van-field
      v-else-if="comp.type === 'selection'"
      :model-value="getOptionLabel(modelValue as string)"
      :label="comp.label"
      :required="comp.required"
      readonly
      is-link
      :placeholder="comp.description"
      @click="showPicker = true"
    />
    <van-field
      v-else-if="comp.type === 'cascader'"
      :model-value="cascaderText"
      :label="comp.label"
      :required="comp.required"
      readonly
      is-link
      :placeholder="comp.description"
      @click="showCascader = true"
    />
    <van-field
      v-else-if="comp.type === 'date'"
      :model-value="(modelValue as string) || ''"
      :label="comp.label"
      :required="comp.required"
      readonly
      is-link
      :placeholder="comp.description"
      @click="showDatePicker = true"
    />
    <van-field
      v-else-if="comp.type === 'date-range'"
      :model-value="dateRangeLabel"
      :label="comp.label"
      :required="comp.required"
      readonly
      is-link
      :placeholder="comp.description"
      @click="showDateRangePicker = true"
    />
    <van-field v-else-if="comp.type === 'rate'" :label="comp.label" :required="comp.required">
      <template #input
        ><van-rate
          :model-value="(modelValue as number) || 0"
          :count="rateMax"
          :size="18"
          :color="rateColor"
          @update:model-value="onChange"
      /></template>
    </van-field>
    <van-field v-else-if="comp.type === 'file'" :label="comp.label" :required="comp.required">
      <template #input>
        <van-uploader
          :model-value="fileList"
          :max-count="uploadMaxCount"
          multiple
          :preview-image="false"
          :show-upload="true"
          accept="*"
          @update:model-value="onUploadChange"
        >
          <template #default>
            <div class="upload-btn"><van-icon name="plus" size="16" /><span>上传附件</span></div>
          </template>
        </van-uploader>
        <div v-if="fileList.length" class="file-list">
          <div v-for="(f, i) in fileList" :key="i" class="file-item">
            <van-icon name="description" size="16" />
            <span class="file-text">{{ f.file?.name || '文件 ' + (i + 1) }}</span>
            <van-icon name="cross" size="14" class="file-remove" @click="removeFile(i)" />
          </div>
        </div>
      </template>
    </van-field>
    <van-field v-else-if="comp.type === 'image'" :label="comp.label" :required="comp.required">
      <template #input
        ><van-uploader
          :model-value="singleImageList"
          max-count="1"
          preview-size="80"
          upload-text="上传图片"
          @update:model-value="onSingleImageChange"
      /></template>
    </van-field>
    <van-field
      v-else-if="comp.type === 'signature' || comp.type === 'relation'"
      :model-value="comp.type === 'signature' && modelValue ? '已签名' : (modelValue as string) || ''"
      :label="comp.label"
      :required="comp.required"
      readonly
      is-link
      :placeholder="comp.description"
    />
    <van-field
      v-else-if="comp.type === 'commitment'"
      :label="comp.label"
      :required="comp.required"
      class="commitment-field"
    >
      <template #input>
        <van-checkbox
          :model-value="!!modelValue"
          shape="square"
          icon-size="16"
          @update:model-value="(v) => onChange(v ? [{ value: '1' }] : [])"
        >
          {{ comp.description || '本人确认以上信息属实' }}</van-checkbox
        >
      </template>
    </van-field>
    <van-field
      v-else-if="comp.type === 'tree-structure'"
      :model-value="cascaderText"
      :label="comp.label"
      :required="comp.required"
      readonly
      is-link
      :placeholder="comp.description"
      @click="showTree = true"
    />
    <van-cell
      v-else-if="comp.type === 'table' || comp.type === 'cross-table'"
      :title="comp.label"
      label="请在桌面端查看"
    />
    <van-cell v-else-if="comp.type === 'QRCode'" :title="comp.label" value="预览不支持" />
    <div v-else-if="isDecor" class="mobile-decor">
      <h2 v-if="comp.type === 'title'">{{ comp.label }}</h2>
      <h3 v-else-if="comp.type === 'subtitle'">{{ comp.label }}</h3>
      <p v-else-if="comp.type === 'group-title'" class="decor-group">{{ comp.label }}</p>
      <van-divider v-else-if="comp.type === 'separator'" />
      <p v-else class="decor-hint">{{ comp.description }}</p>
    </div>
    <van-field
      v-else
      :model-value="modelValue"
      :label="comp.label"
      :placeholder="comp.description"
      @update:model-value="onChange"
    />

    <!-- ═══════ 弹出层（独立 v-if，不放链中） ═══════ -->
    <van-action-sheet v-if="comp.type === 'selection'" v-model:show="showPicker" :title="comp.label">
      <van-picker :columns="pickerColumns" @confirm="onPickerConfirm" @cancel="showPicker = false" />
    </van-action-sheet>
    <van-popup v-if="comp.type === 'cascader'" v-model:show="showCascader" round position="bottom">
      <van-cascader
        :options="cascaderOptions"
        :model-value="(modelValue as string) || ''"
        title="请选择"
        @finish="onCascaderFinish"
        @close="showCascader = false"
      />
    </van-popup>
    <van-calendar v-if="comp.type === 'date'" v-model:show="showDatePicker" @confirm="onDateConfirm" />
    <van-calendar
      v-if="comp.type === 'date-range'"
      v-model:show="showDateRangePicker"
      type="range"
      @confirm="onDateRangeConfirm"
    />
    <van-popup v-if="comp.type === 'tree-structure'" v-model:show="showTree" round position="bottom">
      <van-cascader
        :options="cascaderOptions"
        :model-value="(modelValue as string) || ''"
        title="请选择"
        @finish="onCascaderFinish"
        @close="showTree = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DECOR_TYPES } from '@/registry'
import type { ComponentSchema } from '@/types'
import {
  Field as VanField,
  Cell as VanCell,
  RadioGroup as VanRadioGroup,
  Radio as VanRadio,
  CheckboxGroup as VanCheckboxGroup,
  Checkbox as VanCheckbox,
  ActionSheet as VanActionSheet,
  Picker as VanPicker,
  Popup as VanPopup,
  Cascader as VanCascader,
  Calendar as VanCalendar,
  Rate as VanRate,
  Uploader as VanUploader,
  Divider as VanDivider,
  Button as VanButton,
  Icon as VanIcon,
} from 'vant'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const compProps = computed(() => (props.comp.props as Record<string, unknown>) || {})
const options = computed(() => (compProps.value.options as Array<{ label: string; value: string }>) ?? [])
const maxLen = computed(() => (compProps.value.maxLength as number) ?? 100)
const rateMax = computed(() => (compProps.value.maxScore as number) ?? 5)
const rateColor = computed(() => (compProps.value.iconColor as string) || '#F7BA2A')
const uploadMaxCount = computed(() => (compProps.value.maxCount as number) ?? 3)

const isInput = computed(() => ['input', 'textarea', 'numeric'].includes(props.comp.type))
const isDecor = computed(() => (DECOR_TYPES as string[]).includes(props.comp.type))
const hasMaxLen = computed(() => props.comp.type === 'input')

const fieldType = computed(() => {
  if (props.comp.type === 'textarea') return 'textarea'
  if (props.comp.type === 'numeric') return 'digit'
  return 'text'
})

const pickerColumns = computed(() => options.value.map((o) => ({ text: o.label, value: o.value })))
const cascaderOptions = computed(() => {
  const cvt = (opts: any[]): any[] =>
    opts.map((o) => ({ text: o.label, value: o.value, ...(o.children ? { children: cvt(o.children) } : {}) }))
  return cvt(options.value)
})

const dateRangeLabel = computed(() => {
  const v = props.modelValue
  return Array.isArray(v) && v.length === 2 ? `${v[0]} 至 ${v[1]}` : ''
})

const fileList = ref<Array<{ url: string }>>([])
const singleImageList = ref<Array<{ url: string }>>([])
const showPicker = ref(false),
  showCascader = ref(false),
  showTree = ref(false),
  cascaderText = ref(''),
  showDatePicker = ref(false),
  showDateRangePicker = ref(false)

function onChange(v: unknown) {
  emit('update:modelValue', v)
}
function getOptionLabel(val: string) {
  return options.value.find((o) => o.value === val)?.label ?? ''
}
function onPickerConfirm({ selectedOptions }: any) {
  emit('update:modelValue', selectedOptions[0]?.value)
  showPicker.value = false
}
function onCascaderFinish({ selectedOptions }: any) {
  cascaderText.value = selectedOptions.map((o: any) => o.text).join(' / ')
  emit('update:modelValue', selectedOptions.map((o: any) => o.value).join('/'))
  showCascader.value = false
  showTree.value = false
}
function onDateConfirm(date: Date) {
  emit('update:modelValue', formatDate(date))
  showDatePicker.value = false
}
function onDateRangeConfirm(dates: Date[]) {
  if (dates.length === 2) emit('update:modelValue', [formatDate(dates[0]), formatDate(dates[1])])
  showDateRangePicker.value = false
}
function onUploadChange(list: Array<{ file?: File; url?: string }>) {
  fileList.value = list as any
  emit(
    'update:modelValue',
    list.map((f) => (f.file ? f.file.name : '')),
  )
}
function onSingleImageChange(list: Array<{ file?: File; url?: string }>) {
  singleImageList.value = list as any
  if (list.length && list[0].file) emit('update:modelValue', list[0].file.name)
}
function removeFile(i: number) {
  fileList.value.splice(i, 1)
  emit(
    'update:modelValue',
    fileList.value.map((f) => (f.file ? f.file.name : '')),
  )
}
function formatDate(date: Date) {
  const y = date.getFullYear(),
    m = String(date.getMonth() + 1).padStart(2, '0'),
    d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
</script>

<style scoped lang="scss">
.mobile-renderer {
  width: 100%;
  :deep(.van-cell__title) {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-secondary);
    line-height: 24px;
    flex: none;
    width: 64px;
  }
  :deep(.van-cell) {
    padding: 8px 16px;
  }
  :deep(.van-field__control) {
    font-size: 15px;
  }
  :deep(.van-field__control::placeholder) {
    color: var(--color-text-muted);
  }
  :deep(.van-cell::after) {
    border-color: var(--color-border);
  }
  :deep(.van-radio-group),
  :deep(.van-checkbox-group) {
    padding: 0;
  }
  :deep(.van-radio) {
    margin: 0 14px 0 0;
  }
  :deep(.van-checkbox) {
    margin: 0 14px 0 0;
  }
  :deep(.van-rate) {
    padding: 0;
  }
  :deep(.van-field__control--custom) {
    flex-direction: column;
    align-items: stretch;
    min-height: auto;
  }
  :deep(.van-field__body) {
    overflow: visible;
  }
  :deep(.van-uploader__input-wrapper) {
    display: flex !important;
  }
}
.commitment-field {
  :deep(.van-checkbox) {
    align-items: start;

    .van-checkbox__icon {
      display: flex;
      align-items: center;
      height: 24px;
    }

    .van-checkbox__label {
      line-height: 24px;
    }
  }
}
.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 12px;
  color: var(--color-primary);
  background: transparent;
  border: 1px dashed var(--color-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  &:active {
    opacity: 0.7;
  }
}
.file-list {
  margin-top: 10px;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
  background: var(--color-page);
  border-radius: 6px;
  margin-bottom: 4px;
}
.file-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-remove {
  color: var(--color-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  &:active {
    color: var(--color-error);
  }
}
.mobile-decor {
  padding: 12px 16px;
  h2 {
    font-size: 20px;
    font-weight: 700;
    margin: 8px 0;
  }
  h3 {
    font-size: 17px;
    font-weight: 600;
    margin: 4px 0;
    color: var(--color-text-secondary);
  }
  .decor-group {
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text-secondary);
  }
  .decor-hint {
    font-size: 13px;
    color: var(--color-text-muted);
    padding: 10px 16px;
    background: var(--color-primary-bg);
    border-radius: 8px;
    line-height: 1.6;
  }
}
</style>
