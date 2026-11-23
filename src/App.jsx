import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
	ChevronRight,
	CircleUserRound,
	CreditCard,
	Edit3,
	Heart,
	LayoutDashboard,
	LogIn,
	LogOut,
	Menu,
	MessageCircle,
	Minus,
	Plus,
	RotateCcw,
	Save,
	Search,
	ShoppingBag,
	Smartphone,
	Sparkles,
	Trash2,
	X,
} from 'lucide-react';
import { categories, products, shapeOptions } from './data/products';
import { buildWhatsAppUrl, clearAdminToken, clearUserSession, createOrder, getAdminSession, getProducts, getUserSession, loginAdmin, loginUser, readAdminToken, readUser, readUserToken, resetStoredProducts, saveFavorite, saveProducts, signUpUser, storeAdminToken, storeUserSession } from './services/api';

const money = (value) => `$${value.toFixed(2)}`;

function Logo({ compact = false }) {
  return (
    <a className={`logo ${compact ? 'logo--compact' : ''}`} href="#top" aria-label="Lumin Optics home">
      <span className="logo-mark"><span /><i /></span>
      {!compact && <span className="logo-word">Lumin<span>.</span></span>}
    </a>
  );
}

function IconButton({ label, onClick, children, active = false, className = '' }) {
  return (
    <button className={`icon-button ${active ? 'is-active' : ''} ${className}`} onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

function ProductCard({ product, favorite, onFavorite, onSelect, onAdd }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap" onClick={() => onSelect(product)}>
        <img src={product.image} alt={product.imageAlt} className="product-image" />
        <div className="product-card-topline">
          <span className="eyebrow">{product.collection}</span>
          <button className={`favorite-button ${favorite ? 'is-saved' : ''}`} onClick={(event) => { event.stopPropagation(); onFavorite(product); }} aria-label={favorite ? `Remove ${product.name} from favorites` : `Save ${product.name}`}>
            <Heart size={17} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <span className="product-badge">{product.badge}</span>
        <button className="quick-view" onClick={() => onSelect(product)}>Quick view <ArrowUpRight /></button>
      </div>
      <div className="product-card-info">
        <div>
          <h3>{product.name}</h3>
          <p>{product.color}</p>
        </div>
        <div className="product-price-block">
          {product.oldPrice && <s>{money(product.oldPrice)}</s>}
          <strong>{money(product.price)}</strong>
        </div>
      </div>
      <button className="card-add" onClick={() => onAdd(product)}><span>Add to bag</span><Plus size={15} /></button>
    </article>
  );
}

function ProductModal({ product, favorite, onClose, onFavorite, onAdd }) {
  if (!product) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="product-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${product.name} details`}>
        <button className="modal-close" onClick={onClose} aria-label="Close product details"><X size={20} /></button>
        <div className="modal-product-image"><img src={product.image} alt={product.imageAlt} /></div>
        <div className="modal-product-content">
          <div className="modal-kicker"><span className="eyebrow">{product.collection} / {product.shape}</span><button className={`favorite-button ${favorite ? 'is-saved' : ''}`} onClick={() => onFavorite(product)} aria-label="Toggle favorite"><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /></button></div>
          <h2>{product.name}</h2>
          <div className="modal-price"><strong>{money(product.price)}</strong>{product.oldPrice && <s>{money(product.oldPrice)}</s>}</div>
          <p className="modal-description">{product.description}</p>
          <div className="swatch-row"><span>Color</span><strong>{product.color}</strong><i className="swatch swatch--ink" /><i className="swatch swatch--citrus" /><i className="swatch swatch--clay" /></div>
          <div className="modal-divider" />
          <div className="fit-row"><span>Fit guide</span><button>Find your fit <ArrowRight size={15} /></button></div>
          <ul className="detail-list">{product.details.map((detail) => <li key={detail}><Check size={14} /> {detail}</li>)}</ul>
          <button className="primary-button primary-button--wide" onClick={() => onAdd(product)}>Add to bag <ShoppingBag size={16} /></button>
          <a className="whatsapp-button" href={buildWhatsAppUrl({ product })} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Ask about this frame on WhatsApp</a>
          <p className="modal-note">Free shipping + 90-day fit guarantee. Prescription lenses added at checkout.</p>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onClose, onChangeQuantity, onRemove, onCheckout }) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return (
    <div className="drawer-shell" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer drawer--cart">
        <div className="drawer-header"><div><span className="eyebrow">Your edit</span><h2>Shopping bag <span>{cart.length}</span></h2></div><IconButton label="Close shopping bag" onClick={onClose}><X size={20} /></IconButton></div>
        {cart.length === 0 ? (
          <div className="empty-state"><div className="empty-icon"><ShoppingBag size={28} /></div><h3>Your bag is clear.</h3><p>Save a frame from the edit and it will appear here.</p><button className="text-button" onClick={onClose}>Keep exploring <ArrowRight size={15} /></button></div>
        ) : (
          <>
            <div className="cart-items">{cart.map(({ product, quantity }) => (
              <div className="cart-item" key={product.id}>
                <img src={product.image} alt="" />
                <div className="cart-item-copy"><div className="cart-item-title"><div><strong>{product.name}</strong><span>{product.color}</span></div><button onClick={() => onRemove(product.id)} aria-label={`Remove ${product.name}`}><X size={15} /></button></div><div className="cart-item-bottom"><div className="quantity-control"><button onClick={() => onChangeQuantity(product.id, quantity - 1)} aria-label="Decrease quantity"><Minus size={13} /></button><span>{quantity}</span><button onClick={() => onChangeQuantity(product.id, quantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button></div><strong>{money(product.price * quantity)}</strong></div></div>
              </div>
            ))}</div>
            <div className="cart-footer"><div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="summary-row summary-row--muted"><span>Shipping</span><span>Complimentary</span></div><button className="primary-button primary-button--wide" onClick={onCheckout}>Continue to checkout <ArrowRight size={16} /></button><p className="cart-fineprint">Taxes calculated at checkout. We accept all major cards.</p></div>
          </>
        )}
      </aside>
    </div>
  );
}

function AccountAuth({ onAuthenticated, onClose }) {
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (mode === 'signup' && !name.trim()) return setError('Enter your name.');
    if (!email.trim() || !password) return setError('Enter your email and password.');
    if (mode === 'signup' && password !== confirmPassword) return setError('Passwords do not match.');
    setPending(true);
    try {
      const result = mode === 'signup'
        ? await signUpUser({ name: name.trim(), email: email.trim(), password })
        : await loginUser({ email: email.trim(), password });
      storeUserSession(result);
      onAuthenticated(result.user);
      onClose?.();
    } catch (authError) {
      setError(authError.message || 'Unable to access your account.');
    } finally {
      setPending(false);
    }
  };

  return <div className="account-auth"><button className="back-link" onClick={onClose}><ArrowLeft size={14} /> Back</button><span className="eyebrow">Your orbit / {mode === 'signup' ? '01' : '02'}</span><h3>{mode === 'signup' ? 'Create your orbit.' : 'Welcome back.'}</h3><p>{mode === 'signup' ? 'Save frames, follow orders, and keep your edit close.' : 'Sign in to pick up where you left off.'}</p><form onSubmit={submit}>{mode === 'signup' && <label className="admin-field">Your name<input autoComplete="name" value={name} onChange={(event) => { setName(event.target.value); setError(''); }} placeholder="Alex Morgan" /></label>}<label className="admin-field">Email address<input type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} placeholder="alex@email.com" /></label><label className="admin-field">Password<input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="At least 8 characters" /></label>{mode === 'signup' && <label className="admin-field">Confirm password<input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError(''); }} placeholder="Repeat your password" /></label>}{error && <p className="form-error">{error}</p>}<button className="primary-button primary-button--wide" type="submit" disabled={pending}>{pending ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'} <LogIn size={15} /></button></form><button className="account-switch" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); }}>{mode === 'signup' ? 'Already have an account? Sign in' : 'New to Lumin? Create an account'}</button><small className="account-security-note">Passwords are protected with a salted one-way hash and are never stored in your browser.</small></div>;
}

