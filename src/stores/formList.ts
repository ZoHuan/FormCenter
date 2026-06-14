import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FormSchema } from '@/types'
import { getItem, setItem, removeItem } from '@/utils/storage'
import { nanoid } from 'nanoid'
import { DECOR_TYPES } from '@/registry'

export const useFormListStore = defineStore('formList', () => {
  const forms = ref<FormSchema[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const keyword = ref('')

  const filteredForms = computed(() =>
    keyword.value
      ? forms.value.filter((f) => f.title.toLowerCase().includes(keyword.value.toLowerCase()))
      : forms.value,
  )

  function init() {
    loading.value = true
    error.value = null
    try {
      forms.value = getItem<FormSchema[]>('schemas') ?? []
      let hasFix = false
      forms.value.forEach((f) => {
        f.components?.forEach((c) => {
          if (!c.field && !(DECOR_TYPES as readonly string[]).includes(c.type)) {
            c.field = `${c.type}_${c.id.slice(0, 8)}`
            hasFix = true
          }
          if ((c.type === 'table' || c.type === 'cross-table') && c.props) {
            const cols = (c.props as Record<string, unknown>).columns as Array<Record<string, unknown>>
            if (cols) {
              cols.forEach((col, i) => {
                if (!col.field) {
                  col.field = `col_${i + 1}`
                  hasFix = true
                }
              })
            }
          }
        })
      })
      if (hasFix) save()
    } catch (e) {
      error.value = '加载失败'
      forms.value = []
    } finally {
      loading.value = false
    }
  }

  function getById(id: string): FormSchema | undefined {
    return forms.value.find((f) => f.id === id)
  }

  function create(title: string): FormSchema {
    const now = Date.now()
    const schema: FormSchema = {
      id: nanoid(),
      title,
      description: '',
      status: 'draft',
      components: [],
      version: 1,
      createdAt: now,
      updatedAt: now,
    }
    forms.value.push(schema)
    save()
    return schema
  }

  function update(id: string, patch: Partial<FormSchema>) {
    const idx = forms.value.findIndex((f) => f.id === id)
    if (idx === -1) return
    forms.value[idx] = { ...forms.value[idx], ...patch, updatedAt: Date.now() }
    save()
  }

  function updateStatus(id: string, status: FormSchema['status']) {
    update(id, { status })
  }

  function remove(id: string) {
    forms.value = forms.value.filter((f) => f.id !== id)
    save()
    removeItem(`submissions_${id}`)
    removeItem(`drafts_${id}`)
  }

  function save() {
    setItem('schemas', forms.value)
  }

  return { forms, loading, error, keyword, filteredForms, init, getById, create, update, updateStatus, remove, save }
})
