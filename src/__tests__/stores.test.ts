import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFormListStore } from '@/stores/formList'

describe('formList store', () => {
  beforeEach(() => { setActivePinia(createPinia()); localStorage.clear() })
  it('init with empty', () => { const s = useFormListStore(); s.init(); expect(s.forms).toEqual([]) })
  it('create form', () => { const s = useFormListStore(); s.init(); const f = s.create('测试'); expect(f.title).toBe('测试'); expect(s.forms.length).toBe(1) })
  it('remove form', () => { const s = useFormListStore(); s.init(); const f = s.create('测试'); s.remove(f.id); expect(s.forms.length).toBe(0) })
  it('search filters', () => { const s = useFormListStore(); s.init(); s.create('请假'); s.create('活动'); s.keyword = '请假'; expect(s.filteredForms.length).toBe(1) })
})
