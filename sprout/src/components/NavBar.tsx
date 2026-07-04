import { Link } from 'react-router-dom'

const TABS = [
  'Apparel',
  'Sleep Shop',
  'Doll Shop',
  'Toys',
  'Gift Lab',
  'Clearance',
  'Green Marketplace',
]

export default function NavBar() {
  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__logo">
          Apple Park
          <small>Organic Farm Buddies</small>
        </Link>
        <div className="nav__links">
          {TABS.map((t) => (
            <a key={t} className="nav__link" href="#catalog">
              {t}
            </a>
          ))}
          <Link to="/quiz" className="nav__sprout">
            🌱 SPROUT
          </Link>
        </div>
      </div>
    </nav>
  )
}
