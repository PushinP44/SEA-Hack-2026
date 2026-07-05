// Builds a rich, copy-pasteable text-to-video prompt (for ByteDance **Seedance**)
// that describes the child's WHOLE journey as a non-interactive, wordless
// bedtime fairytale for ages 5 & under. It captures the exact character,
// companion, collected things, the cozy oil-pastel night-meadow setting, the
// colour palette, and a shot-by-shot storyboard — all derived from the real
// answers so the video matches what the child actually played. Logged to the
// console at the end of the quiz. Emoji-free.
import { beats, MAX_PROGRESS } from '../data/scenes'
import { questions } from '../data/questions'
import { archetypes, type ArchetypeId } from '../data/archetypes'
import { lookFor } from '../data/dollLooks'
import { featureFor } from '../data/animalFeatures'
import { envSet, heldToys, companions } from '../data/effects'
import { findBuddy, type Buddy } from '../data/buddies'
import type { Answer } from './scoring'
import type { Product } from '../data/catalog'

// ---- colour → friendly name (so the prompt reads warmly AND keeps the hex) ----
function colorName(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 510
  const light = l > 0.74 ? 'pale ' : l < 0.3 ? 'deep ' : ''
  if (max - min < 22) return `${l > 0.6 ? 'soft ' : light || 'slate '}grey`
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const mx = Math.max(rr, gg, bb)
  const d = mx - Math.min(rr, gg, bb)
  const sat = d / mx
  let hue = mx === rr ? ((gg - bb) / d) % 6 : mx === gg ? (bb - rr) / d + 2 : (rr - gg) / d + 4
  hue *= 60
  if (hue < 0) hue += 360
  // warm, low-saturation tones are earth tones (skin/hair/fur), not coral/amber
  if (hue >= 15 && hue <= 50) {
    if (sat < 0.6 && l < 0.42) return `${light}brown`
    if (sat < 0.55 && l < 0.66) return `${light}tan`
    if (sat < 0.4 && l >= 0.66) return 'soft peach'
  }
  const buckets: [number, string][] = [
    [16, 'red'], [34, 'coral'], [48, 'amber'], [66, 'gold'], [98, 'sage green'],
    [158, 'green'], [196, 'teal'], [238, 'blue'], [266, 'periwinkle'], [292, 'lilac'],
    [330, 'rose'], [361, 'pink'],
  ]
  let base = 'rose'
  for (const [hi, n] of buckets) if (hue <= hi) { base = n; break }
  return `${light}${base}`
}
const withHex = (hex: string) => `${colorName(hex)} (${hex})`

function andList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

// ---- character describers -------------------------------------------------
const HAIR_WORD: Record<string, string> = {
  pigtails: 'hair in bouncy pigtails', wavy: 'soft wavy hair', bob: 'a neat little bob',
  curly: 'curly hair', longWavy: 'long wavy hair', bun: 'hair in a tidy bun',
  short: 'short hair', shortCurly: 'short curly hair',
}
function describeDoll(b: Buddy): string {
  const l = lookFor(b.key)
  const outfit = l.boy
    ? `${withHex(l.dress)} overalls over a cream tee`
    : `a ${withHex(l.dress)} dress`
  return `${b.name}, a cheerful Apple Park Kids toddler doll — ${withHex(l.skin)} skin, ${withHex(l.hair)} ${HAIR_WORD[l.style] ?? 'hair'}, a round rosy-cheeked face with big friendly eyes, tiny eyebrows and a gentle smile, wearing ${outfit}. Soft plush cloth-doll body with stubby arms and legs.`
}
const EAR_WORD: Record<string, string> = {
  round: 'round ears', roundBig: 'big round ears', pointy: 'pointy ears',
  floppy: 'floppy ears', tiny: 'tiny ears', none: 'a smooth head (no ears)',
}
function describeAnimal(name: string, theme: string): string {
  const f = featureFor(theme)
  const bits: string[] = [`a small ${withHex(f.color)} ${theme.toLowerCase()} plush`]
  if (f.belly) bits.push(`a ${colorName(f.belly)} tummy-and-face patch`)
  bits.push(EAR_WORD[f.ear] ?? 'round ears')
  if (f.horn && f.horn !== 'none') bits.push(`${f.horn}-style horns`)
  if (f.unicornHorn) bits.push('a little golden spiral horn')
  if (f.mane) bits.push(`a ${colorName(f.maneColor ?? f.color)} mane`)
  if (f.pattern && f.pattern !== 'none') bits.push(`${f.pattern} markings`)
  if (f.muzzle === 'beak') bits.push('a small soft beak')
  if (f.whiskers) bits.push('fine whiskers')
  if (f.beard) bits.push('a wispy beard')
  if (f.teeth) bits.push('two little front teeth')
  return `${name}, ${andList(bits)}, with big shiny eyes, rosy cheeks and a sweet smile.`
}
const describeBuddy = (b: Buddy) => (b.kind === 'doll' ? describeDoll(b) : describeAnimal(b.name, b.theme))

