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
      <div class="success-icon">✓</div>
      <h2>感谢填写</h2>
      <p>你的回复已成功提交</p>
      <div class="success-actions">
        <el-button @click="window.close()">关闭页面</el-button>
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
        <div class="form-card" :class="{ 'phone-frame': isPreview && previewMode === 'mobile' }">
          <div v-if="isPreview && previewMode === 'mobile'" class="phone-notch"></div>
          <h1 class="form-title">{{ schema?.title }}</h1>
          <p v-if="schema?.description" class="form-desc">{{ schema.description }}</p>

          <div class="fields">
            <div v-for="(row, ri) in layoutRows" :key="ri" class="field-row">
              <div 
                v-for="comp in row" 
                :key="comp.id" 
                class="field-item" 
                :class="{ 
                  'app-style-horizontal': comp.appStyle === 0,
                  'app-style-vertical': comp.appStyle === 1 
                }"
                :style="{ flex: `0 0 ${widthMap[comp.colspan] || 100}%` }"
              >
                <label class="field-label" :class="{ stacked: comp.colspan === 4 || comp.appStyle === 1 }">
                  {{ comp.label }}
                  <span v-if="comp.required" class="required">*</span>
                </label>
                <div class="field-input">
                  <FieldRenderer :comp="comp" :model-value="formData[comp.field]" @update:model-value="(v) => (formData[comp.field] = v)" />
                </div>
                <p v-if="fieldErrors[comp.field]" class="field-error">{{ fieldErrors[comp.field] }}</p>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <template v-if="!isPreview">
              <el-button @click="handleSaveDraft">暂存</el-button>
              <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">提交</el-button>
            </template>
            <el-tooltip v-else content="预览模式下无法提交" placement="top">
              <el-button type="primary" size="large" disabled>提交</el-button>
            </el-tooltip>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFormListStore } from '@/stores/formList'
import { useFormSubmissionStore } from '@/stores/formSubmission'
import { useDraft } from '@/composables/useDraft'
import { validate } from '@/utils/validators'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import FieldRenderer from '@/components/fields/FieldRenderer.vue'
import type { FormSchema, ComponentSchema } from '@/types'

const route = useRoute()
const router = useRouter()
const listStore = useFormListStore()
const subStore = useFormSubmissionStore()
const formId = route.params.formId as string
const { startAutoSave, stopAutoSave, save: saveDraft, clear: clearDraft, hasDraft } = useDraft(formId)

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
  if (draft) {
    showDraftDialog.value = true
    draftTime.value = new Date(draft.savedAt).toLocaleString('zh-CN')
  } else {
    initForm(form)
  }
})

function initForm(form: FormSchema) {
  form.components.forEach((c) => { if (c.field) formData[c.field] = c.defaultValue ?? '' })
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

function isSelectType(t: string) {
  return ['chooser', 'multi-chooser', 'selection', 'cascader', 'tree', 'tree-structure', 'region'].includes(t)
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
  saveDraft({ ...formData })
  ElMessage.success('已暂存')
}

async function handleSubmit() {
  if (!schema.value) return
  let hasError = false
  for (const c of visibleComponents.value) {
    const err = validate(formData[c.field], { required: c.required, ...(c.props as Record<string, unknown>) })
    if (err) { fieldErrors[c.field] = err; hasError = true } else { delete fieldErrors[c.field] }
  }
  if (hasError) {
    const first = visibleComponents.value.find((c) => fieldErrors[c.field])
    if (first) document.querySelector(`[data-field="${first.field}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  await ElMessageBox.confirm('提交后不可修改，是否确认？', '确认提交', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
  submitting.value = true
  const ok = subStore.submit(schema.value.id, { ...formData })
  submitting.value = false
  if (ok) { clearDraft(); stopAutoSave(); loadState.value = 'submitted' }
  else ElMessage.error('提交失败，请重试')
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
  background: var(--color-page);
  display: flex;
  justify-content: center;
  padding: 24px 16px;
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
  gap: 16px;
}
.success-icon {
  width: 72px;
  height: 72px;
  background: var(--color-success);
  color: var(--color-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto;
}
.success-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.draft-dialog {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.draft-time {
  color: var(--color-text-muted);
  font-size: 13px;
}
.fill-form {
  max-width: 720px;
  width: 100%;
}
.form-card {
  background: var(--color-card);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.form-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}
.form-desc {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: 24px;
}
.fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.field-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.field-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  // APP排版：左右排列模式（桌面端默认）
  &.app-style-horizontal {
    @media (min-width: 721px) {
      flex-direction: row;
      align-items: flex-start;
      
      .field-label {
        width: 120px;
        flex-shrink: 0;
        text-align: right;
        padding-right: 12px;
        line-height: 32px;
      }
      
      .field-input {
        flex: 1;
      }
    }
  }

  // APP排版：上下排列模式
  &.app-style-vertical {
    .field-label {
      margin-bottom: 4px;
    }
  }

  // 移动端适配
  @media (max-width: 720px) {
    flex: 0 0 100% !important; // 移动端强制满宽
    
    // 移动端所有组件标签都在上方
    .field-label {
      margin-bottom: 4px;
    }
  }
}
.field-label {
  font-size: 13px;
  font-weight: 500;
}
.field-label.stacked {
  margin-bottom: 4px;
}
.required {
  color: var(--color-error);
}
.field-input :deep(.el-input__wrapper),
.field-input :deep(.el-select__wrapper) {
  border-radius: 8px;
}
.field-error {
  color: var(--color-error);
  font-size: 12px;
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
  padding: 0 16px;
  background: var(--color-primary-bg);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
  gap: 12px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.preview-tag {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: var(--color-canvas);
  border-radius: 4px;
  padding: 2px 10px;
  margin-left: 12px;
}

.preview-toggle {
  margin-left: auto;
  display: flex;
  background: var(--color-canvas);
  border-radius: var(--radius-md);
  padding: 2px;
  gap: 2px;

  button {
    padding: 4px 14px;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 12px;
    cursor: pointer;
    background: transparent;
    color: var(--color-text-muted);
    transition: all .2s;

    &.active {
      background: var(--color-card);
      color: var(--color-primary);
      box-shadow: var(--shadow-xs);
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
  border: 7px solid #1A1814;
  border-radius: 28px;
  padding: 24px 16px;
  min-height: 600px;
  position: relative;
  background: var(--color-card);
}

.phone-notch {
  width: 120px;
  height: 28px;
  background: #1A1814;
  border-radius: 0 0 14px 14px;
  margin: -24px auto 16px;
}
</style>
