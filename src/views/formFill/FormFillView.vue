<template>
  <div class="fill-page">
    <div v-if="loadState === 'loading'" class="fill-center">
      <LoadingState text="加载中..." />
    </div>

    <div v-else-if="loadState === 'draft'" class="fill-center">
      <ErrorState text="表单未发布" />
    </div>

    <div v-else-if="loadState === 'closed'" class="fill-center">
      <ErrorState text="表单已停止收集" />
    </div>

    <div v-else-if="loadState === 'notfound'" class="fill-center">
      <ErrorState text="表单不存在" />
    </div>

    <div v-else-if="loadState === 'submitted'" class="fill-center fill-success">
      <div class="success-icon"><CircleCheck :size="40" /></div>
      <h2>感谢填写</h2>
      <p>你的回复已成功提交</p>
      <div class="success-actions">
        <el-button @click="router.push('/forms')">返回首页</el-button>
        <el-button type="primary" @click="resetForm">再次填写</el-button>
      </div>
    </div>

    <template v-else>
      <div v-if="showDraftDialog" class="fill-center">
        <div class="draft-dialog">
          <p>检测到未完成的填写</p>
          <p class="draft-time">上次保存：{{ draftTime }}</p>
          <el-button type="primary" @click="restoreDraft">恢复填写</el-button>
          <el-button @click="discardDraft">重新填写</el-button>
        </div>
      </div>

      <div v-else class="fill-form" :class="{ 'fill-preview-pc': isPreview && previewMode === 'pc' }">
        <div v-if="isPreview" class="preview-bar">
          <el-button link @click="handleBackToDesigner">← 返回设计器</el-button>
          <span class="preview-tag">预览模式</span>
          <div class="preview-toggle">
            <button :class="{ active: previewMode === 'mobile' }" @click="previewMode = 'mobile'">手机</button>
            <button :class="{ active: previewMode === 'pc' }" @click="previewMode = 'pc'">PC</button>
          </div>
        </div>

        <!-- 头区：独立于卡片 -->
        <div class="form-hero">
          <h1 class="form-title">{{ schema?.title }}</h1>
          <p v-if="schema?.description" class="form-desc">{{ schema.description }}</p>
        </div>

        <!-- 卡片 -->
        <div class="form-card" :class="{ 'phone-frame': isPreview && previewMode === 'mobile' }">
          <div v-if="isPreview && previewMode === 'mobile'" class="phone-notch"></div>

          <div class="fields">
            <div v-for="(row, ri) in layoutRows" :key="ri" class="field-row">
              <div
                v-for="comp in row"
                :key="comp.id"
                class="field-item"
                :class="{
                  'app-style-horizontal': comp.appStyle === 0,
                  'app-style-vertical': comp.appStyle === 1,
                  'is-decor': isDecorType(comp.type),
                  'has-own-title': hasOwnTitle(comp.type),
                }"
                :style="{ flex: `0 0 ${widthMap[comp.colspan] || 100}%` }"
              >
                <label
                  v-if="!isDecorType(comp.type) && !hasOwnTitle(comp.type)"
                  class="field-label"
                  :class="{ stacked: comp.colspan === 4 || comp.appStyle === 1 }"
                >
                  {{ comp.label }}
                  <span v-if="comp.required" class="required">*</span>
                </label>
                <div class="field-input">
                  <FieldRenderer
                    :comp="comp"
                    :model-value="formData[comp.field]"
                    @update:model-value="(v) => (formData[comp.field] = v)"
                  />
                </div>
                <p v-if="fieldErrors[comp.field]" class="field-error">{{ fieldErrors[comp.field] }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 按钮区 -->
        <div class="form-actions">
          <Transition name="fade">
            <p v-if="autoSaveHint" class="auto-save-hint">已自动保存</p>
          </Transition>
          <template v-if="!isPreview">
            <div class="actions-row">
              <el-button class="btn-draft" @click="handleSaveDraft">暂存草稿</el-button>
              <el-button class="btn-submit" :loading="submitting" @click="handleSubmit">确认提交</el-button>
            </div>
          </template>
          <el-tooltip v-else content="预览模式下无法提交" placement="top">
            <div class="actions-row">
              <el-button class="btn-draft" disabled>暂存草稿</el-button>
              <el-button class="btn-submit" disabled>确认提交</el-button>
            </div>
          </el-tooltip>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFormListStore } from '@/stores/formList'