function AccountDrawer({ onClose, onCheckout, orders, favoriteProducts, user, onAuthenticated, onSignedOut }) {
  const [view, setView] = useState('home');
  return (
    <div className="drawer-shell" role="dialog" aria-modal="true" aria-label="Account panel">
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer drawer--account">
        <div className="drawer-header"><div><span className="eyebrow">Your orbit</span><h2>{view === 'home' ? 'Account' : view === 'orders' ? 'Orders' : view === 'saved' ? 'Saved frames' : 'Sign in'}</h2></div><IconButton label="Close account" onClick={onClose}><X size={20} /></IconButton></div>
        {view === 'auth' && <AccountAuth onAuthenticated={onAuthenticated} onClose={() => setView('home')} />}
        {view === 'home' && <>{user ? <div className="account-intro"><div className="account-avatar"><CircleUserRound size={34} /></div><span className="eyebrow">Signed in</span><h3>{user.name}</h3><p>{user.email}</p><button className="secondary-button account-signout" onClick={() => { onSignedOut(); setView('home'); }}>Sign out <LogOut size={15} /></button></div> : <div className="account-intro"><div className="account-avatar"><CircleUserRound size={34} /></div><h3>Make the edit yours.</h3><p>Sign in to save your frames, track orders, and pick up where you left off.</p><button className="primary-button primary-button--wide" onClick={() => setView('auth')}>Sign in / sign up <ArrowRight size={16} /></button></div>}<div className="account-links"><button onClick={() => setView('orders')}><span>Order history <small>{orders.length ? `${orders.length} order${orders.length === 1 ? '' : 's'}` : 'No orders yet'}</small></span><ArrowRight size={16} /></button><button onClick={() => setView('saved')}><span>Saved frames <small>{favoriteProducts.length ? `${favoriteProducts.length} in your orbit` : 'Nothing saved yet'}</small></span><ArrowRight size={16} /></button><button onClick={onCheckout}><span>Guest checkout <small>Use your bag without an account</small></span><ArrowRight size={16} /></button></div></>}
        {view === 'orders' && <div className="account-view"><button className="back-link" onClick={() => setView('home')}><ArrowLeft size={14} /> Account</button>{orders.length ? orders.map((order) => <div className="account-record" key={order.orderId}><div><strong>{order.orderId}</strong><span>{order.status} · {order.items?.length || 0} item(s)</span></div><Check size={16} /></div>) : <div className="account-empty"><span className="eyebrow">No orders yet</span><p>Your confirmed orders will appear here after checkout.</p><button className="underlined-button" onClick={onCheckout}>Start an order <ArrowRight size={15} /></button></div>}</div>}
        {view === 'saved' && <div className="account-view"><button className="back-link" onClick={() => setView('home')}><ArrowLeft size={14} /> Account</button>{favoriteProducts.length ? favoriteProducts.map((product) => <div className="account-record" key={product.id}><div><strong>{product.name}</strong><span>{product.color}</span></div><span>{money(product.price)}</span></div>) : <div className="account-empty"><span className="eyebrow">Your orbit is clear</span><p>Tap the heart on any frame to keep it close.</p><button className="underlined-button" onClick={onClose}>Explore frames <ArrowRight size={15} /></button></div>}</div>}
      </aside>
    </div>
  );
}

