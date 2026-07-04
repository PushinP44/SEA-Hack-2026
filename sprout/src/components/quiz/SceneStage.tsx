// The continuous illustrated world — a cozy oil-pastel NIGHT MEADOW the buddy
// walks through. The terrain scrolls left forever (the buddy is walking right)
// via seamless, tiled parallax layers (each tile is 800 wide and repeats, so the
// loop has no seam). Progress still shifts the palette/bloom; picks manifest by
// TYPE (environment / held toy / alongside Farm Buddy). Emoji-free.
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPE } from 'react'
import { animate, useMotionValue, useMotionValueEvent } from 'framer-motion'
import { beats, MAX_PROGRESS } from '../../data/scenes'
import { envSet, heldToys, companions, effectKind } from '../../data/effects'
import BuddyCharacter, { type Outfit } from './BuddyCharacter'
import { findBuddy, type Buddy } from '../../data/buddies'

const TILE = 800 // one repeat of terrain; translating by -TILE loops seamlessly

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

  // Palette + bloom shift as the story progresses (position is the CSS scroll).
  const i = Math.max(0, Math.min(MAX_PROGRESS - 1, Math.floor(pv)))
  const f = Math.max(0, Math.min(1, pv - i))
  const a = beats[i]
  const b = beats[i + 1] ?? a
  const skyTop = lerpColor(a.skyTop, b.skyTop, f)
  const skyBottom = lerpColor(a.skyBottom, b.skyBottom, f)
  const hillFar = lerpColor(a.hillFar, b.hillFar, f)
  const hillMid = lerpColor(a.hillMid, b.hillMid, f)
  const ground = lerpColor(a.ground, b.ground, f)
  const beatWind = lerp(a.wind, b.wind, f)
  const bloom = lerp(a.bloom, b.bloom, f)

  const env = envSet(chosen)
  const toys = heldToys(chosen)
  const pals = companions(chosen)
  const wind = env.has('windy') ? Math.min(1, beatWind + 0.4) : beatWind

  const swayDur = `${(2.6 - wind * 1.4).toFixed(2)}s`
  const lean = wind * 6

  const [ptr, setPtr] = useState({ x: 0, y: 0 })
  const [pops, setPops] = useState<{ id: number; x: number; y: number }[]>([])
  const popId = useRef(0)
  const lastPop = useRef(0)
  const px = (depth: number) => ptr.x * depth
  const py = (depth: number) => ptr.y * depth

  const [gusting, setGusting] = useState(false)
  const [reaction, setReaction] = useState<{ icon: string; v: number } | null>(null)
  // A pick briefly changes HOW the buddy moves (dash / climb / hop…) then settles.
  const [traverse, setTraverse] = useState<string | undefined>()
  useEffect(() => {
    if (!burst) return
    setGusting(true)
    setReaction({ icon: burst.icon, v: burst.n % 2 })
    if (effectKind(burst.icon) !== 'buddy') setTraverse(burst.icon)
    const t1 = window.setTimeout(() => setGusting(false), 1100)
    const t2 = window.setTimeout(() => setReaction(null), 1500)
    const t3 = window.setTimeout(() => setTraverse(undefined), 1700)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burst?.n])
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

  // Three copies of each tile so the strip always covers the viewport as it scrolls.
  const tiles = [0, 1, 2]

  return (
    <div
      className={'scene' + (gusting ? ' gusting' : '') + (env.has('cloudy') ? ' cozy' : '')}
      style={{ '--sway': effSway } as CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={() => setPtr({ x: 0, y: 0 })}
    >
      <svg className="scene__svg" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={skyTop} />
            <stop offset="0.72" stopColor={skyTop} stopOpacity="0.2" />
            <stop offset="1" stopColor={skyBottom} />
          </linearGradient>
          <filter id="soft"><feGaussianBlur stdDeviation="0.7" /></filter>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        <rect x="0" y="0" width="800" height="520" fill="url(#sky)" />

        {/* sky is far away → moon + stars stay put as the buddy walks */}
        <Stars offX={px(-10)} offY={py(-6)} />
        <g transform={`translate(${640 + px(-14)} ${96 + py(-8)})`} filter="url(#soft)">
          <Moon />
        </g>

        {/* environment: 'cloudy' → plenty of clouds drift slowly across the sky */}
        {env.has('cloudy') && (
          <g className="scene__coziclouds" transform={`translate(${px(-20)} ${py(-8)})`}>
            {([[60, 74, 1], [250, 56, 1.3], [430, 96, 1], [610, 64, 1.2], [780, 112, 0.9], [980, 78, 1.15], [1180, 96, 1]] as const).map(([x, y, s], k) => (
              <g key={k} className="cozicloud" style={{ animationDelay: `${k * 1.4}s`, animationDuration: `${26 + (k % 3) * 6}s` }}>
                <Cloud x={x} y={y} s={s} />
              </g>
            ))}
          </g>
        )}

        {/* ---- scrolling parallax terrain (seamless, tiled) ---- */}
        <g transform={`translate(${px(-16)} 0)`}>
          <g className="scroll-far" filter="url(#soft)">
            {tiles.map((k) => (
              <g key={k} transform={`translate(${k * TILE} 0)`}>
                <FarTile far={hillFar} mountains={env.has('mountains')} />
              </g>
            ))}
          </g>
        </g>

        <g transform={`translate(${px(-30)} 0)`}>
          <g className="scroll-mid">
            {tiles.map((k) => (
              <g key={k} transform={`translate(${k * TILE} 0)`}>
                <MidTile mid={hillMid} house={env.has('house')} />
              </g>
            ))}
          </g>
        </g>

        <g transform={`translate(${px(-46)} 0)`}>
          <g className="scroll-fore">
            {tiles.map((k) => (
              <g key={k} transform={`translate(${k * TILE} 0)`}>
                <ForeTile ground={ground} bloom={bloom} />
              </g>
            ))}
          </g>
        </g>

        {/* environment: 'blow bubbles' → bubbles drift up and to the LEFT (walking right) */}
        {env.has('bubbles') && (
          <g className="scene__bubbles">
            {Array.from({ length: 11 }, (_, k) => (
              <circle key={k} className={`bubble bubble--${k % 5}`} style={{ animationDelay: `${(k * 0.7) % 4}s` }} cx={70 + k * 66} cy={470} r={6 + (k % 3) * 3} fill="rgba(170,205,224,0.26)" stroke="#a9c7d6" strokeWidth="1.5" />
            ))}
          </g>
        )}

        {/* wind arrives in gusts (more when 'windy' chosen) */}
        <g className={'scene__autogust' + (env.has('windy') ? ' windy' : '')} style={{ ['--wpeak' as string]: `${(0.35 + wind * 0.4).toFixed(2)}` } as CSSProperties}>
          {[150, 210, 275, 330].map((y, k) => (
            <path key={y} d={`M-160 ${y} q90 -18 180 0 t180 0 t180 0`} fill="none" stroke="#ffffff" strokeWidth={3 - (k % 2)} strokeLinecap="round" style={{ animationDelay: `${k * 0.12}s` }} />
          ))}
        </g>

        <g className="scene__petals">
          {[0, 1, 2, 3, 4].map((k) => (
            <circle key={k} className={`petal petal--${k}`} r="4" fill={k % 2 ? '#e7c8b0' : '#f0e0a8'} />
          ))}
        </g>

        <g className="scene__pops">
          {pops.map((p) => (
            <Sparkle key={p.id} x={p.x} y={p.y} />
          ))}
        </g>

        {gusting && (
          <g className="gust-sweep" key={burst?.n}>
            {[120, 180, 250, 320].map((y, k) => (
              <path key={y} d={`M-140 ${y} q90 -20 180 0 t180 0`} fill="none" stroke="#ffffff" strokeWidth={3 - (k % 2)} strokeLinecap="round" opacity="0.6" style={{ animationDelay: `${k * 0.08}s` }} />
            ))}
          </g>
        )}

        <rect x="0" y="0" width="800" height="520" filter="url(#grain)" opacity="0.06" style={{ mixBlendMode: 'multiply' }} />
      </svg>

      {/* the buddy = main character; always walking + swaying left/right; reacts to picks */}
      {buddy && (
        <div
          className={
            'scene__hero walking' +
            (gusting ? ' gusting' : '') +
            (traverse ? ` traverse--${traverse}` : '') +
            (reaction ? ` react--${reaction.icon}` + (reaction.v ? ' rv2' : '') : '')
          }
          style={{ transform: `translateX(${px(26)}px)` }}
        >
          <div className="scene__hero-sway">
            <div className="scene__hero-lean" style={{ transform: `rotate(${lean}deg)` }}>
              <div className="scene__hero-gust">
                <div className="scene__hero-react">
                  <div className="scene__hero-bob">
                    <BuddyCharacter buddy={buddy} outfit={outfit} held={toys.slice(-2)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Farm-Buddy friends alongside (half size), holding hands */}
      {buddy && pals.length > 0 && (
        <div className="scene__pals" style={{ transform: `translateX(${px(26)}px)` }}>
          {pals.slice(-2).map((key, k) => {
            const pb = findBuddy(key)
            return pb ? (
              <span key={k} className="pal" style={{ animationDelay: `${k * 0.12}s` }}>
                <BuddyCharacter buddy={pb} size={66} />
              </span>
            ) : null
          })}
          <span className="pal-link" aria-hidden />
        </div>
      )}
    </div>
  )
}

/* ---------------------------- terrain tiles (width 800, periodic) ---------------------------- */
// Each path starts and ends at the same height so tile N meets tile N+1 seamlessly.
function FarTile({ far, mountains }: { far: string; mountains: boolean }) {
  return (
    <g>
      {mountains && <path d="M0 340 L120 190 L250 300 L380 170 L520 300 L660 200 L800 320 L800 520 L0 520 Z" fill={far} opacity="0.85" />}
      <path d="M0 520 L0 300 Q 200 250 400 300 T 800 300 L800 520 Z" fill={far} />
      <Tree x={140} y={392} s={1.0} />
      <Tree x={600} y={398} s={1.2} />
    </g>
  )
}
function MidTile({ mid, house }: { mid: string; house: boolean }) {
  return (
    <g>
      <path d="M0 520 L0 340 Q 200 285 400 340 T 800 340 L800 520 Z" fill={mid} />
      {house && <Cottage x={470} y={356} />}
    </g>
  )
}
function ForeTile({ ground, bloom }: { ground: string; bloom: number }) {
  const blades = Array.from({ length: 24 }, (_, k) => k)
  return (
    <g>
      <path d="M0 520 L0 418 Q 200 384 400 418 T 800 418 L800 520 Z" fill={ground} />
      {blades.map((k) => {
        const x = 8 + k * 34
        const h = 24 + (k % 5) * 6
        return <path key={k} className="blade" style={{ animationDelay: `${(k % 7) * 0.12}s` }} d={`M${x} 440 q6 ${-h} 0 ${-h - 4}`} fill="none" stroke="#5c7d60" strokeWidth="4" strokeLinecap="round" />
      })}
      {bloom > 0.05 &&
        [120, 300, 480, 660].map((x, k) => <Flower key={x} x={x} y={432 - (k % 2) * 10} open={bloom} alt={k % 2 === 0} />)}
    </g>
  )
}

/* ---------------------------- scene pieces ---------------------------- */
function Moon() {
  return (
    <g>
      <circle cx="0" cy="0" r="40" fill="#f6e6b6" opacity="0.35" />
      <path d="M14 -32 A34 34 0 1 0 14 32 A26 30 0 1 1 14 -32 Z" fill="#f7e09c" stroke="#e7c98a" strokeWidth="1.5" />
      <path d="M-10 -4 q4 4 8 0 M2 -4 q4 4 8 0" fill="none" stroke="#c99a6a" strokeWidth="2" strokeLinecap="round" />
      <path d="M-6 8 q7 8 14 0" fill="none" stroke="#c99a6a" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="-14" cy="6" r="4" fill="#e9b48c" opacity="0.5" />
      <circle cx="12" cy="6" r="4" fill="#e9b48c" opacity="0.5" />
    </g>
  )
}

function Stars({ offX, offY }: { offX: number; offY: number }) {
  const stars = [
    [90, 70, 5, '#f0e0a8'], [200, 120, 4, '#cdd6f0'], [320, 60, 6, '#e7c8b0'], [470, 100, 4, '#f0e0a8'],
    [560, 150, 5, '#cdd6f0'], [700, 60, 4, '#e7c8b0'], [150, 200, 3, '#f0e0a8'], [420, 180, 3, '#cdd6f0'],
    [640, 200, 5, '#f0e0a8'], [260, 250, 4, '#e7c8b0'], [520, 250, 3, '#cdd6f0'], [750, 150, 4, '#f0e0a8'],
  ] as const
  return (
    <g className="scene__stars" transform={`translate(${offX} ${offY})`}>
      {stars.map(([x, y, r, fill], k) => (
        <g key={k} className="star" style={{ animationDelay: `${(k % 5) * 0.4}s` }} transform={`translate(${x} ${y})`}>
          <Star r={r as number} fill={fill as string} />
        </g>
      ))}
    </g>
  )
}
function Star({ r, fill }: { r: number; fill: string }) {
  return <path d={`M0 ${-r} Q ${r * 0.3} ${-r * 0.3} ${r} 0 Q ${r * 0.3} ${r * 0.3} 0 ${r} Q ${-r * 0.3} ${r * 0.3} ${-r} 0 Q ${-r * 0.3} ${-r * 0.3} 0 ${-r} Z`} fill={fill} />
}

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="34" ry="18" fill="#e9e4ee" opacity="0.9" />
      <ellipse cx="26" cy="6" rx="24" ry="14" fill="#e9e4ee" opacity="0.9" />
      <ellipse cx="-24" cy="6" rx="22" ry="13" fill="#e9e4ee" opacity="0.9" />
    </g>
  )
}

