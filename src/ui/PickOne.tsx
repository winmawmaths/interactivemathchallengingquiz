import { useEffect, useMemo, useState } from 'react'
import type { Curriculum, Grade, Level } from '../types'
import { generateQuestion } from '../quiz/generate'
import type { McqQuestion, QuizResult } from '../quiz/quizTypes'
import { clamp } from '../lib/random'
import type { TopicId } from '../quiz/topics'

type Phase = 'ready' | 'playing' | 'reveal' | 'done'

export function PickOne(props: {
  level: Level
  grade: Grade
  curriculum: Curriculum
  topic: TopicId
  onComplete: (r: QuizResult) => void
}) {
  const QUESTIONS = props.level === 'primary' ? 10 : props.level === 'secondary' ? 12 : 12
  const PER_QUESTION_SECONDS = props.level === 'primary' ? 9 : props.level === 'secondary' ? 10 : 11

  const [phase, setPhase] = useState<Phase>('ready')
  const [index, setIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(PER_QUESTION_SECONDS)
  const [q, setQ] = useState<McqQuestion>(
    () =>
      generateQuestion(props.level, props.grade, props.curriculum, props.topic, 'pickone') as McqQuestion,
  )
  const [picked, setPicked] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [points, setPoints] = useState(0)

  const progress = useMemo(
    () => clamp(1 - timeLeft / PER_QUESTION_SECONDS, 0, 1),
    [timeLeft, PER_QUESTION_SECONDS],
  )

  useEffect(() => {
    if (phase !== 'playing') return
    const t = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          window.setTimeout(() => {
            setPicked(-1)
            setStreak(0)
            setPhase('reveal')
          }, 0)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [phase])

  function freshQuestion() {
    setQ(generateQuestion(props.level, props.grade, props.curriculum, props.topic, 'pickone') as McqQuestion)
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
      props.onComplete({ correct, total: QUESTIONS, points, bestStreak })
      return
    }
    setIndex(nextIndex)
    setPhase('playing')
    freshQuestion()
  }

  return (
    <div className="card game-panel">
      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="chip">One Is Correct</div>
            <div className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Pick the right card in time.
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              {QUESTIONS} questions / timer resets each question.
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-black uppercase">
            <div className="stat-tile [data-theme='secondary']:[&]:bg-white/10">
              <div className="text-slate-500">Q</div>
              <div className="text-lg font-black text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {Math.min(index + 1, QUESTIONS)}/{QUESTIONS}
              </div>
            </div>
            <div className="stat-tile [data-theme='secondary']:[&]:bg-white/10">
              <div className="text-slate-500">Time</div>
              <div className="text-lg font-black text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {phase === 'playing' ? `${timeLeft}s` : '--'}
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

        <div className="mt-7 rounded-2xl border-4 border-[rgb(var(--line))] bg-white/80 p-5 shadow-[0_8px_0_rgba(29,34,53,0.14)] sm:p-7 [data-theme='secondary']:[&]:bg-white/10">
          <div className="text-sm font-black uppercase text-slate-500">Prompt</div>
          <div className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">{q.prompt}</div>
          {phase === 'reveal' && q.explain && (
            <div className="mt-2 text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
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
                  ? 'ring-4 ring-emerald-400/50'
                  : show && (isPicked || timedOut) && !isCorrect
                    ? 'ring-4 ring-red-400/50'
                    : ''
              return (
                <button
                  key={`${q.id}-${i}`}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={phase !== 'playing'}
                  className={['choice-tile disabled:opacity-80 [data-theme=\'secondary\']:[&]:bg-white/10', ring].join(' ')}
                >
                  <div className="text-xs font-black uppercase text-slate-500">Choice {i + 1}</div>
                  <div className="mt-1 text-xl font-black tracking-tight">{c}</div>
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

            <div className="text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              Correct: <span className="font-bold">{correct}</span> / Best streak:{' '}
              <span className="font-bold">{bestStreak}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