function CheckoutDrawer({ cart, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [customer, setCustomer] = useState({ name: '', email: '', address: '', city: '', postcode: '', card: '', paymentMethod: 'card' });
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const update = (key) => (event) => { setCustomer((current) => ({ ...current, [key]: event.target.value })); setFieldErrors((current) => ({ ...current, [key]: '' })); setError(''); };
  const next = () => {
    const errors = {};
    if (step === 1) {
      if (!customer.name.trim()) errors.name = 'Enter your full name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) errors.email = 'Enter a valid email address.';
    }
    if (step === 2) {
      if (!customer.address.trim()) errors.address = 'Enter a delivery address.';
      if (!customer.city.trim()) errors.city = 'Enter your city.';
      if (!/^\d{5}(-\d{4})?$/.test(customer.postcode.trim())) errors.postcode = 'Use a 5-digit postcode.';
    }
    if (step === 3 && customer.paymentMethod === 'card' && customer.card.replace(/\D/g, '').length < 12) errors.card = 'Enter at least 12 card digits.';
    setFieldErrors(errors);
    if (Object.keys(errors).length || (step === 3 && !cart.length)) {
      setError(!cart.length ? 'Add a frame to your bag before placing an order.' : 'Check the highlighted fields before continuing.');
      return;
    }
    setError('');
    if (step < 3) setStep(step + 1); else { setSubmitted(true); onComplete(customer); }
  };
  return (
    <div className="drawer-shell" role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer drawer--checkout">
        {submitted ? <div className="checkout-success"><div className="success-mark"><Check size={28} /></div><span className="eyebrow">Order confirmed</span><h2>Your view is on its way.</h2><p>We’ve saved your order and sent the details to {customer.email || 'your inbox'}.</p><div className="order-number">LO-{Date.now().toString().slice(-6)}</div><button className="primary-button primary-button--wide" onClick={onClose}>Back to the edit <ArrowRight size={16} /></button></div> : <>
          <div className="drawer-header"><div><button className="back-link" onClick={step === 1 ? onClose : () => setStep(step - 1)}><ArrowLeft size={14} /> {step === 1 ? 'Bag' : 'Back'}</button><h2>Checkout</h2></div><IconButton label="Close checkout" onClick={onClose}><X size={20} /></IconButton></div>
          <div className="checkout-progress"><span className={step >= 1 ? 'is-active' : ''}>01 <b>Details</b></span><i /><span className={step >= 2 ? 'is-active' : ''}>02 <b>Delivery</b></span><i /><span className={step >= 3 ? 'is-active' : ''}>03 <b>Review</b></span></div>
          {step === 1 && <div className="checkout-form"><span className="eyebrow">01 / Your details</span><h3>Let’s make it yours.</h3><label>Full name<input value={customer.name} onChange={update('name')} placeholder="Alex Morgan" />{fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}</label><label>Email address<input type="email" value={customer.email} onChange={update('email')} placeholder="alex@email.com" />{fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}</label>{error && <p className="form-error">{error}</p>}<button className="primary-button primary-button--wide" onClick={next}>Continue to delivery <ArrowRight size={16} /></button></div>}
          {step === 2 && <div className="checkout-form"><span className="eyebrow">02 / Delivery</span><h3>Where should we send it?</h3><label>Address<input value={customer.address} onChange={update('address')} placeholder="24 Sunbeam Street" />{fieldErrors.address && <small className="field-error">{fieldErrors.address}</small>}</label><div className="form-split"><label>City<input value={customer.city} onChange={update('city')} placeholder="New York" />{fieldErrors.city && <small className="field-error">{fieldErrors.city}</small>}</label><label>Postcode<input value={customer.postcode} onChange={update('postcode')} placeholder="10013" />{fieldErrors.postcode && <small className="field-error">{fieldErrors.postcode}</small>}</label></div><div className="delivery-option is-selected"><div><strong>Standard delivery</strong><span>2–4 business days</span></div><strong>Free</strong><Check size={16} /></div>{error && <p className="form-error">{error}</p>}<button className="primary-button primary-button--wide" onClick={next}>Continue to review <ArrowRight size={16} /></button></div>}
          {step === 3 && <div className="checkout-form"><span className="eyebrow">03 / Review</span><h3>One last look.</h3><div className="review-items">{cart.map(({ product, quantity }) => <div key={product.id}><span>{product.name} × {quantity}</span><strong>{money(product.price * quantity)}</strong></div>)}</div><fieldset className="payment-methods"><legend>Payment method</legend><label className={customer.paymentMethod === 'card' ? 'is-selected' : ''}><input type="radio" name="payment" value="card" checked={customer.paymentMethod === 'card'} onChange={update('paymentMethod')} /><CreditCard size={16} /><span><strong>Card</strong><small>Secure demo payment</small></span></label><label className={customer.paymentMethod === 'upi' ? 'is-selected' : ''}><input type="radio" name="payment" value="upi" checked={customer.paymentMethod === 'upi'} onChange={update('paymentMethod')} /><Smartphone size={16} /><span><strong>UPI</strong><small>Pay with your UPI app</small></span></label><label className={customer.paymentMethod === 'cash_on_delivery' ? 'is-selected' : ''}><input type="radio" name="payment" value="cash_on_delivery" checked={customer.paymentMethod === 'cash_on_delivery'} onChange={update('paymentMethod')} /><ShoppingBag size={16} /><span><strong>Cash on delivery</strong><small>Pay when your frame arrives</small></span></label></fieldset>{customer.paymentMethod === 'card' && <label>Card details<input value={customer.card} onChange={update('card')} placeholder="••••  ••••  ••••  4242" />{fieldErrors.card && <small className="field-error">{fieldErrors.card}</small>}</label>}{customer.paymentMethod === 'upi' && <div className="payment-note"><Smartphone size={16} /> You’ll receive the UPI payment instructions after placing the demo order.</div>}<div className="summary-row summary-row--checkout"><span>Total</span><strong>{money(subtotal)}</strong></div>{error && <p className="form-error">{error}</p>}<button className="primary-button primary-button--wide" onClick={next}>Place order <Check size={16} /></button><p className="modal-note">This preview records your selected method — no payment is processed.</p></div>}
        </>}
      </aside>
    </div>
  );
}

const adminCategories = ['Women', 'Men', 'Optical', 'Sun'];

const makeBlankDraft = () => ({
  name: '',
  collection: 'Optical',
  category: 'Optical',
  shape: 'Square',
  price: '189',
  discount: '0',
  color: 'Ink / Cobalt',
  badge: 'New frame',
  image: products[0]?.image || '',
  imageAlt: 'Eyewear frame in a Lumin Optics studio setting',
  description: '',
  details: 'Hand-finished acetate, Prescription ready, Microfibre case included',
});

const discountFor = (product) => product.oldPrice && product.oldPrice > product.price
  ? Math.round((1 - product.price / product.oldPrice) * 100)
  : 0;

const draftFor = (product) => ({
  name: product.name || '',
  collection: product.collection || product.category || 'Optical',
  category: product.category || 'Optical',
  shape: product.shape || 'Square',
  price: String(product.price ?? ''),
  discount: String(discountFor(product)),
  color: product.color || '',
  badge: product.badge || 'New frame',
  image: product.image || '',
  imageAlt: product.imageAlt || '',
  description: product.description || '',
  details: product.details?.join(', ') || '',
});

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'lumin-frame';

function AdminSignIn({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Enter your admin email and password.');
    setPending(true);
    try {
      const result = await loginAdmin({ email: email.trim(), password });
      storeAdminToken(result.token);
      onSignedIn(result.admin);
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in. Check your credentials.');
    } finally {
      setPending(false);
    }
  };

  return <div className="admin-auth-page"><div className="admin-auth-card"><a className="admin-back-link" href="/"><ArrowLeft size={15} /> Back to storefront</a><div className="admin-auth-mark"><LayoutDashboard size={22} /></div><span className="eyebrow">Lumin Optics / private access</span><h1>Welcome <em>back.</em></h1><p>Sign in to shape the catalog, offers, and frame details.</p><form onSubmit={submit}><label className="admin-field">Admin email<input type="email" autoComplete="username" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} placeholder="you@luminoptics.com" /></label><label className="admin-field">Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="Your password" /></label>{error && <p className="admin-form-error">{error}</p>}<button className="primary-button primary-button--wide" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in to admin'} <LogIn size={15} /></button></form><small className="admin-auth-note">JWT session · expires after 30 minutes · credentials never stored in the browser</small></div></div>;
}

