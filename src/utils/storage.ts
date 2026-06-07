const PREFIX = 'formcenter_'
const QUOTA_WARN = 4.5 * 1024 * 1024
const DB_NAME = 'FormCenterFiles'
const DB_VERSION = 1

function getTotalSize(): number {
  let size = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(PREFIX)) size += (localStorage.getItem(key) ?? '').length * 2
  }
  return size
}

export function getItem<T>(key: string): T | null {
  try { const raw = localStorage.getItem(PREFIX + key); return raw ? JSON.parse(raw) : null } catch { return null }
}

export function setItem<T>(key: string, value: T): boolean {
  try {
    const json = JSON.stringify(value)
    const size = getTotalSize() + json.length * 2
    if (size > QUOTA_WARN) {
      const pct = Math.round((size / (5 * 1024 * 1024)) * 100)
      console.warn(`Storage 已使用 ${pct}%，建议清理旧数据`)
      window.dispatchEvent(new CustomEvent('storage-quota', { detail: { size, pct } }))
    }
    localStorage.setItem(PREFIX + key, json); return true
  } catch { return false }
}

export function removeItem(key: string): void {
  try { localStorage.removeItem(PREFIX + key) } catch { /* ignore */ }
}

export function getAllKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(PREFIX)) keys.push(key.slice(PREFIX.length))
  }
  return keys
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => { req.result.createObjectStore('files') }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getFile(fileId: string): Promise<{ dataURL: string; createdAt: number } | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const req = db.transaction('files').objectStore('files').get(fileId)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

export async function setFile(fileId: string, dataURL: string): Promise<boolean> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const req = db.transaction('files', 'readwrite').objectStore('files').put({ dataURL, createdAt: Date.now() }, fileId)
      req.onsuccess = () => resolve(true)
      req.onerror = () => resolve(false)
    })
  } catch {
    return false
  }
}

export async function removeFile(fileId: string): Promise<void> {
  try {
    const db = await openDB()
    db.transaction('files', 'readwrite').objectStore('files').delete(fileId)
  } catch {
    // ignore
  }
}

export async function removeFiles(ids: string[]): Promise<void> {
  for (const id of ids) await removeFile(id)
}

export async function getFileSize(): Promise<number> {
  try {
    const estimate = await navigator.storage?.estimate()
    return estimate?.usage ?? 0
  } catch {
    return 0
  }
}