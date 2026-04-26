export type Level = 'primary' | 'secondary' | 'high'

export type Curriculum =
  | 'thai'
  | 'myanmar'
  | 'singapore'
  | 'cambridge'
  | 'ib'
  | 'edexcel'

export const CURRICULUMS: Array<{ id: Curriculum; label: string; short: string }> = [
  { id: 'thai', label: 'Thai National Curriculum', short: 'Thai' },
  { id: 'myanmar', label: 'Myanmar National Curriculum', short: 'Myanmar' },
  { id: 'singapore', label: 'Singapore National Curriculum', short: 'SG' },
  { id: 'cambridge', label: 'Cambridge Curriculum', short: 'Cambridge' },
  { id: 'ib', label: 'IB Curriculum', short: 'IB' },
  { id: 'edexcel', label: 'Pearson Edexcel Curriculum', short: 'Edexcel' },
]

export function isCurriculum(v: string | null | undefined): v is Curriculum {
  return (
    v === 'thai' ||
    v === 'myanmar' ||
    v === 'singapore' ||
    v === 'cambridge' ||
    v === 'ib' ||
    v === 'edexcel'
  )
}

export type Grade =
  | 'P1'
  | 'P2'
  | 'P3'
  | 'P4'
  | 'P5'
  | 'P6'
  | 'S1'
  | 'S2'
  | 'S3'
  | 'S4'
  | 'H1'
  | 'H2'
  | 'H3'

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

export const GRADES_BY_LEVEL: Record<Level, Grade[]> = {
  primary: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  secondary: ['S1', 'S2', 'S3', 'S4'],
  high: ['H1', 'H2', 'H3'],
}

export function gradeLabel(g: Grade) {
  if (g.startsWith('P')) return `Primary ${g.slice(1)}`
  if (g.startsWith('S')) return `Secondary ${g.slice(1)}`
  return `High ${g.slice(1)}`
}

export function isGrade(value: string | undefined): value is Grade {
  return (
    value === 'P1' ||
    value === 'P2' ||
    value === 'P3' ||
    value === 'P4' ||
    value === 'P5' ||
    value === 'P6' ||
    value === 'S1' ||
    value === 'S2' ||
    value === 'S3' ||
    value === 'S4' ||
    value === 'H1' ||
    value === 'H2' ||
    value === 'H3'
  )
}

export function gradeIndexWithinLevel(level: Level, grade: Grade) {
  const list = GRADES_BY_LEVEL[level]
  const idx = list.indexOf(grade)
  return idx === -1 ? 0 : idx
}

