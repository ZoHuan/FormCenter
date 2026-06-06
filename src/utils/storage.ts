const PREFIX = 'formcenter_'
const QUOTA_WARN = 4.5 * 1024 * 1024

function getTotalSize(): number {
  let size = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(PREFIX)) {
      size += (localStorage.getItem(key) ?? '').length * 2
    }
  }
  return size
}

export function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setItem<T>(key: string, value: T): boolean {
  try {
    const json = JSON.stringify(value)
    if (getTotalSize() + json.length * 2 > QUOTA_WARN) {
      console.warn('Storage near quota')
    }
    localStorage.setItem(PREFIX + key, json)
    return true
  } catch {
    return false
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
}

export function getAllKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(PREFIX)) {
      keys.push(key.slice(PREFIX.length))
    }
  }
  return keys
}
