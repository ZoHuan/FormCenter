<template>
  <Teleport to="body">
    <Transition name="preview-fade">
      <div v-if="visible" class="preview-overlay" @click.self="$emit('close')">
        <!-- toolbar -->
        <div class="preview-toolbar">
          <div class="preview-toggle">
            <button :class="{ active: mode === 'pc' }" @click="mode = 'pc'">桌面端</button>
            <button :class="{ active: mode === 'mobile' }" @click="mode = 'mobile'">移动端</button>
          </div>
          <button class="preview-close" @click="$emit('close')"><X :size="20" /></button>
        </div>

        <!-- card -->
        <div class="preview-scroll">
          <div class="form-card" :class="{ 'is-mobile': mode === 'mobile' }">
            <div class="form-header">
              <h1 v-if="formTitle" class="form-title">{{ formTitle }}</h1>
              <p v-if="formDesc" class="form-desc">{{ formDesc }}</p>
            </div>

            <div class="fields">
              <div v-for="(row, ri) in layoutRows" :key="ri" class="field-row">
                <div
                  v-for="comp in row"
                  :key="comp.id"
                  class="field-item"
                  :class="{
                    'app-horizontal': comp.appStyle === 0 && !isDecorType(comp.type),
                    'app-vertical': comp.appStyle === 1,
                  }"
                  :style="{ flex: `0 0 ${widthMap[comp.colspan] || 100}%` }"
                >
                  <label
                    v-if="!isDecorType(comp.type) && !hasOwnLabel(comp.type) && shouldShowLabel(comp.type)"
                    class="field-label"
                    :class="{ 'table-title': isTableType(comp.type) }"
                  >
                    {{ comp.label }}<span v-if="comp.required" class="required">*</span>
                  </label>
                  <div class="field-input">
                    <FieldRenderer
                      :comp="comp"
                      :mode="mode"
                      :model-value="formData[comp.field]"
                      @update:model-value="(v) => (formData[comp.field] = v)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="form-footer">
              <el-button type="primary" size="large" disabled>提 交</el-button>
              <p class="footer-hint">预览模式下无法提交</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { DECOR_TYPES } from '@/registry'
import FieldRenderer from '@/components/fields/FieldRenderer.vue'
import type { ComponentSchema } from '@/types'

const mobileTypes = [
  'input',
  'textarea',
  'numeric',
  'serial-number',
  'chooser',
  'multi-chooser',
  'selection',
  'cascader',
  'date',
  'date-range',
  'rate',
  'file',
  'image',
  'commitment',
  'tree-structure',
]

const props = defineProps<{
  visible: boolean
  formTitle: string
  formDesc: string
  components: ComponentSchema[]
}>()
defineEmits<{ close: [] }>()

const mode = ref<'pc' | 'mobile'>('pc')
const formData = reactive<Record<string, unknown>>({})
const isDecorType = (t: string) => (DECOR_TYPES as string[]).includes(t)
const isTableType = (t: string) => t === 'table' || t === 'cross-table'
const hasOwnLabel = (t: string) => isTableType(t)
const shouldShowLabel = (t: string) => mode.value !== 'mobile' || !mobileTypes.includes(t)
const visibleComponents = computed(() => props.components.filter((c) => !c.hidden))
const widthMap: Record<number, number> = { 1: 100, 2: 50, 3: 33.33, 4: 100 }

const layoutRows = computed(() => {
  const rows: ComponentSchema[][] = []
  let cur: ComponentSchema[] = []
  let used = 0
  for (const comp of visibleComponents.value) {
    const w = widthMap[comp.colspan] || 100
    if (used + w > 100.01 && cur.length) {
      rows.push(cur)
      cur = []
      used = 0
    }
    cur.push(comp)
    used += w
  }
  if (cur.length) rows.push(cur)
  return rows
})
</script>

<style scoped lang="scss">
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-tooltip);
  background: rgba(22, 20, 19, 0.92);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ── toolbar ── */
.preview-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.preview-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
  padding: 3px;

  button {
    padding: 6px 18px;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 13px;
    cursor: pointer;
    background: transparent;
    color: rgba(255, 255, 255, 0.45);
    transition: all var(--duration-normal);

    &.active {
      background: rgba(255, 255, 255, 0.12);
      color: var(--color-card);
    }
  }
}

.preview-close {
  position: fixed;
  top: 12px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all var(--duration-normal);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--color-card);
  }
}

/* ── card ── */
.preview-scroll {
  width: 100%;
  max-width: 680px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 0;
  }
  scrollbar-width: none;
}

