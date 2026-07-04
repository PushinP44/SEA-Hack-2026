// The continuous illustrated world. Driven by a single `progress` number
// (0..5). A framer-motion spring animates toward the target so advancing a
// question glides the world forward and the Back button rewinds it in reverse.
// Everything is inline SVG (no emoji); ambient wind loops independently so the
// scene stays alive while a question is on screen.
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPE } from 'react'
import { animate, useMotionValue, useMotionValueEvent } from 'framer-motion'
import { beats, MAX_PROGRESS } from '../../data/scenes'
import BuddyCharacter, { type Outfit } from './BuddyCharacter'
import ChoiceIcon from './ChoiceIcon'
import type { Buddy } from '../../data/buddies'

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
function hexToRgb(h: string) {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function lerpColor(a: string, b: string, t: number) {
  const x = hexToRgb(a)
  const y = hexToRgb(b)
  return `rgb(${Math.round(lerp(x[0], y[0], t))},${Math.round(lerp(x[1], y[1], t))},${Math.round(lerp(x[2], y[2], t))})`
}

export type Burst = { icon: string; n: number }

export default function SceneStage({
  progress,
  buddy,
  outfit,
  chosen = [],
  burst,
}: {
  progress: number
  buddy: Buddy | null
  outfit?: Outfit
  chosen?: string[]
  burst?: Burst
}) {
  const mv = useMotionValue(progress)
  const [pv, setPv] = useState(progress)
  useMotionValueEvent(mv, 'change', (v) => setPv(v))
  useEffect(() => {
    const controls = animate(mv, progress, { type: 'spring', stiffness: 55, damping: 15 })
    return controls.stop
  }, [progress, mv])

  // Interpolate the two nearest beats by the fractional part of progress.
  const i = Math.max(0, Math.min(MAX_PROGRESS - 1, Math.floor(pv)))
  const f = Math.max(0, Math.min(1, pv - i))
  const a = beats[i]
  const b = beats[i + 1] ?? a
  const skyTop = lerpColor(a.skyTop, b.skyTop, f)
  const skyBottom = lerpColor(a.skyBottom, b.skyBottom, f)
  const hillFar = lerpColor(a.hillFar, b.hillFar, f)
  const hillMid = lerpColor(a.hillMid, b.hillMid, f)
  const ground = lerpColor(a.ground, b.ground, f)
  const cameraX = lerp(a.cameraX, b.cameraX, f)
  const wind = lerp(a.wind, b.wind, f)
  const bloom = lerp(a.bloom, b.bloom, f)

  // Wind → faster sway + stronger character lean.
  const swayDur = `${(2.6 - wind * 1.4).toFixed(2)}s`
  const lean = wind * 6 // degrees

  // Cursor makes the background react: parallax drift + little "pops".
  const [ptr, setPtr] = useState({ x: 0, y: 0 })
  const [pops, setPops] = useState<{ id: number; x: number; y: number }[]>([])
  const popId = useRef(0)
  const lastPop = useRef(0)
  const px = (depth: number) => ptr.x * depth
  const py = (depth: number) => ptr.y * depth

  // Click impact: the thing the child chose (bunny, house, mountains…) pops into
  // the world along the path and stays, so you watch the story build. Each
  // subject sits at its question's spot in the world, so as the camera pans the
  // buddy walks past the earlier choices. Reverses on Back (derived from chosen).
  const subjects = chosen.map((icon, k) => ({ icon, key: `${k}-${icon}`, worldX: 470 + beats[k].cameraX * 0.8 }))

  // Logical motion state:
  //  • walking — the world is mid-pan between beats → the doll walks.
  //  • gusting — a pick just happened → wind blows the subject in and the doll feels it.
  const walking = Math.abs(pv - progress) > 0.03
  const [gusting, setGusting] = useState(false)
  // The doll's choice-specific reaction (bounce to the drum, gaze up at the cloud…).
  const [reaction, setReaction] = useState<{ icon: string; v: number } | null>(null)
  useEffect(() => {
    if (!burst) return
    setGusting(true)
    setReaction({ icon: burst.icon, v: burst.n % 2 })
    const t1 = window.setTimeout(() => setGusting(false), 1100)
    const t2 = window.setTimeout(() => setReaction(null), 1500)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burst?.n])
  // Wind blows harder during a gust → grass whips faster.
  const effSway = gusting ? '0.5s' : swayDur

  function onMove(e: RPE<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    setPtr({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 })
    if (e.timeStamp - lastPop.current > 150) {
      lastPop.current = e.timeStamp
      const id = ++popId.current
      const vx = ((e.clientX - r.left) / r.width) * 800
      const vy = ((e.clientY - r.top) / r.height) * 520
      setPops((p) => [...p.slice(-7), { id, x: vx, y: vy }])
      window.setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 780)
    }
  }

  return (
    <div
      className={'scene' + (gusting ? ' gusting' : '')}
      style={{ '--sway': effSway } as CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={() => setPtr({ x: 0, y: 0 })}
    >
      <svg className="scene__svg" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={skyTop} />
            <stop offset="1" stopColor={skyBottom} />
          </linearGradient>
        </defs>

        {/* sky */}
        <rect x="0" y="0" width="800" height="520" fill="url(#sky)" />

        {/* sun */}
        <circle cx={640 - cameraX * 0.05 + px(-12)} cy={90 + py(-8)} r="42" fill="#f6e2a6" opacity="0.9" />

        {/* drifting clouds (ambient) */}
        <g className="scene__clouds" opacity="0.9" transform={`translate(${px(-24)} ${py(-10)})`}>
          <Cloud x={120} y={90} s={1} />
          <Cloud x={420} y={60} s={1.3} />
          <Cloud x={700} y={110} s={0.9} />
          <Cloud x={980} y={80} s={1.1} />
        </g>

        {/* far hills (slow parallax) — extended so they always fill the pan */}
        <g transform={`translate(${-cameraX * 0.2 + px(-18)} 0)`}>
          <path d={hillPath(300, 60)} fill={hillFar} />
          <path d={hillPath(320, 30, 400)} fill={hillFar} opacity="0.85" />
          <path d={hillPath(310, 45, 900)} fill={hillFar} />
          <path d={hillPath(320, 30, 1400)} fill={hillFar} opacity="0.85" />
        </g>

        {/* mid hill (the buddy walks along) — spans the full journey */}
        <g transform={`translate(${-cameraX * 0.5 + px(-32)} 0)`}>
          <path d="M-300 520 Q 200 260 500 330 T 1100 320 T 1700 320 T 2300 320 L2300 520 Z" fill={hillMid} />
        </g>

        {/* foreground ground + swaying grass (fast parallax + wind) */}
        <g transform={`translate(${-cameraX * 0.8 + px(-48)} 0)`}>
          <path d="M-300 520 Q 200 400 600 420 T 1200 410 T 1800 420 T 2600 410 L2600 520 Z" fill={ground} />
          <Grass baseY={440} />
        </g>

        {/* garden flowers that open as bloom — sit where the journey ends */}
        <g transform={`translate(${-cameraX * 0.8} 0)`} opacity={bloom}>
          {[1000, 1046, 1092, 1138, 1184, 1230].map((x, k) => (
            <Flower key={x} x={x} y={430 - (k % 2) * 12} open={bloom} alt={k % 2 === 0} />
          ))}
        </g>

        {/* story subjects — each choice the child made pops into the world and
            stays on the path; the buddy walks past them as the camera pans */}
        <g transform={`translate(${-cameraX * 0.8} 0)`}>
          {subjects.map((s) => (
            <SceneSubject key={s.key} icon={s.icon} x={s.worldX} y={372} />
          ))}
        </g>

        {/* wind streaks */}
        <g className="scene__wind" opacity={0.35 * wind + 0.1}>
          <path d="M40 180 q60 -16 120 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <path d="M120 230 q70 -16 140 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <path d="M60 290 q60 -14 120 0" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* drifting petals */}
        <g className="scene__petals">
          {[0, 1, 2, 3, 4].map((k) => (
            <circle key={k} className={`petal petal--${k}`} r="4" fill={k % 2 ? '#e7a6b8' : '#f0d089'} />
          ))}
        </g>

        {/* cursor pops — react where the mouse moves */}
        <g className="scene__pops">
          {pops.map((p) => (
            <Sparkle key={p.id} x={p.x} y={p.y} />
          ))}
        </g>

        {/* gust sweep — wind flows across the scene when a choice blows in */}
        {gusting && (
          <g className="gust-sweep" key={burst?.n}>
            {[120, 180, 250, 320].map((y, k) => (
              <path
                key={y}
                d={`M-140 ${y} q90 -20 180 0 t180 0`}
                fill="none"
                stroke="#ffffff"
                strokeWidth={3 - (k % 2)}
                strokeLinecap="round"
                opacity="0.7"
                style={{ animationDelay: `${k * 0.08}s` }}
              />
            ))}
          </g>
        )}
      </svg>

      {/* the chosen buddy = main character; walks between beats and leans into gusts */}
      {buddy && (
        <div
          className={
            'scene__hero' +
            (walking ? ' walking' : '') +
            (gusting ? ' gusting' : '') +
            (reaction ? ` react--${reaction.icon}` + (reaction.v ? ' rv2' : '') : '')
          }
          style={{ transform: `translateX(${px(26)}px)` }}
        >
          <div className="scene__hero-lean" style={{ transform: `rotate(${lean}deg)` }}>
            <div className="scene__hero-gust">
              <div className="scene__hero-react">
                <div className="scene__hero-bob">
                  <BuddyCharacter buddy={buddy} outfit={outfit} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Sparkle({ x, y }: { x: number; y: number }) {
  // Outer group positions; inner group animates (so the scale doesn't clobber the translate).
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="pop">
        <path d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z" fill="#fff6d8" stroke="#f0d089" strokeWidth="1" />
      </g>
    </g>
  )
}

function hillPath(peak: number, dip: number, shift = 0) {
  return `M${-100 + shift} 520 Q ${200 + shift} ${peak} ${400 + shift} ${peak + dip} T ${900 + shift} ${peak} L${1100 + shift} 520 Z`
}

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="34" ry="18" fill="#ffffff" />
      <ellipse cx="26" cy="6" rx="24" ry="14" fill="#ffffff" />
      <ellipse cx="-24" cy="6" rx="22" ry="13" fill="#ffffff" />
    </g>
  )
}

function Grass({ baseY }: { baseY: number }) {
  const blades = Array.from({ length: 84 }, (_, k) => k)
  return (
    <g>
      {blades.map((k) => {
        const x = -120 + k * 34
        const h = 26 + (k % 5) * 6
        return (
          <path
            key={k}
            className="blade"
            style={{ animationDelay: `${(k % 7) * 0.12}s` }}
            d={`M${x} ${baseY} q6 ${-h} 0 ${-h - 4}`}
            fill="none"
            stroke="#6f9a72"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )
      })}
    </g>
  )
}

function Flower({ x, y, open, alt }: { x: number; y: number; open: number; alt: boolean }) {
  const petal = alt ? '#e7a6b8' : '#f0d089'
  const r = 5 + open * 4
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1="0" x2="0" y2="34" stroke="#6f9a72" strokeWidth="4" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="0" cy={-8} rx={r * 0.6} ry={r} fill={petal} transform={`rotate(${deg})`} opacity={open} />
      ))}
      <circle cx="0" cy="0" r={3 * open} fill="#d89a74" />
    </g>
  )
}

