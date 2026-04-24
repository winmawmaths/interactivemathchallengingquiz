import type { ActivityMeta } from './quizTypes'

export const ACTIVITIES: ActivityMeta[] = [
  {
    id: 'quickfire',
    name: 'Quickfire Sprint',
    blurb: 'Answer fast. Build streaks. Beat the clock.',
    skillTags: ['fluency', 'speed', 'focus'],
  },
  {
    id: 'pickone',
    name: 'One Is Correct',
    blurb: 'Tap the right card before it flips away.',
    skillTags: ['reasoning', 'estimation', 'accuracy'],
  },
  {
    id: 'matchpairs',
    name: 'Match Pairs',
    blurb: 'Connect ideas: expression ↔ value, rule ↔ example.',
    skillTags: ['connections', 'pattern', 'concepts'],
  },
]

