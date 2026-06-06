import { watch, type Ref } from 'vue'
import type { ComponentSchema } from '@/types'

export function useTrigger(components: Ref<ComponentSchema[]>) {
  function evaluate(sourceField: string, sourceValue: string) {
    const rules = components.value.find(c => c.field === sourceField)?.triggerRules ?? []
    const active: typeof rules = []
    for (const rule of rules) {
      const match = rule.sourceValue === sourceValue
      applyRule(rule, match)
      if (match) active.push(rule)
    }
    for (const rule of active) {
      applyRule(rule, true)
    }
  }

  function applyRule(rule: { targetField: string; action: string }, active: boolean) {
    const target = components.value.find(c => c.field === rule.targetField)
    if (!target) return
    switch (rule.action) {
      case 'show': target.hidden = !active; break
      case 'hide': target.hidden = active; break
      case 'require': target.required = active; break
      case 'optional': target.required = !active; break
      case 'enable': target.editable = active; break
      case 'disable': target.editable = !active; break
    }
  }

  return { evaluate }
}