.form-card {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: var(--space-12) 44px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 12px 40px rgba(0, 0, 0, 0.14);

  &.is-mobile {
    max-width: 375px;
    margin: 0 auto;
    padding: 28px 0 32px;
    border-radius: var(--radius-lg);

    .form-title {
      font-size: 22px;
      padding: 0 16px;
    }

    .form-desc {
      font-size: 14px;
      margin-bottom: 24px;
      padding: 0 16px;
    }

    .form-header {
      margin-bottom: 24px;
    }

    .fields {
      gap: 0;
    }

    .field-row {
      gap: 0;
    }

    .field-item {
      gap: 0;

      &:not(:has(.mobile-renderer)) {
        padding: 10px 16px;
      }

      &:has(.decor-renderer) {
        padding: 10px 16px;
      }
    }

    .field-label {
      width: 64px;
      flex-shrink: 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-secondary);
      line-height: 24px;
    }

    .app-horizontal .field-label {
      flex: none;
      width: 64px;
      margin-right: 12px;
      text-align: left;
      line-height: 24px;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-secondary);
      word-wrap: break-word;
    }

    .app-vertical .field-label {
      width: auto;
    }

    .form-footer {
      margin-top: 24px;
      padding: 20px 16px 0;
      border-top: none;

      .el-button--large {
        border-radius: var(--radius-md);
      }
    }
  }
}

/* ── header ── */
.form-header {
  margin-bottom: 40px;
}

.form-title {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--color-text);
  margin: 0 0 6px;
}

.form-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
}

/* ── fields ── */
.fields {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.field-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  &.app-horizontal {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;

    .field-label {
      width: 64px;
      flex-shrink: 0;
      text-align: right;
      line-height: 30px;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-secondary);
    }
    .field-input {
      flex: 1;
      min-width: 0;
    }
  }

  &.app-vertical {
    .field-label {
      margin-bottom: 4px;
    }
  }
}

.field-label {
  width: 64px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.table-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}

.required {
  color: var(--color-error);
  margin-left: 3px;
}

.field-input {
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    height: 32px; // PC 端小尺寸
    padding: 0 4px;
    border-radius: 0;
    background: transparent;
    box-shadow: inset 0 -1px 0 0 var(--color-border);
    transition: box-shadow var(--duration-normal);

    &:hover {
      box-shadow: inset 0 -1px 0 0 var(--color-border-hover);
    }
  }

  :deep(.el-input.is-focus .el-input__wrapper),
  :deep(.el-select.is-focus .el-select__wrapper) {
    box-shadow: inset 0 -2px 0 0 var(--color-primary);
  }

  :deep(.el-textarea__inner) {
    min-height: 80px;
    padding: 6px 4px;
    border-radius: 0;
    background: transparent;
    resize: vertical;
    box-shadow: inset 0 -1px 0 0 var(--color-border);
    transition: box-shadow var(--duration-normal);

    &:hover {
      box-shadow: inset 0 -1px 0 0 var(--color-border-hover);
    }
    &:focus {
      box-shadow: inset 0 -2px 0 0 var(--color-primary);
    }
  }

  :deep(.el-rate) {
    vertical-align: middle;
  }

  :deep(.el-input-number) {
    width: 140px;

    :deep(.el-input__wrapper) {
      padding-right: 30px;
    }
  }

  :deep(.el-input-number__decrease),
  :deep(.el-input-number__increase) {
    width: 26px;
    height: 50%;
    border-radius: 0;
    border-left: 1px solid transparent;
    background: transparent;
    color: var(--color-text-muted);
    transition: all var(--duration-fast);

    &:hover {
      color: var(--color-primary);
      background: var(--color-primary-bg);
      border-left-color: var(--color-border);
    }
  }

  :deep(.el-input-number__decrease) {
    border-bottom: 1px solid transparent;

    &:hover {
      border-bottom-color: var(--color-border);
    }
  }

  :deep(.relation-field .van-cell) {
    padding: 0;
  }
}

/* ── footer ── */
.form-footer {
  margin-top: 40px;
  padding-top: 28px;
  border-top: 1px solid var(--color-canvas);
  text-align: center;

  .el-button--large {
    width: 100%;
    height: 48px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.5px;
    border-radius: var(--radius-lg);
    opacity: 0.45;
  }
}

.footer-hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

/* ── transition ── */
.preview-fade-enter-active {
  transition: opacity var(--duration-slow);
}
.preview-fade-leave-active {
  transition: opacity var(--duration-normal);
}
.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}
</style>
