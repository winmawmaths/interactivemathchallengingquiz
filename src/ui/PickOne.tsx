import { useEffect, useMemo, useState } from 'react'
import type { Level } from '../types'
import { generateQuestion } from '../quiz/generate'
import type { McqQuestion, QuizResult } from '../quiz/quizTypes'
import { clamp } from '../lib/random'

type Phase = 'ready' | 'playing' | 'reveal' | 'done'

export function PickOne(props: { level: Level; onComplete: (r: QuizResult) => void }) {
  const QUESTIONS = props.level === 'primary' ? 10 : props.level === 'secondary' ? 12 : 12
  const PER_QUESTION_SECONDS = props.level === 'primary' ? 9 : props.level === 'secondary' ? 10 : 11

  const [phase, setPhase] = useState<Phase>('ready')
  const [index, setIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(PER_QUESTION_SECONDS)
  const [q, setQ] = useState<McqQuestion>(() => generateQuestion(props.level, 'pickone') as McqQuestion)
  const [picked, setPicked] = useState<number | null>(null)

  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [points, setPoints] = useState(0)

  const progress = useMemo(() => clamp(1 - timeLeft / PER_QUESTION_SECONDS, 0, 1), [timeLeft, PER_QUESTION_SECONDS])

  useEffect(() => {
    if (phase !== 'playing') return
    const t = window.setInterval(() => {
      setTimeLeft((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft > 0) return
    setPicked(-1) // timeout
    setStreak(0)
    setPhase('reveal')
  }, [timeLeft, phase])

  function freshQuestion() {
    setQ(generateQuestion(props.level, 'pickone') as McqQuestion)
    setPicked(null)
    setTimeLeft(PER_QUESTION_SECONDS)
  }

  function start() {
    setPhase('playing')
    setIndex(0)
    setStreak(0)
    setBestStreak(0)
    setCorrect(0)
    setPoints(0)
    freshQuestion()
  }

  function choose(i: number) {
    if (phase !== 'playing') return
    setPicked(i)
    const ok = i === q.answerIndex
    if (ok) {
      setCorrect((c) => c + 1)
      setStreak((s) => {
        const ns = s + 1
        setBestStreak((b) => Math.max(b, ns))
        return ns
      })
      setPoints((p) => p + q.points + Math.min(8, streak))
    } else {
      setStreak(0)
    }
    setPhase('reveal')
  }

  function next() {
    const nextIndex = index + 1
    if (nextIndex >= QUESTIONS) {
      setPhase('done')
      props.onComplete({
        correct,
        total: QUESTIONS,
        points,
        bestStreak,
      })
      return
    }
    setIndex(nextIndex)
    setPhase('playing')
    freshQuestion()
  }

  return (
    <div className="card relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -inset-20 opacity-70 blur-2xl">
        <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.24),transparent_60%),radial-gradient(circle_at_80%_40%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_45%_100%,rgba(99,102,241,0.16),transparent_60%)]" />
      </div>

      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="chip">One Is Correct</div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Pick the right card in time.
            </div>
            <div className="mt-2 text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              {QUESTIONS} questions · timer resets each question.
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
            <div className="rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/30 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:ring-slate-600/40">
              <div className="text-slate-500">Q</div>
              <div className="text-lg font-extrabold text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {Math.min(index + 1, QUESTIONS)}/{QUESTIONS}
              </div>
            </div>
            <div className="rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/30 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:ring-slate-600/40">
              <div className="text-slate-500">Time</div>
              <div className="text-lg font-extrabold text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {phase === 'playing' ? `${timeLeft}s` : '—'}
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

        <div className="mt-7 rounded-[28px] border border-slate-200/30 bg-white/70 p-5 sm:p-7 [data-theme='secondary']:[&]:border-slate-600/40 [data-theme='secondary']:[&]:bg-white/10">
          <div className="text-sm font-semibold text-slate-500">Prompt</div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{q.prompt}</div>
          {phase === 'reveal' && q.explain && (
            <div className="mt-2 text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              {q.explain}
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {q.choices.map((c, i) => {
              const isCorrect = i === q.answerIndex
              const isPicked = picked === i
              const timedOut = picked === -1
              const show = phase === 'reveal'
              const ring =
                show && isCorrect
                  ? 'ring-4 ring-emerald-400/40'
                  : show && (isPicked || timedOut) && !isCorrect
                    ? 'ring-4 ring-red-400/40'
                    : 'ring-1 ring-slate-200/30'
              return (
                <button
                  key={`${q.id}-${i}`}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={phase !== 'playing'}
                  className={[
                    'no-tap-highlight relative overflow-hidden rounded-[24px] px-4 py-4 text-left transition',
                    'bg-white/70 hover:-translate-y-0.5 disabled:opacity-80',
                    "[data-theme='secondary']:[&]:bg-white/10",
                    ring,
                  ].join(' ')}
                >
                  <div className="pointer-events-none absolute -inset-10 opacity-0 blur-2xl transition group-hover:opacity-60" />
                  <div className="text-xs font-semibold text-slate-500">Choice {i + 1}</div>
                  <div className="mt-1 text-xl font-extrabold tracking-tight">{c}</div>
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {phase === 'ready' && (
              <button className="btn btn-primary px-6" type="button" onClick={start}>
                Start round
              </button>
            )}
            {phase === 'reveal' && (
              <button className="btn btn-primary px-6" type="button" onClick={next}>
                Next
              </button>
            )}
            {phase === 'done' && (
              <button className="btn btn-primary px-6" type="button" onClick={start}>
                Play again
              </button>
            )}

            <div className="text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              Correct: <span className="font-bold">{correct}</span> · Best streak:{' '}
              <span className="font-bold">{bestStreak}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