function Tree({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-6" y="10" width="12" height="40" rx="6" fill="#6b5340" />
      <circle cx="0" cy="-6" r="30" fill="#5f7d5f" />
      <circle cx="-22" cy="6" r="22" fill="#688769" />
      <circle cx="22" cy="6" r="22" fill="#688769" />
      <circle cx="0" cy="16" r="24" fill="#5f7d5f" />
    </g>
  )
}

function Cottage({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-34" y="-2" width="68" height="46" rx="6" fill="#efe0cf" stroke="#8a6f56" strokeWidth="2" />
      <path d="M-42 -2 L0 -40 L42 -2 Z" fill="#c98a6a" stroke="#8a6f56" strokeWidth="2" />
      <rect x="-12" y="18" width="20" height="26" rx="3" fill="#8a6f56" />
      <rect x="16" y="8" width="14" height="14" rx="2" fill="#f0e0a8" stroke="#8a6f56" strokeWidth="1.6" />
      <rect x="-30" y="8" width="14" height="14" rx="2" fill="#f0e0a8" stroke="#8a6f56" strokeWidth="1.6" />
      <rect x="18" y="-30" width="8" height="16" fill="#8a6f56" />
    </g>
  )
}

function Flower({ x, y, open, alt }: { x: number; y: number; open: number; alt: boolean }) {
  const petal = alt ? '#e7a6b8' : '#f0d089'
  const r = 5 + open * 4
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1="0" x2="0" y2="34" stroke="#5c7d60" strokeWidth="4" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="0" cy={-8} rx={r * 0.6} ry={r} fill={petal} transform={`rotate(${deg})`} opacity={open} />
      ))}
      <circle cx="0" cy="0" r={3 * open} fill="#d89a74" />
    </g>
  )
}

function Sparkle({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="pop">
        <path d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z" fill="#fff6d8" stroke="#f0d089" strokeWidth="1" />
      </g>
    </g>
  )
}
