import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Curriculum, Grade, Level } from '../types'
import { CURRICULUMS, GRADES_BY_LEVEL, gradeLabel, isCurriculum, isGrade, isLevel } from '../types'
import { useTheme } from '../lib/useTheme'
import { readLocal, writeLocal } from '../lib/persist'
import { ACTIVITIES } from '../quiz/activities'
import type { ActivityId, QuizResult } from '../quiz/quizTypes'
import { isTopicId, topicsFor, type TopicId } from '../quiz/topics'
import { QuickFire } from '../ui/QuickFire'
import { PickOne } from '../ui/PickOne'
import { MatchPairs } from '../ui/MatchPairs'
import { MathTug } from '../ui/MathTug'

function levelLabel(level: Level) {
  if (level === 'primary') return 'Primary / Candy Quest'
  if (level === 'secondary') return 'Secondary / Neon Arcade'
  return 'High School / Strategy Arena'
}

function ActivityPicker(props: {
  selected: ActivityId
  onSelect: (id: ActivityId) => void
}) {
  const covers: Record<ActivityId, { mark: string; cover: string; label: string }> = {
    mathtug: { mark: 'TUG', cover: 'cover-orange', label: 'Team battle' },
    quickfire: { mark: '60', cover: '', label: 'Speed game' },
    pickone: { mark: 'A+', cover: 'cover-green', label: 'Choice game' },
    matchpairs: { mark: '2x', cover: 'cover-pink', label: 'Puzzle game' },
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {ACTIVITIES.map((a) => {
        const active = a.id === props.selected
        const cover = covers[a.id]
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => props.onSelect(a.id)}
            className={[
              'game-tile group',
              active ? 'ring-4 ring-[rgba(var(--ring),0.42)]' : '',
            ].join(' ')}
          >
            <div className={['game-cover', cover.cover].join(' ')}>
              <div className="game-cover-mark">{cover.mark}</div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-black tracking-tight">{a.name}</div>
                <div className="chip">{active ? 'Active' : 'Tap'}</div>
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
                {a.blurb}
              </div>
              <div className="mt-3 text-xs font-black uppercase text-slate-500 [data-theme='secondary']:[&]:text-slate-300">
                {cover.label}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {a.skillTags.map((t) => (
                  <span
                    key={t}
                    className="rounded-lg border-2 border-slate-800 bg-white/80 px-3 py-1 text-xs font-black uppercase text-slate-700 [data-theme='secondary']:[&]:border-cyan-100/60 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:text-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ResultToast(props: { result: QuizResult; onClose: () => void }) {
  return (
    <div className="card fixed bottom-5 right-5 z-50 w-[min(420px,calc(100vw-40px))] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black uppercase text-slate-500">Round complete</div>
          <div className="mt-1 text-xl font-black tracking-tight">
            {props.result.points} pts / {props.result.correct}/{props.result.total} correct
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
            Best streak: <span className="font-bold">{props.result.bestStreak}</span>
          </div>
        </div>
        <button className="btn btn-ghost px-3 py-2 normal-case" onClick={props.onClose} type="button">
          Close
        </button>
      </div>
    </div>
  )
}

export function Play() {
  const params = useParams()
  const nav = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const level = useMemo(() => (isLevel(params.level) ? params.level : null), [params.level])
  const grade = useMemo(() => (isGrade(params.grade) ? params.grade : null), [params.grade])
  const curParam = searchParams.get('cur')
  const stored = readLocal<Curriculum>('mcl.curriculum', 'cambridge')
  const curriculum: Curriculum = isCurriculum(curParam) ? curParam : stored
  useTheme(level)

  const [activity, setActivity] = useState<ActivityId>('mathtug')
  const [lastResult, setLastResult] = useState<QuizResult | null>(null)

  const grades = level ? GRADES_BY_LEVEL[level] : GRADES_BY_LEVEL.primary
  const defaultGrade = grades[0]!
  const activeGrade: Grade = grade && grades.includes(grade) ? grade : defaultGrade
  const topicPacks = level ? topicsFor(level, activeGrade, curriculum) : []
  const topicParam = searchParams.get('topic')
  const activeTopic: TopicId =
    isTopicId(topicParam) && topicPacks.some((t) => t.id === topicParam)
      ? topicParam
      : (topicPacks[0]?.id ?? 'p-number')

  if (!level) {
    return (
      <main className="game-page items-center justify-center">
        <div className="card p-6 text-center">
          <div className="text-2xl font-black">Unknown level</div>
          <p className="mt-2 font-semibold text-slate-600">Go back and choose a valid school level.</p>
          <Link className="btn btn-primary mt-5" to="/">
            Back to lobby
          </Link>
        </div>
      </main>
    )
  }

  function setCurriculum(next: Curriculum) {
    writeLocal('mcl.curriculum', next)
    const ns = new URLSearchParams(searchParams)
    ns.set('cur', next)
    setSearchParams(ns, { replace: true })
  }

  return (
    <main className="game-page">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link className="btn btn-ghost px-4 py-2 normal-case" to="/">
            Lobby
          </Link>
          <div>
            <div className="text-sm font-black uppercase text-slate-500">Level</div>
            <div className="text-xl font-black tracking-tight">{levelLabel(level)}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">Grade: {gradeLabel(activeGrade)}</span>
          <span className="chip">
            Curriculum: {CURRICULUMS.find((c) => c.id === curriculum)?.short ?? curriculum.toUpperCase()}
          </span>
          <span className="chip">Projector-ready</span>
        </div>
      </header>

      <section className="mt-6">
        <div className="card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-black uppercase text-slate-500">Choose curriculum</div>
              <div className="text-lg font-black tracking-tight">Align quizzes to your syllabus</div>
            </div>
            <div className="text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              Saved for next time.
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CURRICULUMS.map((c) => {
              const active = c.id === curriculum
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCurriculum(c.id)}
                  className={[
                    'choice-tile',
                    "[data-theme='secondary']:[&]:bg-white/10",
                    active ? 'ring-4 ring-[rgba(var(--ring),0.42)]' : '',
                  ].join(' ')}
                >
                  <div className="text-sm font-black tracking-tight">{c.label}</div>
                  <div className="mt-1 text-xs font-black uppercase text-slate-500">
                    {active ? 'Active' : 'Tap to select'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-black uppercase text-slate-500">Choose grade</div>
              <div className="text-lg font-black tracking-tight">Teacher controls difficulty</div>
            </div>
            <div className="text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              Higher grades unlock bigger numbers + deeper reasoning.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {grades.map((g) => {
              const active = g === activeGrade
              return (
                <button
                  key={g}
                  type="button"
                  className={[
                    'choice-tile px-3 py-2 text-center text-sm',
                    "[data-theme='secondary']:[&]:bg-white/10",
                    active ? 'ring-4 ring-[rgba(var(--ring),0.42)]' : '',
                  ].join(' ')}
                  onClick={() => {
                    const base = `/play/${level}/${g}`
                    nav(`${base}?${searchParams.toString()}`)
                  }}
                >
                  {g}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-black uppercase text-slate-500">Choose topic pack</div>
              <div className="text-lg font-black tracking-tight">Grade / Topic / Activity</div>
            </div>
            <div className="text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
              Bookmarkable: your selection stays in the URL.
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {topicPacks.map((t) => {
              const active = t.id === activeTopic
              return (
                <button
                  key={t.id}
                  type="button"
                  className={[
                    'choice-tile',
                    "[data-theme='secondary']:[&]:bg-white/10",
                    active ? 'ring-4 ring-[rgba(var(--ring),0.42)]' : '',
                  ].join(' ')}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams)
                    next.set('topic', t.id)
                    setSearchParams(next, { replace: true })
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black tracking-tight">{t.label}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
                        {t.blurb}
                      </div>
                    </div>
                    <div className="chip">{active ? 'Active' : 'Tap'}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <ActivityPicker selected={activity} onSelect={setActivity} />
      </section>

      <section className="mt-6 grow">
        {activity === 'mathtug' && (
          <MathTug
            level={level}
            grade={activeGrade}
            curriculum={curriculum}
            topic={activeTopic}
            onComplete={setLastResult}
          />
        )}
        {activity === 'quickfire' && (
          <QuickFire
            level={level}
            grade={activeGrade}
            curriculum={curriculum}
            topic={activeTopic}
            onComplete={setLastResult}
          />
        )}
        {activity === 'pickone' && (
          <PickOne
            level={level}
            grade={activeGrade}
            curriculum={curriculum}
            topic={activeTopic}
            onComplete={setLastResult}
          />
        )}
        {activity === 'matchpairs' && (
          <MatchPairs
            level={level}
            grade={activeGrade}
            curriculum={curriculum}
            topic={activeTopic}
            onComplete={setLastResult}
          />
        )}
      </section>

      {lastResult && <ResultToast result={lastResult} onClose={() => setLastResult(null)} />}
    </main>
  )
}