import { useFormSubmissionStore } from '@/stores/formSubmission'
import { validate } from '@/utils/validators'
import { DECOR_TYPES } from '@/registry'
import { CircleCheck } from 'lucide-vue-next'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import FieldRenderer from '@/components/fields/FieldRenderer.vue'
import type { FormSchema, ComponentSchema, TriggerRule } from '@/types'

const route = useRoute()
const router = useRouter()
const listStore = useFormListStore()
const subStore = useFormSubmissionStore()
const formId = route.params.formId as string
const autoSaveHint = ref(false)
let autoSaveTimer: ReturnType<typeof setInterval> | null = null
function startAutoSave(getData: () => Record<string, unknown>) {
  autoSaveTimer = setInterval(() => {
    subStore.saveDraft(formId, getData())
    autoSaveHint.value = true
    setTimeout(() => {
      autoSaveHint.value = false
    }, 2000)
  }, 60000)
}
function stopAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}

const isPreview = computed(() => route.query.preview === '1')
const previewMode = ref<'mobile' | 'pc'>('mobile')

const schema = ref<FormSchema | null>(null)
const formData = reactive<Record<string, unknown>>({})
const fieldErrors = reactive<Record<string, string>>({})
const submitting = ref(false)
const loadState = ref<'loading' | 'draft' | 'closed' | 'notfound' | 'ready' | 'submitted'>('loading')
const showDraftDialog = ref(false)
const draftTime = ref('')

onMounted(() => {
  listStore.init()
  const formId = route.params.formId as string
  const form = listStore.getById(formId)
  if (!form) {
    loadState.value = 'notfound'
    return
  }
  schema.value = form
  if (form.status === 'draft' && !isPreview.value) {
    loadState.value = 'draft'
    return
  }
  if (form.status === 'closed' && !isPreview.value) {
    loadState.value = 'closed'
    return
  }

  if (isPreview.value) {
    initForm(form)
    return
  }

  const draft = subStore.loadDraft(formId)
  if (draft && draft.savedAt && Object.keys(draft.data || {}).length > 0) {
    loadState.value = 'ready'
    showDraftDialog.value = true
    draftTime.value = new Date(draft.savedAt).toLocaleString('zh-CN')
  } else {
    initForm(form)
  }
})

function initForm(form: FormSchema) {
  form.components.forEach((c) => {
    if (!c.field && !(DECOR_TYPES as string[]).includes(c.type)) {
      c.field = `${c.type}_${c.id.slice(0, 8)}`
    }
    if (c.field && !(c.field in formData)) {
      formData[c.field] = c.defaultValue ?? ''
    }
  })
  loadState.value = 'ready'
  startAutoSave(() => ({ ...formData }))
}

const visibleComponents = computed(() => schema.value?.components.filter((c) => !c.hidden) ?? [])

const widthMap: Record<number, number> = { 1: 100, 2: 50, 3: 33.33, 4: 100 }
const layoutRows = computed(() => {
  const rows: ComponentSchema[][] = []
  let currentRow: ComponentSchema[] = []
  let rowUsed = 0
  for (const comp of visibleComponents.value) {
    const w = widthMap[comp.colspan] || 100
    if (rowUsed + w > 100.01 && currentRow.length > 0) {
      rows.push(currentRow)
      currentRow = []
      rowUsed = 0
    }
    currentRow.push(comp)
    rowUsed += w
  }
  if (currentRow.length > 0) rows.push(currentRow)
  return rows
})

// 触发规则：监听表单数据变化，自动显隐/必填/可编辑目标组件
watch(
  formData,
  () => {
    if (!schema.value) return
    const comps = schema.value.components
    for (const comp of comps) {
      if (!comp.triggerRules?.length) continue
      const value = formData[comp.field]
      for (const rule of comp.triggerRules) {
        const match = String(rule.sourceValue) === String(value)
        applyTriggerRule(comps, rule, match)
      }
    }
  },
  { deep: true },
)

