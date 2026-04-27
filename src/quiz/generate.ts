import type { Grade, Level } from '../types'
import { gradeIndexWithinLevel } from '../types'
import { int, pick, shuffle } from '../lib/random'
import type { ActivityId, InputQuestion, MatchPairsQuestion, McqQuestion, Question } from './quizTypes'
import type { TopicId } from './topics'
import type { Curriculum } from '../types'

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

function formatBinomialRoot(root: number) {
  return root >= 0 ? `(x - ${root})` : `(x + ${Math.abs(root)})`
}

function genPrimaryQuickfire(grade: Grade, topic: TopicId): Question {
  const gi = gradeIndexWithinLevel('primary', grade) // 0..5
  if (topic === 'p-number') {
    const max = [20, 50, 100, 200, 500, 1000][gi] ?? 100
    const a = int(1, max)
    const b = int(1, max)
    const hi = Math.max(a, b)
    const lo = Math.min(a, b)
    return makeInput({
      level: 'primary',
      grade,
      points: 10,
      prompt: `Which is greater: ${hi} or ${lo}? Type the greater number.`,
      answer: String(hi),
      hint: 'Compare the highest place value first.',
    })
  }
  if (topic === 'p-geometry') {
    const pool =
      gi <= 1
        ? [
            { prompt: 'How many sides does a triangle have?', answer: '3' },
            { prompt: 'How many sides does a square have?', answer: '4' },
            { prompt: 'How many corners does a rectangle have?', answer: '4' },
          ]
        : [
            { prompt: 'How many lines of symmetry does a square have?', answer: '4' },
            { prompt: 'How many right angles are in a rectangle?', answer: '4' },
            { prompt: 'How many sides does a hexagon have?', answer: '6' },
          ]
    const item = pick(pool)
    return makeInput({
      level: 'primary',
      grade,
      points: 12,
      prompt: item.prompt,
      answer: item.answer,
      hint: 'Picture the shape in your mind.',
    })
  }
  if (topic === 'p-measurement') {
    const pool =
      gi <= 2
        ? [
            { prompt: 'How many minutes are in 1 hour?', answer: '60' },
            { prompt: 'How many centimetres are in 1 metre?', answer: '100' },
            { prompt: 'How many days are in 1 week?', answer: '7' },
          ]
        : [
            { prompt: 'How many grams are in 1 kilogram?', answer: '1000' },
            { prompt: 'How many millilitres are in 1 litre?', answer: '1000' },
            { prompt: 'How many months are in 1 year?', answer: '12' },
          ]
    const item = pick(pool)
    return makeInput({
      level: 'primary',
      grade,
      points: 12,
      prompt: item.prompt,
      answer: item.answer,
      hint: 'Use the standard unit fact you know.',
    })
  }
  const modePool =
    topic === 'p-addsub'
      ? (['add', 'sub'] as const)
      : topic === 'p-muldiv'
        ? (['mul', 'div'] as const)
        : topic === 'p-fracdec'
          ? (['fracdec'] as const)
          : (['add', 'sub', 'mul', 'div'] as const)
  const mode = pick(modePool)
  const addMax = [10, 20, 50, 80, 120, 200][gi] ?? 50
  const mulMax = [5, 8, 10, 12, 12, 15][gi] ?? 12
  const a = int(2, mode === 'mul' ? mulMax : addMax)
  const b = int(2, mode === 'mul' ? mulMax : addMax)
  if (mode === 'fracdec') {
    const pool: Array<{ prompt: string; answer: string }> =
      gi <= 2
        ? [
            { prompt: '½', answer: '0.5' },
            { prompt: '¼', answer: '0.25' },
            { prompt: '¾', answer: '0.75' },
            { prompt: '1', answer: '1.0' },
          ]
        : [
            { prompt: '⅓', answer: '0.333…' },
            { prompt: '⅔', answer: '0.666…' },
            { prompt: '⅕', answer: '0.2' },
            { prompt: '⅛', answer: '0.125' },
          ]
    const item = pick(pool)
    return makeInput({
      level: 'primary',
      grade,
      points: 14,
      prompt: `Convert to decimal: ${item.prompt}`,
      answer: item.answer,
      hint: 'Think of division or known fraction facts.',
    })
  }
  if (mode === 'add') {
    return makeInput({
      level: 'primary',
      grade,
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
      grade,
      points: 10,
      prompt: `${hi} − ${lo} = ?`,
      answer: String(hi - lo),
    })
  }
  if (mode === 'mul') {
    return makeInput({
      level: 'primary',
      grade,
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
    grade,
    points: 14,
    prompt: `${prod} ÷ ${a} = ?`,
    answer: String(b),
    hint: 'Think: what times the divisor gives the dividend?',
  })
}

function genSecondaryQuickfire(grade: Grade, topic: TopicId): Question {
  const gi = gradeIndexWithinLevel('secondary', grade) // 0..3
  if (topic === 's-geometry') {
    const pool =
      gi <= 1
        ? [
            { prompt: 'What is the sum of angles in a triangle?', answer: '180' },
            { prompt: 'How many degrees is a right angle?', answer: '90' },
            { prompt: 'What is the perimeter of a square with side 6?', answer: '24' },
          ]
        : [
            { prompt: 'What is the area of a rectangle 8 by 5?', answer: '40' },
            { prompt: 'What is the sum of angles on a straight line?', answer: '180' },
            { prompt: 'What is the area of a triangle with base 10 and height 4?', answer: '20' },
          ]
    const item = pick(pool)
    return makeInput({
      level: 'secondary',
      grade,
      points: 16,
      prompt: item.prompt,
      answer: item.answer,
      hint: 'Recall the geometry fact or formula.',
    })
  }
  if (topic === 's-fractions') {
    const pool =
      gi <= 1
        ? [
            { prompt: 'Simplify 6/8.', answer: '3/4' },
            { prompt: 'Convert 3/5 to decimal.', answer: '0.6' },
            { prompt: '1/4 + 1/4 = ?', answer: '1/2' },
          ]
        : [
            { prompt: '3/4 + 1/8 = ?', answer: '7/8' },
            { prompt: '5/6 - 1/3 = ?', answer: '1/2' },
            { prompt: 'Convert 7/8 to decimal.', answer: '0.875' },
          ]
    const item = pick(pool)
    return makeInput({
      level: 'secondary',
      grade,
      points: 16,
      prompt: item.prompt,
      answer: item.answer,
      hint: 'Use common denominators or decimal conversion.',
    })
  }
  if (topic === 's-data') {
    const sets = [
      { data: [3, 5, 5, 7], mean: '5' },
      { data: [8, 10, 12], mean: '10' },
      { data: [4, 9, 9, 10], mean: '8' },
    ]
    const item = pick(sets)
    return makeInput({
      level: 'secondary',
      grade,
      points: 16,
      prompt: `Find the mean of: ${item.data.join(', ')}.`,
      answer: item.mean,
      hint: 'Add the values and divide by how many there are.',
    })
  }
  const modePool =
    topic === 's-integers'
      ? (['int'] as const)
      : topic === 's-ratiopercent'
        ? (['percent'] as const)
        : topic === 's-linear'
          ? (['linear'] as const)
          : (['int', 'percent', 'linear'] as const)
  const mode = pick(modePool)
  if (mode === 'int') {
    const max = [20, 40, 80, 120][gi] ?? 40
    const a = int(-max, max)
    const b = int(-max, max)
    const op = pick(['+', '−'] as const)
    const ans = op === '+' ? a + b : a - b
    return makeInput({
      level: 'secondary',
      grade,
      points: 14,
      prompt: `${a} ${op} ${b} = ?`,
      answer: String(ans),
      hint: 'Watch the signs.',
    })
  }
  if (mode === 'percent') {
    const basesByG = [
      [40, 50, 60, 80, 100],
      [50, 60, 80, 100, 120, 150],
      [60, 80, 100, 120, 150, 200],
      [80, 100, 120, 150, 200, 250],
    ] as const
    const percByG = [
      [5, 10, 20, 25],
      [5, 10, 12.5, 15, 20, 25],
      [10, 12.5, 15, 20, 25, 30],
      [12.5, 15, 20, 25, 30, 40],
    ] as const
    const base = pick(basesByG[gi] ?? basesByG[1])
    const p = pick((percByG[gi] ?? percByG[1]) as readonly number[])
    const value = (base * p) / 100
    return makeInput({
      level: 'secondary',
      grade,
      points: 16,
      prompt: `Find ${p}% of ${base}.`,
      answer: String(value),
      hint: 'Convert percent to a fraction or decimal.',
    })
  }
  // linear: ax + b = c
  const a = pick(gi <= 1 ? ([2, 3, 4, 5] as const) : ([2, 3, 4, 5, 6, 7] as const))
  const x = int(gi <= 1 ? -6 : -10, gi <= 1 ? 10 : 14)
  const b = int(gi <= 1 ? -12 : -20, gi <= 1 ? 12 : 20)
  const c = a * x + b
  const sign = b >= 0 ? '+' : '−'
  return makeInput({
    level: 'secondary',
    grade,
    points: 18,
    prompt: `Solve: ${a}x ${sign} ${Math.abs(b)} = ${c}.  x = ?`,
    answer: String(x),
    hint: 'Undo addition/subtraction, then divide.',
  })
}

function genHighQuickfire(grade: Grade, topic: TopicId): Question {
  const gi = gradeIndexWithinLevel('high', grade) // 0..2
  if (topic === 'h-sequences') {
    const start = int(2, 12)
    const diff = int(2, 8)
    const n = int(4, 8)
    const answer = start + (n - 1) * diff
    return makeInput({
      level: 'high',
      grade,
      points: 20,
      prompt: `Arithmetic sequence starts ${start}, ${start + diff}, ${start + diff * 2}... Find term ${n}.`,
      answer: String(answer),
      hint: 'Use first term + (n - 1) times the common difference.',
    })
  }
  if (topic === 'h-probability') {
    const red = int(2, 6)
    const blue = int(2, 6)
    return makeInput({
      level: 'high',
      grade,
      points: 20,
      prompt: `A bag has ${red} red and ${blue} blue balls. Probability of red = ?/${red + blue}`,
      answer: String(red),
      hint: 'Favorable outcomes over total outcomes.',
    })
  }
  const modePool =
    topic === 'h-functions'
      ? (['function'] as const)
      : topic === 'h-quadratics'
        ? (['quadratic-factor'] as const)
        : topic === 'h-indices'
          ? (['indices'] as const)
          : topic === 'h-trig'
            ? (['trig'] as const)
            : (['quadratic-factor', 'function', 'indices'] as const)
  const mode = pick(modePool)
  if (mode === 'trig') {
    const angle = pick([0, 30, 45, 60, 90] as const)
    const fn = pick(['sin', 'cos'] as const)
    const table: Record<string, string> = {
      'sin0': '0',
      'sin30': '1/2',
      'sin45': '√2/2',
      'sin60': '√3/2',
      'sin90': '1',
      'cos0': '1',
      'cos30': '√3/2',
      'cos45': '√2/2',
      'cos60': '1/2',
      'cos90': '0',
    }
    return makeInput({
      level: 'high',
      grade,
      points: 20,
      prompt: `Find: ${fn}(${angle}°)`,
      answer: table[`${fn}${angle}`] ?? '0',
      hint: 'Use special angle values.',
    })
  }
  if (mode === 'indices') {
    const a = pick(gi === 0 ? ([2, 3, 5] as const) : ([2, 3, 5, 10] as const))
    const m = int(2 + gi, 6 + gi)
    const n = int(1 + gi, 5 + gi)
    return makeInput({
      level: 'high',
      grade,
      points: 18,
      prompt: `Simplify: ${a}^${m} × ${a}^${n} = ${a}^?`,
      answer: String(m + n),
      hint: 'Same base: add exponents.',
    })
  }
  if (mode === 'function') {
    const a = pick(gi === 0 ? ([2, -1, -2] as const) : ([2, 3, -1, -2] as const))
    const b = int(gi === 0 ? -6 : -10, gi === 0 ? 6 : 10)
    const x = int(gi === 0 ? -4 : -6, gi === 0 ? 4 : 6)
    const fx = a * x + b
    const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`
    return makeInput({
      level: 'high',
      grade,
      points: 18,
      prompt: `Given f(x) = ${a}x ${bStr}. Find f(${x}).`,
      answer: String(fx),
      hint: 'Substitute x, then simplify.',
    })
  }
  // quadratic factor: x^2 + px + q with integer roots
  const r1 = int(gi === 0 ? -6 : -9, gi === 0 ? 6 : 9) || 2
  const r2 = int(gi === 0 ? -6 : -9, gi === 0 ? 6 : 9) || -3
  const p = -(r1 + r2)
  const q = r1 * r2
  const pStr = p >= 0 ? `+ ${p}` : `− ${Math.abs(p)}`
  const qStr = q >= 0 ? `+ ${q}` : `− ${Math.abs(q)}`
  return makeInput({
    level: 'high',
    grade,
    points: 22,
    prompt: `Factorise: x² ${pStr}x ${qStr}.  (x − a)(x − b) with a,b = ?`,
    answer: `${r1},${r2}`,
    hint: 'Find two numbers that multiply to q and add to p.',
  })
}

function genPickOne(level: Level, grade: Grade, topic: TopicId): McqQuestion {
  if (level === 'primary') {
    const gi = gradeIndexWithinLevel('primary', grade)
    if (topic === 'p-number') {
      const max = [20, 50, 100, 200, 500, 1000][gi] ?? 100
      const a = int(1, max)
      const b = int(1, max)
      const c = int(1, max)
      const ans = Math.max(a, b, c)
      const choices = shuffle([String(a), String(b), String(c), String(ans)]).slice(0, 4)
      return makeMcq({
        level,
        grade,
        points: 12,
        prompt: `Which number is greatest: ${a}, ${b}, ${c}?`,
        choices,
        answerIndex: choices.indexOf(String(ans)),
        explain: 'Compare hundreds, tens, then ones.',
      })
    }
    if (topic === 'p-muldiv') {
      const max = [6, 8, 10, 12, 12, 15][gi] ?? 12
      const a = int(2, max)
      const b = int(2, max)
      const ans = a * b
      const choices = shuffle([
        String(ans),
        String(ans + pick([a, b, 1, 2])),
        String(ans - pick([a, 1, 2])),
        String(ans + pick([5, 9, 11])),
      ]).slice(0, 4)
      return makeMcq({
        level,
        grade,
        points: 14,
        prompt: `Which is correct?  ${a} × ${b} =`,
        choices,
        answerIndex: choices.indexOf(String(ans)),
        explain: 'Use known facts and patterns.',
      })
    }

    if (topic === 'p-fracdec') {
      const pool: Array<{ f: string; d: string }> =
        gi <= 2
          ? [
              { f: '½', d: '0.5' },
              { f: '¼', d: '0.25' },
              { f: '¾', d: '0.75' },
              { f: '⅕', d: '0.2' },
            ]
          : [
              { f: '⅓', d: '0.333…' },
              { f: '⅔', d: '0.666…' },
              { f: '⅛', d: '0.125' },
              { f: '⅖', d: '0.4' },
            ]
      const item = pick(pool)
      const choices = shuffle([item.d, '0.6', '0.2', '0.75']).slice(0, 4)
      return makeMcq({
        level,
        grade,
        points: 14,
        prompt: `Which decimal equals ${item.f}?`,
        choices,
        answerIndex: choices.indexOf(item.d),
        explain: 'Think of division or equivalent fractions.',
      })
    }
    if (topic === 'p-geometry') {
      const pool = [
        { prompt: 'Which shape has 3 sides?', answer: 'Triangle', choices: ['Triangle', 'Square', 'Circle', 'Rectangle'] },
        { prompt: 'Which shape has 4 equal sides?', answer: 'Square', choices: ['Triangle', 'Square', 'Oval', 'Pentagon'] },
        { prompt: 'Which shape has no corners?', answer: 'Circle', choices: ['Circle', 'Rectangle', 'Triangle', 'Square'] },
      ]
      const item = pick(pool)
      const choices = shuffle(item.choices)
      return makeMcq({
        level,
        grade,
        points: 12,
        prompt: item.prompt,
        choices,
        answerIndex: choices.indexOf(item.answer),
        explain: 'Use the shape properties you know.',
      })
    }
    if (topic === 'p-measurement') {
      const pool = [
        { prompt: 'How many minutes are in 1 hour?', answer: '60', choices: ['60', '30', '100', '24'] },
        { prompt: 'How many cm are in 1 m?', answer: '100', choices: ['10', '100', '1000', '60'] },
        { prompt: 'How many months are in 1 year?', answer: '12', choices: ['10', '11', '12', '24'] },
      ]
      const item = pick(pool)
      const choices = shuffle(item.choices)
      return makeMcq({
        level,
        grade,
        points: 12,
        prompt: item.prompt,
        choices,
        answerIndex: choices.indexOf(item.answer),
        explain: 'Recall the unit conversion fact.',
      })
    }

    // default add/sub
    const min = gi <= 1 ? 1 : 10
    const max = [20, 50, 99, 199, 499, 999][gi] ?? 99
    const a = int(min, max)
    const b = int(min, max)
    const op = topic === 'p-addsub' ? pick(['+', '−'] as const) : '+'
    const hi = Math.max(a, b)
    const lo = Math.min(a, b)
    const ans = op === '+' ? a + b : hi - lo
    const prompt = op === '+' ? `${a} + ${b}` : `${hi} − ${lo}`
    const choices = shuffle([
      String(ans),
      String(ans + pick([1, 2, 10])),
      String(ans - pick([1, 2, 10])),
      String(ans + pick([5, 9, 11])),
    ]).slice(0, 4)
    return makeMcq({
      level,
      grade,
      points: 12,
      prompt: `Which is correct?  ${prompt} =`,
      choices,
      answerIndex: choices.indexOf(String(ans)),
      explain: 'Use place value (tens + ones).',
    })
  }
  if (level === 'secondary') {
    const gi = gradeIndexWithinLevel('secondary', grade)
    if (topic === 's-geometry') {
      const pool = [
        { prompt: 'What is the sum of angles in a triangle?', answer: '180', choices: ['90', '180', '270', '360'] },
        { prompt: 'Area of rectangle 7 by 3?', answer: '21', choices: ['10', '14', '21', '24'] },
        { prompt: 'Perimeter of square side 5?', answer: '20', choices: ['10', '15', '20', '25'] },
      ]
      const item = pick(pool)
      const choices = shuffle(item.choices)
      return makeMcq({
        level,
        grade,
        points: 18,
        prompt: item.prompt,
        choices,
        answerIndex: choices.indexOf(item.answer),
        explain: 'Use the correct geometry fact or formula.',
      })
    }
    if (topic === 's-fractions') {
      const pool = [
        { prompt: 'Which is equal to 3/4?', answer: '0.75', choices: ['0.4', '0.5', '0.75', '0.8'] },
        { prompt: '1/2 + 1/4 = ?', answer: '3/4', choices: ['2/4', '3/4', '1/4', '4/4'] },
        { prompt: 'Which fraction is simplest form of 4/8?', answer: '1/2', choices: ['2/4', '1/2', '3/4', '2/3'] },
      ]
      const item = pick(pool)
      const choices = shuffle(item.choices)
      return makeMcq({
        level,
        grade,
        points: 18,
        prompt: item.prompt,
        choices,
        answerIndex: choices.indexOf(item.answer),
        explain: 'Work with equivalent fractions or decimals.',
      })
    }
    if (topic === 's-data') {
      const pool = [
        { prompt: 'Mean of 2, 4, 6?', answer: '4', choices: ['3', '4', '5', '6'] },
        { prompt: 'Median of 3, 5, 9?', answer: '5', choices: ['3', '4', '5', '9'] },
        { prompt: 'Range of 4, 10, 7?', answer: '6', choices: ['3', '4', '6', '7'] },
      ]
      const item = pick(pool)
      const choices = shuffle(item.choices)
      return makeMcq({
        level,
        grade,
        points: 18,
        prompt: item.prompt,
        choices,
        answerIndex: choices.indexOf(item.answer),
        explain: 'Pick the correct data measure.',
      })
    }
    if (topic === 's-ratiopercent') {
      const base = pick([50, 60, 80, 100, 120, 150, 200])
      const p = pick((gi <= 1 ? ([5, 10, 20, 25] as const) : ([10, 12.5, 15, 20, 25, 30] as const)) as readonly number[])
      const ans = (base * p) / 100
      const choices = shuffle([
        String(ans),
        String(ans + pick([5, 10, 15])),
        String(ans - pick([5, 10, 15])),
        String(base),
      ])
      return makeMcq({
        level,
        grade,
        points: 18,
        prompt: `Find ${p}% of ${base}.`,
        choices,
        answerIndex: choices.indexOf(String(ans)),
        explain: 'Percent means “per 100”.',
      })
    }
    if (topic === 's-integers') {
      const max = [20, 40, 80, 120][gi] ?? 40
      const a = int(-max, max)
      const b = int(-max, max)
      const op = pick(['+', '−'] as const)
      const ans = op === '+' ? a + b : a - b
      const choices = shuffle([
        String(ans),
        String(ans + pick([1, 2, 5])),
        String(ans - pick([1, 2, 5])),
        String(-ans),
      ])
      return makeMcq({
        level,
        grade,
        points: 16,
        prompt: `Evaluate: ${a} ${op} ${b}`,
        choices,
        answerIndex: choices.indexOf(String(ans)),
        explain: 'Keep track of signs.',
      })
    }

    // s-linear (default)
    const a = int(2, 12)
    const b = int(gi <= 1 ? 2 : -12, 12)
    const c = int(gi <= 1 ? 2 : -12, 12)
    const ans = a * (b + c)
    const choices = shuffle([
      String(ans),
      String(a * b + c),
      String(a * b + a + c),
      String(a * b + a * c + 1),
    ])
    return makeMcq({
      level,
      grade,
      points: 18,
      prompt: `Evaluate: ${a}(${b} + ${c})`,
      choices,
      answerIndex: choices.indexOf(String(ans)),
      explain: 'Distribute: a(b + c) = ab + ac.',
    })
  }
  // high
  const gi = gradeIndexWithinLevel('high', grade)
  if (topic === 'h-functions') {
    const a = pick([2, 3, -1, -2])
    const b = int(-6, 6)
    const x = int(-4, 4)
    const ans = a * x + b
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`
    const choices = shuffle([String(ans), String(ans + 1), String(ans - 1), String(a + x + b)])
    return makeMcq({
      level,
      grade,
      points: 22,
      prompt: `Given f(x) = ${a}x ${bStr}, find f(${x}).`,
      choices,
      answerIndex: choices.indexOf(String(ans)),
      explain: 'Substitute the value of x into the rule.',
    })
  }
  if (topic === 'h-quadratics') {
    const r1 = pick([1, 2, 3, -1, -2])
    const r2 = pick([2, 3, 4, -2, -3])
    const p = -(r1 + r2)
    const q = r1 * r2
    const correct = `${formatBinomialRoot(r1)}${formatBinomialRoot(r2)}`
    const choices = shuffle([
      correct,
      `(x + ${r1})(x + ${r2})`,
      `${formatBinomialRoot(r1)}${r2 >= 0 ? `(x + ${r2})` : `(x - ${Math.abs(r2)})`}`,
      `(x + ${Math.abs(r1)})(x - ${Math.abs(r2)})`,
    ])
    return makeMcq({
      level,
      grade,
      points: 22,
      prompt: `Which factorization matches x^2 ${p >= 0 ? '+ ' : '- '}${Math.abs(p)}x ${q >= 0 ? '+ ' : '- '}${Math.abs(q)}?`,
      choices,
      answerIndex: choices.indexOf(correct),
      explain: 'Roots determine the binomial factors.',
    })
  }
  if (topic === 'h-indices') {
    const base = pick([2, 3, 5, 10])
    const m = int(2 + gi, 5 + gi)
    const n = int(1 + gi, 4 + gi)
    const ans = m + n
    const choices = shuffle([String(ans), String(ans + 1), String(ans - 1), String(m - n)])
    return makeMcq({
      level,
      grade,
      points: 22,
      prompt: `Simplify exponent: ${base}^${m} × ${base}^${n} = ${base}^?`,
      choices,
      answerIndex: choices.indexOf(String(ans)),
      explain: 'Same base: add exponents.',
    })
  }
  if (topic === 'h-trig') {
    const angle = pick([0, 30, 45, 60, 90] as const)
    const fn = pick(['sin', 'cos'] as const)
    const table: Record<string, string> = {
      'sin0': '0',
      'sin30': '1/2',
      'sin45': '√2/2',
      'sin60': '√3/2',
      'sin90': '1',
      'cos0': '1',
      'cos30': '√3/2',
      'cos45': '√2/2',
      'cos60': '1/2',
      'cos90': '0',
    }
    const ans = table[`${fn}${angle}`] ?? '0'
    const choices = shuffle([ans, '1', '0', '1/2'])
    return makeMcq({
      level,
      grade,
      points: 22,
      prompt: `Which is correct? ${fn}(${angle}°) =`,
      choices,
      answerIndex: choices.indexOf(ans),
      explain: 'Use special angle values.',
    })
  }
  if (topic === 'h-sequences') {
    const start = int(1, 10)
    const diff = int(2, 6)
    const ans = start + 4 * diff
    const choices = shuffle([String(ans), String(ans + diff), String(ans - diff), String(start + 3 * diff)])
    return makeMcq({
      level,
      grade,
      points: 22,
      prompt: `Find the 5th term: ${start}, ${start + diff}, ${start + 2 * diff}, ...`,
      choices,
      answerIndex: choices.indexOf(String(ans)),
      explain: 'Arithmetic sequences add the same difference each time.',
    })
  }
  if (topic === 'h-probability') {
    const total = pick([8, 10, 12])
    const favorable = pick([1, 2, 3, 4, 5].filter((n) => n < total))
    const ans = `${favorable}/${total}`
    const choices = shuffle([ans, `${total}/${favorable}`, `${favorable + 1}/${total}`, `${favorable}/${total - 1}`])
    return makeMcq({
      level,
      grade,
      points: 22,
      prompt: `A spinner has ${favorable} winning sections out of ${total}. What is the probability of winning?`,
      choices,
      answerIndex: choices.indexOf(ans),
      explain: 'Probability is favorable outcomes divided by total outcomes.',
    })
  }

  // functions/quadratics default
  const x = int(-4, 6)
  const a = pick([1, 2, 3])
  const b = int(gi === 0 ? -6 : -10, gi === 0 ? 6 : 10)
  const c = int(gi === 0 ? -8 : -14, gi === 0 ? 8 : 14)
  const ans = a * x * x + b * x + c
  const choices = shuffle([
    String(ans),
    String(ans + pick([1, 2, 3, 4])),
    String(ans - pick([1, 2, 3, 4])),
    String(a * x * x + b + c),
  ])
  return makeMcq({
    level,
    grade,
    points: 22,
    prompt: `If f(x) = ${a}x² ${b >= 0 ? '+ ' : '− '}${Math.abs(b)}x ${
      c >= 0 ? '+ ' : '− '
    }${Math.abs(c)}, find f(${x}).`,
    choices,
    answerIndex: choices.indexOf(String(ans)),
    explain: 'Substitute carefully (watch signs).',
  })
}

function genMatchPairs(level: Level, grade: Grade, topic: TopicId): MatchPairsQuestion {
  if (level === 'primary') {
    const gi = gradeIndexWithinLevel('primary', grade)
    if (topic === 'p-number') {
      const pairs = shuffle([
        { left: 'Greatest of 48 and 84', right: '84' },
        { left: 'Smallest of 39 and 93', right: '39' },
        { left: 'Nearest 10 of 67', right: '70' },
        { left: 'Place value of 5 in 352', right: '50' },
        { left: '8 hundreds', right: '800' },
      ]).slice(0, 4)
      return makeMatch({
        level,
        grade,
        points: 20,
        prompt: 'Match each number idea to its answer.',
        leftLabel: 'Idea',
        rightLabel: 'Answer',
        pairs,
      })
    }
    if (topic === 'p-muldiv') {
      const max = [6, 8, 10, 12, 12, 15][gi] ?? 12
      const a = int(2, max)
      const b = int(2, max)
      const c = int(2, max)
      const d = int(2, max)
      const pool = [
        { left: `${a}×${b}`, right: String(a * b) },
        { left: `${c}×${d}`, right: String(c * d) },
        { left: `${a * b}÷${a}`, right: String(b) },
        { left: `${c * d}÷${c}`, right: String(d) },
      ]
      return makeMatch({
        level,
        grade,
        points: 22,
        prompt: 'Match each expression to its value.',
        leftLabel: 'Expression',
        rightLabel: 'Value',
        pairs: shuffle(pool),
      })
    }
    if (topic === 'p-fracdec') {
      const easy = [
        { left: '½', right: '0.5' },
        { left: '¼', right: '0.25' },
        { left: '¾', right: '0.75' },
        { left: '⅕', right: '0.2' },
      ]
      const harder = [
        { left: '⅓', right: '0.333…' },
        { left: '⅔', right: '0.666…' },
        { left: '⅛', right: '0.125' },
        { left: '⅖', right: '0.4' },
      ]
      const pool = gi <= 2 ? easy : [...easy, ...harder]
      const pairs = shuffle(pool).slice(0, 4)
      return makeMatch({
        level,
        grade,
        points: 22,
        prompt: 'Match the fraction to the decimal.',
        leftLabel: 'Fraction',
        rightLabel: 'Decimal',
        pairs,
      })
    }
    if (topic === 'p-geometry') {
      const pairs = shuffle([
        { left: 'Triangle', right: '3 sides' },
        { left: 'Square', right: '4 equal sides' },
        { left: 'Rectangle', right: '4 right angles' },
        { left: 'Circle', right: 'No corners' },
        { left: 'Hexagon', right: '6 sides' },
      ]).slice(0, 4)
      return makeMatch({
        level,
        grade,
        points: 20,
        prompt: 'Match the shape to its property.',
        leftLabel: 'Shape',
        rightLabel: 'Property',
        pairs,
      })
    }
    if (topic === 'p-measurement') {
      const pairs = shuffle([
        { left: '1 hour', right: '60 minutes' },
        { left: '1 metre', right: '100 centimetres' },
        { left: '1 kilogram', right: '1000 grams' },
        { left: '1 litre', right: '1000 millilitres' },
        { left: '1 week', right: '7 days' },
      ]).slice(0, 4)
      return makeMatch({
        level,
        grade,
        points: 20,
        prompt: 'Match the unit to its equivalent.',
        leftLabel: 'Unit',
        rightLabel: 'Equivalent',
        pairs,
      })
    }

    // p-number / p-addsub default
    const max = [20, 50, 99, 199, 499, 999][gi] ?? 99
    const pairs = shuffle([
      { left: 'Even numbers', right: 'End with 0,2,4,6,8' },
      { left: 'Odd numbers', right: 'End with 1,3,5,7,9' },
      { left: 'Nearest 10 of 47', right: '50' },
      { left: 'Compare: 72 ? 27', right: '72 > 27' },
      { left: `Round ${int(10, max)} to nearest 10`, right: 'ends with 0' },
    ]).slice(0, 4)
    return makeMatch({
      level,
      grade,
      points: 20,
      prompt: 'Match each idea to the best description.',
      leftLabel: 'Idea',
      rightLabel: 'Description',
      pairs,
    })
  }
  if (level === 'secondary') {
    const gi = gradeIndexWithinLevel('secondary', grade)
    if (topic === 's-integers') {
      const pairs = shuffle([
        { left: '-4 + 9', right: '5' },
        { left: '7 - 12', right: '-5' },
        { left: '-3 - 6', right: '-9' },
        { left: '8 + (-2)', right: '6' },
      ])
      return makeMatch({
        level,
        grade,
        points: 24,
        prompt: 'Match each integer expression to its value.',
        leftLabel: 'Expression',
        rightLabel: 'Value',
        pairs: pairs.slice(0, 4),
      })
    }
    if (topic === 's-linear') {
      const x = int(gi <= 1 ? -5 : -9, gi <= 1 ? 9 : 12)
      const a = pick([2, 3, 4, 5])
      const b = int(-10, 10)
      const fx = a * x + b
      const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`
      const pairs = shuffle([
        { left: `f(x)=${a}x ${bStr}`, right: `f(${x})=${fx}` },
        { left: 'Solve 2x=18', right: 'x=9' },
        { left: 'Simplify 3(x+4)', right: '3x+12' },
        { left: '2(a+b)', right: '2a+2b' },
      ])
      return makeMatch({
        level,
        grade,
        points: 24,
        prompt: 'Match the expression to its equivalent form.',
        leftLabel: 'Expression',
        rightLabel: 'Equivalent',
        pairs: pairs.slice(0, 4),
      })
    }
    if (topic === 's-ratiopercent') {
      const pairs = shuffle([
        { left: '3 : 4', right: '0.75' },
        { left: '2 : 5', right: '0.4' },
        { left: '7 : 10', right: '0.7' },
        { left: '25%', right: '0.25' },
        { left: '40%', right: '0.4' },
      ]).slice(0, 4)
      return makeMatch({
        level,
        grade,
        points: 24,
        prompt: 'Match each to its decimal value.',
        leftLabel: 'Ratio/Percent',
        rightLabel: 'Decimal',
        pairs,
      })
    }
    if (topic === 's-geometry') {
      const pairs = shuffle([
        { left: 'Straight angle', right: '180°' },
        { left: 'Right angle', right: '90°' },
        { left: 'Triangle angles sum', right: '180°' },
        { left: 'Rectangle area', right: 'length × width' },
        { left: 'Perimeter', right: 'sum of side lengths' },
      ]).slice(0, 4)
      return makeMatch({
        level,
        grade,
        points: 24,
        prompt: 'Match the term to the fact/formula.',
        leftLabel: 'Term',
        rightLabel: 'Fact / formula',
        pairs,
      })
    }
    if (topic === 's-fractions') {
      const pairs = shuffle([
        { left: '3/4', right: '0.75' },
        { left: '1/2', right: '0.5' },
        { left: '2/5', right: '0.4' },
        { left: '7/10', right: '0.7' },
        { left: '1/8', right: '0.125' },
      ]).slice(0, 4)
      return makeMatch({
        level,
        grade,
        points: 24,
        prompt: 'Match each fraction to its decimal.',
        leftLabel: 'Fraction',
        rightLabel: 'Decimal',
        pairs,
      })
    }
    if (topic === 's-data') {
      const pairs = shuffle([
        { left: 'Mean of 2, 4, 6', right: '4' },
        { left: 'Median of 1, 3, 9', right: '3' },
        { left: 'Range of 5, 11, 9', right: '6' },
        { left: 'Mode of 2, 2, 5, 7', right: '2' },
        { left: 'Mean of 4, 4, 4', right: '4' },
      ]).slice(0, 4)
      return makeMatch({
        level,
        grade,
        points: 24,
        prompt: 'Match the data question to its answer.',
        leftLabel: 'Question',
        rightLabel: 'Answer',
        pairs,
      })
    }

    const pairs = shuffle([
      { left: '3 : 4', right: '0.75' },
      { left: '2 : 5', right: '0.4' },
      { left: '7 : 10', right: '0.7' },
      { left: '5 : 2', right: '2.5' },
      { left: '9 : 3', right: '3' },
      ...(gi >= 2 ? [{ left: '12 : 5', right: '2.4' }] : []),
    ]).slice(0, 4)
    return makeMatch({
      level,
      grade,
      points: 22,
      prompt: 'Match the ratio a:b to the value of a ÷ b.',
      leftLabel: 'Ratio',
      rightLabel: 'a ÷ b',
      pairs,
    })
  }
  const gi = gradeIndexWithinLevel('high', grade)
  if (topic === 'h-trig') {
    const pairs = shuffle([
      { left: 'sin²θ + cos²θ', right: '1' },
      { left: 'sin(30°)', right: '1/2' },
      { left: 'cos(60°)', right: '1/2' },
      { left: 'sin(90°)', right: '1' },
      { left: 'cos(0°)', right: '1' },
    ]).slice(0, 4)
    return makeMatch({
      level,
      grade,
      points: 26,
      prompt: 'Match each trig item to its value.',
      leftLabel: 'Trig',
      rightLabel: 'Value',
      pairs,
    })
  }
  if (topic === 'h-indices') {
    const pairs = shuffle([
      { left: 'a^m × a^n', right: 'a^(m+n)' },
      { left: '(a^m)^n', right: 'a^(mn)' },
      { left: 'a^0', right: '1 (a ≠ 0)' },
      { left: 'a^(-n)', right: '1/a^n' },
      { left: 'log₁₀(1000)', right: '3' },
    ]).slice(0, 4)
    return makeMatch({
      level,
      grade,
      points: 26,
      prompt: 'Match the rule to its result.',
      leftLabel: 'Rule',
      rightLabel: 'Result',
      pairs,
    })
  }
  if (topic === 'h-functions') {
    const pairs = shuffle([
      { left: 'f(x) = 2x + 3, f(4)', right: '11' },
      { left: 'f(x) = x - 5, f(9)', right: '4' },
      { left: 'f(x) = 3x, f(6)', right: '18' },
      { left: 'f(x) = x^2, f(5)', right: '25' },
      { left: 'f(x) = 2x - 1, f(3)', right: '5' },
    ]).slice(0, 4)
    return makeMatch({
      level,
      grade,
      points: 26,
      prompt: 'Match each function rule to the correct value.',
      leftLabel: 'Function',
      rightLabel: 'Value',
      pairs,
    })
  }
  if (topic === 'h-quadratics') {
    const pairs = shuffle([
      { left: 'x^2 - 5x + 6', right: '(x - 2)(x - 3)' },
      { left: 'x^2 + 5x + 6', right: '(x + 2)(x + 3)' },
      { left: 'x^2 - x - 6', right: '(x - 3)(x + 2)' },
      { left: 'x^2 + x - 6', right: '(x + 3)(x - 2)' },
      { left: 'Discriminant of x^2+4x+1', right: '12' },
    ]).slice(0, 4)
    return makeMatch({
      level,
      grade,
      points: 26,
      prompt: 'Match each quadratic expression to its result.',
      leftLabel: 'Expression',
      rightLabel: 'Result',
      pairs,
    })
  }
  if (topic === 'h-sequences') {
    const pairs = shuffle([
      { left: '2, 5, 8, 11, ...', right: 'common difference 3' },
      { left: '3, 6, 12, 24, ...', right: 'common ratio 2' },
      { left: '1st term 4, difference 5, term 3', right: '14' },
      { left: '1st term 7, difference 2, term 4', right: '13' },
      { left: '5, 10, 20, 40, ...', right: 'geometric' },
    ]).slice(0, 4)
    return makeMatch({
      level,
      grade,
      points: 26,
      prompt: 'Match the sequence idea to the correct fact.',
      leftLabel: 'Sequence',
      rightLabel: 'Fact',
      pairs,
    })
  }
  if (topic === 'h-probability') {
    const pairs = shuffle([
      { left: 'Probability of heads on a fair coin', right: '1/2' },
      { left: 'Probability of rolling a 6', right: '1/6' },
      { left: 'Complement of probability 3/8', right: '5/8' },
      { left: 'Certain event', right: '1' },
      { left: 'Impossible event', right: '0' },
    ]).slice(0, 4)
    return makeMatch({
      level,
      grade,
      points: 26,
      prompt: 'Match the probability statement to its value.',
      leftLabel: 'Statement',
      rightLabel: 'Value',
      pairs,
    })
  }
  const pairs = shuffle([
    { left: 'sin²θ + cos²θ', right: '1' },
    { left: '(a + b)²', right: 'a² + 2ab + b²' },
    { left: 'log₁₀(1000)', right: '3' },
    { left: 'a⁰', right: '1 (a ≠ 0)' },
    { left: 'Δ for ax²+bx+c', right: 'b² − 4ac' },
    ...(gi >= 1 ? [{ left: '1/(1/x)', right: 'x (x ≠ 0)' }] : []),
  ]).slice(0, 4)
  return makeMatch({
    level,
    grade,
    points: 26,
    prompt: 'Match the expression to its simplified result.',
    leftLabel: 'Expression',
    rightLabel: 'Result',
    pairs,
  })
}

export function generateQuestion(
  level: Level,
  grade: Grade,
  _curriculum: Curriculum,
  topic: TopicId,
  activity: ActivityId,
): Question {
  if (activity === 'quickfire') {
    if (level === 'primary') return genPrimaryQuickfire(grade, topic)
    if (level === 'secondary') return genSecondaryQuickfire(grade, topic)
    return genHighQuickfire(grade, topic)
  }
  if (activity === 'pickone') return genPickOne(level, grade, topic)
  return genMatchPairs(level, grade, topic)
}
