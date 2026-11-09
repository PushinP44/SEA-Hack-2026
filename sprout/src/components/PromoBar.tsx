export default function PromoBar() {
  const items = [
    'Free shipping over $75',
    'New: try SPROUT — the play-first gift quiz',
    'Stars, Stripes & Snuggles Sale · 30% off',
    'Organic. Heirloom. Made to last.',
  ]
  // Duplicated once so the marquee can loop seamlessly (-50% translate).
  return (
    <div className="promobar">
      <div className="promobar__track">
        {[...items, ...items].map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  )
}
