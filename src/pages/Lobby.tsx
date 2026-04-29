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
      className="no-tap-highlight card group relative overflow-hidden p-5 text-left transition hover:-translate-y-1 active:translate-y-1"
      aria-label={`Enter ${props.title} level`}
    >
      <div className={['pointer-events-none absolute -inset-10 opacity-70 transition group-hover:opacity-100', props.accents].join(' ')} />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="chip mb-3">{props.tagline}</div>
          <h2 className="text-2xl font-black tracking-tight">{props.title}</h2>
          <p className="mt-2 max-w-[45ch] text-sm font-semibold text-slate-600">{props.flavor}</p>
        </div>
        <div className="floaty grid h-12 w-12 place-items-center rounded-xl border-4 border-slate-800 bg-yellow-200 text-lg font-black shadow-[0_5px_0_rgba(29,34,53,0.2)]">
          GO
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-3 gap-2 text-xs font-black uppercase text-slate-700">
        <div className="rounded-xl border-2 border-slate-800 bg-white/80 px-3 py-2">Live streaks</div>
        <div className="rounded-xl border-2 border-slate-800 bg-white/80 px-3 py-2">Feedback</div>
        <div className="rounded-xl border-2 border-slate-800 bg-white/80 px-3 py-2">Team play</div>
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
    <main className="game-page">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl border-4 border-slate-800 bg-orange-300 shadow-[0_5px_0_rgba(29,34,53,0.2)]">
            <span className="text-xl font-black">M</span>
          </div>
          <div>
            <div className="text-sm font-black uppercase text-slate-500">Interactive Classroom</div>
            <div className="text-xl font-black tracking-tight">Math Challenge Lab</div>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="chip">No sign-in</span>
          <span className="chip">Runs offline</span>
        </div>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-stretch">
        <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-9">
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-[repeating-linear-gradient(90deg,rgba(29,34,53,0.16)_0_18px,rgba(255,255,255,0.35)_18px_36px)]" />
          <div className="chip mb-4">Teacher friendly / Student fun</div>
          <h1 className="relative text-4xl font-black tracking-tight sm:text-6xl">
            Play math like an <span className="text-orange-600">arcade</span>.
          </h1>
          <p className="relative mt-4 max-w-[60ch] text-base font-semibold text-slate-700 sm:text-lg">
            Choose a level, pick a topic, and jump into fast classroom games with scores, streaks,
            timers, and big tap targets.
          </p>

          <div className="relative mt-6">
            <div className="text-sm font-black uppercase text-slate-500">Curriculum</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {CURRICULUMS.map((c) => {
                const active = c.id === curriculum
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCurriculum(c.id)}
                    className={['choice-tile bg-white/80', active ? 'ring-4 ring-orange-400/50' : ''].join(' ')}
                  >
                    <div className="text-sm font-black tracking-tight">{c.label}</div>
                    <div className="mt-1 text-xs font-black uppercase text-slate-500">
                      Selected: {active ? 'Yes' : 'No'}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="relative mt-7 flex flex-wrap items-center gap-3">
            <a className="btn btn-primary" href="#levels">
              Choose a level
            </a>
            <div className="btn btn-ghost cursor-default normal-case">Project it and let teams race</div>
          </div>
        </div>

        <div className="card relative overflow-hidden p-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.16),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(250,204,21,0.45),transparent_18%)]" />
          <div className="relative">
            <div className="text-sm font-black uppercase text-slate-500">Game modes</div>
            <ul className="mt-3 space-y-2 text-sm font-bold text-slate-700">
              <li className="flex gap-2 rounded-xl border-2 border-slate-800 bg-white/80 px-3 py-2">
                <span className="font-black text-orange-600">1</span> Quickfire timed sprints
              </li>
              <li className="flex gap-2 rounded-xl border-2 border-slate-800 bg-white/80 px-3 py-2">
                <span className="font-black text-sky-600">2</span> Tap-to-choose challenges
              </li>
              <li className="flex gap-2 rounded-xl border-2 border-slate-800 bg-white/80 px-3 py-2">
                <span className="font-black text-emerald-600">3</span> Match-pairs concept linking
              </li>
              <li className="flex gap-2 rounded-xl border-2 border-slate-800 bg-white/80 px-3 py-2">
                <span className="font-black text-pink-600">4</span> Score, streak, and review
              </li>
            </ul>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-black uppercase text-slate-600">
              {LEVELS.map((l) => (
                <div key={l.id} className="rounded-xl border-2 border-slate-800 bg-yellow-100 px-3 py-2">
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
          tagline="Candy Quest"
          flavor="Big buttons, joyful animations, and quick wins for fundamentals and confidence."
          accents="bg-[conic-gradient(from_180deg,rgba(251,146,60,0.38),rgba(56,189,248,0.28),rgba(74,222,128,0.26),rgba(251,146,60,0.38))]"
          curriculum={curriculum}
        />
        <LevelCard
          id="secondary"
          title="Secondary"
          tagline="Neon Arcade"
          flavor="Faster pacing for mental math, operations, negative numbers, and algebra basics."
          accents="bg-[conic-gradient(from_240deg,rgba(34,211,238,0.38),rgba(244,114,182,0.32),rgba(250,204,21,0.28),rgba(34,211,238,0.38))]"
          curriculum={curriculum}
        />
        <LevelCard
          id="high"
          title="High School"
          tagline="Strategy Arena"
          flavor="Focused challenges for functions, algebraic structure, identities, and reasoning."
          accents="bg-[conic-gradient(from_90deg,rgba(20,184,166,0.35),rgba(129,140,248,0.28),rgba(245,158,11,0.26),rgba(20,184,166,0.35))]"
          curriculum={curriculum}
        />
      </section>

      <footer className="mt-auto pt-10 text-sm font-semibold text-slate-500">
        Built for classroom projection and quick team play. Extend the question generators in{' '}
        <code className="rounded bg-white/80 px-2 py-1 ring-1 ring-slate-200/50">src/quiz</code>.
      </footer>
    </main>
  )
}
