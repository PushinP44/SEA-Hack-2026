// How each chosen thing manifests in the scene — by TYPE:
//   environment → changes the setting (weather / backdrop / props)
//   toy         → held / played by the doll
//   buddy       → a real Organic Farm Buddy that walks alongside (half the doll's size)
// All derived from `chosen` (the icons of the current answers), so Back reverses.

export type EffectKind = 'environment' | 'toy' | 'buddy'
export type EnvKey = 'windy' | 'cloudy' | 'mountains' | 'house' | 'bubbles'

type Effect = { kind: EffectKind; env?: EnvKey; buddyKey?: string }

export const CHOICE_EFFECT: Record<string, Effect> = {
  // environment — each changes the setting in a distinct, obvious way
  run: { kind: 'environment', env: 'windy' },
  cloud: { kind: 'environment', env: 'cloudy' },
  mountains: { kind: 'environment', env: 'mountains' },
  house: { kind: 'environment', env: 'house' },
  bubbles: { kind: 'environment', env: 'bubbles' }, // kid-friendly "blow bubbles"
  // toys (held / played)
  flute: { kind: 'toy' },
  drum: { kind: 'toy' },
  compass: { kind: 'toy' },
  crown: { kind: 'toy' },
  teddy: { kind: 'toy' },
  // buddies (a real Farm Buddy that walks alongside)
  bunny: { kind: 'buddy', buddyKey: 'cupcake the unicorn' },
  bear: { kind: 'buddy', buddyKey: 'kozy koala' },
}

export function effectKind(icon: string): EffectKind | undefined {
  return CHOICE_EFFECT[icon]?.kind
}

export function envSet(chosen: string[]): Set<EnvKey> {
  const s = new Set<EnvKey>()
  for (const c of chosen) {
    const e = CHOICE_EFFECT[c]
    if (e?.kind === 'environment' && e.env) s.add(e.env)
  }
  return s
}

export function heldToys(chosen: string[]): string[] {
  return chosen.filter((c) => CHOICE_EFFECT[c]?.kind === 'toy')
}

// Returns the Farm Buddy keys (into buddies.ts) that should walk alongside.
export function companions(chosen: string[]): string[] {
  return chosen
    .map((c) => CHOICE_EFFECT[c]?.buddyKey)
    .filter((k): k is string => Boolean(k))
}
