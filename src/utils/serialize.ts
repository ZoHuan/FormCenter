export function serializeFormData(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      result[key] = value.toISOString()
    } else if (value instanceof File || value instanceof Blob) {
      result[key] = null
    } else if (value instanceof HTMLCanvasElement) {
      result[key] = value.toDataURL('image/png')
    } else if (typeof value === 'object' && value !== null) {
      result[key] = serializeFormData(value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }
  return result
}

export function deserializeFormData(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      result[key] = new Date(value)
    } else if (typeof value === 'object' && value !== null) {
      result[key] = deserializeFormData(value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }
  return result
}
