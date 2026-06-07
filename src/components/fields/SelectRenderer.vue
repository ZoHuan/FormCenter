<template>
  <div class="select-renderer">
    <!-- 多选框 (multi-chooser) -->
    <template v-if="comp.type === 'multi-chooser'">
      <el-checkbox-group
        :model-value="(modelValue as string[]) || []"
        @update:model-value="(v) => $emit('update:modelValue', v)"
      >
        <el-checkbox
          v-for="opt in options"
          :key="opt.value"
          :label="opt.value"
        >
          {{ opt.label }}
        </el-checkbox>
      </el-checkbox-group>
    </template>

    <!-- 单选框 (chooser) -->
    <template v-else-if="comp.type === 'chooser'">
      <el-radio-group
        :model-value="modelValue as string"
        @update:model-value="(v) => $emit('update:modelValue', v)"
      >
        <el-radio
          v-for="opt in options"
          :key="opt.value"
          :label="opt.value"
        >
          {{ opt.label }}
        </el-radio>
      </el-radio-group>
    </template>

    <!-- 级联选择 (cascader) -->
    <template v-else-if="comp.type === 'cascader'">
      <el-cascader
        :model-value="modelValue"
        @update:model-value="(v) => $emit('update:modelValue', v)"
        :options="cascaderOptions"
        :placeholder="comp.description"
        clearable
        filterable
      />
    </template>

    <!-- 树形选择 (tree) -->
    <template v-else-if="comp.type === 'tree'">
      <el-tree-select
        :model-value="modelValue"
        @update:model-value="(v) => $emit('update:modelValue', v)"
        :data="treeData"
        :placeholder="comp.description"
        clearable
        filterable
        check-strictly
      />
    </template>

    <!-- 下拉框 (selection) - 默认 -->
    <template v-else>
      <el-select
        :model-value="modelValue as string"
        @update:model-value="(v) => $emit('update:modelValue', v)"
        :placeholder="comp.description"
        clearable
        filterable
      >
        <el-option
          v-for="opt in options"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: unknown] }>()

// 获取选项列表
const options = computed(() => {
  const compProps = (props.comp.props as Record<string, unknown>) || {}
  return (compProps.options as Array<{ label: string; value: string }>) || []
})

// 级联选择选项（需要转换为 cascader 格式）
const cascaderOptions = computed(() => {
  // 将平铺选项转换为树形结构
  // 这里简化处理，实际应该根据数据源配置来获取
  return options.value.map(opt => ({
    label: opt.label,
    value: opt.value,
  }))
})

// 树形选择数据
const treeData = computed(() => {
  // 将选项转换为树形结构
  return options.value.map(opt => ({
    label: opt.label,
    value: opt.value,
  }))
})
</script>

<style scoped lang="scss">
.select-renderer {
  width: 100%;

  :deep(.el-checkbox-group),
  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  :deep(.el-select),
  :deep(.el-cascader),
  :deep(.el-tree-select) {
    width: 100%;
  }
}
</style>
