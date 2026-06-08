import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Submission, FormDraft } from '@/types'
import { getItem, setItem, removeItem } from '@/utils/storage'
import { nanoid } from 'nanoid'

export const useFormSubmissionStore = defineStore('formSubmission', () => {
  const submissions = ref<Submission[]>([])
  const loading = ref(false)
  const page = ref(1)
  const pageSize = ref(10)

  function init(formId: string) {
    loading.value = true
    try {
      submissions.value = getItem<Submission[]>(`submissions_${formId}`) ?? []
    } finally {
      loading.value = false
    }
  }

  function submit(formId: string, data: Record<string, unknown>): boolean {
    const submission: Submission = {
      id: nanoid(),
      formId,
      data,
      submittedAt: Date.now(),
    }
    const raw = getItem<Submission[]>(`submissions_${formId}`)
    const all = raw ?? []
    if (!raw && localStorage.getItem(`formcenter_submissions_${formId}`)) {
      console.warn('[submit] 已有提交数据损坏，将覆盖，formId:', formId)
    }
    all.push(submission)
    if (!setItem(`submissions_${formId}`, all)) return false
    submissions.value = all
    return true
  }

  function loadDraft(formId: string): FormDraft | null {
    return getItem<FormDraft>(`drafts_${formId}`)
  }

  function saveDraft(formId: string, data: Record<string, unknown>) {
    setItem(`drafts_${formId}`, { formId, data, savedAt: Date.now() })
  }

  function clearDraft(formId: string) {
    removeItem(`drafts_${formId}`)
  }

  return { submissions, loading, page, pageSize, init, submit, loadDraft, saveDraft, clearDraft }
})
