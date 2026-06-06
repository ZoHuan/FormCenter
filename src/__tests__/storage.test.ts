import { describe, it, expect } from 'vitest'
import { validate } from '@/utils/validators'
describe('validators', () => {
  it('required', () => { expect(validate('', { required: true })).toBe('此项为必填项'); expect(validate('a', { required: true })).toBeNull() })
  it('phone', () => { expect(validate('13800138000', { format: 'phone' })).toBeNull(); expect(validate('123', { format: 'phone' })).toBeTruthy() })
  it('maxLength', () => { expect(validate('abc', { maxLength: 2 })).toBeTruthy(); expect(validate('ab', { maxLength: 2 })).toBeNull() })
})
