import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ComponentSchema, ComponentType, FormSchema } from '@/types'
import { getItem, setItem } from '@/utils/storage'
import { createDefaultComponent } from '@/registry'
import { nanoid } from 'nanoid'

export const useFormDesignerStore = defineStore('formDesigner', () => {
  const schema = ref<FormSchema | null>(null)
  const components = ref<ComponentSchema[]>([])
  const selectedId = ref<string | null>(null)
  const isDirty = ref(false)

  const selectedComponent = computed(() =>
    selectedId.value ? (components.value.find((c) => c.id === selectedId.value) ?? null) : null,
  )

  function load(id: string) {
    const forms = getItem<FormSchema[]>('schemas') ?? []
    const found = forms.find((f) => f.id === id)
    if (found) {
      // 修复旧数据：给没有 field 的组件自动生成 field
      const decorTypes = ['title', 'subtitle', 'group-title', 'separator', 'point-out']
      found.components.forEach((c) => {
        if (!c.field && !decorTypes.includes(c.type)) {
          c.field = `${c.type}_${c.id.slice(0, 8)}`
        }
      })
      schema.value = found
      components.value = [...found.components]
      selectedId.value = null
      isDirty.value = false
    }
  }

  function reset() {
    const now = Date.now()
    schema.value = {
      id: '',
      title: '',
      description: '',
      status: 'draft',
      components: [],
      version: 1,
      createdAt: now,
      updatedAt: now,
    }
    components.value = []
    selectedId.value = null
    isDirty.value = false
  }

  function addComponent(type: ComponentType) {
    const comp = createDefaultComponent(type)
    components.value.push(comp)
    selectedId.value = comp.id
    isDirty.value = true
  }

  function removeComponent(id: string) {
    components.value = components.value.filter((c) => c.id !== id)
    if (selectedId.value === id) selectedId.value = null
    components.value.forEach((c) => {
      if (c.triggerRules) {
        c.triggerRules = c.triggerRules.filter((r) => r.targetField !== id)
      }
    })
    isDirty.value = true
  }

  function duplicateComponent(id: string) {
    const source = components.value.find((c) => c.id === id)
    if (!source) return
    const newComp: ComponentSchema = {
      ...JSON.parse(JSON.stringify(source)),
      id: nanoid(),
      field: source.field + '_copy',
      label: source.label + '(副本)',
    }
    const idx = components.value.findIndex((c) => c.id === id)
    components.value.splice(idx + 1, 0, newComp)
    selectedId.value = newComp.id
    isDirty.value = true
  }

  function updateComponent(id: string, patch: Partial<ComponentSchema>) {
    const idx = components.value.findIndex((c) => c.id === id)
    if (idx === -1) return
    components.value[idx] = { ...components.value[idx], ...patch }
    isDirty.value = true
  }

  function selectComponent(id: string | null) {
    selectedId.value = id
  }

  function moveComponent(fromIdx: number, toIdx: number) {
    const item = components.value.splice(fromIdx, 1)[0]
    if (item) components.value.splice(toIdx, 0, item)
    isDirty.value = true
  }

  function save(): string {
    if (!schema.value) return ''
    if (!schema.value.id) {
      schema.value.id = nanoid()
      schema.value.createdAt = Date.now()
      schema.value.version = 1
    } else {
      schema.value.version++
    }
    schema.value.components = [...components.value]
    schema.value.updatedAt = Date.now()

    const forms = getItem<FormSchema[]>('schemas') ?? []
    const idx = forms.findIndex((f) => f.id === schema.value!.id)
    if (idx >= 0) forms[idx] = schema.value
    else forms.push(schema.value)
    setItem('schemas', forms)
    isDirty.value = false
    return schema.value.id
  }

  return {
    schema,
    components,
    selectedId,
    isDirty,
    selectedComponent,
    load,
    reset,
    addComponent,
    removeComponent,
    updateComponent,
    selectComponent,
    moveComponent,
    save,
  }
})
