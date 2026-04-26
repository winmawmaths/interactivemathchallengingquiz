import { useMemo, useState } from 'react'
import type { Curriculum, Grade, Level } from '../types'
import { shuffle } from '../lib/random'
import { generateQuestion } from '../quiz/generate'
import type { MatchPairsQuestion, QuizResult } from '../quiz/quizTypes'
import type { TopicId } from '../quiz/topics'

type PairState = {
  q: MatchPairsQuestion
  left: string[]
  right: string[]
  rightByLeft: Map<string, string>
}

function buildStateFor(level: Level, grade: Grade, curriculum: Curriculum, topic: TopicId): PairState {
  const q = generateQuestion(level, grade, curriculum, topic, 'matchpairs') as MatchPairsQuestion
  const left = q.pairs.map((p) => p.left)
  const right = shuffle(q.pairs.map((p) => p.right))
  const rightByLeft = new Map(q.pairs.map((p) => [p.left, p.right]))
  return { q, left, right, rightByLeft }
}

export function MatchPairs(props: {
  level: Level
  grade: Grade
  curriculum: Curriculum
  topic: TopicId
  onComplete: (r: QuizResult) => void
}) {
  const [state, setState] = useState<PairState>(() =>
    buildStateFor(props.level, props.grade, props.curriculum, props.topic),
  )
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matches, setMatches] = useState<Map<string, string>>(new Map())
  const [attempts, setAttempts] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const totalPairs = state.left.length
  const solved = matches.size
  const seconds = useMemo(() => {
    if (!startedAt) return 0
    return Math.max(0, Math.round((Date.now() - startedAt) / 1000))
  }, [startedAt, solved, done])

  function reset() {
    setState(buildStateFor(props.level, props.grade, props.curriculum, props.topic))
    setSelectedLeft(null)
    setMatches(new Map())
    setAttempts(0)
    setStartedAt(null)
    setDone(false)
  }

  function pickLeft(v: string) {
    if (done) return
    if (!startedAt) setStartedAt(Date.now())
    if (matches.has(v)) return
    setSelectedLeft((cur) => (cur === v ? null : v))
  }

  function pickRight(v: string) {
    if (done) return
    if (!selectedLeft) return
    if (!startedAt) setStartedAt(Date.now())

    setAttempts((a) => a + 1)
    const expected = state.rightByLeft.get(selectedLeft)
    if (expected === v) {
      setMatches((m) => {
        const nm = new Map(m)
        nm.set(selectedLeft, v)
        return nm
      })
      setSelectedLeft(null)
      const nowSolved = solved + 1
      if (nowSolved >= totalPairs) {
        setDone(true)
        const timeBonus = Math.max(0, 40 - seconds)
        const accuracyBonus = Math.max(0, 20 - Math.max(0, attempts - totalPairs) * 2)
        const pts = state.q.points + timeBonus + accuracyBonus
        props.onComplete({
          correct: totalPairs,
          total: totalPairs,
          points: pts,
          bestStreak: totalPairs,
        })
      }
    } else {
      // keep left selected; student can try another right option
    }
  }

  return (
    <div className="card relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -inset-20 opacity-70 blur-2xl">
        <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.18),transparent_60%),radial-gradient(circle_at_75%_45%,rgba(20,184,166,0.18),transparent_55%),radial-gradient(circle_at_40%_100%,rgba(99,102,241,0.16),transparent_60%)]" />
      </div>

      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="chip">Match Pairs</div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Connect the ideas.
            </div>
            <div className="mt-2 text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              Tap a left card, then tap its matching right card.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
            <div className="rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/30 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:ring-slate-600/40">
              <div className="text-slate-500">Solved</div>
              <div className="text-lg font-extrabold text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {solved}/{totalPairs}
              </div>
            </div>
            <div className="rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/30 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:ring-slate-600/40">
              <div className="text-slate-500">Attempts</div>
              <div className="text-lg font-extrabold text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {attempts}
              </div>
            </div>
            <div className="rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/30 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:ring-slate-600/40">
              <div className="text-slate-500">Time</div>
              <div className="text-lg font-extrabold text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {startedAt ? `${seconds}s` : '—'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 rounded-[28px] border border-slate-200/30 bg-white/70 p-5 sm:p-7 [data-theme='secondary']:[&]:border-slate-600/40 [data-theme='secondary']:[&]:bg-white/10">
          <div className="text-sm font-semibold text-slate-500">Prompt</div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{state.q.prompt}</div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold text-slate-500">
                {state.q.leftLabel ?? 'Left'}
              </div>
              <div className="grid gap-2">
                {state.left.map((v) => {
                  const matched = matches.has(v)
                  const active = selectedLeft === v
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => pickLeft(v)}
                      className={[
                        'no-tap-highlight rounded-[22px] px-4 py-4 text-left transition',
                        'ring-1 ring-slate-200/30 bg-white/70',
                        "[data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:ring-slate-600/40",
                        matched ? 'opacity-70' : 'hover:-translate-y-0.5',
                        active ? 'ring-4 ring-[rgba(var(--ring),0.35)]' : '',
                      ].join(' ')}
                      disabled={matched || done}
                    >
                      <div className="text-lg font-extrabold tracking-tight">{v}</div>
                      {matched && (
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          Matched → {matches.get(v)}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold text-slate-500">
                {state.q.rightLabel ?? 'Right'}
              </div>
              <div className="grid gap-2">
                {state.right.map((v) => {
                  const alreadyUsed = [...matches.values()].includes(v)
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => pickRight(v)}
                      className={[
                        'no-tap-highlight rounded-[22px] px-4 py-4 text-left transition',
                        'ring-1 ring-slate-200/30 bg-white/70',
                        "[data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:ring-slate-600/40",
                        alreadyUsed ? 'opacity-60' : 'hover:-translate-y-0.5',
                      ].join(' ')}
                      disabled={alreadyUsed || done || !selectedLeft}
                    >
                      <div className="text-lg font-extrabold tracking-tight">{v}</div>
                      {!selectedLeft && (
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          Pick a left card first
                        </div>
                      )}
                      {selectedLeft && (
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          Match with: <span className="font-extrabold">{selectedLeft}</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button className="btn btn-ghost px-6" type="button" onClick={reset}>
              New set
            </button>
            <div className="text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              {done ? (
                <span className="font-bold">Solved! Great teamwork.</span>
              ) : selectedLeft ? (
                <span>
                  Selected: <span className="font-bold">{selectedLeft}</span>
                </span>
              ) : (
                <span>Select a left card to begin.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

