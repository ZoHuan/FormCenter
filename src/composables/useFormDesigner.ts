import { ref, computed, watch } from 'vue'
import { useFormDesignerStore } from '@/stores/formDesigner'
import type { ComponentType } from '@/types'

export function useFormDesigner() {
  const store = useFormDesignerStore()

  const selectedComponent = computed(() => store.selectedComponent)
  const components = computed(() => store.components)
  const isDirty = computed(() => store.isDirty)

  function selectComponent(id: string | null) {
    store.selectComponent(id)
  }

  function removeComponent(id: string) {
    store.removeComponent(id)
  }

  function addComponent(type: ComponentType) {
    store.addComponent(type)
  }

  function moveComponent(fromIdx: number, toIdx: number) {
    store.moveComponent(fromIdx, toIdx)
  }

  function save(): string {
    return store.save()
  }

  function load(id: string) {
    store.load(id)
  }

  function reset() {
    store.reset()
  }

  return {
    selectedComponent,
    components,
    isDirty,
    selectComponent,
    removeComponent,
    addComponent,
    moveComponent,
    save,
    load,
    reset,
  }
}
