// The chosen buddy, as the story's main character — emoji-free, drawn from
// per-animal / per-doll configs so each buddy looks like itself. A real
// AI-generated cutout at /public/art/buddy-<key>.png overrides everything.
import { artFor, isDollTheme } from '../../lib/art'
import { featureFor, type AnimalFeature } from '../../data/animalFeatures'
import { lookFor, type DollLook } from '../../data/dollLooks'
import ChoiceIcon from './ChoiceIcon'
import type { Buddy } from '../../data/buddies'

const INK = '#4a4640'
export type Outfit = { color: string; label?: string }

export default function BuddyCharacter({
  buddy,
  size = 132,
  outfit,
  held = [],
}: {
  buddy: Buddy
  size?: number
  outfit?: Outfit
  held?: string[] // toy icons carried in the doll's hands
}) {
  const png = artFor(`buddy-${buddy.key}`)
  if (png) return <img src={png} alt={buddy.name} width={size} height={size} style={{ objectFit: 'contain' }} />

  const doll = isDollTheme(buddy.theme)
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={buddy.name}>
      <ellipse cx="60" cy="113" rx="26" ry="5" fill="rgba(74,70,64,0.15)" />
      {doll ? <Doll look={lookFor(buddy.key)} outfit={outfit} /> : <Animal f={featureFor(buddy.theme)} uid={buddy.key} outfit={outfit} />}
      {/* toys are actually held/played by the character (no bubble) */}
      {held.slice(-2).map((icon, k) => {
        const p = TOY_PLACE[icon] ?? { x: 91, y: 90, size: 30 }
        return (
          <g key={k} transform={`translate(${p.x - p.size / 2} ${p.y - p.size / 2}) rotate(${p.rot ?? 0} ${p.size / 2} ${p.size / 2})`}>
            <g className={'held-toy ' + (p.cls ?? '')}>
              <ChoiceIcon name={icon} size={p.size} />
            </g>
            {(icon === 'flute' || icon === 'drum') && <MusicNotes />}
          </g>
        )
      })}
    </svg>
  )
}