function applyTriggerRule(comps: ComponentSchema[], rule: TriggerRule, match: boolean) {
  const target = comps.find((c) => c.field === rule.targetField)
  if (!target) return
  switch (rule.action) {
    case 'show':
      target.hidden = !match
      break
    case 'hide':
      target.hidden = match
      break
    case 'require':
      target.required = match
      break
    case 'optional':
      target.required = !match
      break
    case 'enable':
      target.editable = match
      break
    case 'disable':
      target.editable = !match
      break
  }
}

function isSelectType(t: string) {
  return ['chooser', 'multi-chooser', 'selection', 'cascader', 'tree-structure'].includes(t)
}

function isDecorType(t: string) {
  return (DECOR_TYPES as string[]).includes(t)
}

function hasOwnTitle(t: string) {
  return ['table'].includes(t)
}

function restoreDraft() {
  showDraftDialog.value = false
  const form = schema.value
  if (!form) return
  const draft = subStore.loadDraft(form.id)
  if (draft) Object.assign(formData, draft.data)
  form.components.forEach((c) => {
    if (c.field && !(c.field in formData)) formData[c.field] = c.defaultValue ?? ''
  })
  loadState.value = 'ready'
  startAutoSave(() => ({ ...formData }))
}

function discardDraft() {
  showDraftDialog.value = false
  const form = schema.value
  if (form) {
    subStore.clearDraft(form.id)
    initForm(form)
  }
}

function handleSaveDraft() {
  if (!schema.value) return
  subStore.saveDraft(formId, { ...formData })
  ElMessage.success('已暂存')
}

