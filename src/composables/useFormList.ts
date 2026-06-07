import { computed } from 'vue'
import { useFormListStore } from '@/stores/formList'
import { useFormSubmissionStore } from '@/stores/formSubmission'
import { copyToClipboard } from '@/utils/clipboard'
import type { FormSchema } from '@/types'

export function useFormList() {
  const store = useFormListStore()
  const subStore = useFormSubmissionStore()

  const forms = computed(() => store.filteredForms)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)

  function init() {
    store.init()
  }

  function search(keyword: string) {
    store.keyword = keyword
  }

  function create(title: string): FormSchema {
    return store.create(title)
  }

  function remove(id: string) {
    store.remove(id)
  }

  function updateStatus(id: string, status: FormSchema['status']) {
    store.updateStatus(id, status)
  }

  function getSubmissionCount(formId: string): number {
    subStore.init(formId)
    return subStore.submissions.length
  }

  async function copyLink(formId: string): Promise<boolean> {
    const url = `${window.location.origin}/fill/${formId}`
    return copyToClipboard(url)
  }

  return {
    forms,
    loading,
    error,
    init,
    search,
    create,
    remove,
    updateStatus,
    getSubmissionCount,
    copyLink,
  }
}
