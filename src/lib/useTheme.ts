import { useEffect } from 'react'
import type { Level } from '../types'

export function useTheme(level: Level | null) {
  useEffect(() => {
    const body = document.body
    if (!level) {
      body.removeAttribute('data-theme')
      return
    }
    body.setAttribute('data-theme', level)
    return () => {
      body.removeAttribute('data-theme')
    }
  }, [level])
}

