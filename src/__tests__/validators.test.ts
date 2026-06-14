import { describe, it, expect } from 'vitest'
import { validate } from '@/utils/validators'

describe('validate', () => {
  it('returns null for valid value', () => {
    expect(validate('hello', {})).toBeNull()
  })
  it('returns error for empty required', () => {
    expect(validate('', { required: true })).toBe('此项为必填项')
  })
  it('returns error for whitespace-only required', () => {
    expect(validate('   ', { required: true })).toBe('此项为必填项')
  })
  it('returns null for non-required empty', () => {
    expect(validate('', { required: false })).toBeNull()
  })
  it('validates phone format', () => {
    expect(validate('13800138000', { format: 'phone' })).toBeNull()
    expect(validate('abc', { format: 'phone' })).toContain('手机号')
  })
  it('validates email format', () => {
    expect(validate('a@b.com', { format: 'email' })).toBeNull()
    expect(validate('abc', { format: 'email' })).toContain('邮箱')
  })
  it('validates idCard format', () => {
    expect(validate('110101199003074518', { format: 'idCard' })).toBeNull()
    expect(validate('abc', { format: 'idCard' })).toContain('身份证')
  })
  it('returns null for none format', () => {
    expect(validate('anything', { format: 'none' })).toBeNull()
  })
  it('validates maxLength', () => {
    expect(validate('abcde', { maxLength: 3 })).toContain('最多输入')
  })
  it('returns null when within maxLength', () => {
    expect(validate('ab', { maxLength: 3 })).toBeNull()
  })
  it('validates numeric min/max', () => {
    expect(validate('5', { min: 0, max: 10 })).toBeNull()
    expect(validate('15', { min: 0, max: 10 })).toContain('最大值')
  })
  it('validates numeric min', () => {
    expect(validate('-1', { min: 0 })).toContain('最小值')
  })
  it('validates decimal places', () => {
    expect(validate('3.14', { decimalPlaces: 1 })).toContain('小数')
  })
  it('returns null for valid decimal', () => {
    expect(validate('3.1', { decimalPlaces: 2 })).toBeNull()
  })
})
