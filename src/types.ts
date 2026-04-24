export type Level = 'primary' | 'secondary' | 'high'

export const LEVELS: Array<{
  id: Level
  label: string
  tagline: string
}> = [
  { id: 'primary', label: 'Primary', tagline: 'Playful brain-boosters' },
  { id: 'secondary', label: 'Secondary', tagline: 'Arcade speed + strategy' },
  { id: 'high', label: 'High School', tagline: 'Deep thinking, clean logic' },
]

export function isLevel(value: string | undefined): value is Level {
  return value === 'primary' || value === 'secondary' || value === 'high'
}

