import { type Ref } from 'vue'
import type { ComponentSchema } from '@/types'
import { validate as validateField } from '@/utils/validators'

export function useValidation(components: Ref<ComponentSchema[]>) {
  function validateAll(formData: Record<string, unknown>): Record<string, string> {
    const errors: Record<string, string> = {}
    for (const c of components.value) {
      if (c.hidden || !c.field) continue
      const rules = { required: c.required, ...(c.props as Record<string, unknown>) }
      const err = validateField(formData[c.field], rules)
      if (err) errors[c.field] = err
    }
    return errors
  }

  function scrollToFirst(errors: Record<string, string>) {
    const first = Object.keys(errors)[0]
    if (first) document.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return { validateAll, scrollToFirst }
}
