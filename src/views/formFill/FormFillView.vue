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

      <div v-else class="fill-form">
        <div class="form-card">
          <h1 class="form-title">{{ schema?.title }}</h1>
          <p v-if="schema?.description" class="form-desc">{{ schema.description }}</p>

          <div class="fields">
            <div v-for="comp in visibleComponents" :key="comp.id" class="field-item">
              <label class="field-label">
                {{ comp.label }}
                <span v-if="comp.required" class="required">*</span>
              </label>
              <div class="field-input">
                <el-input v-if="comp.type === 'input' || comp.type === 'textarea'" v-model="formData[comp.field]" :placeholder="comp.description" :type="comp.type === 'textarea' ? 'textarea' : 'text'" />
                <el-input-number v-else-if="comp.type === 'numeric'" v-model="formData[comp.field]" :placeholder="comp.description" />
                <el-select v-else-if="isSelectType(comp.type)" v-model="formData[comp.field]" :placeholder="comp.description">
                  <el-option v-for="opt in (comp.props as Record<string, unknown>)?.options as Array<{label:string;value:string}> ?? []" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
                <el-date-picker v-else-if="comp.type === 'date'" v-model="formData[comp.field]" type="date" />
                <el-input v-else v-model="formData[comp.field]" :placeholder="comp.description" />
              </div>
              <p v-if="fieldErrors[comp.field]" class="field-error">{{ fieldErrors[comp.field] }}</p>
            </div>
          </div>

          <div class="form-actions">
            <el-button @click="handleSaveDraft">暂存</el-button>
            <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">提交</el-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFormListStore } from '@/stores/formList'
import { useFormSubmissionStore } from '@/stores/formSubmission'
import { validate } from '@/utils/validators'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import type { FormSchema, ComponentSchema } from '@/types'

const route = useRoute()
const listStore = useFormListStore()
const subStore = useFormSubmissionStore()

const schema = ref<FormSchema | null>(null)
const formData = reactive<Record<string, unknown>>({})
const fieldErrors = reactive<Record<string, string>>({})
const submitting = ref(false)
const loadState = ref<'loading' | 'draft' | 'closed' | 'notfound' | 'ready' | 'submitted'>('loading')
const showDraftDialog = ref(false)
const draftTime = ref('')

onMounted(() => {
  const formId = route.params.formId as string
  const form = listStore.getById(formId)
  if (!form) { loadState.value = 'notfound'; return }
  schema.value = form
  if (form.status === 'draft') { loadState.value = 'draft'; return }
  if (form.status === 'closed') { loadState.value = 'closed'; return }

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
}

const visibleComponents = computed(() => schema.value?.components.filter((c) => !c.hidden) ?? [])

function isSelectType(t: string) {
  return ['chooser', 'multi-chooser', 'selection', 'cascader', 'tree', 'user-tree', 'org-tree', 'region'].includes(t)
}

function restoreDraft() {
  showDraftDialog.value = false
  const form = schema.value
  if (!form) return
  const draft = subStore.loadDraft(form.id)
  if (draft) Object.assign(formData, draft.data)
  form.components.forEach((c) => { if (c.field && !(c.field in formData)) formData[c.field] = c.defaultValue ?? '' })
  loadState.value = 'ready'
}

function discardDraft() {
  showDraftDialog.value = false
  const form = schema.value
  if (form) { subStore.clearDraft(form.id); initForm(form) }
}

function handleSaveDraft() {
  if (!schema.value) return
  subStore.saveDraft(schema.value.id, { ...formData })
  ElMessage.success('已暂存')
}

async function handleSubmit() {
  if (!schema.value) return

  let hasError = false
  for (const c of visibleComponents.value) {
    const err = validate(formData[c.field], { required: c.required, ...c.props as Record<string, unknown> })
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
  if (ok) { subStore.clearDraft(schema.value.id); loadState.value = 'submitted' }
  else ElMessage.error('提交失败，请重试')
}

function resetForm() {
  loadState.value = 'ready'
  if (schema.value) initForm(schema.value)
}
</script>

<style scoped>
.fill-page { min-height: 100vh; background: #F8F7F5; display: flex; justify-content: center; padding: 24px 16px; }
.fill-center { max-width: 720px; width: 100%; display: flex; align-items: center; justify-content: center; min-height: 60vh; }
.fill-success { flex-direction: column; text-align: center; gap: 16px; }
.success-icon { width: 72px; height: 72px; background: #5B7B4A; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto; }
.success-actions { display: flex; gap: 12px; margin-top: 16px; }
.draft-dialog { text-align: center; display: flex; flex-direction: column; gap: 12px; }
.draft-time { color: #9C9790; font-size: 13px; }
.fill-form { max-width: 720px; width: 100%; }
.form-card { background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
.form-title { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
.form-desc { color: #6B6560; font-size: 14px; margin-bottom: 24px; }
.fields { display: flex; flex-direction: column; gap: 20px; }
.field-item { display: flex; flex-direction: column; gap: 4px; }
.field-label { font-size: 13px; font-weight: 500; }
.required { color: #B54A3A; }
.field-input :deep(.el-input__wrapper), .field-input :deep(.el-select__wrapper) { border-radius: 8px; }
.field-error { color: #B54A3A; font-size: 12px; }
.form-actions { display: flex; gap: 12px; margin-top: 32px; justify-content: flex-end; }
</style>
