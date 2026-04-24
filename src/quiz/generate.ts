import type { Level } from '../types'
import { int, pick, shuffle } from '../lib/random'
import type { ActivityId, InputQuestion, MatchPairsQuestion, McqQuestion, Question } from './quizTypes'

function qid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function makeMcq(args: Omit<McqQuestion, 'kind' | 'id'>): McqQuestion {
  return { kind: 'mcq', id: qid(), ...args }
}
function makeMatch(args: Omit<MatchPairsQuestion, 'kind' | 'id'>): MatchPairsQuestion {
  return { kind: 'match', id: qid(), ...args }
}

function makeInput(args: Omit<InputQuestion, 'kind' | 'id'>): InputQuestion {
  return { kind: 'input', id: qid(), ...args }
}

function genPrimaryQuickfire(): Question {
  const mode = pick(['add', 'sub', 'mul', 'div'] as const)
  const a = int(2, mode === 'mul' ? 12 : 50)
  const b = int(2, mode === 'mul' ? 12 : 50)
  if (mode === 'add') {
    return makeInput({
      level: 'primary',
      points: 10,
      prompt: `${a} + ${b} = ?`,
      answer: String(a + b),
    })
  }
  if (mode === 'sub') {
    const hi = Math.max(a, b)
    const lo = Math.min(a, b)
    return makeInput({
      level: 'primary',
      points: 10,
      prompt: `${hi} − ${lo} = ?`,
      answer: String(hi - lo),
    })
  }
  if (mode === 'mul') {
    return makeInput({
      level: 'primary',
      points: 12,
      prompt: `${a} × ${b} = ?`,
      answer: String(a * b),
      hint: 'Tip: break one factor into tens + ones.',
    })
  }
  // div (exact)
  const prod = a * b
  return makeInput({
    level: 'primary',
    points: 14,
    prompt: `${prod} ÷ ${a} = ?`,
    answer: String(b),
    hint: 'Think: what times the divisor gives the dividend?',
  })
}

function genSecondaryQuickfire(): Question {
  const mode = pick(['int', 'percent', 'linear'] as const)
  if (mode === 'int') {
    const a = int(-40, 40)
    const b = int(-40, 40)
    const op = pick(['+', '−'] as const)
    const ans = op === '+' ? a + b : a - b
    return makeInput({
      level: 'secondary',
      points: 14,
      prompt: `${a} ${op} ${b} = ?`,
      answer: String(ans),
      hint: 'Watch the signs.',
    })
  }
  if (mode === 'percent') {
    const base = pick([40, 50, 60, 80, 100, 120, 150, 200])
    const p = pick([5, 10, 12.5, 15, 20, 25, 30, 40] as const)
    const value = (base * p) / 100
    return makeInput({
      level: 'secondary',
      points: 16,
      prompt: `Find ${p}% of ${base}.`,
      answer: String(value),
      hint: 'Convert percent to a fraction or decimal.',
    })
  }
  // linear: ax + b = c
  const a = pick([2, 3, 4, 5, 6])
  const x = int(-8, 12)
  const b = int(-15, 15)
  const c = a * x + b
  const sign = b >= 0 ? '+' : '−'
  return makeInput({
    level: 'secondary',
    points: 18,
    prompt: `Solve: ${a}x ${sign} ${Math.abs(b)} = ${c}.  x = ?`,
    answer: String(x),
    hint: 'Undo addition/subtraction, then divide.',
  })
}

