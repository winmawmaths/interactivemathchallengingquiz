import { useEffect, useMemo, useRef, useState } from 'react'
import type { Curriculum, Grade, Level } from '../types'
import { generateQuestion } from '../quiz/generate'
import type { InputQuestion, QuizResult } from '../quiz/quizTypes'
import { clamp } from '../lib/random'
import type { TopicId } from '../quiz/topics'

function normalize(s: string) {
  return s.trim().replace(/\s+/g, '')
}

function isCorrect(expected: string, got: string) {
  const e = normalize(expected)
  const g = normalize(got)
  if (e.includes(',')) {
    const eParts = e.split(',').filter(Boolean).sort().join(',')
    const gParts = g.split(',').filter(Boolean).sort().join(',')
    return eParts === gParts
  }
  return e.toLowerCase() === g.toLowerCase()
}

export function QuickFire(props: {
  level: Level
  grade: Grade
  curriculum: Curriculum
  topic: TopicId
  onComplete: (r: QuizResult) => void
}) {
  const ROUND_SECONDS = props.level === 'primary' ? 60 : props.level === 'secondary' ? 70 : 75

  const [running, setRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [q, setQ] = useState<InputQuestion>(
    () =>
      generateQuestion(props.level, props.grade, props.curriculum, props.topic, 'quickfire') as InputQuestion,
  )
  const [answer, setAnswer] = useState('')
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [points, setPoints] = useState(0)
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const progress = useMemo(() => clamp(1 - timeLeft / ROUND_SECONDS, 0, 1), [timeLeft, ROUND_SECONDS])

  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          window.setTimeout(() => {
            setRunning(false)
            props.onComplete({ correct, total: Math.max(total, 1), points, bestStreak })
          }, 0)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [bestStreak, correct, points, props, running, total])

  useEffect(() => {
    if (!running) return
    inputRef.current?.focus()
  }, [running, q.id])

  function start() {
    setRunning(true)
    setTimeLeft(ROUND_SECONDS)
    setStreak(0)
    setBestStreak(0)
    setCorrect(0)
    setTotal(0)
    setPoints(0)
    setAnswer('')
    setFlash(null)
    setQ(generateQuestion(props.level, props.grade, props.curriculum, props.topic, 'quickfire') as InputQuestion)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  function next() {
    setAnswer('')
    setQ(generateQuestion(props.level, props.grade, props.curriculum, props.topic, 'quickfire') as InputQuestion)
  }

  function submit() {
    if (!running) return
    const ok = isCorrect(q.answer, answer)
    setTotal((t) => t + 1)
    if (ok) {
      setCorrect((c) => c + 1)
      setStreak((s) => {
        const ns = s + 1
        setBestStreak((b) => Math.max(b, ns))
        return ns
      })
      setPoints((p) => p + q.points + Math.min(10, streak))
      setFlash('good')
      window.setTimeout(() => setFlash(null), 180)
      next()
      return
    }

    setStreak(0)
    setFlash('bad')
    window.setTimeout(() => setFlash(null), 220)
  }

  return (
    <div className="card game-panel">
      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="chip">Quickfire Sprint</div>
            <div className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Beat the clock. Build a streak.
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              Correct answers increase streak bonus. Wrong answers reset streak.
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-black uppercase">
            <div className="stat-tile [data-theme='secondary']:[&]:bg-white/10">
              <div className="text-slate-500">Time</div>
              <div className="text-lg font-black text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {timeLeft}s
              </div>
            </div>
            <div className="stat-tile [data-theme='secondary']:[&]:bg-white/10">
              <div className="text-slate-500">Streak</div>
              <div className="text-lg font-black text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {streak}
              </div>
            </div>
            <div className="stat-tile [data-theme='secondary']:[&]:bg-white/10">
              <div className="text-slate-500">Points</div>
              <div className="text-lg font-black text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {points}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full border-2 border-[rgb(var(--line))] bg-black/10 [data-theme='secondary']:[&]:bg-white/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgb(34_197_94),rgb(250_204_21),rgb(var(--ring)))]"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div
          className={[
            'mt-7 rounded-2xl border-4 border-[rgb(var(--line))] bg-white/80 p-5 shadow-[0_8px_0_rgba(29,34,53,0.14)] sm:p-7',
            "[data-theme='secondary']:[&]:bg-white/10",
            flash === 'good' ? 'ring-4 ring-emerald-400/40' : '',
            flash === 'bad' ? 'ring-4 ring-red-400/40' : '',
          ].join(' ')}
        >
          <div className="text-sm font-black uppercase text-slate-500">Question</div>
          <div className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{q.prompt}</div>
          {q.hint && (
            <div className="mt-2 text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              Hint: {q.hint}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit()
              }}
              disabled={!running}
              placeholder={running ? 'Type answer...' : 'Press Start...'}
              className="w-full rounded-xl border-4 border-[rgb(var(--line))] bg-white/90 px-4 py-3 text-lg font-black tracking-tight outline-none ring-orange-400/30 focus:ring-4 disabled:opacity-60 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:text-slate-100"
            />
            <div className="flex gap-2">
              {!running ? (
                <button className="btn btn-primary px-6" type="button" onClick={start}>
                  Start
                </button>
              ) : (
                <button className="btn btn-primary px-6" type="button" onClick={submit}>
                  Submit
                </button>
              )}
              <button
                className="btn btn-ghost px-5"
                type="button"
                onClick={() => {
                  if (!running) return
                  setTotal((t) => t + 1)
                  setStreak(0)
                  next()
                }}
                disabled={!running}
              >
                Skip
              </button>
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