function Visitor({ x, y, type }: { x: number; y: number; type: 'fox' | 'bunny' | 'bear' }) {
  return (
    <g transform={`translate(${x} ${y})`} className="scene__visitor">
      <ellipse cx="0" cy="30" rx="16" ry="4" fill="rgba(74,70,64,0.15)" />
      {type === 'fox' && (
        <>
          <path d="M-16 -6 l-3 -12 l10 6 Z M16 -6 l3 -12 l-10 6 Z" fill="#e08a4e" stroke="#4a4640" strokeWidth="1.6" />
          <ellipse cx="0" cy="8" rx="18" ry="16" fill="#e08a4e" stroke="#4a4640" strokeWidth="2" />
          <path d="M-8 16 q8 8 16 0 L0 24 Z" fill="#f4efe6" />
          <circle cx="-6" cy="4" r="2" fill="#4a4640" />
          <circle cx="6" cy="4" r="2" fill="#4a4640" />
          <circle cx="0" cy="12" r="2" fill="#4a4640" />
        </>
      )}
      {type === 'bunny' && (
        <>
          <ellipse className="pt-bunny-ear pt-bunny-ear--a" cx="-7" cy="-16" rx="4" ry="12" fill="#e3d6cc" stroke="#4a4640" strokeWidth="1.6" />
          <ellipse className="pt-bunny-ear pt-bunny-ear--b" cx="7" cy="-16" rx="4" ry="12" fill="#e3d6cc" stroke="#4a4640" strokeWidth="1.6" />
          <ellipse cx="0" cy="8" rx="16" ry="15" fill="#efe6e0" stroke="#4a4640" strokeWidth="2" />
          <circle cx="-6" cy="5" r="2" fill="#4a4640" />
          <circle cx="6" cy="5" r="2" fill="#4a4640" />
          <circle cx="0" cy="11" r="2" fill="#d98a97" />
        </>
      )}
      {type === 'bear' && (
        <>
          <circle cx="-12" cy="-8" r="6" fill="#b98d63" stroke="#4a4640" strokeWidth="1.6" />
          <circle cx="12" cy="-8" r="6" fill="#b98d63" stroke="#4a4640" strokeWidth="1.6" />
          <circle cx="0" cy="8" r="17" fill="#b98d63" stroke="#4a4640" strokeWidth="2" />
          <ellipse cx="0" cy="13" rx="7" ry="5" fill="#e8cfa8" />
          <circle cx="-6" cy="4" r="2" fill="#4a4640" />
          <circle cx="6" cy="4" r="2" fill="#4a4640" />
          <circle cx="0" cy="11" r="2" fill="#4a4640" />
        </>
      )}
    </g>
  )
}

