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
                    v-if="!isDecorType(comp.type) && !hasOwnLabel(comp.type)"
                    class="field-label"
                    :class="{ 'table-title': isTableType(comp.type) }"
                  >
                    {{ comp.label }}<span v-if="comp.required" class="required">*</span>
                  </label>
                  <div class="field-input">
                    <FieldRenderer :comp="comp" :model-value="undefined" />
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
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { DECOR_TYPES } from '@/registry'
import FieldRenderer from '@/components/fields/FieldRenderer.vue'
import type { ComponentSchema } from '@/types'

const props = defineProps<{
  visible: boolean
  formTitle: string
  formDesc: string
  components: ComponentSchema[]
}>()
defineEmits<{ close: [] }>()

const mode = ref<'pc' | 'mobile'>('pc')
const isDecorType = (t: string) => (DECOR_TYPES as string[]).includes(t)
const isTableType = (t: string) => t === 'table' || t === 'cross-table'
const hasOwnLabel = (t: string) => isTableType(t)
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
  z-index: 1000;
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
  border-radius: 8px;
  padding: 3px;

  button {
    padding: 6px 18px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    background: transparent;
    color: rgba(255, 255, 255, 0.45);
    transition: all 0.2s;

    &.active {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
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
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: #fff;
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
  border-radius: 16px;
  padding: 48px 44px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 12px 40px rgba(0, 0, 0, 0.14);

  &.is-mobile {
    max-width: 375px;
    margin: 0 auto;
    padding: 32px 24px;
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
    gap: 16px;

    .field-label {
      width: 80px;
      flex-shrink: 0;
      text-align: right;
      margin-top: 10px;
    }
    .field-input {
      flex: 1;
    }
  }

  &.app-vertical {
    .field-label {
      margin-bottom: 4px;
    }
  }
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 2px;
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

.field-input :deep(.el-input__wrapper),
.field-input :deep(.el-select__wrapper) {
  border-radius: 0;
  box-shadow: inset 0 -1px 0 0 var(--color-border);
  background: transparent;
  padding: 0 4px;
  height: 44px;
  transition: box-shadow 0.25s ease;

  &:hover {
    box-shadow: inset 0 -1px 0 0 var(--color-border-hover);
  }
}
.field-input :deep(.el-input.is-focus .el-input__wrapper),
.field-input :deep(.el-select.is-focus .el-select__wrapper) {
  box-shadow: inset 0 -2px 0 0 var(--color-primary);
}
.field-input :deep(.el-textarea__inner) {
  border-radius: 0;
  box-shadow: inset 0 -1px 0 0 var(--color-border);
  background: transparent;
  min-height: 80px;
  padding: 6px 4px;
  resize: vertical;
  transition: box-shadow 0.25s ease;

  &:hover {
    box-shadow: inset 0 -1px 0 0 var(--color-border-hover);
  }
  &:focus {
    box-shadow: inset 0 -2px 0 0 var(--color-primary);
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
    border-radius: 10px;
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
  transition: opacity 0.3s ease;
}
.preview-fade-leave-active {
  transition: opacity 0.2s ease;
}
.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}
</style>
