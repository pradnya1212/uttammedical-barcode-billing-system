
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search, ShoppingBag, Heart, X, Plus, Minus, Pill,
  ShieldCheck, Truck, Headphones, ArrowRight, Package, RefreshCw,
  CheckCircle2, Printer, CreditCard, Banknote
} from 'lucide-react';
import './store.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086';

const categories = [
  { id: 'all', name: 'All products' },
  { id: 'medicines', name: 'Medicines & Tablets' },
  { id: 'syrups', name: 'Syrups & Liquids' },
  { id: 'drops', name: 'Drops & Inhalers' },
  { id: 'creams', name: 'Ointments & Creams' },
  { id: 'wellness', name: 'Wellness & Supplements' }
];

const dosagePhotos = {
  SYRUP: [
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=900&q=80'
  ],
  SUSPENSION: [
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80'
  ],
  TABLET: [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=900&q=80'
  ],
  CAPSULE: [
    'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=900&q=80'
  ],
  DROPS: [
    'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=900&q=80'
  ],
  INHALER: [
    'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=900&q=80'
  ],
  CREAM: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80'
  ],
  OINTMENT: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80'
  ],
  POWDER: [
    'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=900&q=80'
  ]
};

function getProductPhoto(product, index = 0) {
  const form = (product.dosageForm || 'TABLET').toUpperCase();
  const photos = dosagePhotos[form] || dosagePhotos.TABLET;
  return photos[index % photos.length];
}

function matchProductCategory(product, catId) {
  if (catId === 'all') return true;

  const form = (product.dosageForm || '').toUpperCase();
  const cat = (product.category || '').toLowerCase();
  const name = (product.medicineName || '').toLowerCase();

  if (catId === 'syrups') {
    return ['SYRUP', 'SUSPENSION'].includes(form) ||
      /syrup|suspension|tonic|liquid|cough|cold/i.test(cat + ' ' + name);
  }

  if (catId === 'medicines') {
    return ['TABLET', 'CAPSULE'].includes(form) &&
      !/supplement|vitamin|calcium/i.test(cat);
  }

  if (catId === 'drops') {
    return ['DROPS', 'INHALER'].includes(form) ||
      /drop|inhaler|spray/i.test(cat + ' ' + name);
  }

  if (catId === 'creams') {
    return ['CREAM', 'OINTMENT'].includes(form) ||
      /cream|ointment|gel/i.test(cat + ' ' + name);
  }

  if (catId === 'wellness') {
    return form === 'POWDER' ||
      /wellness|supplement|vitamin|nutrition|ors|calcium/i.test(cat + ' ' + name);
  }

  return true;
}

const money = n =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(n || 0));

async function get(path) {
  const response = await fetch(`${API}${path}`);
  const body = await response.text();

  let data = {};

  try {
    data = body ? JSON.parse(body) : {};
  } catch {
    data = { message: body };
  }

  if (!response.ok) {
    throw new Error(data.message || `API request failed (${response.status})`);
  }

  return data;
}

