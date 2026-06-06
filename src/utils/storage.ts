const DB_NAME = 'FormCenterFiles'
const DB_VERSION = 1

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