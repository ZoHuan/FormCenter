export interface FormSchema {
  id: string
  title: string
  description: string
  status: 'draft' | 'open' | 'closed'
  components: import('./component').ComponentSchema[]
  version: number
  createdAt: number
  updatedAt: number
}

export interface Submission {
  id: string
  formId: string
  data: Record<string, unknown>
  submittedAt: number
}

export interface FormDraft {
  formId: string
  data: Record<string, unknown>
  savedAt: number
}
