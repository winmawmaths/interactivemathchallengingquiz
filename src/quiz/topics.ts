import type { Curriculum, Grade, Level } from '../types'
import { GRADES_BY_LEVEL } from '../types'

export type TopicId =
  // Primary
  | 'p-number'
  | 'p-addsub'
  | 'p-muldiv'
  | 'p-fracdec'
  // Secondary
  | 's-integers'
  | 's-ratiopercent'
  | 's-linear'
  | 's-geometry'
  // High
  | 'h-functions'
  | 'h-quadratics'
  | 'h-indices'
  | 'h-trig'

export type TopicPack = {
  id: TopicId
  level: Level
  label: string
  blurb: string
  grades: Grade[]
  curriculums: Curriculum[]
}

const PRIMARY_GRADES = GRADES_BY_LEVEL.primary
const SECONDARY_GRADES = GRADES_BY_LEVEL.secondary
const HIGH_GRADES = GRADES_BY_LEVEL.high

export const TOPIC_PACKS: TopicPack[] = [
  {
    id: 'p-number',
    level: 'primary',
    label: 'Number Sense',
    blurb: 'Place value, comparisons, and mental strategies.',
    grades: PRIMARY_GRADES,
    curriculums: ['thai', 'myanmar', 'singapore', 'cambridge', 'ib', 'edexcel'],
  },
  {
    id: 'p-addsub',
    level: 'primary',
    label: 'Addition & Subtraction',
    blurb: 'Fluency with sums, differences, and regrouping.',
    grades: PRIMARY_GRADES,
    curriculums: ['thai', 'myanmar', 'singapore', 'cambridge', 'ib', 'edexcel'],
  },
  {
    id: 'p-muldiv',
    level: 'primary',
    label: 'Multiplication & Division',
    blurb: 'Times tables, factors, and exact division.',
    grades: PRIMARY_GRADES,
    curriculums: ['thai', 'myanmar', 'singapore', 'cambridge', 'ib', 'edexcel'],
  },
  {
    id: 'p-fracdec',
    level: 'primary',
    label: 'Fractions & Decimals',
    blurb: 'Equivalences and simple conversions.',
    grades: ['P3', 'P4', 'P5', 'P6'],
    curriculums: ['thai', 'myanmar', 'singapore', 'cambridge', 'ib', 'edexcel'],
  },

  {
    id: 's-integers',
    level: 'secondary',
    label: 'Integers & Operations',
    blurb: 'Signs, order of operations, and quick evaluation.',
    grades: SECONDARY_GRADES,
    curriculums: ['thai', 'myanmar', 'singapore', 'cambridge', 'ib', 'edexcel'],
  },
  {
    id: 's-ratiopercent',
    level: 'secondary',
    label: 'Ratio, Rate & Percent',
    blurb: 'Percent of a number, ratios to decimals, rates.',
    grades: SECONDARY_GRADES,
    curriculums: ['thai', 'myanmar', 'singapore', 'cambridge', 'ib', 'edexcel'],
  },
  {
    id: 's-linear',
    level: 'secondary',
    label: 'Linear Algebra',
    blurb: 'Solve, simplify, and evaluate expressions.',
    grades: SECONDARY_GRADES,
    curriculums: ['thai', 'myanmar', 'singapore', 'cambridge', 'ib', 'edexcel'],
  },
  {
    id: 's-geometry',
    level: 'secondary',
    label: 'Geometry Basics',
    blurb: 'Angles, perimeter/area, and shape reasoning.',
    grades: ['S1', 'S2', 'S3'],
    curriculums: ['thai', 'myanmar', 'singapore', 'cambridge', 'ib', 'edexcel'],
  },

  {
    id: 'h-functions',
    level: 'high',
    label: 'Functions',
    blurb: 'Evaluate and interpret functions.',
    grades: HIGH_GRADES,
    curriculums: ['thai', 'myanmar', 'singapore', 'cambridge', 'ib', 'edexcel'],
  },
  {
    id: 'h-quadratics',
    level: 'high',
    label: 'Quadratics',
    blurb: 'Factorise and evaluate quadratics.',
    grades: HIGH_GRADES,
    curriculums: ['thai', 'myanmar', 'singapore', 'cambridge', 'ib', 'edexcel'],
  },
  {
    id: 'h-indices',
    level: 'high',
    label: 'Indices & Logs',
    blurb: 'Exponent rules and simple logs.',
    grades: HIGH_GRADES,
    curriculums: ['thai', 'myanmar', 'singapore', 'cambridge', 'ib', 'edexcel'],
  },
  {
    id: 'h-trig',
    level: 'high',
    label: 'Trigonometry',
    blurb: 'Identities and quick values.',
    grades: ['H2', 'H3'],
    curriculums: ['thai', 'myanmar', 'singapore', 'cambridge', 'ib', 'edexcel'],
  },
]

export function topicsFor(level: Level, grade: Grade, curriculum: Curriculum): TopicPack[] {
  return TOPIC_PACKS.filter(
    (t) => t.level === level && t.grades.includes(grade) && t.curriculums.includes(curriculum),
  )
}

export function isTopicId(value: string | null | undefined): value is TopicId {
  return TOPIC_PACKS.some((t) => t.id === value)
}

