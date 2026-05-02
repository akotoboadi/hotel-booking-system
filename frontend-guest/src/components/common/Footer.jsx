import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <div className="footer__logo">AKStay<span>·</span></div>
          <p>Discover extraordinary stays around the world. Every detail curated for those who expect the best.</p>
        </div>
        <div className="footer__links-group">
          <h4>Explore</h4>
          <Link to="/search">All Hotels</Link>
          <Link to="/search?type=resort">Resorts</Link>
          <Link to="/search?type=boutique">Boutique Hotels</Link>
          <Link to="/search?type=villa">Villas</Link>
        </div>
        <div className="footer__links-group">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Cancellation Policy</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
        <div className="footer__links-group">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Press</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} AKStay. All rights reserved.</span>
        <div className="footer__socials">
          <a href="#">Instagram</a>
          <a href="#">Twitter</a>
          <a href="#">LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}