import type { Grade, Level } from '../types'

export type ActivityId = 'quickfire' | 'pickone' | 'matchpairs'

export type ActivityMeta = {
  id: ActivityId
  name: string
  blurb: string
  skillTags: string[]
}

export type QuestionBase = {
  id: string
  level: Level
  grade: Grade
  points: number
  prompt: string
}

export type InputQuestion = QuestionBase & {
  kind: 'input'
  answer: string
  hint?: string
}

export type McqQuestion = QuestionBase & {
  kind: 'mcq'
  choices: string[]
  answerIndex: number
  explain?: string
}

export type MatchPairsQuestion = QuestionBase & {
  kind: 'match'
  leftLabel?: string
  rightLabel?: string
  pairs: Array<{ left: string; right: string }>
}

export type Question = InputQuestion | McqQuestion | MatchPairsQuestion

export type QuizResult = {
  correct: number
  total: number
  points: number
  bestStreak: number
}

