import { Link, useSearchParams } from 'react-router-dom'
import { CURRICULUMS, isCurriculum, type Curriculum } from '../types'
import { useTheme } from '../lib/useTheme'
import { readLocal, writeLocal } from '../lib/persist'

const SUBJECTS = ['All', 'Addition', 'Fractions', 'Algebra', 'Logic', 'Speed']
const GRADES = ['K', '1', '2', '3', '4', '5', '6+']

const GAME_TILES = [
  {
    title: 'Times Table Rally',
    blurb: 'Race the clock with quick multiplication facts.',
    level: 'primary',
    grade: '3-5',
    mark: 'x2',
    cover: 'cover-orange',
  },
  {
    title: 'Fraction Launch',
    blurb: 'Choose equal fractions before the rocket lifts off.',
    level: 'primary',
    grade: '4-6',
    mark: '3/4',
    cover: 'cover-green',
  },
  {
    title: 'Integer Warp',
    blurb: 'Jump through positive and negative number gates.',
    level: 'secondary',
    grade: '6+',
    mark: '-7',
    cover: 'cover-pink',
  },
  {
    title: 'Algebra Dash',
    blurb: 'Solve for x and build a high-score streak.',
    level: 'secondary',
    grade: '6+',
    mark: 'x',
    cover: '',
  },
  {
    title: 'Function Arena',
    blurb: 'Match rules, inputs, and outputs under pressure.',
    level: 'high',
    grade: '9+',
    mark: 'f',
    cover: 'cover-green',
  },
  {
    title: 'Logic Links',
    blurb: 'Connect patterns and equivalent forms.',
    level: 'high',
    grade: '8+',
    mark: '99',
    cover: 'cover-orange',
  },
] as const

const SCORE_ROWS = [
  ['Top Score', 'Quickfire Sprint', '980'],
  ['Most Points', 'Algebra Dash', '760'],
  ['In A Row', 'Fraction Launch', '24'],
]

function GameTile(props: (typeof GAME_TILES)[number] & { curriculum: Curriculum }) {
  return (
    <Link to={`/play/${props.level}?cur=${props.curriculum}`} className="game-tile">
      <div className={['game-cover', props.cover].join(' ')}>
        <div className="game-cover-mark">{props.mark}</div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black tracking-tight">{props.title}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-600">{props.blurb}</p>
          </div>
          <span className="chip shrink-0">{props.grade}</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase text-slate-500">Free math game</span>
          <span className="rounded-xl border-2 border-slate-900 bg-yellow-200 px-3 py-1 text-xs font-black uppercase">
            Play
          </span>
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
    <main className="game-page">
      <header className="flex flex-col gap-4 rounded-2xl border-4 border-[rgb(var(--line))] bg-white/90 p-4 shadow-[0_7px_0_rgba(29,34,53,0.16)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-xl border-4 border-slate-900 bg-orange-300 shadow-[0_5px_0_rgba(29,34,53,0.2)]">
            <span className="text-2xl font-black">M</span>
          </div>
          <div>
            <div className="text-sm font-black uppercase text-slate-500">Purposeful play / Fast facts</div>
            <div className="text-2xl font-black tracking-tight">Math Challenge Arcade</div>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          <a className="filter-pill" href="#games">
            Math Games
          </a>
          <a className="filter-pill" href="#scores">
            Top Scores
          </a>
          <a className="filter-pill" href="#curriculum">
            Curriculum
          </a>
        </nav>
      </header>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[repeating-linear-gradient(90deg,rgba(29,34,53,0.16)_0_18px,rgba(255,255,255,0.4)_18px_36px)]" />
          <div className="relative max-w-3xl">
            <div className="chip mb-4">Arcade + academics = fun learning</div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Play free math games by grade and skill.
            </h1>
            <p className="mt-4 text-base font-semibold text-slate-700 sm:text-lg">
              Pick a bright game tile, choose a topic, and practice with timers, points, streaks,
              matching challenges, and classroom-friendly controls.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="btn btn-primary" href="#games">
                Play
              </a>
              <a className="btn btn-ghost normal-case" href="#filters">
                Browse by grade
              </a>
            </div>
          </div>
        </div>

        <aside id="scores" className="card p-5">
          <div className="text-sm font-black uppercase text-slate-500">Today's Top Players</div>
          <div className="mt-3 space-y-3">
            {SCORE_ROWS.map(([label, game, score]) => (
              <div key={label} className="rounded-xl border-2 border-slate-900 bg-yellow-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase text-slate-500">{label}</div>
                    <div className="font-black">{game}</div>
                  </div>
                  <div className="rounded-xl border-2 border-slate-900 bg-white px-3 py-1 text-lg font-black">
                    {score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section id="filters" className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="card p-4">
          <div className="mb-3 text-sm font-black uppercase text-slate-500">Grades</div>
          <div className="grid grid-cols-7 gap-2">
            {GRADES.map((grade) => (
              <div key={grade} className="filter-pill">
                {grade}
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <div className="mb-3 text-sm font-black uppercase text-slate-500">Subjects</div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SUBJECTS.map((subject) => (
              <div key={subject} className="filter-pill">
                {subject}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="games" className="mt-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-black uppercase text-slate-500">Play Free Games</div>
            <h2 className="text-3xl font-black tracking-tight">Choose your challenge</h2>
          </div>
          <div className="chip">Practice / Challenge / Logic</div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GAME_TILES.map((game) => (
            <GameTile key={game.title} {...game} curriculum={curriculum} />
          ))}
        </div>
      </section>

      <section id="curriculum" className="mt-8 card p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-black uppercase text-slate-500">Curriculum</div>
            <h2 className="text-2xl font-black tracking-tight">Choose the question path</h2>
          </div>
          <div className="text-sm font-semibold text-slate-600">Saved for your next round.</div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
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
                  {active ? 'Active' : 'Tap to select'}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <footer className="mt-auto pt-10 text-sm font-semibold text-slate-500">
        Inspired by kid-friendly math game portals: big covers, quick play, grade filters, and visible scores.
      </footer>
    </main>
  )
}
