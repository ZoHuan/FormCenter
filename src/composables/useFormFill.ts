import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFormListStore } from '@/stores/formList'
import { useFormSubmissionStore } from '@/stores/formSubmission'
import { useDraft } from '@/composables/useDraft'
import { useValidation } from '@/composables/useValidation'
import { useTrigger } from '@/composables/useTrigger'
import type { FormSchema, ComponentSchema } from '@/types'

export function useFormFill() {
  const route = useRoute()
  const listStore = useFormListStore()
  const subStore = useFormSubmissionStore()

  const formId = route.params.formId as string
  const schema = ref<FormSchema | null>(null)
  const formData = reactive<Record<string, unknown>>({})
  const fieldErrors = reactive<Record<string, string>>({})
  const submitting = ref(false)
  const loadState = ref<'loading' | 'draft' | 'closed' | 'notfound' | 'ready' | 'submitted'>('loading')
  const showDraftDialog = ref(false)
  const draftTime = ref('')
  const isPreview = computed(() => route.query.preview === '1')

  const { startAutoSave, stopAutoSave, save: saveDraft, clear: clearDraft, hasDraft } = useDraft(formId)
  const { validateAll, scrollToFirst } = useValidation(ref([]))
  const { evaluate: evaluateTrigger } = useTrigger(ref([]))

  const visibleComponents = computed(() =>
    (schema.value?.components ?? []).filter((c: ComponentSchema) => !c.hidden)
  )

  function init() {
    const form = listStore.getById(formId)
    if (!form) { loadState.value = 'notfound'; return }
    if (!isPreview.value) {
      if (form.status === 'draft') { loadState.value = 'draft'; return }
      if (form.status === 'closed') { loadState.value = 'closed'; return }
    }
    schema.value = form
    if (!isPreview.value && hasDraft.value) {
      const draft = subStore.loadDraft(formId)
      if (draft) {
        showDraftDialog.value = true
        draftTime.value = new Date(draft.savedAt).toLocaleString('zh-CN')
        return
      }
    }
    initForm(form)
  }

  function initForm(form: FormSchema) {
    form.components.forEach((c) => { if (c.field) formData[c.field] = c.defaultValue ?? '' })
    startAutoSave(() => ({ ...formData }))
    loadState.value = 'ready'
  }

  function restoreDraft() {
    showDraftDialog.value = false
    if (!schema.value) return
    const draft = subStore.loadDraft(formId)
    if (draft) Object.assign(formData, draft.data)
    startAutoSave(() => ({ ...formData }))
    loadState.value = 'ready'
  }

  function discardDraft() {
    showDraftDialog.value = false
    clearDraft()
    if (schema.value) initForm(schema.value)
  }

  function handleSaveDraft() {
    saveDraft({ ...formData })
    ElMessage.success('已暂存')
  }

  async function handleSubmit() {
    if (!schema.value) return
    const errors = validateAll(formData)
    Object.assign(fieldErrors, errors)
    if (Object.keys(errors).length > 0) { scrollToFirst(errors); return }
    await ElMessageBox.confirm('提交后不可修改，是否确认？', '确认提交', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
    submitting.value = true
    const ok = subStore.submit(formId, { ...formData })
    submitting.value = false
    if (ok) { clearDraft(); stopAutoSave(); loadState.value = 'submitted' }
    else ElMessage.error('提交失败，请重试')
  }

  function resetForm() {
    loadState.value = 'ready'
    if (schema.value) initForm(schema.value)
  }

  return {
    schema,
    formData,
    fieldErrors,
    submitting,
    loadState,
    showDraftDialog,
    draftTime,
    isPreview,
    visibleComponents,
    init,
    restoreDraft,
    discardDraft,
    handleSaveDraft,
    handleSubmit,
    resetForm,
  }
}
