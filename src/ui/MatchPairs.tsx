import { useEffect, useState } from 'react'
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
  const [started, setStarted] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [done, setDone] = useState(false)

  const totalPairs = state.left.length
  const solved = matches.size

  useEffect(() => {
    if (!started || done) return
    const t = window.setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(t)
  }, [done, started])

  function reset() {
    setState(buildStateFor(props.level, props.grade, props.curriculum, props.topic))
    setSelectedLeft(null)
    setMatches(new Map())
    setAttempts(0)
    setStarted(false)
    setSeconds(0)
    setDone(false)
  }

  function pickLeft(v: string) {
    if (done) return
    if (!started) setStarted(true)
    if (matches.has(v)) return
    setSelectedLeft((cur) => (cur === v ? null : v))
  }

  function pickRight(v: string) {
    if (done) return
    if (!selectedLeft) return
    if (!started) setStarted(true)

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
    }
  }

  return (
    <div className="card game-panel">
      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="chip">Match Pairs</div>
            <div className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Connect the ideas.
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              Tap a left card, then tap its matching right card.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-black uppercase">
            <div className="stat-tile [data-theme='secondary']:[&]:bg-white/10">
              <div className="text-slate-500">Solved</div>
              <div className="text-lg font-black text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {solved}/{totalPairs}
              </div>
            </div>
            <div className="stat-tile [data-theme='secondary']:[&]:bg-white/10">
              <div className="text-slate-500">Attempts</div>
              <div className="text-lg font-black text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {attempts}
              </div>
            </div>
            <div className="stat-tile [data-theme='secondary']:[&]:bg-white/10">
              <div className="text-slate-500">Time</div>
              <div className="text-lg font-black text-slate-900 [data-theme='secondary']:[&]:text-slate-100">
                {started ? `${seconds}s` : '--'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border-4 border-[rgb(var(--line))] bg-white/80 p-5 shadow-[0_8px_0_rgba(29,34,53,0.14)] sm:p-7 [data-theme='secondary']:[&]:bg-white/10">
          <div className="text-sm font-black uppercase text-slate-500">Prompt</div>
          <div className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">{state.q.prompt}</div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-black uppercase text-slate-500">
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
                        'choice-tile [data-theme=\'secondary\']:[&]:bg-white/10',
                        matched ? 'opacity-70' : '',
                        active ? 'ring-4 ring-[rgba(var(--ring),0.42)]' : '',
                      ].join(' ')}
                      disabled={matched || done}
                    >
                      <div className="text-lg font-black tracking-tight">{v}</div>
                      {matched && (
                        <div className="mt-1 text-xs font-black uppercase text-slate-500">
                          Matched: {matches.get(v)}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-black uppercase text-slate-500">
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
                        'choice-tile [data-theme=\'secondary\']:[&]:bg-white/10',
                        alreadyUsed ? 'opacity-60' : '',
                      ].join(' ')}
                      disabled={alreadyUsed || done || !selectedLeft}
                    >
                      <div className="text-lg font-black tracking-tight">{v}</div>
                      {!selectedLeft && (
                        <div className="mt-1 text-xs font-black uppercase text-slate-500">
                          Pick a left card first
                        </div>
                      )}
                      {selectedLeft && (
                        <div className="mt-1 text-xs font-black uppercase text-slate-500">
                          Match with: <span className="font-black">{selectedLeft}</span>
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
            <div className="text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
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
