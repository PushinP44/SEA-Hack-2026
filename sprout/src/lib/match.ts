// Deterministic product match: archetype (+ chosen buddy) -> one real product.
// Prefers in-stock items and the archetype's priority product types, so the
// reveal is reproducible on stage and never lands on a sold-out item.
import { catalog, type Product } from '../data/catalog'
import { archetypes, type ArchetypeId } from '../data/archetypes'

// A stable score so ordering is deterministic regardless of catalog order.
function rank(p: Product, a: ArchetypeId): number {
  const arch = archetypes[a]
  const themeHit = arch.themes.includes(p.theme) ? 100 : 0
  const typeIdx = arch.types.indexOf(p.type)
  const typeHit = typeIdx >= 0 ? 50 - typeIdx * 5 : 0
  const stock = p.inStock ? 20 : 0
  return themeHit + typeHit + stock
}

export function matchProduct(archetypeId: ArchetypeId, buddyTheme?: string): Product {
  const scored = catalog
    .map((p) => ({ p, s: rank(p, archetypeId) }))
    // Nudge products that echo the chosen buddy's own animal, when in theme.
    .map(({ p, s }) => ({
      p,
      s: buddyTheme && p.theme === buddyTheme ? s + 15 : s,
    }))
    .filter((x) => x.s > 20) // must be a real theme/type fit, not just in-stock
    .sort((a, b) => b.s - a.s || a.p.id.localeCompare(b.p.id))

  const inStock = scored.find((x) => x.p.inStock)
  return (inStock ?? scored[0])?.p ?? catalog[0]
}

export const price = (p: Product): { now: number; was: number; onSale: boolean } => ({
  now: p.salePrice,
  was: p.regPrice,
  onSale: p.salePrice < p.regPrice,
})

// ---------------------------------------------------------------------------
// Outfit match — a real, wearable apparel item the doll can be shown wearing at
// the reveal, so the child understands the suggestion. Deterministic + in-stock.
// ---------------------------------------------------------------------------
const WEARABLE = ['Dress', 'Romper', 'Overalls', 'Jumpsuit', 'Coverall', 'Shortall']

const OUTFIT_KEYWORDS: Record<ArchetypeId, string[]> = {
  adventurer: ['safari', 'zebra', 'alligator', 'whale', 'mountain', 'chambray'],
  dreamer: ['wildflower', 'flower', 'floral', 'daisy', 'rainbow', 'zinnia', 'pink', 'bloom'],
  nurturer: ['waffle', 'lavender', 'sage', 'dusty', 'bear', 'muslin'],
  maker: ['stripe', 'gingham', 'overall', 'bamboo', 'check', 'saguaro'],
}

// A couple of extra in-stock picks for a "2 you may like" row — related to the
// archetype, distinct in type from each other and from what's already shown.
export function moreSuggestions(archetypeId: ArchetypeId, excludeIds: string[], n = 2): Product[] {
  const scored = catalog
    .filter((p) => p.inStock && !excludeIds.includes(p.id))
    .map((p) => ({ p, s: rank(p, archetypeId) }))
    .filter((x) => x.s > 20)
    .sort((a, b) => b.s - a.s || a.p.id.localeCompare(b.p.id))
  const out: Product[] = []
  for (const { p } of scored) {
    if (out.length >= n) break
    if (!out.some((o) => o.type === p.type)) out.push(p) // variety of type
  }
  for (const { p } of scored) {
    if (out.length >= n) break
    if (!out.includes(p)) out.push(p)
  }
  return out.slice(0, n)
}

export function matchOutfit(archetypeId: ArchetypeId): Product {
  const wearable = catalog
    .filter((p) => WEARABLE.includes(p.type))
    .sort((a, b) => a.id.localeCompare(b.id))
  const kw = OUTFIT_KEYWORDS[archetypeId]
  const byKeyword = wearable.find((p) => p.inStock && kw.some((k) => p.name.toLowerCase().includes(k)))
  const anyStock = wearable.find((p) => p.inStock)
  return byKeyword ?? anyStock ?? wearable[0] ?? catalog[0]
}

// Map colour/print words in an apparel name to a dress fill for the SVG doll.
const COLOR_WORDS: [string, string][] = [
  ['dusty rose', '#d99aa2'], ['ballet slipper pink', '#e7b6c2'], ['baby blue', '#a9c7e0'],
  ['terra cotta', '#c67d5a'], ['terracotta', '#c67d5a'], ['olive green', '#8a9a5b'], ['olive', '#8a9a5b'],
  ['sage', '#8fb47f'], ['lavender', '#c9c0e0'], ['caramel', '#c98a5a'], ['marine', '#6f8fbf'],
  ['mustard', '#e0b45a'], ['rust', '#b56a45'], ['teal', '#5fa3a0'], ['chambray', '#8fa8c4'],
  ['raspberry', '#c05a76'], ['smoke', '#9aa0a6'], ['cream', '#efe4d2'], ['mint', '#a9d6c2'],
  ['zebra', '#d7d7d7'], ['safari', '#cbb98f'], ['wildflower', '#e7a6b8'], ['daisy', '#f0d089'],
  ['rainbow', '#e79ac0'], ['zinnia', '#e08a6a'], ['pink', '#e7a6b8'], ['blue', '#8fb8d6'],
  ['gingham', '#cf8f6f'], ['saguaro', '#8fb47f'], ['squirrel', '#c98a5a'], ['woodland', '#a9805c'],
]

export function outfitColor(p: Product, fallback: string): string {
  const n = p.name.toLowerCase()
  for (const [word, hex] of COLOR_WORDS) if (n.includes(word)) return hex
  return fallback
}