async function handleSubmit() {
  if (!schema.value) return
  let hasError = false
  for (const c of visibleComponents.value) {
    const err = validate(formData[c.field], { required: c.required, ...(c.props as Record<string, unknown>) })
    if (err) {
      fieldErrors[c.field] = err
      hasError = true
    } else {
      delete fieldErrors[c.field]
    }
  }
  if (hasError) {
    const first = visibleComponents.value.find((c) => fieldErrors[c.field])
    if (first)
      document.querySelector(`[data-field="${first.field}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  await ElMessageBox.confirm('提交后不可修改，是否确认？', '确认提交', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
  submitting.value = true
  const ok = subStore.submit(schema.value.id, { ...formData })
  submitting.value = false
  if (ok) {
    subStore.clearDraft(formId)
    stopAutoSave()
    loadState.value = 'submitted'
  } else ElMessage.error('提交失败，请重试')
}

function resetForm() {
  loadState.value = 'ready'
  if (schema.value) initForm(schema.value)
}
onUnmounted(stopAutoSave)

function handleBackToDesigner() {
  if (schema.value?.id) window.open(`/formDesigner/${schema.value.id}`, '_self')
  else router.push('/forms')
}
</script>

<style scoped lang="scss">
.fill-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 0%, #f0f4ef 0%, var(--color-page) 60%),
    radial-gradient(circle, rgba(45, 106, 79, 0.03) 1px, transparent 1px);
  background-size:
    100% 100%,
    24px 24px;
  display: flex;
  justify-content: center;
  padding: 0 16px 64px;
}

.fill-center {
  max-width: 720px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.fill-success {
  flex-direction: column;
  text-align: center;
  gap: 12px;
  background: var(--color-card);
  border-radius: 24px;
  padding: 56px 32px;
  box-shadow:
    0 2px 4px rgba(28, 25, 23, 0.03),
    0 8px 24px rgba(28, 25, 23, 0.06);

  h2 {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  p {
    font-size: 15px;
    color: var(--color-text-secondary);
    margin: 0;
  }
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #5b7b4a, #4a6a3d);
  color: var(--color-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 28px rgba(91, 123, 74, 0.3);

  svg {
    width: 36px;
    height: 36px;
  }
}

.success-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

.draft-dialog {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 48px 32px;
  background: var(--color-card);
  border-radius: 24px;
  box-shadow:
    0 2px 4px rgba(28, 25, 23, 0.03),
    0 8px 24px rgba(28, 25, 23, 0.06);
  max-width: 400px;
  width: 100%;

  p {
    margin: 0;
    font-size: 16px;
    color: var(--color-text);
    font-weight: 500;
  }

  .draft-time {
    font-size: 13px;
    color: var(--color-text-muted);
  }

  .el-button {
    height: 44px;
    border-radius: var(--radius-lg);
    font-weight: 600;
  }
}
.fill-form {
  max-width: 680px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ── 头区 ── */
.form-hero {
  text-align: center;
  padding: 40px 24px 64px;
  position: relative;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 50% 0%, rgba(45, 106, 79, 0.06) 0%, transparent 60%),
      radial-gradient(circle at 80% 30%, rgba(45, 106, 79, 0.03) 0%, transparent 40%);
    pointer-events: none;
  }
}

.form-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin: 0;
  line-height: 1.3;
  position: relative;
  z-index: 1;

  &::after {
    content: '';
    display: block;
    width: 52px;
    height: 4px;
    background: linear-gradient(90deg, var(--color-primary), rgba(45, 106, 79, 0.3));
    border-radius: 2px;
    margin: 20px auto 0;
  }
}

.form-desc {
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 1.65;
  margin: 20px 0 0;
  max-width: 460px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;
  font-weight: 400;
}

/* ── 卡片·悬浮于头区之上 ── */
.form-card {
  background: var(--color-card);
  border-radius: 24px;
  padding: 40px 48px;
  margin-top: -32px;
  position: relative;
  z-index: 2;
  box-shadow:
    0 2px 4px rgba(28, 25, 23, 0.03),
    0 8px 24px rgba(28, 25, 23, 0.06),
    0 24px 64px rgba(28, 25, 23, 0.08);
  border: 1px solid rgba(28, 25, 23, 0.04);
}

/* ── 表单字段（保持不变） ── */
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

  // APP排版：左右排列模式
  &.app-style-horizontal {
    @media (min-width: 721px) {
      &:not(.is-decor) {
        flex-direction: row;
        align-items: flex-start;
        gap: 20px;

        .field-label {
          width: 90px;
          flex-shrink: 0;
          text-align: right;
          padding-right: 0;
          line-height: 1.5;
          margin-top: 10px;
        }

        .field-input {
          flex: 1;
          min-width: 0;
        }
      }
    }
  }

  // APP排版：上下排列模式
  &.app-style-vertical {
    .field-label {
      margin-bottom: 4px;
    }
  }

  // ── 真实移动端适配 ──
  @media (max-width: 720px) {
    .field-item {
      flex: 0 0 100% !important;

      .field-label {
        margin-bottom: 4px;
      }
    }

    .form-hero {
      padding: 24px 20px 44px;

      &::before {
        opacity: 0.6;
      }
    }

    .form-title {
      font-size: 22px;

      &::after {
        width: 36px;
        height: 3px;
        margin-top: 14px;
      }
    }

    .form-desc {
      font-size: 14px;
      margin-top: 14px;
    }

    .form-card {
      margin-top: -24px;
      padding: 28px 16px;
      border-radius: 20px 20px 0 0;
      box-shadow:
        0 -2px 12px rgba(28, 25, 23, 0.06),
        0 -8px 32px rgba(28, 25, 23, 0.08);
      border: none;
    }

    .form-actions {
      margin-top: 32px;
      padding: 0 16px 24px;
    }

    .actions-row {
      gap: 10px;
    }
  }
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 0.01em;

  .required {
    color: var(--color-error);
    margin-left: 2px;
  }

  &.stacked {
    margin-bottom: 4px;
  }
}
// ── 输入框下划线风格 ──
.field-input {
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    height: 44px;
    padding: 0 2px;
    border-radius: 0;
    background: transparent;
    box-shadow: inset 0 -1px 0 0 var(--color-border);
    transition:
      box-shadow var(--duration-normal),
      background var(--duration-fast);

    &:hover {
      box-shadow: inset 0 -1px 0 0 var(--color-border-hover);
      background: rgba(246, 248, 245, 0.5);
    }
  }

  :deep(.el-input.is-focus .el-input__wrapper),
  :deep(.el-select.is-focus .el-select__wrapper) {
    box-shadow: inset 0 -2px 0 0 var(--color-primary);
    background: rgba(45, 106, 79, 0.02);
  }

  :deep(.el-input.is-error .el-input__wrapper) {
    box-shadow: inset 0 -2px 0 0 var(--color-error);
  }

  :deep(.el-textarea__inner) {
    min-height: 80px;
    padding: 8px 2px;
    border-radius: 0;
    background: transparent;
    resize: vertical;
    box-shadow: inset 0 -1px 0 0 var(--color-border);
    transition:
      box-shadow var(--duration-normal),
      background var(--duration-fast);

    &:hover {
      box-shadow: inset 0 -1px 0 0 var(--color-border-hover);
      background: rgba(246, 248, 245, 0.5);
    }

    &:focus {
      box-shadow: inset 0 -2px 0 0 var(--color-primary);
      background: rgba(45, 106, 79, 0.02);
    }
  }

  @media (min-width: 768px) {
    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      height: 40px;
    }
  }
}
.field-error {
  color: var(--color-error);
  font-size: 12px;
}

/* ── 按钮区 ── */
.form-actions {
  margin-top: 44px;
  padding: 0 24px 32px;
}

.actions-row {
  display: flex;
  gap: 14px;
  max-width: 680px;
  margin: 0 auto;
}

.btn-draft {
  flex: 1;
  height: 52px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 14px;
  color: var(--color-text-secondary);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  letter-spacing: 0.04em;
  transition: all var(--duration-normal);
  box-shadow: 0 2px 8px rgba(28, 25, 23, 0.04);

  &:hover:not(:disabled) {
    border-color: var(--color-border-hover);
    color: var(--color-text);
    box-shadow: 0 4px 12px rgba(28, 25, 23, 0.06);
    transform: translateY(-1px);
  }
}

.btn-submit {
  flex: 1;
  height: 52px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #3d7e5c 100%);
  color: var(--color-card);
  border: none;
  letter-spacing: 0.04em;
  box-shadow:
    0 4px 16px rgba(45, 106, 79, 0.2),
    0 1px 4px rgba(45, 106, 79, 0.1);
  transition:
    all var(--duration-normal),
    transform var(--duration-fast);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow:
      0 8px 28px rgba(45, 106, 79, 0.28),
      0 2px 6px rgba(45, 106, 79, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(45, 106, 79, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.auto-save-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sig-pad {
  display: flex;
  align-items: center;

  .sig-preview {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    width: 200px;
    height: 100px;
  }
}

.qr-display {
  display: flex;
  align-items: center;
}

.preview-bar {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: var(--color-card);
  margin-bottom: 20px;
  gap: 12px;
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(28, 25, 23, 0.06);
}

.preview-tag {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  border-radius: 4px;
  padding: 2px 10px;
  margin-left: 12px;
}

.preview-toggle {
  margin-left: auto;
  display: flex;
  background: var(--color-canvas);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 2px;

  button {
    padding: 4px 16px;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    background: transparent;
    color: var(--color-text-muted);
    transition: all var(--duration-normal);

    &.active {
      background: var(--color-card);
      color: var(--color-primary);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }
  }
}

.fill-preview-pc {
  max-width: 720px;
  margin: 0 auto;
}

.phone-frame {
  max-width: 375px;
  margin: 0 auto;
  border: 8px solid #2c2c2e;
  border-radius: 32px;
  padding: 32px 18px 24px;
  min-height: 600px;
  position: relative;
  background: var(--color-card);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);

  .form-card {
    box-shadow: none;
    border: none;
    padding: 0;
    border-radius: 0;
  }
}

.phone-notch {
  width: 120px;
  height: 30px;
  background: #2c2c2e;
  border-radius: 0 0 16px 16px;
  margin: -32px auto 20px;
}
</style>
