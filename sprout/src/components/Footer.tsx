export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__cols">
        <div>
          <div className="nav__logo" style={{ fontSize: 20 }}>
            Apple Park
            <small>Organic Farm Buddies</small>
          </div>
          <p style={{ maxWidth: '34ch' }}>
            Soft apparel, whimsical dolls, and toys — wrapped in love, woven with purpose.
          </p>
        </div>
        <div>
          <h5>Shop</h5>
          <a href="#catalog">Dolls</a>
          <a href="#catalog">Farm Buddies</a>
          <a href="#catalog">Apparel</a>
          <a href="#catalog">Gift Lab</a>
        </div>
        <div>
          <h5>Help</h5>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="#">Contact</a>
        </div>
        <div>
          <h5>Gift Menu</h5>
          <a href="/quiz">SPROUT gift quiz</a>
          <a href="#">Gift cards</a>
          <a href="#">Registry</a>
        </div>
      </div>
      <div className="container" style={{ marginTop: 24, fontSize: 13 }}>
        © {2026} Apple Park Kids · Good to be green 🌿 · Demo build
      </div>
    </footer>
  )
}
