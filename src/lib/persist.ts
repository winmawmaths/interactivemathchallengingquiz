export function readLocal<T extends string>(key: string, fallback: T): T {
  try {
    const v = window.localStorage.getItem(key)
    return (v as T) || fallback
  } catch {
    return fallback
  }
}

export function writeLocal(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

