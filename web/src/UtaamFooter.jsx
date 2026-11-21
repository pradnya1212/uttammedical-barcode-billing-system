import React, { useState } from 'react';
import './utaam-footer.css';

export default function UtaamFooter({ setPage }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  const navTo = (pageId) => {
    if (typeof setPage === 'function') {
      setPage(pageId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="utaam-footer" id="admin-footer">
      <div className="uf-container">

        {/* ── 1. BRAND & SLOGAN ── */}
        <div className="uf-brand-section">
          <div className="uf-logo-row">
            <div className="uf-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                <path d="M12 5v4"/>
                <path d="M10 7h4"/>
              </svg>
            </div>
            <div>
              <div className="uf-brand-title">UTAAM MEDICAL</div>
              <div className="uf-brand-sub">Healthcare • Wellness • Trust</div>
            </div>
          </div>

          <h3 className="uf-headline">Your Health, Our Priority.</h3>
          <p className="uf-description">
            Your trusted destination for healthcare essentials, medicines and medical supplies.
            We are committed to making healthcare shopping convenient, accessible and reliable.
          </p>

          <div className="uf-badges-row">
            <span className="uf-badge uf-badge-green">Quality-focused</span>
            <span className="uf-badge uf-badge-blue">Customer support</span>
            <span className="uf-badge uf-badge-dark">Secure checkout</span>
          </div>
        </div>

        <div className="uf-divider" />

        {/* ── 2. 4-COLUMN NAVIGATION LINKS ── */}
        <div className="uf-links-grid">
          {/* Col 1: Explore */}
          <div className="uf-col">
            <h4 className="uf-col-title">Explore</h4>
            <ul className="uf-link-list">
              <li>
                <button type="button" onClick={() => navTo('dashboard')} className="uf-link-btn">
                  Home
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navTo('dashboard')} className="uf-link-btn">
                  About UTAAM
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navTo('medicines')} className="uf-link-btn">
                  Shop Medicines
                </button>
              </li>
              <li>
                <a href="/store.html" target="_blank" rel="noreferrer" className="uf-link-btn">
                  Healthcare Products
                </a>
              </li>
              <li>
                <button type="button" onClick={() => navTo('medicines')} className="uf-link-btn">
                  New Arrivals
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navTo('medicines')} className="uf-link-btn">
                  Best Sellers
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: My Account */}
          <div className="uf-col">
            <h4 className="uf-col-title">My Account</h4>
            <ul className="uf-link-list">
              <li>
                <a href="/login.html" target="_blank" rel="noreferrer" className="uf-link-btn">
                  Login / Register
                </a>
              </li>
              <li>
                <button type="button" onClick={() => navTo('profile')} className="uf-link-btn">
                  My Profile
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navTo('orders')} className="uf-link-btn">
                  My Orders
                </button>
              </li>
              <li>
                <a href="/track-order.html" target="_blank" rel="noreferrer" className="uf-link-btn">
                  Track My Order
                </a>
              </li>
              <li>
                <button type="button" onClick={() => navTo('module-customers')} className="uf-link-btn">
                  Saved Addresses
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navTo('orders')} className="uf-link-btn">
                  Order History
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="uf-col">
            <h4 className="uf-col-title">Customer Care</h4>
            <ul className="uf-link-list">
              <li>
                <a href="tel:07719061073" className="uf-link-btn">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="mailto:support@utaammedical.com" className="uf-link-btn">
                  Help Center
                </a>
              </li>
              <li>
                <span className="uf-link-static">Frequently Asked Questions</span>
              </li>
              <li>
                <span className="uf-link-static">Shipping &amp; Delivery</span>
              </li>
              <li>
                <button type="button" onClick={() => navTo('module-returns')} className="uf-link-btn">
                  Cancellation &amp; Refunds
                </button>
              </li>
              <li>
                <a href="mailto:support@utaammedical.com" className="uf-link-btn">
                  Report an Issue
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Information */}
          <div className="uf-col">
            <h4 className="uf-col-title">Information</h4>
            <ul className="uf-link-list">
              <li><span className="uf-link-static">Privacy Policy</span></li>
              <li><span className="uf-link-static">Terms &amp; Conditions</span></li>
              <li><span className="uf-link-static">Return Policy</span></li>
              <li><span className="uf-link-static">Disclaimer</span></li>
              <li><span className="uf-link-static">Prescription Policy</span></li>
              <li><span className="uf-link-static">Cookie Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="uf-divider" />

        {/* ── 3. STAY CONNECTED (NEWSLETTER + SOCIALS) ── */}
        <div className="uf-connected-section">
          <h4 className="uf-connected-title">Stay Connected</h4>
          <p className="uf-connected-sub">Get updates about new products, healthcare information and special offers.</p>

          <form onSubmit={handleSubscribe} className="uf-subscribe-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="uf-subscribe-input"
              required
            />
            <button type="submit" className="uf-subscribe-btn">
              {subscribed ? '✓ Subscribed' : 'Subscribe'}
            </button>
          </form>

          {subscribed && (
            <div className="uf-subscribe-msg">Thank you for subscribing to UTAAM Medical updates!</div>
          )}

          <div className="uf-social-icons">
            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="uf-social-icon" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="uf-social-icon" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="uf-social-icon" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect width="4" height="12" x="2" y="9"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            {/* YouTube */}
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="uf-social-icon" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                <polygon points="10 15 15 12 10 9 10 15"/>
              </svg>
            </a>
            {/* Chat / Message */}
            <a href="mailto:support@utaammedical.com" className="uf-social-icon" aria-label="Message Support">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ── 4. CONTACT INFORMATION ── */}
        <div className="uf-info-block">
          <h4 className="uf-block-title">Contact Information</h4>
          <div className="uf-contact-details">
            <div className="uf-contact-line">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Customer Support: <strong>+91 77190 61073</strong></span>
            </div>

            <div className="uf-contact-line">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <a href="mailto:support@utaammedical.com">support@utaammedical.com</a>
              <span className="uf-sep">·</span>
              <a href="mailto:turevalepradnya@gmail.com">turevalepradnya@gmail.com</a>
            </div>

            <div className="uf-contact-line">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Chhatrapati Shivaji Maharaj Petha (Hujjare Galli), Jath, Sangli, Maharashtra, India</span>
            </div>
          </div>
        </div>

        {/* ── 5. SECURE & CONVENIENT PAYMENTS ── */}
        <div className="uf-info-block">
          <h4 className="uf-block-title">Secure &amp; Convenient Payments</h4>
          <div className="uf-payment-badges">
            <span className="uf-pay-pill">UPI</span>
            <span className="uf-pay-pill">VISA</span>
            <span className="uf-pay-pill">Mastercard</span>
            <span className="uf-pay-pill">RuPay</span>
            <span className="uf-pay-pill">Razorpay</span>
          </div>
          <p className="uf-payment-note">Payment methods displayed are subject to actual checkout availability.</p>
        </div>

        {/* ── 6. HEALTHCARE DISCLAIMER ── */}
        <div className="uf-info-block">
          <h4 className="uf-block-title">Healthcare Disclaimer</h4>
          <p className="uf-disclaimer-text">
            Product information is provided for general informational purposes and is not a substitute for
            professional medical advice. Use prescription medicines only with a valid prescription where required.
            Consult a qualified healthcare professional before using medicines.
          </p>
        </div>

        <div className="uf-divider" />

        {/* ── 7. BOTTOM BAR ── */}
        <div className="uf-bottom-bar">
          <div className="uf-copyright">© {new Date().getFullYear()} UTAAM Medical. All Rights Reserved.</div>
          <div className="uf-tagline-bottom">Designed with care for better healthcare access.</div>
        </div>

      </div>
    </footer>
  );
}
