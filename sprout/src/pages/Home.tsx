import { Link } from 'react-router-dom'
import PromoBar from '../components/PromoBar'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import CollectionGrid from '../components/CollectionGrid'
import { catalog, byCollection, type Product } from '../data/catalog'

const dolls = byCollection('Doll Shop - Apple Park Kids').slice(0, 8)
const apparel = catalog
  .filter((p) => p.collection.startsWith('Apparel') && p.salePrice < p.regPrice)
  .slice(0, 8)
const giftSets = catalog
  .filter((p) => p.collection === 'Gift Lab' || p.type === 'Gift Set' || p.type === 'Bundle')
  .slice(0, 8)
const buddies = catalog
  .filter((p) => p.collection === 'Organic Farm Buddies' && p.type === 'Plush')
  .slice(0, 8)

function apparelFallback(): Product[] {
  // If no on-sale apparel parsed, just show some apparel.
  return apparel.length
    ? apparel
    : catalog.filter((p) => p.collection.startsWith('Apparel')).slice(0, 8)
}

export default function Home() {
  return (
    <>
      <PromoBar />
      <NavBar />

      {/* Hero */}
      <header className="hero">
        <div className="hero__inner">
          <div>
            <div className="hero__eyebrow">Wrapped in love, woven with purpose</div>
            <h1 className="hero__title">
              Soft, safe, and <em>story-rich</em> — for the littlest hands.
            </h1>
            <p className="hero__text">
              Organic apparel, whimsical dolls, and heirloom Farm Buddies. And now — a play-first way
              to find the perfect gift.
            </p>
            <div className="hero__cta">
              <a className="btn btn--primary btn--lg" href="#catalog">
                Shop the collection
              </a>
              <Link className="btn btn--sprout btn--lg" to="/quiz">
                Try the SPROUT gift quiz
              </Link>
            </div>
          </div>
          <div className="hero__art">
            <div className="bigmoji">🌱</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginTop: 8 }}>
              Meet SPROUT
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              The child plays a tiny story. You get one perfect gift, in one tap.
            </p>
            <span className="hero__badge">Find their gift in 2 minutes</span>
          </div>
        </div>
      </header>

      {/* Little Best Friends */}
      <section className="section container" id="catalog">
        <div className="section__head">
          <h2 className="section__title">Little Best Friends</h2>
          <span className="section__sub">Apple Park Kids dolls · a character a child already loves</span>
        </div>
        <CollectionGrid items={dolls} />
      </section>

      {/* Made for Play */}
      <section className="section container">
        <div className="section__head">
          <h2 className="section__title">Made for Play (and on sale!)</h2>
          <span className="section__sub">Muslin & bamboo, gentle on skin</span>
        </div>
        <CollectionGrid items={apparelFallback()} />
      </section>

      {/* SPROUT banner */}
      <section className="section container">
        <div className="philo" style={{ background: 'linear-gradient(160deg,#f4ede2,#f6e2d9)' }}>
          <div className="bigmoji" style={{ fontSize: 52 }}>🌸</div>
          <h3>Don’t guess. Let them play.</h3>
          <p>
            SPROUT turns gift-shopping into a five-minute picture story starring a doll or Farm Buddy
            your child already loves. They answer — you receive a finished decision, priced and ready.
          </p>
          <div style={{ marginTop: 18 }}>
            <Link className="btn btn--sprout btn--lg" to="/quiz">
              🌱 Start the quiz
            </Link>
          </div>
        </div>
      </section>

      {/* Sweet Little Gift Sets */}
      <section className="section container">
        <div className="section__head">
          <h2 className="section__title">Sweet Little Gift Sets</h2>
          <span className="section__sub">Curated & ready to wrap</span>
        </div>
        <CollectionGrid items={giftSets} />
      </section>

      {/* Farm Buddies */}
      <section className="section container">
        <div className="section__head">
          <h2 className="section__title">Organic Farm Buddies</h2>
          <span className="section__sub">32 named characters, ready for a story</span>
        </div>
        <CollectionGrid items={buddies} />
      </section>

      {/* Values */}
      <section className="section container">
        <div className="values">
          <div className="value">
            <div className="bigmoji">🌿</div>
            <h4>Good to be green</h4>
            <p>Organic cotton, safe dyes, recycled fabrics — better for baby and the planet.</p>
          </div>
          <div className="value">
            <div className="bigmoji">🧸</div>
            <h4>Heirloom quality</h4>
            <p>Made to be loved, washed, and passed down — not thrown away.</p>
          </div>
          <div className="value">
            <div className="bigmoji">📖</div>
            <h4>A story, not a spec sheet</h4>
            <p>Every character has a name and a personality your child can grow with.</p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section container">
        <div className="news">
          <h3>Join us for a playdate in the park!</h3>
          <p style={{ color: 'var(--muted)' }}>Sweet updates, new arrivals, and the occasional treat.</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <input placeholder="you@email.com" aria-label="email" />
            <button className="btn btn--primary" type="submit">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  )
}
