import { describe, it, expect } from 'vitest'
import { serializeFormData, deserializeFormData } from '@/utils/serialize'

describe('serializeFormData', () => {
  it('passes through primitives', () => { expect(serializeFormData({ a: 1, b: 'hello' })).toEqual({ a: 1, b: 'hello' }) })
  it('converts Date to ISO string', () => { const d = new Date('2025-06-01T00:00:00Z'); const r = serializeFormData({ date: d }); expect(r.date).toBe('2025-06-01T00:00:00.000Z') })
  it('converts nested objects', () => { expect(serializeFormData({ a: { b: 'val' } })).toEqual({ a: { b: 'val' } }) })
  it('handles null', () => { expect(serializeFormData({ a: null })).toEqual({ a: null }) })
})

describe('deserializeFormData', () => {
  it('converts ISO string to Date', () => { const r = deserializeFormData({ date: '2025-06-01T00:00:00.000Z' }); expect(r.date).toBeInstanceOf(Date) })
  it('passes through non-ISO strings', () => { expect(deserializeFormData({ a: 'hello' })).toEqual({ a: 'hello' }) })
  it('passes through numbers', () => { expect(deserializeFormData({ a: 42 })).toEqual({ a: 42 }) })
  it('handles nested objects', () => { const r = deserializeFormData({ obj: { date: '2025-01-01T00:00:00.000Z' } }); expect(r.obj).toBeDefined() })
})
