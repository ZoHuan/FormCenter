import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFormListStore } from '@/stores/formList'
import { useFormDesignerStore } from '@/stores/formDesigner'

describe('formList store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })
  it('init with empty', () => {
    const s = useFormListStore()
    s.init()
    expect(s.forms).toEqual([])
  })
  it('create form', () => {
    const s = useFormListStore()
    s.init()
    const f = s.create('测试')
    expect(f.title).toBe('测试')
    expect(s.forms.length).toBe(1)
  })
  it('getById returns created form', () => {
    const s = useFormListStore()
    s.init()
    const f = s.create('测试')
    expect(s.getById(f.id)?.title).toBe('测试')
  })
  it('getById returns undefined for missing', () => {
    const s = useFormListStore()
    s.init()
    expect(s.getById('nope')).toBeUndefined()
  })
  it('update form title', () => {
    const s = useFormListStore()
    s.init()
    const f = s.create('原名')
    s.update(f.id, { title: '新名' })
    expect(s.getById(f.id)?.title).toBe('新名')
  })
  it('updateStatus changes status', () => {
    const s = useFormListStore()
    s.init()
    const f = s.create('测试')
    s.updateStatus(f.id, 'open')
    expect(s.getById(f.id)?.status).toBe('open')
  })
  it('remove form', () => {
    const s = useFormListStore()
    s.init()
    const f = s.create('测试')
    s.remove(f.id)
    expect(s.forms.length).toBe(0)
  })
  it('search filters', () => {
    const s = useFormListStore()
    s.init()
    s.create('请假')
    s.create('活动')
    s.keyword = '请假'
    expect(s.filteredForms.length).toBe(1)
  })
  it('search is case-insensitive', () => {
    const s = useFormListStore()
    s.init()
    s.create('Leave')
    s.keyword = 'leave'
    expect(s.filteredForms.length).toBe(1)
  })
})

describe('formDesigner store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })
  it('reset to empty', () => {
    const s = useFormDesignerStore()
    s.reset()
    expect(s.components.length).toBe(0)
  })
  it('add input component', () => {
    const s = useFormDesignerStore()
    s.reset()
    s.addComponent('input')
    expect(s.components.length).toBe(1)
    expect(s.components[0].type).toBe('input')
  })
  it('select component', () => {
    const s = useFormDesignerStore()
    s.reset()
    s.addComponent('input')
    s.selectComponent(s.components[0].id)
    expect(s.selectedId).toBe(s.components[0].id)
  })
  it('selectedComponent returns selected', () => {
    const s = useFormDesignerStore()
    s.reset()
    s.addComponent('input')
    const id = s.components[0].id
    s.selectComponent(id)
    expect(s.selectedComponent?.id).toBe(id)
  })
  it('removeComponent deletes and clears selection', () => {
    const s = useFormDesignerStore()
    s.reset()
    s.addComponent('input')
    const id = s.components[0].id
    s.selectComponent(id)
    s.removeComponent(id)
    expect(s.components.length).toBe(0)
    expect(s.selectedId).toBeNull()
  })
  it('isDirty after addComponent', () => {
    const s = useFormDesignerStore()
    s.reset()
    s.addComponent('input')
    expect(s.isDirty).toBe(true)
  })
  it('save persists to localStorage', () => {
    const s = useFormDesignerStore()
    s.reset()
    s.schema!.title = '测试表单'
    const id = s.save()
    expect(id).toBeTruthy()
    expect(s.isDirty).toBe(false)
  })
})
