import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Curriculum, Grade, Level } from '../types'
import { generateQuestion } from '../quiz/generate'
import type { InputQuestion, QuizResult } from '../quiz/quizTypes'
import type { TopicId } from '../quiz/topics'

function normalize(s: string) {
  return s.trim().replace(/\s+/g, '').toLowerCase()
}

function answerMatches(expected: string, got: string) {
  const e = normalize(expected)
  const g = normalize(got)
  if (e.includes(',')) {
    return e.split(',').filter(Boolean).sort().join(',') === g.split(',').filter(Boolean).sort().join(',')
  }
  return e === g
}

export function MathTug(props: {
  level: Level
  grade: Grade
  curriculum: Curriculum
  topic: TopicId
  onComplete: (r: QuizResult) => void
}) {
  const ROUND_SECONDS = props.level === 'primary' ? 75 : props.level === 'secondary' ? 80 : 90
  const WIN_DISTANCE = 5

  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [pull, setPull] = useState(0)
  const [answer, setAnswer] = useState('')
  const [q, setQ] = useState<InputQuestion>(
    () => generateQuestion(props.level, props.grade, props.curriculum, props.topic, 'mathtug') as InputQuestion,
  )
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [points, setPoints] = useState(0)
  const [message, setMessage] = useState('Win the rope by answering fast.')

  const inputRef = useRef<HTMLInputElement | null>(null)

  const markerLeft = useMemo(() => 50 + (pull / WIN_DISTANCE) * 38, [pull])
  const playerWinning = pull > 0
  const rivalWinning = pull < 0

  const finish = useCallback(
    (text: string) => {
      setRunning(false)
      setDone(true)
      setMessage(text)
      props.onComplete({
        correct,
        total: Math.max(total, 1),
        points: points + Math.max(0, pull) * 12,
        bestStreak,
      })
    },
    [bestStreak, correct, points, props, pull, total],
  )

  useEffect(() => {
    if (!running || done) return
    const t = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          window.setTimeout(() => finish('Time up!'), 0)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [done, finish, running])

  useEffect(() => {
    if (!running || done) return
    inputRef.current?.focus()
  }, [done, q.id, running])

  function freshQuestion() {
    setQ(generateQuestion(props.level, props.grade, props.curriculum, props.topic, 'mathtug') as InputQuestion)
    setAnswer('')
  }

  function start() {
    setRunning(true)
    setDone(false)
    setTimeLeft(ROUND_SECONDS)
    setPull(0)
    setCorrect(0)
    setTotal(0)
    setStreak(0)
    setBestStreak(0)
    setPoints(0)
    setMessage('Pull the rope to your side.')
    freshQuestion()
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  function submit() {
    if (!running || done) return
    const ok = answerMatches(q.answer, answer)
    const nextTotal = total + 1
    setTotal(nextTotal)

    if (ok) {
      const nextPull = Math.min(WIN_DISTANCE, pull + 1)
      const nextCorrect = correct + 1
      const nextPoints = points + q.points + Math.min(12, streak * 2)
      setPull(nextPull)
      setCorrect(nextCorrect)
      setPoints(nextPoints)
      setStreak((s) => {
        const ns = s + 1
        setBestStreak((b) => Math.max(b, ns))
        return ns
      })
      setMessage('Great pull! Keep going.')
      if (nextPull >= WIN_DISTANCE) {
        window.setTimeout(() => {
          setRunning(false)
          setDone(true)
          setMessage('Your team wins the tug!')
          props.onComplete({
            correct: nextCorrect,
            total: nextTotal,
            points: nextPoints + 60,
            bestStreak: Math.max(bestStreak, streak + 1),
          })
        }, 0)
        return
      }
      freshQuestion()
      return
    }

    const nextPull = Math.max(-WIN_DISTANCE, pull - 1)
    setPull(nextPull)
    setStreak(0)
    setMessage('Rival team pulls back.')
    if (nextPull <= -WIN_DISTANCE) {
      window.setTimeout(() => finish('Rival team wins this round.'), 0)
      return
    }
    freshQuestion()
  }

  return (
    <div className="card game-panel">
      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="chip">Math Tug of War</div>
            <div className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Answer right to pull your team across.
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              Correct answers pull right. Wrong answers pull left.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-black uppercase">
            <div className="stat-tile [data-theme='secondary']:[&]:bg-white/10">
              <div className="text-slate-500">Time</div>
              <div className="text-lg font-black">{timeLeft}s</div>
            </div>
            <div className="stat-tile [data-theme='secondary']:[&]:bg-white/10">
              <div className="text-slate-500">Pull</div>
              <div className="text-lg font-black">{pull}</div>
            </div>
            <div className="stat-tile [data-theme='secondary']:[&]:bg-white/10">
              <div className="text-slate-500">Points</div>
              <div className="text-lg font-black">{points}</div>
            </div>
          </div>
        </div>

        <div className="tug-field mt-6">
          <div className="tug-center-line" />
          <div className="tug-team left-5 bg-red-100">
            <div>
              <div className="text-4xl font-black">A</div>
              <div className="text-xs font-black uppercase text-slate-600">Rivals</div>
            </div>
          </div>
          <div className="tug-team right-5 bg-sky-100">
            <div>
              <div className="text-4xl font-black">B</div>
              <div className="text-xs font-black uppercase text-slate-600">Your Team</div>
            </div>
          </div>
          <div className="tug-lane" />
          <div
            className={[
              'tug-marker',
              playerWinning ? 'bg-sky-200' : '',
              rivalWinning ? 'bg-red-200' : '',
            ].join(' ')}
            style={{ left: `${markerLeft}%` }}
          >
            =
          </div>
        </div>

        <div className="mt-6 rounded-2xl border-4 border-[rgb(var(--line))] bg-white/85 p-5 shadow-[0_8px_0_rgba(29,34,53,0.14)] [data-theme='secondary']:[&]:bg-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-black uppercase text-slate-500">Question</div>
              <div className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{q.prompt}</div>
              {q.hint && (
                <div className="mt-2 text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
                  Hint: {q.hint}
                </div>
              )}
            </div>
            <div className="chip">{message}</div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit()
              }}
              disabled={!running || done}
              placeholder={running ? 'Type answer...' : 'Press Start...'}
              className="w-full rounded-xl border-4 border-[rgb(var(--line))] bg-white/90 px-4 py-3 text-lg font-black tracking-tight outline-none ring-sky-400/30 focus:ring-4 disabled:opacity-60 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:text-slate-100"
            />
            <div className="flex gap-2">
              {!running ? (
                <button className="btn btn-primary px-6" type="button" onClick={start}>
                  Start
                </button>
              ) : (
                <button className="btn btn-primary px-6" type="button" onClick={submit}>
                  Pull
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
            Correct: <span className="font-bold">{correct}</span> / Attempts:{' '}
            <span className="font-bold">{total}</span> / Best streak:{' '}
            <span className="font-bold">{bestStreak}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