function App() {
  // ── Auth session & Token Verification ──────────────────────
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('utaam_session') || 'null'); }
    catch { return null; }
  });
  const [tokenVerified, setTokenVerified] = useState(false);

  // Verify Customer Token on Mount
  useEffect(() => {
    if (!session || !session.authToken) {
      window.location.href = '/login.html';
      return;
    }

    // Call backend token verification
    fetch(`${API}/api/auth/verify-token?token=${encodeURIComponent(session.authToken)}`)
      .then(res => {
        if (!res.ok) throw new Error('Token verification failed');
        return res.json();
      })
      .then(data => {
        if (data.valid || data.success) {
          setTokenVerified(true);
          // Sync verified customer details
          if (data.customerId) {
            setCustomer(prev => ({
              ...prev,
              name: data.name || prev.name,
              phone: data.phone || prev.phone,
              email: data.email || prev.email,
              address: data.address || prev.address
            }));
          }
        } else {
          throw new Error('Token invalid');
        }
      })
      .catch(() => {
        localStorage.removeItem('utaam_session');
        localStorage.removeItem('utaam_customer');
        window.location.href = '/login.html?session_expired=1';
      });
  }, []);

  function handleLogout() {
    localStorage.removeItem('utaam_session');
    localStorage.removeItem('utaam_customer');
    window.location.href = '/login.html';
  }

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showWishlist, setShowWishlist] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [customer, setCustomer] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('utaam_customer') || '{}'
      );

      return {
        name: saved.name || '',
        email: saved.email || '',
        phone: saved.phone || '',
        address: saved.address || ''
      };
    } catch {
      return {
        name: '',
        email: '',
        phone: '',
        address: ''
      };
    }
  });

  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [orderLoading, setOrderLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [orderMessage, setOrderMessage] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const medicines = await get('/api/medicines');

      if (!Array.isArray(medicines)) {
        throw new Error('Invalid medicine API response');
      }

      const enriched = await Promise.all(
        medicines.map(async medicine => {
          try {
            const batchesResponse = await get(
              `/api/medicines/${medicine.id}/batches`
            );

            const batches = Array.isArray(batchesResponse)
              ? batchesResponse
              : [];

            const available = batches
              .filter(batch => Number(batch.quantity || 0) > 0)
              .sort(
                (a, b) => Number(a.mrp || 0) - Number(b.mrp || 0)
              );

            const batch = available[0] || batches[0] || null;

            return {
              ...medicine,
              batches,
              batch,
              price: batch?.mrp ?? null,
              stock: available.reduce(
                (sum, batch) => sum + Number(batch.quantity || 0),
                0
              )
            };
          } catch {
            return {
              ...medicine,
              batches: [],
              batch: null,
              price: null,
              stock: 0
            };
          }
        })
      );

      setItems(enriched.filter(item => item.active !== false));
    } catch (err) {
      setError(
        `${err.message}. Make sure the UTAAM backend is running at ${API}.`
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    return items.filter(product => {
      const searchable = `
        ${product.medicineName || ''}
        ${product.genericName || ''}
        ${product.manufacturer || ''}
        ${product.category || ''}
        ${product.dosageForm || ''}
      `.toLowerCase();

      return (
        searchable.includes(search.trim().toLowerCase()) &&
        matchProductCategory(product, category) &&
        (!showWishlist || wishlist.includes(product.id))
      );
    });
  }, [items, search, category, showWishlist, wishlist]);

  const cartCount = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const total = cart.reduce(
    (sum, item) => sum + item.qty * Number(item.price || 0),
    0
  );

  function add(product) {
    if (product.prescriptionRequired === true) {
      setOrderMessage(
        'This item requires a valid prescription. Please contact the pharmacy.'
      );
      return;
    }

    if (Number(product.stock || 0) < 1) {
      setOrderMessage('This medicine is currently out of stock.');
      return;
    }

    if (product.price == null) {
      setOrderMessage('Price is currently unavailable.');
      return;
    }

    const productIndex = items.findIndex(
      item => item.id === product.id
    );

    const photo = getProductPhoto(product, Math.max(productIndex, 0));

    setCart(oldCart => {
      const existing = oldCart.find(
        item => item.id === product.id
      );

      if (existing) {
        if (existing.qty >= Number(product.stock)) {
          setOrderMessage('Maximum available stock already added.');
          return oldCart;
        }

        return oldCart.map(item =>
          item.id === product.id
            ? {
              ...item,
              qty: Math.min(item.qty + 1, Number(product.stock)),
              photo
            }
            : item
        );
      }

      return [
        ...oldCart,
        {
          ...product,
          photo,
          qty: 1
        }
      ];
    });

    setCartOpen(true);
    setOrderMessage(`${product.medicineName} added to your cart.`);
  }

  function changeQty(id, delta) {
    setCart(oldCart =>
      oldCart.map(item =>
        item.id === id
          ? {
            ...item,
            qty: Math.max(
              1,
              Math.min(
                item.qty + delta,
                Number(item.stock || 99)
              )
            )
          }
          : item
      )
    );
  }

  function removeItem(id) {
    setCart(oldCart =>
      oldCart.filter(item => item.id !== id)
    );
  }

  function toggleWish(id) {
    setWishlist(old =>
      old.includes(id)
        ? old.filter(item => item !== id)
        : [...old, id]
    );
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();

    if (cart.length === 0) {
      setOrderMessage(
        'Your cart is empty. Add products to your cart first.'
      );
      return;
    }

    setOrderLoading(true);
    setOrderMessage('');

    const orderPayload = {
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      deliveryAddress: customer.address,
      paymentMethod,
      items: cart.map(item => ({
        medicineId: item.id,
        medicineName: item.medicineName,
        dosageForm: item.dosageForm,
        unitPrice: item.price,
        quantity: item.qty
      }))
    };

    try {
      const response = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      const responseText = await response.text();
      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.detail ||
          `Failed to place order (${response.status})`
        );
      }

      localStorage.setItem(
        'utaam_customer',
        JSON.stringify(customer)
      );

      setConfirmedOrder(data);
      setCart([]);
      setCheckoutOpen(false);

      load();
    } catch (err) {
      setOrderMessage(`Could not place order: ${err.message}`);
    } finally {
      setOrderLoading(false);
    }
  }

  return (
    <div className="store">

      <div className="announcement">
        FREE DELIVERY ON ELIGIBLE ORDERS <span>•</span>
        PHARMACIST SUPPORT AVAILABLE
      </div>

      <header className="store-header">

        <a className="store-brand" href="/store.html">
          <span className="brand-icon">
            <Pill size={22} />
          </span>

          <span>
            UTAAM <b>MEDICAL</b>
            <small>CARE THAT COMES CLOSER</small>
          </span>
        </a>

        <nav className="desktop-nav">
          <a className="selected" href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#benefits">Why Utaam</a>
          <a href="/track-order.html">Track Order</a>
          <a href="#footer">Contact</a>
        </nav>

        <div className="header-actions">

          <form
            className="header-search"
            onSubmit={event => {
              event.preventDefault();
              document.getElementById('shop')?.scrollIntoView({
                behavior: 'smooth'
              });
            }}
          >
            <Search size={19} />

            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search medicines & syrups..."
              aria-label="Search medicines"
            />

            <button type="submit" aria-label="Search">
              <Search size={19} />
            </button>
          </form>

          <button
            type="button"
            className={`round-action ${showWishlist ? 'active' : ''}`}
            title="View wishlist"
            aria-label="View wishlist products"
            onClick={() => {
              setShowWishlist(value => !value);
              setCategory('all');
              setSearch('');

              document.getElementById('shop')?.scrollIntoView({
                behavior: 'smooth'
              });
            }}
          >
            <Heart
              size={19}
              fill={showWishlist ? 'currentColor' : 'none'}
            />
            <i>{wishlist.length}</i>
          </button>

          <button
            type="button"
            className="round-action cart-action"
            title="Shopping cart"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={19} />
            <i>{cartCount}</i>
          </button>



          {session && (
            <div className="user-menu">
              <span className="user-avatar" title={session.name || session.email}>
                {(session.name || session.email || 'U').charAt(0).toUpperCase()}
              </span>
              <span className="user-name">{session.name?.split(' ')[0] || 'Account'}</span>
              <button className="logout-btn" onClick={handleLogout} title="Sign out">
                Sign out
              </button>
            </div>
          )}

        </div>
      </header>

      <main id="home">

        <section className="hero">

          <div className="hero-copy">
            <span className="hero-kicker">
              YOUR HEALTH, OUR PRIORITY
            </span>

            <h1>
              Everyday care.
              <br />
              <em>Delivered with</em> trust.
            </h1>

            <p>
              Find tablets, cough syrups, pediatric care, pain relief,
              and wellness essentials loaded straight from your local pharmacy stock.
            </p>

            <a href="#shop" className="shop-cta">
              Explore products <ArrowRight size={17} />
            </a>

            <div className="hero-note">
              <ShieldCheck size={16} />
              Pharmacy-managed inventory ({items.length} items available)
            </div>
          </div>

          <div className="hero-art">
            <img
              className="hero-photo"
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=90"
              alt="Pharmacist preparing healthcare essentials"
            />

            <div className="hero-photo-shade"></div>

            <div className="hero-photo-label">
              <span>YOUR EVERYDAY HEALTH PARTNER</span>
              <b>Wellness starts<br />with small steps.</b>

              <a href="#shop">
                Shop essentials <ArrowRight size={15} />
              </a>
            </div>

            <div className="floating-tag">
              <ShieldCheck size={15} />
              Pharmacy-managed care
            </div>
          </div>

        </section>

        <section className="benefits" id="benefits">

          <div>
            <span className="benefit-icon">
              <ShieldCheck />
            </span>
            <span>
              <b>Trusted inventory</b>
              <small>Managed by your pharmacy</small>
            </span>
          </div>

          <div>
            <span className="benefit-icon">
              <Truck />
            </span>
            <span>
              <b>Convenient delivery</b>
              <small>Delivery options at checkout</small>
            </span>
          </div>

          <div>
            <span className="benefit-icon">
              <Headphones />
            </span>
            <span>
              <b>Helpful support</b>
              <small>We're here when you need us</small>
            </span>
          </div>

        </section>

        <section className="shop-section" id="shop">

          <div className="section-heading">
            <div>
              <span className="section-kicker">
                {showWishlist ? 'YOUR SAVED PRODUCTS' : 'SHOP THE COLLECTION'}
              </span>

              <h2>
                {showWishlist ? 'My Wishlist' : 'Find what you need'}
              </h2>

              <p>
                {showWishlist
                  ? 'Your favourite pharmacy products.'
                  : 'Products categorized by type: medicines, syrups, drops, creams, and wellness supplements.'}
              </p>
            </div>

            <button
              type="button"
              className="refresh-btn"
              onClick={load}
            >
              <RefreshCw size={15} />
              Refresh stock
            </button>
          </div>

          {showWishlist && (
            <button
              type="button"
              className="refresh-btn"
              onClick={() => setShowWishlist(false)}
            >
              <ArrowRight size={15} />
              Continue shopping
            </button>
          )}

          {!showWishlist && (
            <div
              className="category-rail"
              role="tablist"
              aria-label="Product categories"
            >
              {categories.map(item => {
                const count =
                  item.id === 'all'
                    ? items.length
                    : items.filter(product =>
                      matchProductCategory(product, item.id)
                    ).length;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={category === item.id}
                    className={category === item.id ? 'active' : ''}
                    onClick={() => setCategory(item.id)}
                  >
                    {item.name}
                    <span className="cat-count">{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <div className="store-alert">{error}</div>
          )}

          {loading ? (
            <div className="loading-state">
              Loading pharmacy inventory…
            </div>
          ) : visible.length === 0 ? (
            <div className="empty-state">
              <Package size={30} />

              <b>
                {showWishlist
                  ? 'Your wishlist is empty'
                  : 'No products found'}
              </b>

              <span>
                {showWishlist
                  ? 'Click the heart on a product to save it here.'
                  : items.length
                    ? 'Try another category or clear your search term.'
                    : 'Add medicines and batches in the admin workspace first.'}
              </span>

              {showWishlist && (
                <button
                  type="button"
                  className="refresh-btn"
                  onClick={() => setShowWishlist(false)}
                >
                  Browse products
                </button>
              )}

              {!items.length && (
                <button
                  type="button"
                  className="refresh-btn"
                  onClick={() => loadMedicines()}
                  style={{ marginTop: '12px' }}
                >
                  Reload catalog
                </button>
              )}
            </div>
          ) : (

            <div className="product-grid">

              {visible.map((product, index) => (
                <article
                  className="product-card"
                  key={product.id}
                >

                  <div className={`product-visual tone-${index % 4}`}>

                    <img
                      className="product-photo"
                      src={getProductPhoto(product, index)}
                      alt={`${product.medicineName} product`}
                      loading="lazy"
                    />

                    <button
                      type="button"
                      className={`wish-btn ${wishlist.includes(product.id) ? 'chosen' : ''
                        }`}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleWish(product.id);
                      }}
                      aria-label={
                        wishlist.includes(product.id)
                          ? 'Remove from wishlist'
                          : 'Add to wishlist'
                      }
                      aria-pressed={wishlist.includes(product.id)}
                    >
                      <Heart
                        size={19}
                        fill={
                          wishlist.includes(product.id)
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                    </button>

                    <span className="product-category">
                      {product.dosageForm} · {product.category || 'Pharmacy'}
                    </span>

                  </div>

                  <div className="product-info">

                    <div className="product-maker">
                      {product.manufacturer ||
                        product.genericName ||
                        'UTAAM Pharmacy'}
                    </div>

                    <h3>
                      {product.medicineName} {product.strength || ''}
                    </h3>

                    <div className="product-meta">
                      {product.dosageForm || 'Healthcare'}
                      {product.prescriptionRequired &&
                        ' · Prescription required'}
                    </div>

                    <div className="product-buy">

                      <div>
                        {product.price != null ? (
                          <>
                            <b>{money(product.price)}</b>

                            <small>
                              {product.stock > 0
                                ? `${product.stock} in stock`
                                : 'Out of stock'}
                            </small>
                          </>
                        ) : (
                          <b className="price-unavailable">
                            Price at pharmacy
                          </b>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={
                          Number(product.stock || 0) < 1 ||
                          product.price == null ||
                          product.prescriptionRequired === true
                        }
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          add(product);
                        }}
                      >
                        <Plus size={15} />
                        Add
                      </button>

                    </div>
                  </div>

                </article>
              ))}

            </div>

          )}

        </section>

      </main>

      <footer id="footer">

        <div className="footer-brand">
          <span className="brand-icon">
            <Pill size={20} />
          </span>

          <b>UTAAM MEDICAL</b>
          <p>Care that comes closer.</p>
          <span>Thoughtful care for everyday wellbeing.</span>
        </div>

        <div>
          <b>Customer care</b>
          <a href="mailto:care@utaammedical.example">
            care@utaammedical.example
          </a>
          <span>
            For medicine and prescription queries, contact your pharmacy.
          </span>
        </div>

        <div>
          <b>Explore</b>
          <a href="#home">Home</a>
          <a href="#shop">Shop products</a>
          <a href="#benefits">Why UTAAM</a>
          <a href="/track-order.html">Track your orders</a>
        </div>

        <div>
          <b>Shop with confidence</b>
          <span>Pharmacy-managed inventory</span>
          <span>Helpful customer support</span>
          <span>Secure checkout coming soon</span>
        </div>

        <small className="copyright">
          © {new Date().getFullYear()} UTAAM MEDICAL · Customer storefront
        </small>

      </footer>

      {/* SHOPPING CART DRAWER */}

      {cartOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="cart-drawer"
            onClick={event => event.stopPropagation()}
          >

            <div className="drawer-head">
              <div>
                <small>YOUR BAG</small>
                <h2>
                  Shopping cart <span>{cartCount}</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
              >
                <X />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={34} />
                <b>Your cart is empty</b>
                <span>Add a product to get started.</span>
              </div>
            ) : (
              <>
                <div className="cart-lines">

                  {cart.map(item => (
                    <div className="cart-line" key={item.id}>

                      <img
                        className="cart-product-photo"
                        src={item.photo || getProductPhoto(item)}
                        alt={item.medicineName}
                      />

                      <div className="cart-line-info">
                        <b>
                          {item.medicineName} {item.strength || ''}
                        </b>

                        <small>
                          {item.dosageForm || 'Medicine'} · {money(item.price)} each
                        </small>

                        <div className="qty-control">

                          <button
                            type="button"
                            onClick={() => changeQty(item.id, -1)}
                          >
                            <Minus size={13} />
                          </button>

                          <span>{item.qty}</span>

                          <button
                            type="button"
                            disabled={item.qty >= item.stock}
                            onClick={() => changeQty(item.id, 1)}
                          >
                            <Plus size={13} />
                          </button>

                        </div>
                      </div>

                      <strong>
                        {money(item.price * item.qty)}
                      </strong>

                      <button
                        type="button"
                        className="remove-line"
                        title="Remove product"
                        onClick={() => removeItem(item.id)}
                      >
                        <X size={14} />
                      </button>

                    </div>
                  ))}

                </div>

                <div className="drawer-total">
                  <span>Subtotal</span>
                  <b>{money(total)}</b>
                </div>

                <button
                  type="button"
                  className="checkout-btn"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                >
                  Continue to checkout
                  <ArrowRight size={16} />
                </button>
              </>
            )}

          </aside>
        </div>
      )}

      {/* CHECKOUT MODAL */}

      {checkoutOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setCheckoutOpen(false)}
        >
          <form
            className="checkout-modal"
            onClick={event => event.stopPropagation()}
            onSubmit={handlePlaceOrder}
          >

            <div className="drawer-head">
              <div>
                <small>CHECKOUT</small>
                <h2>Delivery & Payment</h2>
              </div>

              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
              >
                <X />
              </button>
            </div>

            <label>
              Full name
              <input
                required
                placeholder="Your full name"
                value={customer.name}
                onChange={event =>
                  setCustomer({
                    ...customer,
                    name: event.target.value
                  })
                }
              />
            </label>

            <label>
              Email
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={customer.email}
                onChange={event =>
                  setCustomer({
                    ...customer,
                    email: event.target.value
                  })
                }
              />
            </label>

            <label>
              Phone number
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={customer.phone}
                onChange={event =>
                  setCustomer({
                    ...customer,
                    phone: event.target.value
                  })
                }
              />
            </label>

            <label>
              Delivery address
              <textarea
                required
                placeholder="House/Street, Landmark, City, State, PIN"
                value={customer.address}
                onChange={event =>
                  setCustomer({
                    ...customer,
                    address: event.target.value
                  })
                }
              />
            </label>

            <div className="payment-section">
              <span className="payment-title">Payment Method</span>

              <div className="payment-options-grid">

                <label
                  className={`payment-pill ${paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'selected'
                      : ''
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={() =>
                      setPaymentMethod('CASH_ON_DELIVERY')
                    }
                  />

                  <Banknote size={18} />

                  <div>
                    <b>Cash on Delivery</b>
                    <small>Pay cash or UPI at doorstep</small>
                  </div>
                </label>

                <label
                  className={`payment-pill ${paymentMethod === 'ONLINE_UPI'
                      ? 'selected'
                      : ''
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE_UPI"
                    checked={paymentMethod === 'ONLINE_UPI'}
                    onChange={() =>
                      setPaymentMethod('ONLINE_UPI')
                    }
                  />

                  <CreditCard size={18} />

                  <div>
                    <b>Online / UPI</b>
                    <small>Online payment option</small>
                  </div>
                </label>

              </div>
            </div>

            <div className="checkout-summary">
              <div>
                <span>Order subtotal ({cartCount} items)</span>
                <small className="free-shipping-tag">
                  FREE Pharmacy Delivery
                </small>
              </div>

              <b>{money(total)}</b>
            </div>

            <button
              className="checkout-btn"
              type="submit"
              disabled={orderLoading || cartCount === 0}
            >
              {orderLoading
                ? 'Processing Order...'
                : `Place Order • ${money(total)}`}
            </button>

            {orderMessage && (
              <p className="checkout-message">{orderMessage}</p>
            )}

          </form>
        </div>
      )}

      {/* ORDER CONFIRMATION MODAL / INVOICE */}

      {confirmedOrder && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmedOrder(null)}
        >
          <div
            className="checkout-modal order-receipt-modal"
            onClick={event => event.stopPropagation()}
          >

            <div className="receipt-banner">
              <span className="receipt-success-icon">
                <CheckCircle2 size={42} />
              </span>

              <h2>Order Placed Successfully!</h2>

              <p>
                Thank you, <b>{confirmedOrder.customerName}</b>.
                Your pharmacy order has been confirmed.
              </p>

              <div className="receipt-id-tag">
                Order ID: <b>#{confirmedOrder.orderNumber}</b>
              </div>
            </div>

            <div className="receipt-details-box">

              <div>
                <small>DELIVERY ADDRESS</small>
                <b>{confirmedOrder.customerName}</b>
                <p>{confirmedOrder.deliveryAddress}</p>
                <span>Phone: {confirmedOrder.customerPhone}</span>
              </div>

              <div>
                <small>PAYMENT METHOD</small>

                <b>
                  {confirmedOrder.paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'Cash on Delivery'
                    : 'Online / UPI'}
                </b>

                <small style={{ marginTop: '10px' }}>
                  STATUS
                </small>

                <b className="status-confirmed-tag">
                  ● {confirmedOrder.orderStatus}
                </b>
              </div>

            </div>

            <div className="receipt-items-list">
              <small>ORDER ITEMS</small>

              {confirmedOrder.items &&
                confirmedOrder.items.map(item => (
                  <div
                    className="receipt-item-row"
                    key={item.id || item.medicineId}
                  >
                    <div>
                      <b>{item.medicineName}</b>
                      <small>
                        {item.dosageForm || 'Medicine'} ·
                        Batch: {item.batchNumber || 'Assigned'}
                      </small>
                    </div>

                    <div>
                      <span>
                        {item.quantity} × {money(item.unitPrice)}
                      </span>
                      <strong>{money(item.subtotal)}</strong>
                    </div>
                  </div>
                ))}
            </div>

            <div className="receipt-total-row">
              <span>Total Payable</span>
              <b>{money(confirmedOrder.totalAmount)}</b>
            </div>

            <div className="receipt-actions">

              <button
                type="button"
                className="print-btn"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                Print Receipt
              </button>

              <button
                type="button"
                className="checkout-btn"
                onClick={() => setConfirmedOrder(null)}
              >
                Continue Shopping
              </button>

            </div>

          </div>
        </div>
      )}

      {orderMessage && !checkoutOpen && (
        <div className="toast">
          {orderMessage}

          <button
            type="button"
            onClick={() => setOrderMessage('')}
          >
            <X size={14} />
          </button>
        </div>
      )}

    </div>
  );
}

createRoot(document.getElementById('store-root')).render(<App />);