// Floating music notes rising from an instrument (a little tune).
function MusicNotes() {
  return (
    <g className="mnotes">
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${20 + k * 9} ${-2 - (k % 2) * 4})`}>
          <g className="mnote" style={{ animationDelay: `${k * 0.5}s` }}>
            <ellipse cx="0" cy="6" rx="3.4" ry="2.6" fill="#c07f7f" transform="rotate(-20 0 6)" />
            <path d="M3 5 L3 -8 L9 -10 L9 -4" fill="none" stroke="#c07f7f" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </g>
      ))}
    </g>
  )
}

// Where each toy sits on the character, and how it's "used".
const TOY_PLACE: Record<string, { x: number; y: number; size: number; rot?: number; cls?: string }> = {
  flute: { x: 66, y: 42, size: 42, rot: -18, cls: 'play-flute' }, // up near the mouth
  drum: { x: 60, y: 82, size: 48, cls: 'play-drum' }, // in front of the belly
  teddy: { x: 58, y: 80, size: 40, cls: 'hug' }, // hugged to the chest
  crown: { x: 60, y: 14, size: 44 }, // worn on the head
  compass: { x: 90, y: 84, size: 32, cls: 'inhand' }, // in the hand
  workshop: { x: 90, y: 84, size: 32, cls: 'inhand' },
}

/* ------------------------------ Animals ------------------------------ */
function Animal({ f, uid, outfit }: { f: AnimalFeature; uid: string; outfit?: Outfit }) {
  const cx = 60
  const cy = f.neck ? 34 : 44
  const r = 24
  const clip = `hclip-${uid}`
  return (
    <g>
      {/* horns / antlers (behind head) */}
      {f.horn === 'cow' && (
        <g fill="#e7ded2" stroke={INK} strokeWidth="1.6">
          <path d={`M${cx - 16} ${cy - 18} q-10 -2 -14 4 q8 2 14 -4Z`} />
          <path d={`M${cx + 16} ${cy - 18} q10 -2 14 4 q-8 2 -14 -4Z`} />
        </g>
      )}
      {f.horn === 'goat' && (
        <g fill="none" stroke="#cbb39a" strokeWidth="5" strokeLinecap="round">
          <path d={`M${cx - 12} ${cy - 20} q-8 -8 -2 -16`} />
          <path d={`M${cx + 12} ${cy - 20} q8 -8 2 -16`} />
        </g>
      )}
      {f.horn === 'giraffe' && (
        <g stroke="#b9863c" strokeWidth="4" strokeLinecap="round">
          <line x1={cx - 9} y1={cy - 20} x2={cx - 11} y2={cy - 30} />
          <line x1={cx + 9} y1={cy - 20} x2={cx + 11} y2={cy - 30} />
          <circle cx={cx - 11} cy={cy - 32} r="3.5" fill="#8a6a3c" stroke="none" />
          <circle cx={cx + 11} cy={cy - 32} r="3.5" fill="#8a6a3c" stroke="none" />
        </g>
      )}
      {f.horn === 'antler' && (
        <g fill="none" stroke="#a9805c" strokeWidth="3.5" strokeLinecap="round">
          <path d={`M${cx - 12} ${cy - 18} q-12 -6 -16 -16 M${cx - 22} ${cy - 26} l-6 -2 M${cx - 26} ${cy - 30} l-2 -6`} />
          <path d={`M${cx + 12} ${cy - 18} q12 -6 16 -16 M${cx + 22} ${cy - 26} l6 -2 M${cx + 26} ${cy - 30} l2 -6`} />
        </g>
      )}

      {/* mane (behind head) */}
      {f.mane && <path d={`M${cx - 22} ${cy - 6} q-6 22 6 34 M${cx + 22} ${cy - 6} q6 22 -6 34`} fill="none" stroke={f.maneColor ?? INK} strokeWidth="8" strokeLinecap="round" />}

      {/* ears (behind head) */}
      <Ears f={f} cx={cx} cy={cy} />

      {/* neck */}
      {f.neck && <rect x={cx - 8} y={cy + 8} width="16" height={f.muzzle === 'beak' ? 40 : 30} rx="8" fill={f.color} stroke={INK} strokeWidth="2" />}

      {/* body */}
      <path d="M40 68 q20 -12 40 0 l5 32 q-25 11 -50 0 Z" fill={f.color} stroke={INK} strokeWidth="2.5" />
      {f.belly && <ellipse cx="60" cy="88" rx="15" ry="16" fill={f.belly} opacity="0.9" />}
      {outfit && <Dress color={outfit.color} />}
      <path className="arm arm--l" d="M42 74 q-12 6 -13 18" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
      <path className="arm arm--r" d="M78 74 q12 6 13 18" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
      <ellipse className="foot foot--l" cx="52" cy="105" rx="6" ry="4" fill={INK} />
      <ellipse className="foot foot--r" cx="68" cy="105" rx="6" ry="4" fill={INK} />

      {/* head */}
      <circle cx={cx} cy={cy} r={r} fill={f.color} stroke={INK} strokeWidth="2.5" />

      {/* pattern */}
      {f.pattern && f.pattern !== 'none' && (
        <>
          <clipPath id={clip}>
            <circle cx={cx} cy={cy} r={r - 1} />
          </clipPath>
          <g clipPath={`url(#${clip})`} fill={f.patternColor} stroke="none">
            {f.pattern === 'stripes' &&
              [-16, -8, 0, 8, 16].map((dx) => <rect key={dx} x={cx + dx} y={cy - 26} width="4" height="52" transform={`rotate(12 ${cx + dx} ${cy})`} />)}
            {f.pattern === 'spots' && [[-12, -8], [8, -10], [-6, 8], [12, 6], [0, -2]].map(([dx, dy], i) => <circle key={i} cx={cx + dx} cy={cy + dy} r="3.2" />)}
            {f.pattern === 'patches' && [[-14, -6, 9], [10, -8, 7], [-4, 10, 8]].map(([dx, dy, rr], i) => <circle key={i} cx={cx + dx} cy={cy + dy} r={rr} />)}
          </g>
        </>
      )}

      {/* lemur-style eye patches */}
      {f.eyePatch && (
        <g fill={f.eyePatch}>
          <ellipse cx={cx - 8} cy={cy - 1} rx="6" ry="8" />
          <ellipse cx={cx + 8} cy={cy - 1} rx="6" ry="8" />
        </g>
      )}

      {/* muzzle */}
      <Muzzle f={f} cx={cx} cy={cy} />

      {/* eyes */}
      {f.bigEyes ? (
        <g>
          <circle cx={cx - 8} cy={cy - 1} r="5" fill="#fff" stroke={INK} strokeWidth="1.4" />
          <circle cx={cx + 8} cy={cy - 1} r="5" fill="#fff" stroke={INK} strokeWidth="1.4" />
          <circle cx={cx - 8} cy={cy - 1} r="2.4" fill={INK} />
          <circle cx={cx + 8} cy={cy - 1} r="2.4" fill={INK} />
        </g>
      ) : (
        <g fill={INK}>
          <circle cx={cx - 8} cy={cy - 2} r="2.6" />
          <circle cx={cx + 8} cy={cy - 2} r="2.6" />
        </g>
      )}
      {f.cheek && (
        <g fill={f.cheek}>
          <circle cx={cx - 14} cy={cy + 6} r="4" />
          <circle cx={cx + 14} cy={cy + 6} r="4" />
        </g>
      )}
      {f.whiskers && (
        <g stroke={INK} strokeWidth="1.2" strokeLinecap="round">
          <path d={`M${cx - 10} ${cy + 8} l-14 -2 M${cx - 10} ${cy + 11} l-14 2`} />
          <path d={`M${cx + 10} ${cy + 8} l14 -2 M${cx + 10} ${cy + 11} l14 2`} />
        </g>
      )}
      {f.teeth && <rect x={cx - 4} y={cy + 12} width="8" height="7" rx="1.5" fill="#fff" stroke={INK} strokeWidth="1.2" />}
      {f.beard && <path d={`M${cx - 6} ${cy + 16} q6 12 12 0 Z`} fill={f.belly ?? '#e7ded2'} stroke={INK} strokeWidth="1.4" />}

      {/* unicorn horn + produce leaf (front) */}
      {f.unicornHorn && <path d={`M${cx} ${cy - 22} l-4 -14 l4 -4 l4 4 Z`} fill="#f0d089" stroke={INK} strokeWidth="1.4" />}
      {f.leaf && (
        <g fill="#6f9a72" stroke={INK} strokeWidth="1.4">
          <path d={`M${cx} ${cy - 22} q-10 -6 -14 2 q10 4 14 -2Z`} />
          <path d={`M${cx} ${cy - 22} q10 -6 14 2 q-10 4 -14 -2Z`} />
        </g>
      )}
    </g>
  )
}

