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

function levelLabel(level: Level) {
  if (level === 'primary') return 'Primary · Candy Lab'
  if (level === 'secondary') return 'Secondary · Neon Arcade'
  return 'High School · Studio Mode'
}

function ActivityPicker(props: {
  selected: ActivityId
  onSelect: (id: ActivityId) => void
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {ACTIVITIES.map((a) => {
        const active = a.id === props.selected
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => props.onSelect(a.id)}
            className={[
              'no-tap-highlight card group relative overflow-hidden p-5 text-left transition',
              active ? 'ring-2 ring-[rgb(var(--ring))]' : 'hover:-translate-y-0.5',
            ].join(' ')}
          >
            <div className="pointer-events-none absolute -inset-16 opacity-70 blur-2xl transition group-hover:opacity-100">
              <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.22),transparent_60%),radial-gradient(circle_at_70%_60%,rgba(236,72,153,0.18),transparent_55%),radial-gradient(circle_at_40%_95%,rgba(34,197,94,0.16),transparent_60%)]" />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-extrabold tracking-tight">{a.name}</div>
                <div className="chip">{active ? 'Active' : 'Tap'}</div>
              </div>
              <div className="mt-2 text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
                {a.blurb}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {a.skillTags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/30 [data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:text-slate-200 [data-theme='secondary']:[&]:ring-slate-600/40"
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
          <div className="text-sm font-semibold text-slate-500">Round complete</div>
          <div className="mt-1 text-xl font-extrabold tracking-tight">
            {props.result.points} pts · {props.result.correct}/{props.result.total} correct
          </div>
          <div className="mt-2 text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
            Best streak: <span className="font-bold">{props.result.bestStreak}</span>
          </div>
        </div>
        <button className="btn btn-ghost px-3 py-2" onClick={props.onClose} type="button">
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

  const [activity, setActivity] = useState<ActivityId>('quickfire')
  const [lastResult, setLastResult] = useState<QuizResult | null>(null)

  if (!level) {
    return (
      <main className="mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-5 py-10">
        <div className="card p-6 text-center">
          <div className="text-2xl font-extrabold">Unknown level</div>
          <p className="mt-2 text-slate-600">Go back and choose a valid school level.</p>
          <Link className="btn btn-primary mt-5" to="/">
            Back to lobby
          </Link>
        </div>
      </main>
    )
  }

  const grades = GRADES_BY_LEVEL[level]
  const defaultGrade = grades[0]!
  const activeGrade: Grade = grade && grades.includes(grade) ? grade : defaultGrade
  const topicPacks = topicsFor(level, activeGrade, curriculum)
  const topicParam = searchParams.get('topic')
  const activeTopic: TopicId = useMemo(() => {
    if (isTopicId(topicParam) && topicPacks.some((t) => t.id === topicParam)) return topicParam
    return topicPacks[0]?.id ?? 'p-number'
  }, [topicParam, topicPacks])

  function setCurriculum(next: Curriculum) {
    writeLocal('mcl.curriculum', next)
    const ns = new URLSearchParams(searchParams)
    ns.set('cur', next)
    setSearchParams(ns, { replace: true })
  }

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-6xl flex-col px-5 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link className="btn btn-ghost px-4 py-2" to="/">
            ← Lobby
          </Link>
          <div>
            <div className="text-sm font-semibold text-slate-500">Level</div>
            <div className="text-xl font-extrabold tracking-tight">{levelLabel(level)}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">Grade: {gradeLabel(activeGrade)}</span>
          <span className="chip">
            Curriculum:{' '}
            {CURRICULUMS.find((c) => c.id === curriculum)?.short ?? curriculum.toUpperCase()}
          </span>
          <span className="chip">Made for projector</span>
        </div>
      </header>

      <section className="mt-6">
        <div className="card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-500">Choose curriculum</div>
              <div className="text-lg font-extrabold tracking-tight">Align quizzes to your syllabus</div>
            </div>
            <div className="text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
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
                    'no-tap-highlight rounded-2xl px-4 py-3 text-left transition',
                    'ring-1 ring-slate-200/30 bg-white/60 hover:-translate-y-0.5',
                    "[data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:ring-slate-600/40",
                    active ? 'ring-2 ring-[rgb(var(--ring))]' : '',
                  ].join(' ')}
                >
                  <div className="text-sm font-extrabold tracking-tight">{c.label}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
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
              <div className="text-sm font-semibold text-slate-500">Choose grade</div>
              <div className="text-lg font-extrabold tracking-tight">Teacher controls difficulty</div>
            </div>
            <div className="text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
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
                    'no-tap-highlight rounded-2xl px-3 py-2 text-sm font-extrabold transition',
                    'ring-1 ring-slate-200/30 bg-white/60 hover:-translate-y-0.5',
                    "[data-theme='secondary']:[&]:bg-white/10 [data-theme='secondary']:[&]:ring-slate-600/40",
                    active ? 'ring-2 ring-[rgb(var(--ring))]' : '',
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
              <div className="text-sm font-semibold text-slate-500">Choose topic pack</div>
              <div className="text-lg font-extrabold tracking-tight">Grade → Topic → Activity</div>
            </div>
            <div className="text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
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
                    'no-tap-highlight card p-5 text-left transition',
                    active ? 'ring-2 ring-[rgb(var(--ring))]' : 'hover:-translate-y-0.5',
                  ].join(' ')}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams)
                    next.set('topic', t.id)
                    setSearchParams(next, { replace: true })
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-extrabold tracking-tight">{t.label}</div>
                      <div className="mt-1 text-sm text-slate-600 [data-theme='secondary']:[&]:text-slate-300">
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

