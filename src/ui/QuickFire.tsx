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

  const progress = useMemo(() => {
    return clamp(1 - timeLeft / ROUND_SECONDS, 0, 1)
  }, [timeLeft, ROUND_SECONDS])

  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) return 0
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [running])

  useEffect(() => {
    if (!running) return
    if (timeLeft > 0) return
    setRunning(false)
    props.onComplete({ correct, total: Math.max(total, 1), points, bestStreak })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, running])

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
    <div className="card relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -inset-20 opacity-70 blur-2xl">
        <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.26),transparent_60%),radial-gradient(circle_at_75%_45%,rgba(236,72,153,0.18),transparent_55%),radial-gradient(circle_at_40%_100%,rgba(34,197,94,0.16),transparent_60%)]" />
      </div>

      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="chip">Quickfire Sprint</div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Beat the clock. Build a streak.
            </div>
            <div className="mt-2 text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              Correct answers increase streak bonus. Wrong answers reset streak.
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
            <div className="rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/30 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:ring-slate-600/40">
              <div className="text-slate-500">Time</div>
              <div className="text-lg font-extrabold text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {timeLeft}s
              </div>
            </div>
            <div className="rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/30 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:ring-slate-600/40">
              <div className="text-slate-500">Streak</div>
              <div className="text-lg font-extrabold text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {streak}
              </div>
            </div>
            <div className="rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/30 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:ring-slate-600/40">
              <div className="text-slate-500">Points</div>
              <div className="text-lg font-extrabold text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {points}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/5 [data-theme='secondary']:[&]:bg-white/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgb(var(--ring)),rgb(168_85_247))]"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div
          className={[
            'mt-7 rounded-[28px] border p-5 sm:p-7',
            'bg-white/70 border-slate-200/30 [data-theme=\'secondary\']:[&]:bg-white/10 [data-theme=\'secondary\']:[&]:border-slate-600/40',
            flash === 'good' ? 'ring-4 ring-emerald-400/40' : '',
            flash === 'bad' ? 'ring-4 ring-red-400/40' : '',
          ].join(' ')}
        >
          <div className="text-sm font-semibold text-slate-500">Question</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{q.prompt}</div>
          {q.hint && (
            <div className="mt-2 text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
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
              placeholder={running ? 'Type answer…' : 'Press Start…'}
              className="w-full rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3 text-lg font-semibold tracking-tight outline-none ring-indigo-500/30 focus:ring-4 disabled:opacity-60 [data-theme='secondary']:[&]:border-slate-600/50 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:text-slate-100"
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

          <div className="mt-4 text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
            Correct: <span className="font-bold">{correct}</span> · Attempts:{' '}
            <span className="font-bold">{total}</span> · Best streak:{' '}
            <span className="font-bold">{bestStreak}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

