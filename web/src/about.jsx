
import React from "react";
import { createRoot } from "react-dom/client";
import {
  Pill, Search, ShoppingCart, User, ShieldCheck, Truck,
  Heart, Store, MapPin, Phone, Mail, Clock, CalendarDays,
  BriefcaseMedical, Leaf, HeartPulse, Baby, Bandage,
  Award, CheckCircle2, Headset, Facebook, Instagram,
  Youtube, ArrowRight
} from "lucide-react";
import "./about.css";

const store = {
  name: "UTAAM MEDICAL",
  address: "Add your actual store address here",
  phone: "Add your store phone number",
  email: "Add your store email",
  weekdays: "Monday – Saturday",
  weekdayHours: "8:00 AM – 10:00 PM",
  sunday: "Sunday",
  sundayHours: "9:00 AM – 8:00 PM"
};

const services = [
  { icon: Pill, name: "Prescription Medicines" },
  { icon: BriefcaseMedical, name: "OTC & Health Products" },
  { icon: Leaf, name: "Vitamins & Supplements" },
  { icon: HeartPulse, name: "Personal Care" },
  { icon: Baby, name: "Baby & Mother Care" },
  { icon: Bandage, name: "First Aid Essentials" }
];

function Brand() {
  return (
    <a className="about-brand" href="/about.html">
      <span className="about-brand-icon"><Pill size={27} /></span>
      <span>
        <strong>UTAAM</strong>
        <small>MEDICAL</small>
      </span>
    </a>
  );
}

function AboutPage() {
  return (
    <div className="about-page">
      <header className="about-header">
        <Brand />

        <nav className="about-nav">
          <a href="/store.html">Home</a>
          <a href="/store.html#shop">Shop</a>
          <a href="/track-order.html">Track Order</a>
          <a className="active" href="/about.html">About Store</a>
        </nav>

        <div className="about-header-actions">
          <a href="/store.html#shop" aria-label="Search medicines"><Search /></a>
          <a href="/store.html#cart" aria-label="Shopping cart"><ShoppingCart /></a>
          <a href="/store.html" aria-label="Customer account"><User /></a>
        </div>
      </header>

      <main>
        <section className="about-hero">
          <div className="about-hero-content">
            <span className="about-eyebrow">ABOUT OUR STORE</span>
            <h1>UTAAM MEDICAL</h1>
            <h2>Your Trusted Neighborhood Pharmacy</h2>
            <p>
              A modern pharmacy committed to providing genuine medicines,
              healthcare essentials and personalized care for you and your family.
            </p>

            <div className="about-highlights">
              <div><ShieldCheck /><b>Genuine<br />Medicines</b></div>
              <div><Truck /><b>Fast & Reliable<br />Service</b></div>
              <div><Heart /><b>Customer<br />First</b></div>
            </div>
          </div>

          <div className="about-hero-image">
            <img
              src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1100&q=85"
              alt="Pharmacy shelves and healthcare products"
            />
          </div>
        </section>

        <section className="about-content-grid">
          <article className="about-card store-card">
            <h2><Store /> Store Information</h2>

            <div className="store-detail">
              <MapPin />
              <div><b>Store Name</b><p>{store.name}</p></div>
            </div>

            <div className="store-detail">
              <MapPin />
              <div><b>Address</b><p>{store.address}</p></div>
            </div>

            <div className="store-detail">
              <Phone />
              <div><b>Phone</b><p>{store.phone}</p></div>
            </div>

            <div className="store-detail">
              <Mail />
              <div><b>Email</b><p>{store.email}</p></div>
            </div>
          </article>

          <article className="about-card services-card">
            <h2><HeartPulse /> Our Services</h2>
            <div className="services-grid">
              {services.map(({ icon: Icon, name }) => (
                <div className="service-item" key={name}>
                  <Icon />
                  <b>{name}</b>
                </div>
              ))}
            </div>
          </article>

          <article className="about-card hours-card">
            <h2><Clock /> Opening Hours</h2>
            <div className="hours-row">
              <CalendarDays />
              <b>{store.weekdays}</b>
              <span>{store.weekdayHours}</span>
            </div>
            <div className="hours-row">
              <CalendarDays />
              <b>{store.sunday}</b>
              <span>{store.sundayHours}</span>
            </div>
          </article>

          <article className="about-card why-card">
            <h2><Award /> Why Choose UTAAM MEDICAL?</h2>
            {[
              "A focus on genuine and trusted medicines",
              "A range of healthcare products",
              "Friendly customer support",
              "Convenient ordering and order tracking"
            ].map(item => (
              <p className="why-item" key={item}>
                <CheckCircle2 /> {item}
              </p>
            ))}
          </article>
        </section>

        <section className="about-assistance">
          <div className="assistance-heading">
            <Headset size={43} />
            <div>
              <h2>Need Assistance?</h2>
              <p>Our team is here to help with medicines, orders and general queries.</p>
            </div>
          </div>

          <a href={`tel:${store.phone}`} className="assistance-link">
            <Phone /> <span>Call Us<small>{store.phone}</small></span>
          </a>

          <a href={`mailto:${store.email}`} className="assistance-link">
            <Mail /> <span>Email Us<small>{store.email}</small></span>
          </a>

          <a href="#store-footer" className="visit-button">
            <MapPin /> Visit Our Store
          </a>
        </section>
      </main>

      <footer className="about-footer" id="store-footer">
        <div className="footer-columns">
          <div className="footer-brand-column">
            <Brand />
            <p className="footer-tagline">Care that comes closer.</p>
            <p>
              Your trusted neighborhood pharmacy for genuine medicines,
              healthcare essentials and everyday wellness.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="Facebook"><Facebook /></a>
              <a href="#" aria-label="Instagram"><Instagram /></a>
              <a href="#" aria-label="YouTube"><Youtube /></a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Quick Links</h3>
            <a href="/store.html">Home</a>
            <a href="/store.html#shop">Shop</a>
            <a href="/track-order.html">Track Order</a>
            <a href="/about.html">About Our Store</a>
            <a href={`mailto:${store.email}`}>Contact Us</a>
          </div>

          <div className="footer-column">
            <h3>Our Services</h3>
            {services.map(({ name }) => <span key={name}>{name}</span>)}
          </div>

          <div className="footer-column footer-contact">
            <h3>Contact Information</h3>
            <p><MapPin /> {store.address}</p>
            <p><Phone /> {store.phone}</p>
            <p><Mail /> {store.email}</p>
            <p><Clock /> {store.weekdayHours}</p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} UTAAM MEDICAL. All Rights Reserved.</span>
          <div>
            <a href="#store-footer">Privacy Policy</a>
            <a href="#store-footer">Terms of Service</a>
            <a href="#store-footer">Refund & Return Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<AboutPage />);