function genHighQuickfire(): Question {
  const mode = pick(['quadratic-factor', 'function', 'indices'] as const)
  if (mode === 'indices') {
    const a = pick([2, 3, 5, 10])
    const m = int(2, 6)
    const n = int(1, 5)
    return makeInput({
      level: 'high',
      points: 18,
      prompt: `Simplify: ${a}^${m} × ${a}^${n} = ${a}^?`,
      answer: String(m + n),
      hint: 'Same base: add exponents.',
    })
  }
  if (mode === 'function') {
    const a = pick([2, 3, -1, -2])
    const b = int(-6, 6)
    const x = int(-4, 4)
    const fx = a * x + b
    const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`
    return makeInput({
      level: 'high',
      points: 18,
      prompt: `Given f(x) = ${a}x ${bStr}. Find f(${x}).`,
      answer: String(fx),
      hint: 'Substitute x, then simplify.',
    })
  }
  // quadratic factor: x^2 + px + q with integer roots
  const r1 = int(-9, 9) || 2
  const r2 = int(-9, 9) || -3
  const p = -(r1 + r2)
  const q = r1 * r2
  const pStr = p >= 0 ? `+ ${p}` : `− ${Math.abs(p)}`
  const qStr = q >= 0 ? `+ ${q}` : `− ${Math.abs(q)}`
  return makeInput({
    level: 'high',
    points: 22,
    prompt: `Factorise: x² ${pStr}x ${qStr}.  (x − a)(x − b) with a,b = ?`,
    answer: `${r1},${r2}`,
    hint: 'Find two numbers that multiply to q and add to p.',
  })
}

function genPickOne(level: Level): McqQuestion {
  if (level === 'primary') {
    const a = int(10, 99)
    const b = int(10, 99)
    const ans = a + b
    const choices = shuffle([
      String(ans),
      String(ans + pick([1, 2, 10])),
      String(ans - pick([1, 2, 10])),
      String(ans + pick([5, 9, 11])),
    ]).slice(0, 4)
    return makeMcq({
      level,
      points: 12,
      prompt: `Which is correct?  ${a} + ${b} =`,
      choices,
      answerIndex: choices.indexOf(String(ans)),
      explain: 'Use place value (tens + ones).',
    })
  }
  if (level === 'secondary') {
    const a = int(2, 12)
    const b = int(2, 12)
    const c = int(2, 12)
    const ans = a * (b + c)
    const choices = shuffle([
      String(ans),
      String(a * b + c),
      String(a * b + a + c),
      String(a * b + a * c + 1),
    ])
    return makeMcq({
      level,
      points: 18,
      prompt: `Evaluate: ${a}(${b} + ${c})`,
      choices,
      answerIndex: choices.indexOf(String(ans)),
      explain: 'Distribute: a(b + c) = ab + ac.',
    })
  }
  // high
  const x = int(-4, 6)
  const a = pick([1, 2, 3])
  const b = int(-6, 6)
  const c = int(-8, 8)
  const ans = a * x * x + b * x + c
  const choices = shuffle([
    String(ans),
    String(ans + pick([1, 2, 3, 4])),
    String(ans - pick([1, 2, 3, 4])),
    String(a * x * x + b + c),
  ])
  return makeMcq({
    level,
    points: 22,
    prompt: `If f(x) = ${a}x² ${b >= 0 ? '+ ' : '− '}${Math.abs(b)}x ${
      c >= 0 ? '+ ' : '− '
    }${Math.abs(c)}, find f(${x}).`,
    choices,
    answerIndex: choices.indexOf(String(ans)),
    explain: 'Substitute carefully (watch signs).',
  })
}

function genMatchPairs(level: Level): MatchPairsQuestion {
  if (level === 'primary') {
    const pairs = shuffle([
      { left: '½', right: '0.5' },
      { left: '¼', right: '0.25' },
      { left: '¾', right: '0.75' },
      { left: '⅓', right: '0.333…' },
      { left: '⅔', right: '0.666…' },
    ]).slice(0, 4)
    return makeMatch({
      level,
      points: 20,
      prompt: 'Match the fraction to the decimal.',
      leftLabel: 'Fraction',
      rightLabel: 'Decimal',
      pairs,
    })
  }
  if (level === 'secondary') {
    const pairs = shuffle([
      { left: '3 : 4', right: '0.75' },
      { left: '2 : 5', right: '0.4' },
      { left: '7 : 10', right: '0.7' },
      { left: '5 : 2', right: '2.5' },
      { left: '9 : 3', right: '3' },
    ]).slice(0, 4)
    return makeMatch({
      level,
      points: 22,
      prompt: 'Match the ratio a:b to the value of a ÷ b.',
      leftLabel: 'Ratio',
      rightLabel: 'a ÷ b',
      pairs,
    })
  }
  const pairs = shuffle([
    { left: 'sin²θ + cos²θ', right: '1' },
    { left: '(a + b)²', right: 'a² + 2ab + b²' },
    { left: 'log₁₀(1000)', right: '3' },
    { left: 'a⁰', right: '1 (a ≠ 0)' },
    { left: 'Δ for ax²+bx+c', right: 'b² − 4ac' },
  ]).slice(0, 4)
  return makeMatch({
    level,
    points: 26,
    prompt: 'Match the expression to its simplified result.',
    leftLabel: 'Expression',
    rightLabel: 'Result',
    pairs,
  })
}

export function generateQuestion(level: Level, activity: ActivityId): Question {
  if (activity === 'quickfire') {
    if (level === 'primary') return genPrimaryQuickfire()
    if (level === 'secondary') return genSecondaryQuickfire()
    return genHighQuickfire()
  }
  if (activity === 'pickone') return genPickOne(level)
  return genMatchPairs(level)
}