// The subject of a chosen answer, dropped into the world. Each icon has its own
// bespoke motion (`.subj--<icon>` loop + `.pt-*` sub-parts + `.em--<icon>`
// emitter, all in theme.css). `.subject` handles the shared wind entrance so it
// composes with the per-icon transform without conflict.
function SceneSubject({ icon, x, y }: { icon: string; x: number; y: number }) {
  const animal = icon === 'bunny' || icon === 'bear'
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="8" rx="24" ry="5" fill="rgba(74,70,64,0.14)" />
      <g className="subject">
        <g className={`subj subj--${icon}`}>
          {animal ? (
            <g transform="translate(0 -20) scale(1.5)">
              <Visitor x={0} y={0} type={icon as 'bunny' | 'bear'} />
            </g>
          ) : (
            <g transform="translate(-38 -80) scale(1.2)">
              <ChoiceIcon name={icon} size={64} />
            </g>
          )}
          <Emitter icon={icon} />
        </g>
      </g>
    </g>
  )
}

// Ambient particles per subject — 5 nodes the CSS colours + animates per icon
// (dust drifts, rain falls, notes/sparkles rise, beat rings expand, smoke curls…).
function Emitter({ icon }: { icon: string }) {
  const NONE = new Set(['bear'])
  if (NONE.has(icon)) return null
  return (
    <g className={`em em--${icon}`}>
      {[0, 1, 2, 3, 4].map((k) => (
        <circle key={k} className={`emp emp--${k}`} cx="0" cy="-30" r="3" />
      ))}
    </g>
  )
}
