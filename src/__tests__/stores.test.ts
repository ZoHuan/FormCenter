import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFormListStore } from '@/stores/formList'
import { useFormDesignerStore } from '@/stores/formDesigner'

describe('formList store', () => {
  beforeEach(() => { setActivePinia(createPinia()); localStorage.clear() })
  it('init with empty', () => { const s = useFormListStore(); s.init(); expect(s.forms).toEqual([]) })
  it('create form', () => { const s = useFormListStore(); s.init(); const f = s.create('测试'); expect(f.title).toBe('测试'); expect(s.forms.length).toBe(1) })
  it('remove form', () => { const s = useFormListStore(); s.init(); const f = s.create('测试'); s.remove(f.id); expect(s.forms.length).toBe(0) })
  it('search filters', () => { const s = useFormListStore(); s.init(); s.create('请假'); s.create('活动'); s.keyword = '请假'; expect(s.filteredForms.length).toBe(1) })
})

describe('formDesigner store', () => {
  beforeEach(() => { setActivePinia(createPinia()); localStorage.clear() })
  it('reset to empty', () => { const s = useFormDesignerStore(); s.reset(); expect(s.components.length).toBe(0) })
  it('add component', () => { const s = useFormDesignerStore(); s.reset(); s.addComponent('input'); expect(s.components.length).toBe(1); expect(s.components[0].type).toBe('input') })
  it('select component', () => { const s = useFormDesignerStore(); s.reset(); s.addComponent('input'); s.selectComponent(s.components[0].id); expect(s.selectedId).toBe(s.components[0].id) })
  it('remove component', () => { const s = useFormDesignerStore(); s.reset(); s.addComponent('input'); const id = s.components[0].id; s.removeComponent(id); expect(s.components.length).toBe(0) })
  it('save to localStorage', () => { const s = useFormDesignerStore(); s.reset(); s.schema!.title = '测试表单'; s.save(); expect(s.schema!.id).toBeTruthy() })
})
