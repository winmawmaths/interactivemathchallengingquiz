import { Link, useSearchParams } from 'react-router-dom'
import { CURRICULUMS, LEVELS, isCurriculum, type Curriculum } from '../types'
import { useTheme } from '../lib/useTheme'
import { readLocal, writeLocal } from '../lib/persist'

function LevelCard(props: {
  id: 'primary' | 'secondary' | 'high'
  title: string
  tagline: string
  flavor: string
  accents: string
  curriculum: Curriculum
}) {
  return (
    <Link
      to={`/play/${props.id}?cur=${props.curriculum}`}
      className={[
        'no-tap-highlight group relative overflow-hidden rounded-[32px] border border-slate-200/40 bg-white/50 p-6 text-left shadow-[0_30px_90px_rgba(10,20,40,0.14)] backdrop-blur-xl transition',
        'hover:-translate-y-1 hover:shadow-[0_35px_120px_rgba(10,20,40,0.2)] active:translate-y-0',
      ].join(' ')}
      aria-label={`Enter ${props.title} level`}
    >
      <div
        className={[
          'pointer-events-none absolute -inset-16 opacity-80 blur-2xl transition group-hover:opacity-100 group-hover:blur-xl',
          props.accents,
        ].join(' ')}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="chip mb-3">{props.tagline}</div>
          <h2 className="text-2xl font-extrabold tracking-tight">{props.title}</h2>
          <p className="mt-2 max-w-[45ch] text-sm text-slate-600">{props.flavor}</p>
        </div>
        <div className="floaty grid h-12 w-12 place-items-center rounded-2xl bg-white/70 text-lg font-black ring-1 ring-slate-200/40">
          →
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
        <div className="rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/30">
          Live streaks
        </div>
        <div className="rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/30">
          Instant feedback
        </div>
        <div className="rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/30">
          Classroom-ready
        </div>
      </div>
    </Link>
  )
}

export function Lobby() {
  useTheme(null)
  const [sp, setSp] = useSearchParams()
  const curParam = sp.get('cur')
  const stored = readLocal<Curriculum>('mcl.curriculum', 'cambridge')
  const curriculum: Curriculum = isCurriculum(curParam) ? curParam : stored

  function setCurriculum(next: Curriculum) {
    writeLocal('mcl.curriculum', next)
    const ns = new URLSearchParams(sp)
    ns.set('cur', next)
    setSp(ns, { replace: true })
  }

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-6xl flex-col px-5 py-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/70 ring-1 ring-slate-200/40">
            <span className="text-xl font-black">∑</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500">Interactive Classroom</div>
            <div className="text-xl font-extrabold tracking-tight">Math Challenge Lab</div>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="chip">No sign-in</span>
          <span className="chip">Runs offline after load</span>
        </div>
      </header>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-end">
        <div className="glass rounded-[36px] p-7 sm:p-10">
          <div className="chip mb-4">Teacher friendly · Student fun</div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Turn practice into a <span className="text-indigo-600">game</span>.
          </h1>
          <p className="mt-4 max-w-[60ch] text-base text-slate-600 sm:text-lg">
            Choose a school level to enter a uniquely designed “math world”. Each world has
            different pacing, visuals, and activity styles—perfect for mixed classrooms.
          </p>

          <div className="mt-6">
            <div className="text-sm font-semibold text-slate-500">Curriculum</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
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
                      active ? 'ring-2 ring-[rgb(var(--ring))]' : '',
                    ].join(' ')}
                  >
                    <div className="text-sm font-extrabold tracking-tight">{c.label}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">
                      Selected: {active ? 'Yes' : 'No'}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a className="btn btn-primary" href="#levels">
              Choose a level
            </a>
            <div className="btn btn-ghost cursor-default">
              Tip: Project on a screen and let teams answer
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[36px] border border-white/40 bg-white/50 p-7 shadow-[0_40px_120px_rgba(10,20,40,0.16)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -inset-16 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.25),transparent_60%),radial-gradient(circle_at_70%_60%,rgba(236,72,153,0.18),transparent_55%),radial-gradient(circle_at_50%_95%,rgba(34,197,94,0.18),transparent_60%)] blur-2xl" />
          <div className="relative">
            <div className="text-sm font-semibold text-slate-500">What you get</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="font-black text-indigo-600">•</span> Quickfire timed sprints
              </li>
              <li className="flex gap-2">
                <span className="font-black text-indigo-600">•</span> Tap-to-choose challenges
              </li>
              <li className="flex gap-2">
                <span className="font-black text-indigo-600">•</span> Match-pairs concept linking
              </li>
              <li className="flex gap-2">
                <span className="font-black text-indigo-600">•</span> Score, streak, and review
              </li>
            </ul>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-600">
              {LEVELS.map((l) => (
                <div
                  key={l.id}
                  className="rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/30"
                >
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="levels" className="mt-10 grid gap-5 md:grid-cols-3">
        <LevelCard
          id="primary"
          title="Primary"
          tagline="Candy Lab"
          flavor="Big buttons, joyful animations, and quick wins. Great for fundamentals and confidence-building."
          accents="bg-[conic-gradient(from_180deg,rgba(236,72,153,0.35),rgba(99,102,241,0.25),rgba(34,197,94,0.22),rgba(236,72,153,0.35))]"
          curriculum={curriculum}
        />
        <LevelCard
          id="secondary"
          title="Secondary"
          tagline="Neon Arcade"
          flavor="Dark neon grid vibes with faster pacing. Designed for mental math, operations, and algebra basics."
          accents="bg-[conic-gradient(from_240deg,rgba(34,211,238,0.35),rgba(168,85,247,0.3),rgba(59,130,246,0.28),rgba(34,211,238,0.35))]"
          curriculum={curriculum}
        />
        <LevelCard
          id="high"
          title="High School"
          tagline="Studio Mode"
          flavor="Clean, premium, and calm—focused on reasoning: functions, algebraic structure, and identities."
          accents="bg-[conic-gradient(from_90deg,rgba(20,184,166,0.35),rgba(99,102,241,0.24),rgba(34,197,94,0.22),rgba(20,184,166,0.35))]"
          curriculum={curriculum}
        />
      </section>

      <footer className="mt-auto pt-10 text-sm text-slate-500">
        Built for classroom projection and quick team play. Extend the question generators in{' '}
        <code className="rounded bg-white/60 px-2 py-1 ring-1 ring-slate-200/30">src/quiz</code>.
      </footer>
    </main>
  )
}

