import { describe, it, expect } from 'vitest'
import { serializeFormData, deserializeFormData } from '@/utils/serialize'
describe('serialize', () => {
  it('serializes Date', () => { const d = new Date('2025-06-01'); const r = serializeFormData({ date: d }); expect(r.date).toBe('2025-06-01T00:00:00.000Z') })
  it('deserializes ISO string to Date', () => { const r = deserializeFormData({ date: '2025-06-01T00:00:00.000Z' }); expect(r.date).toBeInstanceOf(Date) })
  it('passes through strings', () => { expect(serializeFormData({ a: 'hello' }).a).toBe('hello') })
})
