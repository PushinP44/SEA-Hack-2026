import type { Product } from '../data/catalog'
import { themeEmoji } from '../lib/art'

function money(n: number) {
  return `$${n.toFixed(2)}`
}

export function ProductCard({ p }: { p: Product }) {
  const onSale = p.salePrice < p.regPrice
  const emoji = p.type === 'Doll' ? '🧸' : themeEmoji(p.theme)
  return (
    <a className="card" href={p.url} target="_blank" rel="noreferrer">
      <div className="card__thumb">
        {!p.inStock && <span className="card__soldout">Sold out</span>}
        <span>{emoji}</span>
      </div>
      <div className="card__body">
        <div className="card__name">{p.name}</div>
        <div className="card__price">
          <span className={'card__now' + (onSale ? ' card__now--sale' : '')}>
            {money(p.salePrice)}
          </span>
          {onSale && <span className="card__was">{money(p.regPrice)}</span>}
        </div>
      </div>
    </a>
  )
}

export default function CollectionGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  )
}
