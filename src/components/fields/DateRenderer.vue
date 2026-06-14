<template>
  <div class="date-renderer">
    <!-- 日期区间 -->
    <template v-if="comp.type === 'date-range'">
      <el-date-picker
        :model-value="modelValue as [string, string]"
        @update:model-value="(v) => $emit('update:modelValue', v)"
        :type="dateType"
        :placeholder="comp.description"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        range-separator="至"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
      />
    </template>

    <!-- 单个日期 -->
    <template v-else>
      <el-date-picker
        :model-value="modelValue as string"
        @update:model-value="(v) => $emit('update:modelValue', v)"
        :type="dateType"
        :placeholder="comp.description"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()

// 获取日期类型配置
const dateType = computed(() => {
  const compProps = (props.comp.props as Record<string, unknown>) || {}
  const configuredType = compProps.dateType as string

  // 根据组件类型和配置返回正确的 date-picker type
  if (props.comp.type === 'date-range') {
    // 日期区间类型
    switch (configuredType) {
      case 'yearrange':
        return 'yearrange'
      case 'monthrange':
        return 'monthrange'
      case 'datetimerange':
        return 'datetimerange'
      case 'daterange':
      default:
        return 'daterange'
    }
  } else {
    // 单个日期类型
    switch (configuredType) {
      case 'year':
        return 'year'
      case 'month':
        return 'month'
      case 'datetime':
        return 'datetime'
      case 'timeperiod':
        return 'datetime' // 时间段使用 datetime
      case 'date':
      default:
        return 'date'
    }
  }
})
</script>

<style scoped lang="scss">
.date-renderer {
  width: 100%;

  :deep(.el-date-editor) {
    width: 100%;
  }
}
</style>