// ---- what each choice looks like on screen --------------------------------
const MANIFEST: Record<string, string> = {
  run: 'laughs and dashes down the breezy hillside as ribbons of wind and a few soft autumn leaves swirl past',
  cloud: 'curls up in the cool grass to watch fluffy clouds drift slowly across the moon',
  flute: 'lifts a little wooden flute and plays a dreamy tune while glowing music notes float up into the night air',
  drum: 'happily pats a small round drum, and the whole meadow seems to bounce gently along to the beat',
  mountains: 'sets off toward gentle moonlit mountains rising on the horizon while a tiny bird glides overhead',
  bubbles: 'blows a stream of shimmering soap bubbles that catch the moonlight and drift away on the breeze',
  bunny: 'greets a little lilac unicorn friend who skips up and slips a paw into their hand',
  bear: 'greets a soft grey koala friend who pads up and holds their hand',
  compass: 'holds up a tiny glowing compass and happily picks one more little adventure',
  crown: 'sits down in the grass to weave a flower crown, then gently sets it on their head as a shower of golden sparkles drifts down',
  teddy: 'snuggles a soft teddy bear close for a warm, sleepy cuddle',
  house: 'stacks smooth wooden blocks into a cozy little cottage with a warm glowing window',
}
const TOY_WORD: Record<string, string> = {
  flute: 'a little wooden flute', drum: 'a round drum', compass: 'a glowing compass',
  crown: 'a flower crown on their head', teddy: 'a soft teddy bear',
}
const ENV_WORD: Record<string, string> = {
  windy: 'a playful breeze', cloudy: 'soft drifting clouds', mountains: 'distant moonlit mountains',
  house: 'a cozy little cottage', bubbles: 'floating soap bubbles',
}
const CAMERAS = [
  'slow left-to-right tracking shot following the walk, gentle parallax between moon, trees and grass',
  'soft, slow push-in on the character’s happy face as fireflies drift past',
  'wide establishing pan across the moonlit meadow',
  'low, gentle look-up as they move through the swaying grass',
  'dreamy parallax dolly with blossoms and fireflies floating past the lens',
  'slow crane-up revealing more of the star-filled sky',
]

