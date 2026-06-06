const patterns = {
  phone: /^1[3-9]\d{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  idCard: /^\d{17}[\dX]$/,
}

export function validate(value: unknown, rules: { required?: boolean; format?: string; min?: number; max?: number; maxLength?: number; minSize?: number; maxSize?: number; decimalPlaces?: number; customRegex?: string }): string | null {
  const val = typeof value === 'string' ? value.trim() : ''

  if (rules.required && !val) return '此项为必填项'

  if (rules.format && rules.format !== 'none' && val) {
    const pattern = rules.customRegex ? new RegExp(rules.customRegex) : patterns[rules.format as keyof typeof patterns]
    if (pattern && !pattern.test(val)) {
      const labels: Record<string, string> = { phone: '手机号', email: '邮箱', idCard: '身份证', custom: '自定义' }
      return `请输入正确的${labels[rules.format] ?? '格式'}`
    }
  }

  if (rules.maxLength && val.length > rules.maxLength) {
    return `最多输入${rules.maxLength}个字符`
  }

  const num = Number(val)
  if (!isNaN(num)) {
    if (rules.min !== undefined && num < rules.min) return `最小值为${rules.min}`
    if (rules.max !== undefined && num > rules.max) return `最大值为${rules.max}`
    if (rules.decimalPlaces !== undefined) {
      const parts = val.split('.')
      if (parts[1] && parts[1].length > rules.decimalPlaces) return `最多${rules.decimalPlaces}位小数`
    }
  }

  return null
}
