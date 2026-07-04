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
