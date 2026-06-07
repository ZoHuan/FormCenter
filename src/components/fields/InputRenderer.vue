<template>
  <div class="input-renderer">
    <!-- 数字输入 -->
    <template v-if="comp.type === 'numeric'">
      <el-input-number
        :model-value="modelValue as number"
        @update:model-value="(v) => $emit('update:modelValue', v)"
        :min="min"
        :max="max"
        :precision="decimalPlaces"
        :placeholder="comp.description"
        controls-position="right"
      />
      <span v-if="unit" class="input-unit">{{ unit }}</span>
    </template>

    <!-- 多行文本 -->
    <template v-else-if="comp.type === 'textarea'">
      <el-input
        :model-value="modelValue as string"
        @update:model-value="(v) => $emit('update:modelValue', v)"
        type="textarea"
        :placeholder="comp.description"
        :maxlength="maxLength"
        :rows="rows"
        :autosize="autoSize ? { minRows: 1, maxRows: 10 } : false"
        show-word-limit
      />
    </template>

    <!-- 编号（只读） -->
    <template v-else-if="comp.type === 'serial-number'">
      <el-input
        :model-value="modelValue as string"
        placeholder="自动生成"
        disabled
      />
    </template>

    <!-- 单行文本 -->
    <template v-else>
      <el-input
        :model-value="modelValue as string"
        @update:model-value="handleInput"
        :placeholder="comp.description"
        :maxlength="maxLength"
        show-word-limit
        @blur="handleBlur"
      >
        <template v-if="formatHint" #suffix>
          <el-tooltip :content="formatHint" placement="top">
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
        </template>
      </el-input>
      <p v-if="formatError" class="format-error">{{ formatError }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{ comp: ComponentSchema; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const formatError = ref('')

// 获取 props 配置
const compProps = computed(() => (props.comp.props as Record<string, unknown>) || {})

// 数字配置
const min = computed(() => compProps.value.min as number | undefined)
const max = computed(() => compProps.value.max as number | undefined)
const decimalPlaces = computed(() => compProps.value.decimalPlaces as number | undefined)
const unit = computed(() => compProps.value.unit as string | undefined)

// 文本配置
const maxLength = computed(() => compProps.value.maxLength as number | undefined)
const rows = computed(() => (compProps.value.defaultRows as number) || 3)
const autoSize = computed(() => compProps.value.autoSize as boolean ?? true)

// 格式校验配置
const format = computed(() => compProps.value.format as string | undefined)
const customRegex = computed(() => compProps.value.customRegex as string | undefined)

const formatHint = computed(() => {
  switch (format.value) {
    case 'phone': return '请输入11位手机号'
    case 'idCard': return '请输入18位身份证号'
    case 'email': return '请输入邮箱地址'
    case 'custom': return customRegex.value ? '请输入符合格式的内容' : ''
    default: return ''
  }
})

function handleInput(value: string) {
  emit('update:modelValue', value)
  formatError.value = ''
}

function handleBlur() {
  if (!format.value || format.value === 'none') return
  const value = props.modelValue as string
  if (!value) return

  let regex: RegExp
  let errorMsg: string

  switch (format.value) {
    case 'phone':
      regex = /^1[3-9]\d{9}$/
      errorMsg = '请输入正确的手机号'
      break
    case 'idCard':
      regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
      errorMsg = '请输入正确的身份证号'
      break
    case 'email':
      regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      errorMsg = '请输入正确的邮箱地址'
      break
    case 'custom':
      if (customRegex.value) {
        try {
          regex = new RegExp(customRegex.value)
          errorMsg = '输入内容不符合格式要求'
        } catch {
          return
        }
      } else {
        return
      }
      break
    default:
      return
  }

  if (!regex.test(value)) {
    formatError.value = errorMsg
  } else {
    formatError.value = ''
  }
}
</script>

<style scoped lang="scss">
.input-renderer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.input-unit {
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 32px;
  white-space: nowrap;
}

.format-error {
  color: var(--color-error);
  font-size: 12px;
  margin-top: 4px;
  width: 100%;
}
</style>
