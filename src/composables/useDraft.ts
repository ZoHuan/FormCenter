import { ref, onUnmounted } from 'vue'
import { useFormSubmissionStore } from '@/stores/formSubmission'

export function useDraft(formId: string) {
  const store = useFormSubmissionStore()
  const hasDraft = ref(!!store.loadDraft(formId))
  let timer: ReturnType<typeof setInterval> | null = null

  function startAutoSave(getData: () => Record<string, unknown>) {
    timer = setInterval(() => {
      store.saveDraft(formId, getData())
    }, 60000)
  }

  function stopAutoSave() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function save(data: Record<string, unknown>) {
    store.saveDraft(formId, data)
  }

  function clear() {
    store.clearDraft(formId)
    hasDraft.value = false
  }

  onUnmounted(stopAutoSave)

  return { hasDraft, startAutoSave, stopAutoSave, save, clear }
}