function Ears({ f, cx, cy }: { f: AnimalFeature; cx: number; cy: number }) {
  const c = f.color
  const inner = f.earInner
  if (f.ear === 'none') return null
  const R = f.ear === 'roundBig' ? 13 : f.ear === 'tiny' ? 6 : 10
  if (f.ear === 'pointy') {
    return (
      <g fill={c} stroke={INK} strokeWidth="2">
        <path d={`M${cx - 20} ${cy - 14} l-4 -18 l16 8 Z`} />
        <path d={`M${cx + 20} ${cy - 14} l4 -18 l-16 8 Z`} />
        {inner && (
          <>
            <path d={`M${cx - 18} ${cy - 15} l-2 -9 l8 4 Z`} fill={inner} stroke="none" />
            <path d={`M${cx + 18} ${cy - 15} l2 -9 l-8 4 Z`} fill={inner} stroke="none" />
          </>
        )}
      </g>
    )
  }
  if (f.ear === 'floppy') {
    return (
      <g fill={c} stroke={INK} strokeWidth="2">
        <ellipse cx={cx - 22} cy={cy + 2} rx="7" ry="12" transform={`rotate(24 ${cx - 22} ${cy + 2})`} />
        <ellipse cx={cx + 22} cy={cy + 2} rx="7" ry="12" transform={`rotate(-24 ${cx + 22} ${cy + 2})`} />
      </g>
    )
  }
  // round / roundBig / tiny
  const dx = f.ear === 'roundBig' ? 20 : 18
  const dy = f.ear === 'tiny' ? 18 : 15
  return (
    <g fill={c} stroke={INK} strokeWidth="2">
      <circle cx={cx - dx} cy={cy - dy} r={R} />
      <circle cx={cx + dx} cy={cy - dy} r={R} />
      {inner && (
        <g fill={inner} stroke="none">
          <circle cx={cx - dx} cy={cy - dy} r={R * 0.5} />
          <circle cx={cx + dx} cy={cy - dy} r={R * 0.5} />
        </g>
      )}
    </g>
  )
}