export function buildSeedancePrompt(input: {
  buddy: Buddy
  answers: Answer[]
  winner: ArchetypeId
  product: Product
  outfitColor?: string
  childName?: string
}): string {
  const { buddy, answers, winner, product, outfitColor, childName } = input
  const arch = archetypes[winner]
  const ordered = [...answers].sort((a, b) => a.questionId - b.questionId)
  const icons = ordered
    .map((a) => questions.find((q) => q.id === a.questionId)?.choices.find((c) => c.id === a.choiceId)?.icon)
    .filter((x): x is string => Boolean(x))

  const toys = heldToys(icons)
  const pals = companions(icons)
  const env = envSet(icons)
  const palNames = pals.map((k) => findBuddy(k)?.name).filter((x): x is string => Boolean(x))
  const hasFlute = icons.includes('flute')
  const hasDrum = icons.includes('drum')

  // ---- storyboard shots ----
  const shots: string[] = []
  shots.push(
    `Shot 1 — Opening ("${beats[0].name}"): Under a big crescent moon with a soft sleepy smile and a warm golden halo, ${buddy.name} stands at the top of a breezy meadow hill as fireflies begin to wake around them. They give a happy little wave and set off walking. Camera: ${CAMERAS[0]}.`,
  )
  ordered.forEach((a, k) => {
    const q = questions.find((qq) => qq.id === a.questionId)
    const c = q?.choices.find((cc) => cc.id === a.choiceId)
    if (!q || !c) return
    const beat = beats[Math.min(k, MAX_PROGRESS)]
    const man = MANIFEST[c.icon] ?? `chooses “${c.label}”`
    shots.push(
      `Shot ${k + 2} — "${beat.name}" [sky ${withHex(beat.skyTop)} down to a ${withHex(beat.skyBottom)} horizon glow, hills ${withHex(beat.hillMid)}]: ${q.scene} ${buddy.name} ${man}. Camera: ${CAMERAS[(k + 1) % CAMERAS.length]}.`,
    )
  })
  const rBeat = beats[MAX_PROGRESS]
  const outfitPhrase =
    buddy.kind === 'doll'
      ? `now dressed in the ${product.name}${outfitColor ? ` in ${withHex(outfitColor)}` : ''}`
      : `now with their very own ${product.name}`
  const carried = toys.map((t) => TOY_WORD[t]).filter(Boolean)
  const leftover = [...env].filter((e) => e !== 'windy' && e !== 'cloudy').map((e) => ENV_WORD[e]).filter(Boolean)
  shots.push(
    `Shot ${ordered.length + 2} — Reveal ("${rBeat.name}"): In a home garden bursting into bloom beneath a sky thick with twinkling stars${leftover.length ? `, with ${andList(leftover)} from the journey still nearby` : ''}, ${buddy.name} stands ${outfitPhrase}${carried.length ? `, carrying ${andList(carried)}` : ''}${palNames.length ? `, hand in hand with ${andList(palNames)} while a soft glowing heart floats above them` : ''}. A big friendly title-less moment — ${arch.title} — ${arch.blurb} Camera: slow zoom-out, fireflies rising, then a gentle fade as the moon smiles goodnight.`,
  )

  // ---- assemble the full prompt ----
  const companionBlock = palNames.length
    ? `\n[COMPANION]\n${andList(pals.map((k) => (findBuddy(k) ? describeBuddy(findBuddy(k)!) : '')).filter(Boolean))} Walks alongside at about half the main character's height, holding hands; clearly delighted, with a tiny glowing heart floating above now and then.\n`
    : ''
  const collectedBlock =
    toys.length || env.size
      ? `\n[THINGS COLLECTED ALONG THE WAY]\n${[
          toys.length ? `Held/worn: ${andList(toys.map((t) => TOY_WORD[t] ?? t))}.` : '',
          env.size ? `Setting changes triggered: ${andList([...env].map((e) => ENV_WORD[e] ?? e))} (these persist in the world once introduced).` : '',
        ].filter(Boolean).join(' ')}\n`
      : ''
  const audioExtra = [
    hasFlute ? 'a dreamy solo flute melody' : '',
    hasDrum ? 'a soft, playful hand-drum rhythm' : '',
  ].filter(Boolean)

  return [
    '════════════════════ KraDoll → SEEDANCE VIDEO PROMPT ════════════════════',
    `A wordless, non-interactive bedtime FAIRYTALE for children ages 5 and under${childName ? `, made for ${childName}` : ''}. Follow ${buddy.name} through one continuous, gentle night-meadow journey. NO on-screen text, NO dialogue, NO narration — tell the whole story through soft visuals and music only.`,
    '',
    '[TARGET MODEL] ByteDance Seedance 1.0 (pro), text-to-video, 1080p, 24fps.',
    '[FORMAT] 16:9 landscape (also works as 9:16 vertical). ~45–60s total told as 8 linked shots of ~6s each — generate shot by shot and KEEP THE CHARACTER DESIGN IDENTICAL across every shot for continuity (same colours, proportions, outfit).',
    '',
    '[ART STYLE] Hand-drawn OIL-PASTEL storybook illustration — soft chalky pastel texture, visible paper grain, thick rounded hand-drawn outlines, no sharp edges, flat soft shading, everything plump and huggable. Like a cozy picture-book gently brought to life (2D illustrated, NOT 3D, NOT photoreal).',
    '[MOOD & PACING] Calm, warm, magical, reassuring — a bedtime lullaby feeling. Very slow, gentle motion; soft dissolves between shots; the world scrolls smoothly as the character walks. No fast cuts, no scares, no loud surprises.',
    '',
    '[COLOUR PALETTE — cozy oil-pastel night meadow]',
    `• Sky: dusky indigo ${withHex(beats[0].skyTop)} deepening to starry ${withHex(beats[MAX_PROGRESS].skyTop)}, with a warm apricot horizon glow ${withHex(beats[0].skyBottom)}.`,
    `• Land: moonlit mossy greens — far hills ${withHex(beats[3].hillFar)}, near hills ${withHex(beats[3].hillMid)}, meadow ground ${withHex(beats[3].ground)}.`,
    '• Moon: warm cream #f7e09c with a soft golden halo. Stars: silver-lilac #cdd6f0 and pale gold #f0e0a8, plus a rare wishing star.',
    '• Magic accents: firefly gold #fbf6cf, blossom pink #f3c6d6, toadstool red #d98a7a with cream spots, meadow flowers gold #f0d089.',
    '',
    '[SETTING / WORLD] A cozy rolling night meadow under a giant smiling crescent moon. Drifting glowing fireflies, swirling soft pastel stars, cloud-shaped storybook trees dotted with tiny blossoms, red-capped white-spotted toadstools tucked in the grass, a soft moonlit winding path, gently swaying grass, little meadow flowers, and a faint shimmering stream. Everything rounded, plush and faintly glowing.',
    '',
    `[MAIN CHARACTER] ${describeBuddy(buddy)} Expressive and full of feeling — blinks, rosy cheeks, eyebrows and smile that shift with each moment (curious, delighted, cozy). A gentle magical aura glows softly around them.`,
    companionBlock + collectedBlock,
    '[STORYBOARD — shot by shot]',
    ...shots,
    '',
    '[CAMERA] Slow, smooth, child-friendly moves only — lateral tracking that follows the walk, occasional tender push-ins on the face, layered parallax (moon & stars far, trees mid, grass/toadstools/fireflies near).',
    `[AUDIO] Gentle instrumental lullaby — music box / harp / soft strings — with quiet nighttime ambience (light breeze, distant crickets, tiny sparkly chimes)${audioExtra.length ? `, featuring ${andList(audioExtra)}` : ''}. Warm and soothing. NO speech.`,
    '[NEGATIVE / AVOID] no text, no words, no captions, no logos; nothing scary, dark or sad; no fast motion or jump cuts; no photorealism, no 3D CGI look, no harsh contrast or neon; no other humans besides the character; no brand marks.',
    '═══════════════════════════════════════════════════════════════════════',
  ].join('\n')
}