function AdminPage() {
  const [catalog, setCatalog] = useState(products);
  const [token, setToken] = useState(readAdminToken);
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(readAdminToken()));
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(makeBlankDraft);
  const [search, setSearch] = useState('');
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return undefined;
    getAdminSession(token).then((result) => setAdmin(result.admin)).catch(() => { clearAdminToken(); setToken(''); }).finally(() => setAuthLoading(false));
    return undefined;
  }, [token]);

  useEffect(() => {
    getProducts().then((items) => {
      if (items?.length) {
        setCatalog(items);
      }
    });
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredCatalog = useMemo(() => catalog.filter((product) => [product.name, product.category, product.shape, product.color].join(' ').toLowerCase().includes(search.toLowerCase())), [catalog, search]);
  const saleCount = catalog.filter((product) => discountFor(product) > 0).length;
  const averagePrice = catalog.length ? catalog.reduce((sum, product) => sum + Number(product.price || 0), 0) / catalog.length : 0;

  const startNew = () => {
    setEditingId(null);
    setDraft(makeBlankDraft());
    setError('');
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setDraft(draftFor(product));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateDraft = (key) => (event) => {
    setDraft((current) => ({ ...current, [key]: event.target.value }));
    setError('');
  };

  const submitFrame = (event) => {
    event.preventDefault();
    const price = Number(draft.price);
    const discount = Number(draft.discount || 0);
    if (!draft.name.trim()) return setError('Give this frame a name before saving.');
    if (!Number.isFinite(price) || price <= 0) return setError('Enter a price greater than zero.');
    if (!Number.isFinite(discount) || discount < 0 || discount > 90) return setError('Discount must be between 0% and 90%.');
    if (!draft.image.trim()) return setError('Add an image URL so the frame can appear in the storefront.');

    const id = editingId || `${slugify(draft.name)}-${Date.now().toString(36).slice(-4)}`;
    const frame = {
      id,
      name: draft.name.trim(),
      collection: draft.collection,
      category: draft.category,
      shape: draft.shape,
      price: Number(price.toFixed(2)),
      oldPrice: discount ? Number((price / (1 - discount / 100)).toFixed(2)) : null,
      badge: draft.badge.trim() || 'New frame',
      color: draft.color.trim() || 'Ink / Cobalt',
      description: draft.description.trim() || 'A considered frame made for your point of view.',
      image: draft.image.trim(),
      imageAlt: draft.imageAlt.trim() || `${draft.name} eyewear frame`,
      details: draft.details.split(',').map((detail) => detail.trim()).filter(Boolean),
    };

    setCatalog((current) => editingId ? current.map((product) => product.id === editingId ? frame : product) : [...current, frame]);
    setEditingId(frame.id);
    setDraft(draftFor(frame));
    setDirty(true);
    setNotice(editingId ? `${frame.name} updated — save the catalog to publish it.` : `${frame.name} added — save the catalog to publish it.`);
    return undefined;
  };

  const deleteFrame = (product) => {
    if (!window.confirm(`Remove ${product.name} from the catalog?`)) return;
    setCatalog((current) => current.filter((item) => item.id !== product.id));
    if (editingId === product.id) startNew();
    setDirty(true);
    setNotice(`${product.name} removed — save the catalog to keep the change.`);
  };

  const persistCatalog = async () => {
    try {
      await saveProducts(catalog, token);
      setDirty(false);
      setNotice('Catalog saved securely.');
    } catch (saveError) {
      setError(saveError.message || 'The catalog could not be saved.');
    }
  };

  if (authLoading) return <div className="admin-loading"><span className="eyebrow">Private workspace</span><h1>Checking your <em>session.</em></h1></div>;
  if (!admin) return <AdminSignIn onSignedIn={(nextAdmin) => { setAdmin(nextAdmin); setToken(readAdminToken()); }} />;

  const resetCatalog = () => {
    if (!window.confirm('Reset the preview catalog to the original Lumin frames?')) return;
    resetStoredProducts();
    setCatalog(products);
    setEditingId(null);
    setDraft(makeBlankDraft());
    setDirty(false);
    setNotice('Preview catalog restored to the original frames.');
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-bar"><a className="admin-back-link" href="/"><ArrowLeft size={15} /> Back to storefront</a><div className="admin-header-actions"><span className="admin-badge"><LayoutDashboard size={14} /> {admin.email}</span><button className="admin-signout" onClick={() => { clearAdminToken(); setToken(''); setAdmin(null); }}><LogOut size={14} /> Sign out</button></div></div>
        <div className="admin-header-copy"><div><span className="eyebrow eyebrow--dark">Catalog control / internal</span><h1>Make the edit <em>yours.</em></h1><p>Keep pricing, offers, and frame details in step with the Lumin point of view.</p></div><div className="admin-header-orbit"><span>LO</span><small>01 / catalog</small></div></div>
      </header>

      <main className="admin-main">
        <section className="admin-stats" aria-label="Catalog overview"><div><span className="eyebrow">Active frames</span><strong>{catalog.length.toString().padStart(2, '0')}</strong><small>in the current edit</small></div><div><span className="eyebrow">On sale</span><strong>{saleCount.toString().padStart(2, '0')}</strong><small>with a visible discount</small></div><div><span className="eyebrow">Average price</span><strong>{money(averagePrice)}</strong><small>across the catalog</small></div></section>

        <section className="admin-toolbar"><div><span className="eyebrow">Frame inventory / {catalog.length} items</span><h2>Shape the <em>selection.</em></h2></div><div className="admin-toolbar-actions"><button className="secondary-button" onClick={resetCatalog}><RotateCcw size={15} /> Reset preview</button><button className="primary-button" onClick={persistCatalog} disabled={!dirty}><Save size={15} /> {dirty ? 'Save catalog' : 'Catalog saved'}</button></div></section>

        <div className="admin-layout">
          <section className="admin-catalog-panel"><div className="admin-panel-heading"><div><span className="eyebrow">Current frames</span><h3>Catalog list</h3></div><label className="admin-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search frames" aria-label="Search frames" /></label></div><div className="admin-product-list">{filteredCatalog.map((product) => <article className={`admin-product-row ${editingId === product.id ? 'is-editing' : ''}`} key={product.id}><div className="admin-product-thumb"><img src={product.image} alt={product.imageAlt} /></div><div className="admin-product-copy"><div><span className="eyebrow">{product.category} / {product.shape}</span><h3>{product.name}</h3><p>{product.color}</p></div><div className="admin-product-price"><strong>{money(product.price)}</strong>{product.oldPrice && <s>{money(product.oldPrice)}</s>}{discountFor(product) > 0 && <span>-{discountFor(product)}%</span>}</div></div><div className="admin-row-actions"><button className="icon-button" onClick={() => startEdit(product)} aria-label={`Edit ${product.name}`} title="Edit frame"><Edit3 size={16} /></button><button className="icon-button admin-delete" onClick={() => deleteFrame(product)} aria-label={`Delete ${product.name}`} title="Delete frame"><Trash2 size={16} /></button></div></article>)}{!filteredCatalog.length && <div className="admin-empty"><span className="eyebrow">No frames found</span><p>Try another search or add a new frame to the edit.</p></div>}</div></section>

          <section className="admin-editor"><div className="admin-panel-heading"><div><span className="eyebrow">{editingId ? 'Editing a frame' : 'Add to the edit'}</span><h3>{editingId ? 'Refine the details.' : 'Add a new frame.'}</h3></div>{editingId && <button className="text-button" onClick={startNew}>Clear editor <X size={14} /></button>}</div><form onSubmit={submitFrame}><div className="admin-form-grid"><label className="admin-field admin-field--wide">Frame name<input value={draft.name} onChange={updateDraft('name')} placeholder="e.g. Solace 07" /></label><label className="admin-field">Collection<select value={draft.collection} onChange={updateDraft('collection')}>{adminCategories.map((option) => <option key={option}>{option}</option>)}</select></label><label className="admin-field">Category<select value={draft.category} onChange={updateDraft('category')}>{adminCategories.map((option) => <option key={option}>{option}</option>)}</select></label><label className="admin-field">Shape<select value={draft.shape} onChange={updateDraft('shape')}>{shapeOptions.map((option) => <option key={option.label}>{option.label}</option>)}</select></label><label className="admin-field">Badge<input value={draft.badge} onChange={updateDraft('badge')} placeholder="New frame" /></label><label className="admin-field">Cost / retail price<input type="number" min="0" step="0.01" value={draft.price} onChange={updateDraft('price')} placeholder="189" /></label><label className="admin-field">Discount %<input type="number" min="0" max="90" step="1" value={draft.discount} onChange={updateDraft('discount')} placeholder="0" /></label><label className="admin-field admin-field--wide">Color story<input value={draft.color} onChange={updateDraft('color')} placeholder="Ink / Cobalt" /></label><label className="admin-field admin-field--wide">Image URL<input type="url" value={draft.image} onChange={updateDraft('image')} placeholder="https://..." /></label><label className="admin-field admin-field--wide">Image alt text<input value={draft.imageAlt} onChange={updateDraft('imageAlt')} placeholder="Black square eyeglasses on a pale yellow surface" /></label><label className="admin-field admin-field--wide">Description<textarea rows="3" value={draft.description} onChange={updateDraft('description')} placeholder="A concise description for the product detail view." /></label><label className="admin-field admin-field--wide">Frame details <span className="admin-field-hint">Separate each detail with a comma</span><textarea rows="3" value={draft.details} onChange={updateDraft('details')} placeholder="Prescription ready, UV400 protection, Fitted in our atelier" /></label></div>{error && <p className="admin-form-error">{error}</p>}<div className="admin-form-footer"><span>{editingId ? 'Updates stay in this draft until you save the catalog.' : 'Add the frame, then save the catalog when the edit is ready.'}</span><button className="primary-button" type="submit">{editingId ? 'Update frame' : 'Add frame'} <ArrowRight size={15} /></button></div></form></section>
        </div>
      </main>

      <footer className="admin-footer"><span>Lumin Optics / admin workspace</span><a href="/">Return to storefront <ArrowRight size={14} /></a></footer>
      {notice && <div className="toast"><Check size={16} /> {notice}</div>}
    </div>
  );
}

function PageHeader({ eyebrow, title, description }) {
  return <header className="simple-page-header"><a className="simple-page-back" href="/"><ArrowLeft size={15} /> Lumin Optics</a><span className="eyebrow eyebrow--dark">{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>;
}

function CollectionPage() {
  const [catalog, setCatalog] = useState(products);
  const [activeCategory, setActiveCategory] = useState('All frames');
  useEffect(() => { getProducts().then((items) => { if (items?.length) setCatalog(items); }); }, []);
  const collection = catalog.filter((product) => activeCategory === 'All frames' || product.category === activeCategory);
  return <div className="simple-page"><PageHeader eyebrow="The Lumin collection / 06 frames" title={<>Find your <em>signature.</em></>} description="A considered collection of optical and sun frames, designed to stay in your orbit." /><main className="collection-main"><div className="collection-controls"><div className="category-tabs">{categories.map((category) => <button className={activeCategory === category ? 'is-active' : ''} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><a className="underlined-button" href="/contact">Need help choosing? <ArrowRight size={15} /></a></div><div className="collection-grid">{collection.map((product) => <article className="collection-card" key={product.id}><div className="collection-card-image"><img src={product.image} alt={product.imageAlt} /><span className="product-badge">{product.badge}</span></div><div className="collection-card-copy"><div><span className="eyebrow">{product.collection} / {product.shape}</span><h2>{product.name}</h2><p>{product.description}</p></div><div className="collection-card-bottom"><strong>{money(product.price)}</strong><a className="whatsapp-link" href={buildWhatsAppUrl({ product })} target="_blank" rel="noreferrer"><MessageCircle size={14} /> Ask on WhatsApp</a></div></div></article>)}</div></main><footer className="simple-page-footer"><a href="/">Back to the storefront <ArrowRight size={14} /></a><span>Built for your point of view.</span></footer></div>;
}

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = (event) => { event.preventDefault(); window.open(buildWhatsAppUrl(form), '_blank', 'noopener,noreferrer'); };
  return <div className="simple-page"><PageHeader eyebrow="Lumin service / contact" title={<>Let’s find the <em>right frame.</em></>} description="Tell us what you’re looking for and our optical team will help you choose a shape, fit, or finish." /><main className="contact-main"><section className="contact-intro"><div className="contact-orbit"><MessageCircle size={30} /><span>We reply<br />on WhatsApp</span></div><span className="eyebrow">A direct line to the edit</span><h2>Questions look<br /><em>good</em> on you.</h2><p>Use the form and we’ll open a WhatsApp conversation with your message ready to send. You can ask about fit, prescription readiness, colour, delivery, or a particular frame.</p><div className="contact-notes"><span><strong>01</strong> Fit guidance</span><span><strong>02</strong> Frame details</span><span><strong>03</strong> Delivery help</span></div></section><form className="contact-form" onSubmit={submit}><label className="admin-field">Your name<input required value={form.name} onChange={update('name')} maxLength="100" placeholder="Alex Morgan" /></label><label className="admin-field">Email address<input required type="email" value={form.email} onChange={update('email')} maxLength="160" placeholder="alex@email.com" /></label><label className="admin-field">How can we help?<textarea required rows="6" value={form.message} onChange={update('message')} maxLength="800" placeholder="I’m looking for a lightweight everyday frame…" /></label><button className="primary-button primary-button--wide" type="submit">Open WhatsApp chat <MessageCircle size={16} /></button><small className="contact-fineprint">Your message opens in WhatsApp for your review before sending.</small></form></main><footer className="simple-page-footer"><a href="/collection">Explore the collection <ArrowRight size={14} /></a><a href="/">Back to storefront <ArrowRight size={14} /></a></footer></div>;
}

function AccountPage() {
  const [user, setUser] = useState(readUser);
  const [checking, setChecking] = useState(Boolean(readUserToken()));

  useEffect(() => {
    const token = readUserToken();
    if (!token) {
      setChecking(false);
      return undefined;
    }
    getUserSession(token).then((result) => setUser(result.user)).catch(() => { clearUserSession(); setUser(null); }).finally(() => setChecking(false));
    return undefined;
  }, []);

  return <div className="account-page"><PageHeader eyebrow="Your orbit / account" title={user ? <>Good to see you, <em>{user.name.split(' ')[0]}.</em></> : <>Make the edit <em>yours.</em></>} description={user ? `Signed in as ${user.email}. Your saved frames and orders stay close.` : 'Create an account or sign in to keep your Lumin frames, orders, and preferences together.'} /><main className="account-page-main">{checking ? <div className="account-page-card"><span className="eyebrow">Your orbit</span><h2>Checking your <em>session.</em></h2></div> : user ? <div className="account-page-card account-page-card--signed"><div className="account-avatar"><CircleUserRound size={34} /></div><span className="eyebrow">Member account</span><h2>{user.name}</h2><p>{user.email}</p><button className="secondary-button" onClick={() => { clearUserSession(); setUser(null); }}>Sign out <LogOut size={15} /></button></div> : <div className="account-page-card"><AccountAuth onAuthenticated={setUser} onClose={() => { window.location.href = '/'; }} /></div>}</main><footer className="simple-page-footer"><a href="/">Back to the storefront <ArrowRight size={14} /></a><a href="/collection">Explore the collection <ArrowRight size={14} /></a></footer></div>;
}

function StorefrontApp() {
  const [catalog, setCatalog] = useState(products);
  const [activeCategory, setActiveCategory] = useState('All frames');
  const [activeShape, setActiveShape] = useState('All shapes');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [toast, setToast] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(readUser);

  useEffect(() => {
    getProducts().then((items) => { if (items?.length) setCatalog(items); });
  }, []);

  useEffect(() => {
    const token = readUserToken();
    if (!token) return undefined;
    getUserSession(token).then((result) => setUser(result.user)).catch(() => { clearUserSession(); setUser(null); });
    return undefined;
  }, []);

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') { setSelectedProduct(null); setDrawer(null); setSearchOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredProducts = useMemo(() => catalog.filter((product) => {
    const categoryMatch = activeCategory === 'All frames' || product.category === activeCategory;
    const shapeMatch = activeShape === 'All shapes' || product.shape === activeShape;
    const searchMatch = !query || [product.name, product.category, product.shape, product.color].join(' ').toLowerCase().includes(query.toLowerCase());
    return categoryMatch && shapeMatch && searchMatch;
  }), [catalog, activeCategory, activeShape, query]);

  const addToCart = (product) => {
    setCart((current) => {
      const match = current.find((item) => item.product.id === product.id);
      return match ? current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { product, quantity: 1 }];
    });
    setSelectedProduct(null);
    setToast(`${product.name} added to your bag`);
  };

  const toggleFavorite = async (product) => {
    const wasSaved = favorites.includes(product.id);
    setFavorites((current) => wasSaved ? current.filter((id) => id !== product.id) : [...current, product.id]);
    await saveFavorite(product.id, !wasSaved);
    setToast(wasSaved ? `${product.name} removed from saved frames` : `${product.name} saved to your orbit`);
  };

  const changeQuantity = (id, quantity) => setCart((current) => quantity <= 0 ? current.filter((item) => item.product.id !== id) : current.map((item) => item.product.id === id ? { ...item, quantity } : item));
  const removeFromCart = (id) => setCart((current) => current.filter((item) => item.product.id !== id));
  const jumpToShop = (category = 'All frames') => { setActiveCategory(category); window.setTimeout(() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }), 30); };
  const heroProduct = catalog[featuredIndex % catalog.length] || products[0];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favoriteProducts = catalog.filter((product) => favorites.includes(product.id));

  return (
    <div className="site-shell" id="top">
      <div className="yellow-frame yellow-frame--left" /><div className="yellow-frame yellow-frame--right" />
      <header className="site-header">
        <div className="announcement"><span>Complimentary delivery on every frame</span><span className="announcement-center">The Lumin edit / 2024</span><span className="announcement-social">Follow along <Sparkles size={12} /></span></div>
        <div className="nav-wrap"><button className="mobile-menu" aria-label="Open navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}><Menu size={20} /></button><Logo /><nav className={`main-nav ${mobileNavOpen ? 'is-open' : ''}`}><a href="#shop" onClick={() => setMobileNavOpen(false)}>Shop</a><a href="/collection" onClick={() => setMobileNavOpen(false)}>Collection</a><a href="/contact" onClick={() => setMobileNavOpen(false)}>Contact</a></nav><div className="nav-actions"><IconButton label="Search" active={searchOpen} onClick={() => setSearchOpen((open) => !open)}><Search size={19} /></IconButton><IconButton label="Account" onClick={() => setDrawer('account')}><CircleUserRound size={19} /></IconButton><IconButton label="Saved frames" active={favorites.length > 0} onClick={() => { setToast(favorites.length ? `${favorites.length} saved frame${favorites.length === 1 ? '' : 's'} in your orbit` : 'Save a frame to find it here'); }}><Heart size={19} fill={favorites.length ? 'currentColor' : 'none'} /></IconButton><button className="bag-button" onClick={() => setDrawer('cart')}><ShoppingBag size={18} /><span>{totalItems}</span></button></div></div>
        {searchOpen && <div className="search-bar"><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by shape, collection, or name" /><button onClick={() => { setQuery(''); setSearchOpen(false); }}><X size={17} /></button></div>}
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy"><span className="eyebrow eyebrow--dark">The new Lumin edit / 01</span><h1>See the<br /><em>shape</em> before<br />you choose.</h1><p>Curated frames for people who notice the details. Designed in small runs, finished by hand, and made to stay in your orbit.</p><div className="hero-actions"><button className="primary-button" onClick={() => jumpToShop()}>Shop the edit <ArrowDownRight size={16} /></button><button className="underlined-button" onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}>Why Lumin <ArrowRight size={15} /></button></div></div>
          <div className="hero-visual"><div className="hero-image-card"><img src={heroProduct.image} alt={heroProduct.imageAlt} /><div className="hero-image-overlay"><span className="eyebrow">01 / 06</span><strong>{heroProduct.name}</strong><span>{heroProduct.color}</span></div></div><div className="hero-caption"><span>Move through the edit</span><div className="hero-controls"><button onClick={() => setFeaturedIndex((featuredIndex + products.length - 1) % products.length)} aria-label="Previous frame"><ChevronLeft size={17} /></button><button onClick={() => setFeaturedIndex((featuredIndex + 1) % products.length)} aria-label="Next frame"><ChevronRight size={17} /></button></div></div><div className="orbit-stamp"><Sparkles size={17} /><span>made for<br />your point<br />of view</span></div></div>
        </section>

        <section className="ticker"><div className="ticker-track"><span>optical clarity</span><i /> <span>quiet confidence</span><i /> <span>small-batch frames</span><i /> <span>optical clarity</span><i /> <span>quiet confidence</span></div></section>

        <section className="shop-section content-section" id="shop">
          <div className="section-heading"><div><span className="eyebrow">The collection / 06 frames</span><h2>Make an <em>impression.</em></h2></div><p>Frames that change the room by changing the way you see it.</p></div>
          <div className="catalog-controls"><div className="category-tabs">{categories.map((category) => <button className={activeCategory === category ? 'is-active' : ''} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><div className="filter-select"><span>Shape</span><select value={activeShape} onChange={(event) => setActiveShape(event.target.value)}><option>All shapes</option>{shapeOptions.map((option) => <option key={option.label}>{option.label}</option>)}</select><ChevronDown size={15} /></div></div>
          {query && <div className="active-search">Showing results for <strong>“{query}”</strong><button onClick={() => setQuery('')}>Clear <X size={13} /></button></div>}
          <div className="product-grid">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={toggleFavorite} onSelect={setSelectedProduct} onAdd={addToCart} />)}</div>
          {filteredProducts.length === 0 && <div className="no-results"><span className="eyebrow">Nothing in this orbit</span><h3>Try another shape or collection.</h3><button className="underlined-button" onClick={() => { setActiveCategory('All frames'); setActiveShape('All shapes'); setQuery(''); }}>Reset filters <ArrowRight size={15} /></button></div>}
        </section>

        <section className="shape-section content-section"><div className="shape-copy"><span className="eyebrow">A considered choice</span><h2>Find your<br /><em>signature</em><br />silhouette.</h2><p>There’s a frame for every point of view. Start with the shape that feels most like you.</p><button className="underlined-button" onClick={() => jumpToShop()}>Explore all shapes <ArrowRight size={15} /></button></div><div className="shape-tiles">{shapeOptions.map((option, index) => <button key={option.label} className={`shape-tile shape-tile--${index + 1}`} onClick={() => { setActiveShape(option.label); jumpToShop(); }}><span className="shape-symbol">{option.icon}</span><span className="eyebrow">0{index + 1}</span><strong>{option.label}</strong><ArrowUpRight /></button>)}</div></section>

        <section className="story-section content-section" id="story"><div className="story-image"><img src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1300&q=88" alt="Model wearing Lumin frames in a sunlit studio" /><div className="story-image-label">The frame is<br /><strong>the first<br />impression.</strong></div></div><div className="story-copy"><span className="eyebrow">Our point of view / 01</span><h2>Good design<br />should feel<br /><em>inevitable.</em></h2><p>We design optical objects with a fashion eye and an engineer’s restraint. Nothing extra. Nothing overlooked. Just balanced shapes, honest materials, and a fit you’ll forget you’re wearing.</p><div className="story-stat"><strong>90</strong><span>day fit guarantee<br />because your face has an opinion.</span></div><button className="underlined-button">Read our story <ArrowRight size={15} /></button></div></section>

        <section className="journal-section content-section" id="journal"><div className="journal-heading"><div><span className="eyebrow">From the journal</span><h2>Notes on <em>seeing.</em></h2></div><button className="underlined-button">View all notes <ArrowRight size={15} /></button></div><div className="journal-grid"><article className="journal-card journal-card--yellow"><span className="eyebrow">Field notes / 04</span><h3>How to choose<br />your next<br /><em>everyday frame.</em></h3><div className="journal-arrow"><ArrowUpRight /></div></article><article className="journal-card journal-card--photo"><img src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=900&q=88" alt="Eyeglasses resting on a book" /><div className="journal-overlay"><span className="eyebrow">Materials / 02</span><h3>The quiet<br />luxury of<br />a good fit.</h3></div></article><article className="journal-card journal-card--ink"><span className="eyebrow">Lumin service</span><h3>Try on from<br />wherever you<br /><em>are.</em></h3><p>Book a 15-minute virtual fit session with our optical team.</p><button className="underlined-button underlined-button--light">Book a fit <ArrowRight size={15} /></button></article></div></section>
      </main>

      <footer className="site-footer"><div className="footer-top"><Logo /><p>A sharper way to see<br />the everyday.</p><div className="footer-actions"><a className="underlined-button underlined-button--light" href="/collection">Collection <ArrowUpRight size={15} /></a><a className="underlined-button underlined-button--light" href="/contact">Contact <ArrowUpRight size={15} /></a><a className="underlined-button underlined-button--light" href="/admin">Admin workspace <ArrowUpRight size={15} /></a></div></div><div className="footer-bottom"><span>© 2024 Lumin Optics</span><span>Privacy / Shipping / Returns</span><span>Designed for your point of view <span className="footer-dot" /></span></div></footer>

      {selectedProduct && <ProductModal product={selectedProduct} favorite={favorites.includes(selectedProduct.id)} onClose={() => setSelectedProduct(null)} onFavorite={toggleFavorite} onAdd={addToCart} />}
      {drawer === 'cart' && <CartDrawer cart={cart} onClose={() => setDrawer(null)} onChangeQuantity={changeQuantity} onRemove={removeFromCart} onCheckout={() => setDrawer('checkout')} />}
      {drawer === 'account' && <AccountDrawer user={user} onAuthenticated={setUser} onSignedOut={() => { clearUserSession(); setUser(null); }} orders={orders} favoriteProducts={favoriteProducts} onClose={() => setDrawer(null)} onCheckout={() => cart.length ? setDrawer('checkout') : setToast('Add a frame before checkout')} />}
      {drawer === 'checkout' && <CheckoutDrawer cart={cart} onClose={() => setDrawer(null)} onComplete={async (customer) => { const order = await createOrder({ customer, items: cart, paymentMethod: customer.paymentMethod }); setOrders((current) => [order, ...current]); setCart([]); }} />}
      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </div>
  );
}

function ArrowUpRight({ size = 16 }) { return <ArrowRight size={size} className="arrow-up-right" />; }

function App() {
  const [route, setRoute] = useState(() => window.location.pathname);

  useEffect(() => {
    const onRouteChange = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onRouteChange);
    return () => window.removeEventListener('popstate', onRouteChange);
  }, []);

  if (route === '/admin') return <AdminPage />;
  if (route === '/account') return <AccountPage />;
  if (route === '/collection') return <CollectionPage />;
  if (route === '/contact') return <ContactPage />;
  return <StorefrontApp />;
}

export default App;