function Muzzle({ f, cx, cy }: { f: AnimalFeature; cx: number; cy: number }) {
  const m = f.muzzle ?? 'small'
  const col = f.muzzleColor ?? f.belly ?? '#efe6e6'
  if (m === 'none') return <g fill={f.nose}><circle cx={cx} cy={cy + 6} r="2.6" /></g>
  if (m === 'beak')
    return <path d={`M${cx - 3} ${cy + 2} l14 6 l-14 6 q-4 -6 0 -12Z`} fill="#e6a94e" stroke={INK} strokeWidth="1.6" />
  if (m === 'pig')
    return (
      <g stroke={INK} strokeWidth="1.6">
        <ellipse cx={cx} cy={cy + 9} rx="11" ry="8" fill={col} />
        <circle cx={cx - 4} cy={cy + 9} r="2" fill={f.nose} />
        <circle cx={cx + 4} cy={cy + 9} r="2" fill={f.nose} />
      </g>
    )
  const rx = m === 'wide' ? 13 : m === 'long' ? 9 : 7
  const ry = m === 'long' ? 12 : m === 'wide' ? 9 : 5
  const yy = m === 'long' ? cy + 12 : cy + 9
  return (
    <g stroke={INK} strokeWidth="1.4">
      <ellipse cx={cx} cy={yy} rx={rx} ry={ry} fill={col} />
      <ellipse cx={cx} cy={yy - ry + 3} rx="3" ry="2.4" fill={f.nose} stroke="none" />
      <path d={`M${cx} ${yy - ry + 5} v4 q0 3 -4 3 M${cx} ${yy - ry + 9} q4 0 4 3`} fill="none" stroke={INK} strokeWidth="1.4" />
    </g>
  )
}

function Dress({ color }: { color: string }) {
  return <path d="M40 78 q20 -8 40 0 l5 22 q-25 11 -50 0 Z" fill={color} stroke={INK} strokeWidth="2" opacity="0.96" />
}

/* ------------------------------- Dolls ------------------------------- */
function Doll({ look, outfit }: { look: DollLook; outfit?: Outfit }) {
  const cx = 60
  const cy = 40
  const r = 23
  const dress = outfit?.color ?? look.dress
  return (
    <g>
      <HairBack look={look} cx={cx} cy={cy} r={r} />
      {/* head */}
      <circle cx={cx} cy={cy} r={r} fill={look.skin} stroke={INK} strokeWidth="2.2" />
      {/* body: dress (girls) or overalls (boys) */}
      {look.boy ? (
        <>
          <path d="M40 68 q20 -10 40 0 l3 32 q-23 10 -46 0 Z" fill="#f2ede4" stroke={INK} strokeWidth="2.2" />
          <path d="M42 74 q18 -8 36 0 l2 26 q-20 9 -40 0 Z" fill={dress} stroke={INK} strokeWidth="2.2" />
          <line x1="52" y1="70" x2="54" y2="86" stroke={INK} strokeWidth="2" />
          <line x1="68" y1="70" x2="66" y2="86" stroke={INK} strokeWidth="2" />
        </>
      ) : (
        <path d="M40 66 q20 -12 40 0 l7 34 q-27 12 -54 0 Z" fill={dress} stroke={INK} strokeWidth="2.2" />
      )}
      <path className="arm arm--l" d="M43 72 q-12 6 -13 18" fill="none" stroke={look.skin} strokeWidth="6" strokeLinecap="round" />
      <path className="arm arm--r" d="M77 72 q12 6 13 18" fill="none" stroke={look.skin} strokeWidth="6" strokeLinecap="round" />
      <ellipse className="foot foot--l" cx="52" cy="106" rx="6" ry="4" fill={INK} />
      <ellipse className="foot foot--r" cx="68" cy="106" rx="6" ry="4" fill={INK} />

      <HairFront look={look} cx={cx} cy={cy} r={r} />

      {/* face */}
      <circle cx={cx - 8} cy={cy} r="2.6" fill={INK} />
      <circle cx={cx + 8} cy={cy} r="2.6" fill={INK} />
      <circle cx={cx - 13} cy={cy + 6} r="3.4" fill="rgba(209,106,90,0.35)" />
      <circle cx={cx + 13} cy={cy + 6} r="3.4" fill="rgba(209,106,90,0.35)" />
      <path d={`M${cx - 5} ${cy + 8} q5 5 10 0`} fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />

      {/* outfit accessory: a matching hair bow when a suggested outfit is worn */}
      {outfit && (
        <g fill={outfit.color} stroke={INK} strokeWidth="1.4">
          <path d={`M${cx + 12} ${cy - r + 4} l8 -5 l0 10 Z`} />
          <path d={`M${cx + 12} ${cy - r + 4} l8 5 l0 -10 Z`} />
          <circle cx={cx + 12} cy={cy - r + 4} r="2.4" />
        </g>
      )}
    </g>
  )
}

