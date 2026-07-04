// Buddies = the characters a child can pick to star in their story.
// Derived from the real catalog: the 10 Apple Park Kids dolls + the named
// Organic Farm Buddies characters.
import { catalog, type Product } from './catalog'
import { themeEmoji } from '../lib/art'

export type Buddy = {
  key: string
  name: string
  kind: 'doll' | 'buddy'
  theme: string // animal or 'Doll'
  emoji: string
  product?: Product // representative catalog product (for a photo/link later)
}

export const dolls: Buddy[] = catalog
  .filter((p) => p.type === 'Doll' && p.collection.startsWith('Doll Shop - Apple Park Kids'))
  .map((p) => ({
    key: p.character.toLowerCase(),
    name: p.character,
    kind: 'doll' as const,
    theme: 'Doll',
    emoji: '🧒',
    product: p,
  }))

// One buddy per named Farm Buddies character; prefer their Plush as the representative product.
const buddyMap = new Map<string, Buddy>()
for (const p of catalog) {
  if (p.collection !== 'Organic Farm Buddies') continue
  if (!p.character || p.character === 'N/A') continue
  const key = p.character.toLowerCase()
  const existing = buddyMap.get(key)
  const isPlush = p.type === 'Plush'
  if (!existing) {
    buddyMap.set(key, {
      key,
      name: p.character,
      kind: 'buddy',
      theme: p.theme,
      emoji: themeEmoji(p.theme),
      product: p,
    })
  } else if (isPlush) {
    existing.product = p
  }
}

export const farmBuddies: Buddy[] = [...buddyMap.values()].sort((a, b) =>
  a.name.localeCompare(b.name),
)

export const allBuddies: Buddy[] = [...dolls, ...farmBuddies]

export const findBuddy = (key: string): Buddy | undefined =>
  allBuddies.find((b) => b.key === key)
