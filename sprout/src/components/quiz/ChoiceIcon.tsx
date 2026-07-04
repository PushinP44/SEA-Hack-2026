// Emoji-free choice icons — simple, on-brand inline SVGs keyed by name.
// Each renders inside a 64x64 viewBox. Colours use the Apple Park pastel palette.
import type { ReactElement } from 'react'

const INK = '#4a4640'
const SAGE = '#8fb47f'
const ROSE = '#d99aa2'
const TERRA = '#d89a74'
const SKY = '#8fb8d6'
const SUN = '#e6c766'
const CREAM = '#f4efe6'

const S = { fill: 'none', stroke: INK, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const icons: Record<string, () => ReactElement> = {
  // ---- Q1: windy hill ----
  run: () => (
    <g>
      <circle cx="38" cy="16" r="6" fill={INK} />
      <path d="M40 24 L30 34 L38 40 L34 52" {...S} />
      <path d="M30 34 L20 30" {...S} className="pt-run-limb pt-run-limb--a" />
      <path d="M40 24 L50 30" {...S} className="pt-run-limb pt-run-limb--b" />
      <path className="pt-run-speed" d="M8 20 q10 -3 16 0 M6 30 q12 -3 18 0 M10 40 q9 -3 14 0" fill="none" stroke={SKY} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  kite: () => (
    <g>
      <path d="M32 10 L46 26 L32 40 L18 26 Z" fill={ROSE} stroke={INK} strokeWidth="2.5" />
      <path d="M32 10 L32 40 M18 26 L46 26" stroke={INK} strokeWidth="1.6" />
      <path d="M32 40 q4 8 -2 12 q6 2 4 8" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  cloud: () => (
    <g>
      <path d="M18 40 a10 10 0 0 1 4 -19 a12 12 0 0 1 22 3 a8 8 0 0 1 0 16 Z" fill={CREAM} stroke={INK} strokeWidth="2.5" />
      <path d="M12 48 q8 -3 14 0 M22 55 q8 -3 14 0" fill="none" stroke={SKY} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  pinwheel: () => (
    <g>
      <line x1="32" y1="30" x2="32" y2="54" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M32 30 L18 20 A16 16 0 0 1 32 14 Z" fill={SAGE} stroke={INK} strokeWidth="1.6" />
      <path d="M32 30 L44 16 A16 16 0 0 1 50 30 Z" fill={ROSE} stroke={INK} strokeWidth="1.6" />
      <path d="M32 30 L46 40 A16 16 0 0 1 32 46 Z" fill={SUN} stroke={INK} strokeWidth="1.6" />
      <path d="M32 30 L20 44 A16 16 0 0 1 14 30 Z" fill={TERRA} stroke={INK} strokeWidth="1.6" />
      <circle cx="32" cy="30" r="3" fill={INK} />
    </g>
  ),

  // ---- Q2: music ----
  drum: () => (
    <g>
      <ellipse cx="32" cy="24" rx="18" ry="7" fill={ROSE} stroke={INK} strokeWidth="2.5" />
      <path d="M14 24 V40 a18 7 0 0 0 36 0 V24" fill={ROSE} stroke={INK} strokeWidth="2.5" />
      <path d="M14 40 a18 7 0 0 0 36 0" fill="none" stroke={INK} strokeWidth="2" />
      <line className="pt-drum-stick pt-drum-stick--a" x1="44" y1="10" x2="52" y2="20" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <line className="pt-drum-stick pt-drum-stick--b" x1="20" y1="10" x2="14" y2="20" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  waves: () => (
    <g>
      <path d="M8 26 q6 -8 12 0 t12 0 t12 0 t12 0" fill="none" stroke={SKY} strokeWidth="3" strokeLinecap="round" />
      <path d="M8 38 q6 -8 12 0 t12 0 t12 0 t12 0" fill="none" stroke={SKY} strokeWidth="3" strokeLinecap="round" />
      <path d="M8 50 q6 -8 12 0 t12 0 t12 0 t12 0" fill="none" stroke={SKY} strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  piano: () => (
    <g>
      <rect x="12" y="20" width="40" height="26" rx="4" fill={CREAM} stroke={INK} strokeWidth="2.5" />
      <line x1="20" y1="20" x2="20" y2="40" stroke={INK} strokeWidth="2" />
      <line x1="28" y1="20" x2="28" y2="40" stroke={INK} strokeWidth="2" />
      <line x1="36" y1="20" x2="36" y2="40" stroke={INK} strokeWidth="2" />
      <line x1="44" y1="20" x2="44" y2="40" stroke={INK} strokeWidth="2" />
      <rect x="17" y="20" width="6" height="12" fill={INK} />
      <rect x="33" y="20" width="6" height="12" fill={INK} />
      <rect x="41" y="20" width="6" height="12" fill={INK} />
    </g>
  ),
  flute: () => (
    <g>
      <rect x="10" y="30" width="44" height="8" rx="4" fill={SUN} stroke={INK} strokeWidth="2.5" transform="rotate(-18 32 34)" />
      <circle cx="24" cy="37" r="2" fill={INK} />
      <circle cx="31" cy="34" r="2" fill={INK} />
      <circle cx="38" cy="31" r="2" fill={INK} />
      <path d="M50 14 q6 2 3 8" fill="none" stroke={SAGE} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),

  // ---- Q3: window views ----
  mountains: () => (
    <g>
      <path d="M8 48 L24 22 L34 38 L44 20 L56 48 Z" fill={SAGE} stroke={INK} strokeWidth="2.5" />
      <path d="M20 30 L24 22 L28 30 Z" fill={CREAM} />
      <path d="M40 28 L44 20 L48 28 Z" fill={CREAM} />
      <circle className="pt-mtn-sun" cx="46" cy="14" r="5" fill={SUN} />
    </g>
  ),
  flowers: () => (
    <g>
      {[20, 32, 44].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="52" x2={x} y2="34" stroke={SAGE} strokeWidth="3" strokeLinecap="round" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={x} cy="30" rx="3.4" ry="6" fill={i === 1 ? ROSE : SUN} transform={`rotate(${a} ${x} 34)`} />
          ))}
          <circle cx={x} cy="34" r="3" fill={TERRA} />
        </g>
      ))}
    </g>
  ),
  fireplace: () => (
    <g>
      <rect x="14" y="16" width="36" height="34" rx="4" fill={CREAM} stroke={INK} strokeWidth="2.5" />
      <path d="M32 44 c-6 -2 -8 -8 -4 -13 c1 4 4 4 4 1 c4 3 6 8 2 12 Z" fill={TERRA} stroke={INK} strokeWidth="1.6" />
      <line x1="22" y1="50" x2="42" y2="50" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  workshop: () => (
    <g>
      <path className="pt-ws-wrench" d="M16 40 L30 26 M26 22 a6 6 0 0 0 -2 8 L18 36 a4 4 0 0 0 6 6 L30 34 a6 6 0 0 0 8 -2 l-6 -6 -6 6 -2 -2 6 -6 Z" fill={TERRA} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <g className="pt-ws-gear">
        <circle cx="44" cy="44" r="7" fill="none" stroke={SAGE} strokeWidth="3" />
        <circle cx="44" cy="44" r="2.5" fill={INK} />
        <path d="M44 35 v-4 M44 53 v4 M35 44 h-4 M53 44 h4" stroke={SAGE} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </g>
  ),

  // ---- Q4: little visitors ----
  fox: () => (
    <g>
      <path d="M18 24 L14 12 L26 20 Z M46 24 L50 12 L38 20 Z" fill={TERRA} stroke={INK} strokeWidth="2" />
      <path d="M20 22 q12 -8 24 0 q4 14 -12 20 q-16 -6 -12 -20 Z" fill={TERRA} stroke={INK} strokeWidth="2.5" />
      <path d="M26 40 q6 6 12 0 L32 46 Z" fill={CREAM} />
      <circle cx="26" cy="30" r="2.4" fill={INK} />
      <circle cx="38" cy="30" r="2.4" fill={INK} />
      <circle cx="32" cy="38" r="2.4" fill={INK} />
    </g>
  ),
  bunny: () => (
    <g>
      <ellipse cx="26" cy="16" rx="4" ry="12" fill={ROSE} stroke={INK} strokeWidth="2" />
      <ellipse cx="38" cy="16" rx="4" ry="12" fill={ROSE} stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="38" r="14" fill={CREAM} stroke={INK} strokeWidth="2.5" />
      <circle cx="27" cy="36" r="2.2" fill={INK} />
      <circle cx="37" cy="36" r="2.2" fill={INK} />
      <path d="M30 42 q2 2 4 0" fill="none" stroke={INK} strokeWidth="2" />
    </g>
  ),
  bear: () => (
    <g>
      <circle cx="20" cy="20" r="6" fill={TERRA} stroke={INK} strokeWidth="2" />
      <circle cx="44" cy="20" r="6" fill={TERRA} stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="36" r="16" fill={TERRA} stroke={INK} strokeWidth="2.5" />
      <circle cx="26" cy="34" r="2.4" fill={INK} />
      <circle cx="38" cy="34" r="2.4" fill={INK} />
      <ellipse cx="32" cy="42" rx="5" ry="4" fill={CREAM} />
      <circle cx="32" cy="41" r="2.2" fill={INK} />
    </g>
  ),
  monkey: () => (
    <g>
      <circle cx="18" cy="30" r="6" fill={TERRA} stroke={INK} strokeWidth="2" />
      <circle cx="46" cy="30" r="6" fill={TERRA} stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="34" r="16" fill={TERRA} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="32" cy="40" rx="11" ry="9" fill={CREAM} />
      <circle cx="27" cy="32" r="2.4" fill={INK} />
      <circle cx="37" cy="32" r="2.4" fill={INK} />
      <path d="M28 40 q4 3 8 0" fill="none" stroke={INK} strokeWidth="2" />
    </g>
  ),

  // ---- Q5: celebrate ----
  compass: () => (
    <g>
      <circle cx="32" cy="34" r="18" fill={CREAM} stroke={INK} strokeWidth="2.5" />
      <path className="pt-compass-needle" d="M32 22 L37 34 L32 46 L27 34 Z" fill={ROSE} stroke={INK} strokeWidth="1.6" />
      <circle cx="32" cy="34" r="2.4" fill={INK} />
      <circle cx="32" cy="14" r="3" fill={SAGE} stroke={INK} strokeWidth="1.6" />
    </g>
  ),
  crown: () => (
    <g>
      {[16, 28, 40, 52].map((x) => (
        <line key={x} x1={x} y1="44" x2={x} y2="24" stroke={SAGE} strokeWidth="2.5" strokeLinecap="round" />
      ))}
      {[16, 28, 40, 52].map((x, i) => (
        <circle key={x} className="pt-crown-gem" cx={x} cy="22" r="5" fill={i % 2 ? ROSE : SUN} stroke={INK} strokeWidth="1.6" />
      ))}
      <path d="M12 44 q20 8 40 0" fill="none" stroke={SAGE} strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  teddy: () => (
    <g>
      <circle cx="22" cy="22" r="5" fill={TERRA} stroke={INK} strokeWidth="2" />
      <circle cx="42" cy="22" r="5" fill={TERRA} stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="34" r="14" fill={TERRA} stroke={INK} strokeWidth="2.5" />
      <path d="M27 33 h0 M37 33 h0" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="40" r="3" fill={CREAM} />
      <path d="M24 48 l4 6 M40 48 l-4 6" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  house: () => (
    <g>
      <rect className="pt-house-wall" x="18" y="32" width="28" height="20" rx="2" fill={CREAM} stroke={INK} strokeWidth="2.5" />
      <path className="pt-house-roof" d="M14 32 L32 16 L50 32 Z" fill={TERRA} stroke={INK} strokeWidth="2.5" />
      <rect className="pt-house-door" x="28" y="40" width="8" height="12" fill={SAGE} stroke={INK} strokeWidth="1.6" />
    </g>
  ),

  bubbles: () => (
    <g>
      {/* bubble wand */}
      <line x1="14" y1="52" x2="24" y2="34" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="26" cy="30" r="7" fill="none" stroke={TERRA} strokeWidth="3" />
      {/* floating bubbles */}
      <circle cx="40" cy="24" r="8" fill="rgba(143,184,214,0.35)" stroke={SKY} strokeWidth="2" />
      <circle cx="52" cy="14" r="5" fill="rgba(143,184,214,0.35)" stroke={SKY} strokeWidth="2" />
      <circle cx="48" cy="38" r="4" fill="rgba(143,184,214,0.35)" stroke={SKY} strokeWidth="2" />
      <circle cx="37" cy="24" r="2" fill="#fff" opacity="0.8" />
    </g>
  ),

  // ---- reveal ----
  gift: () => (
    <g>
      <rect x="14" y="26" width="36" height="26" rx="3" fill={ROSE} stroke={INK} strokeWidth="2.5" />
      <rect x="12" y="20" width="40" height="10" rx="3" fill={TERRA} stroke={INK} strokeWidth="2.5" />
      <line x1="32" y1="20" x2="32" y2="52" stroke={INK} strokeWidth="2.5" />
      <path d="M32 20 q-12 -12 -14 -2 q-1 6 14 2 Z" fill={SUN} stroke={INK} strokeWidth="1.6" />
      <path d="M32 20 q12 -12 14 -2 q1 6 -14 2 Z" fill={SUN} stroke={INK} strokeWidth="1.6" />
    </g>
  ),
}

export default function ChoiceIcon({ name, size = 64 }: { name: string; size?: number }) {
  const Draw = icons[name] ?? icons.compass
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-hidden>
      <Draw />
    </svg>
  )
}