function HairBack({ look, cx, cy, r }: { look: DollLook; cx: number; cy: number; r: number }) {
  const h = look.hair
  if (look.style === 'longWavy')
    return <path d={`M${cx - r - 2} ${cy - 4} q-6 30 8 44 l${2 * r + 4 - 12} 0 q14 -14 8 -44 Z`} fill={h} />
  if (look.style === 'wavy' || look.style === 'curly')
    return <path d={`M${cx - r - 1} ${cy - 2} q-4 22 6 32 l${2 * r + 2 - 12} 0 q10 -10 6 -32 Z`} fill={h} />
  if (look.style === 'pigtails')
    return (
      <g fill={h} stroke={INK} strokeWidth="1.4">
        <circle cx={cx - r - 3} cy={cy + 4} r="8" />
        <circle cx={cx + r + 3} cy={cy + 4} r="8" />
      </g>
    )
  return null
}

function HairFront({ look, cx, cy, r }: { look: DollLook; cx: number; cy: number; r: number }) {
  const h = look.hair
  const cap = `M${cx - r} ${cy - 2} a${r} ${r} 0 0 1 ${2 * r} 0 q-${r} -14 -${2 * r} 0 Z`
  switch (look.style) {
    case 'bun':
      return (
        <g fill={h} stroke={INK} strokeWidth="1.4">
          <circle cx={cx} cy={cy - r - 4} r="7" />
          <path d={cap} stroke="none" />
        </g>
      )
    case 'bob':
      return (
        <g fill={h}>
          <path d={`M${cx - r - 1} ${cy - 4} q0 20 4 24 l6 0 q-6 -10 -4 -20 q6 -12 20 -12 q14 0 20 12 q2 10 -4 20 l6 0 q4 -4 4 -24 q-6 -16 -26 -16 q-20 0 -26 16 Z`} />
        </g>
      )
    case 'curly':
      return (
        <g fill={h} stroke={INK} strokeWidth="1">
          {[-16, -8, 0, 8, 16].map((dx, i) => (
            <circle key={dx} cx={cx + dx} cy={cy - r + 2 + (i % 2) * 3} r="7" />
          ))}
        </g>
      )
    case 'shortCurly':
      return (
        <g fill={h}>
          {[-14, -6, 2, 10].map((dx) => (
            <circle key={dx} cx={cx + dx} cy={cy - r + 4} r="6" />
          ))}
        </g>
      )
    case 'short':
      return <path d={`M${cx - r} ${cy - 2} q0 -20 ${r} -20 q${r} 0 ${r} 20 q-6 -12 -${r} -12 q-${r} 0 -${r} 12 Z`} fill={h} />
    case 'pigtails':
      return <path d={cap} fill={h} />
    case 'longWavy':
    case 'wavy':
    default:
      return <path d={cap} fill={h} />
  }
}
