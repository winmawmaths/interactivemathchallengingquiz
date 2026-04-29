import type { ActivityMeta } from './quizTypes'

export const ACTIVITIES: ActivityMeta[] = [
  {
    id: 'mathtug',
    name: 'Math Tug',
    blurb: 'Answer to pull your team across the line.',
    skillTags: ['competition', 'teams', 'speed'],
  },
  {
    id: 'quickfire',
    name: 'Quickfire Sprint',
    blurb: 'Answer fast. Build streaks. Beat the clock.',
    skillTags: ['fluency', 'speed', 'focus'],
  },
  {
    id: 'pickone',
    name: 'One Is Correct',
    blurb: 'Tap the right card before the timer runs out.',
    skillTags: ['reasoning', 'estimation', 'accuracy'],
  },
  {
    id: 'matchpairs',
    name: 'Match Pairs',
    blurb: 'Connect ideas: expression to value, rule to example.',
    skillTags: ['connections', 'pattern', 'concepts'],
  },
]
