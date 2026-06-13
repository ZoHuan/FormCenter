<template>
  <div class="relation-field">
    <template v-if="mode === 'mobile'">
      <van-field
        :model-value="getOptionLabel(modelValue as string)"
        readonly
        is-link
        :placeholder="comp.description"
        @click="showPicker = true"
      />
      <van-action-sheet v-model:show="showPicker" title="请选择">
        <van-picker :columns="pickerColumns" @confirm="onPickerConfirm" @cancel="showPicker = false" />
      </van-action-sheet>
    </template>
    <template v-else>
      <el-select
        :model-value="modelValue"
        @update:model-value="(v) => $emit('update:modelValue', v)"
        :placeholder="comp.description"
        clearable
      >
        <el-option v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </template>
    <div v-if="modelValue && outputFields.length" class="relation-info">
      <span v-for="f in outputFields" :key="f.field">{{ f.label }}: 示例数据</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentSchema } from '@/types'
import { Field as VanField, ActionSheet as VanActionSheet, Picker as VanPicker } from 'vant'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown; mode?: string }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()
const options = computed(
  () => ((props.comp.props as Record<string, unknown>)?.options as Array<{ label: string; value: string }>) ?? [],
)
const outputFields = computed(
  () => ((props.comp.props as Record<string, unknown>)?.outputFields as Array<{ field: string; label: string }>) ?? [],
)
const showPicker = ref(false)
const pickerColumns = computed(() => options.value.map((o) => ({ text: o.label, value: o.value })))
function getOptionLabel(val: string) {
  return options.value.find((o) => o.value === val)?.label ?? ''
}
function onPickerConfirm({ selectedOptions }: any) {
  showPicker.value = false
  emit('update:modelValue', selectedOptions[0]?.value)
}
</script>
<style scoped>
.relation-info {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
<style scoped>
.relation-info {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
