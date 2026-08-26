import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, MapPin, CheckCircle, MessageCircle, Copy, ExternalLink } from 'lucide-react';
import { useUIStore, useCartStore, useSessionStore, useProductsStore } from '../../store';
import { useCartRecovery } from '../../hooks/useCartRecovery';
import { ordersApi } from '../../api/index';
import { formatPrice, NIGERIAN_STATES } from '../../data/products';
import toast from 'react-hot-toast';

const STEPS = ['Your Details', 'Delivery', 'Review'];

// Vendor contact for the post-order handoff message. No payment integration
// exists yet (see the note in the success screen) — this is purely a manual
// "customer notifies vendor" flow for now, built so a real payment step can
// slot in later without touching this.
const VENDOR_WHATSAPP = (import.meta.env.VITE_VENDOR_WHATSAPP || '+2349074112695').replace(/[^\d]/g, '');
const VENDOR_INSTAGRAM = import.meta.env.VITE_VENDOR_INSTAGRAM || 'lum_ng';

// lucide-react dropped brand icons — small inline glyph instead of a dependency
function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

export default function CheckoutModal() {
  const { checkoutOpen, closeCheckout } = useUIStore();
  const { items, clearCart } = useCartStore();
  const { customer, deliveryMode, setCustomer, setDeliveryMode } = useSessionStore();
  const { products } = useProductsStore();

  const { attachEmail, markRecovered, sessionId } = useCartRecovery();
  const [step, setStep] = useState(0);
  const [orderRef, setOrderRef] = useState('');
  const [orderToken, setOrderToken] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [copied, setCopied] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', state: '', landmark: '', pickupDate: '' });

  // Restore session on open
  useEffect(() => {
    if (checkoutOpen && customer) {
      setForm(f => ({ ...f, ...customer }));
    }
    if (checkoutOpen) setStep(0);
  }, [checkoutOpen]);

  useEffect(() => {
    document.body.style.overflow = checkoutOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [checkoutOpen]);

  const subtotal = items.reduce((sum, item) => {
    const p = products.find(p => p.id === item.id);
    if (!p) return sum;
    return sum + (item.qty >= (p.bulkMin || Infinity) ? p.bulkPrice : p.price) * item.qty;
  }, 0);

  const deliveryFee = deliveryMode === 'delivery' ? (form.state === 'Lagos' ? 1500 : 3000) : 0;

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
        return 'Please fill in all required fields.';
      }
    }
    if (step === 1 && deliveryMode === 'delivery') {
      if (!form.address.trim()) return 'Please enter your delivery address.';
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { alert(err); return; }
    setCustomer(form);
    // Attach email to abandoned cart record as soon as customer fills step 0
    if (step === 0 && form.email && form.name) {
      attachEmail(form.email, form.name);
    }
    setStep(s => s + 1);
  };

  const placeOrder = async () => {
    // Build order payload
    const orderPayload = {
      customer: {
        name:      form.name,
        email:     form.email,
        phone:     form.phone,
        address:   form.address,
        state:     form.state,
        landmark:  form.landmark,
        pickupDate: form.pickupDate,
      },
      items:       items.map(i => ({ id: i.id, qty: i.qty })),
      delivery:    deliveryMode,
      subtotal,
      deliveryFee,
      sessionId,   // lets backend mark abandoned cart as recovered
    };

    setPlacing(true);
    setOrderError('');
    try {
      const { data } = await ordersApi.create(orderPayload);
      // Snapshot for the success screen's WhatsApp/IG message — items/form
      // will be gone (cart cleared) or stale by the time that renders.
      setOrderSnapshot({
        items: items.map(item => {
          const p = products.find(x => x.id === item.id);
          const price = p ? (item.qty >= (p.bulkMin || Infinity) ? p.bulkPrice : p.price) : 0;
          return { name: p?.name || 'Item', qty: item.qty, unit: p?.unit || '', price };
        }),
        customer: { ...form },
        delivery: deliveryMode,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
      });
      markRecovered(); // tell backend the cart was converted
      clearCart();
      setOrderRef(data.ref);
      setOrderToken(data.publicToken || '');
      setStep(3);
    } catch (err) {
      // Don't fake a success screen if the order wasn't actually saved —
      // that would leave the customer thinking they ordered when nothing
      // exists anywhere the admin can see it.
      setOrderError(
        err.response?.data?.message ||
        'We couldn\'t place your order right now. Please check your connection and try again, or reach us directly on WhatsApp.'
      );
    } finally {
      setPlacing(false);
    }
  };

  const inputCls = 'bg-[var(--input-bg)] border border-[var(--border)] rounded px-4 py-3 text-[var(--text)] text-[14px] w-full focus:outline-none focus:border-[rgba(201,168,76,0.4)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.1)] placeholder:text-[var(--text-ghost)] transition-all';

  /** Structured, human-readable order summary sent to the vendor via
   * WhatsApp/Instagram. No payment info — that's intentionally absent until
   * a real payment integration exists; this is a manual handoff in the
   * meantime, not a replacement for one. */
  const buildOrderMessage = () => {
    if (!orderSnapshot) return '';
    const lines = [
      `New order from LUM NG — ${orderRef}`,
      '',
      ...orderSnapshot.items.map(i => `• ${i.name} × ${i.qty} (${i.unit}) — ${formatPrice(i.price * i.qty)}`),
      '',
      `Subtotal: ${formatPrice(orderSnapshot.subtotal)}`,
      `${orderSnapshot.delivery === 'pickup' ? 'Pickup' : 'Delivery'}: ${orderSnapshot.deliveryFee === 0 ? 'Free' : formatPrice(orderSnapshot.deliveryFee)}`,
      `Total: ${formatPrice(orderSnapshot.total)}`,
      '',
      `Customer: ${orderSnapshot.customer.name}`,
      `Phone: ${orderSnapshot.customer.phone}`,
      `Email: ${orderSnapshot.customer.email}`,
    ];
    if (orderSnapshot.delivery === 'delivery' && orderSnapshot.customer.address) {
      lines.push(`Address: ${orderSnapshot.customer.address}${orderSnapshot.customer.state ? `, ${orderSnapshot.customer.state}` : ''}`);
      if (orderSnapshot.customer.landmark) lines.push(`Landmark: ${orderSnapshot.customer.landmark}`);
    }
    if (orderSnapshot.delivery === 'pickup' && orderSnapshot.customer.pickupDate) {
      lines.push(`Preferred pickup date: ${orderSnapshot.customer.pickupDate}`);
    }
    lines.push('', `View order: ${window.location.origin}/order/${orderToken}`);
    lines.push('', '(No payment made yet — to be confirmed manually.)');
    return lines.join('\n');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(buildOrderMessage());
    window.open(`https://wa.me/${VENDOR_WHATSAPP}?text=${text}`, '_blank', 'noopener');
  };

  const handleInstagramShare = async () => {
    try {
      await navigator.clipboard.writeText(buildOrderMessage());
      toast.success('Order details copied — paste them into the chat', {
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(201,168,76,0.3)' },
      });
    } catch {
      // Clipboard can fail (permissions/older browsers) — the IG thread
      // still opens either way, just without the auto-copy convenience.
    }
    window.open(`https://ig.me/m/${VENDOR_INSTAGRAM}`, '_blank', 'noopener');
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(buildOrderMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — select and copy the text manually');
    }
  };

  return (
    <AnimatePresence>
      {checkoutOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[400] flex items-center justify-center p-5"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl w-full max-w-[600px] max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-10 pt-10 pb-8">
              <div
                className="font-[Playfair_Display] text-2xl font-black tracking-widest"
                style={{ background: 'linear-gradient(135deg,#fff,#e8c97a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                LUMNG
              </div>
              <button onClick={closeCheckout} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Progress */}
            {step < 3 && (
              <div className="flex items-center px-10 mb-8">
                {STEPS.map((label, i) => (
                  <React.Fragment key={label}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold border transition-all ${
                        i === step ? 'bg-[#c9a84c] border-[#c9a84c] text-black'
                        : i < step ? 'bg-[rgba(76,175,110,0.2)] border-[rgba(76,175,110,0.4)] text-green-400'
                        : 'bg-[var(--bg-3)] border-[var(--border)] text-[var(--text-ghost)]'
                      }`}>
                        {i < step ? <CheckCircle size={16} /> : i + 1}
                      </div>
                      <span className={`text-[11px] tracking-wider uppercase ${i === step ? 'text-[var(--gold)]' : 'text-[var(--text-ghost)]'}`}>{label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-3 mb-5 ${i < step ? 'bg-[rgba(76,175,110,0.4)]' : 'bg-white/10'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            <div className="px-10 pb-10">
              {/* Step 0 — Details */}
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
                  <div>
                    <h3 className="font-[Playfair_Display] text-2xl font-bold mb-1">Your Details</h3>
                    <p className="text-[13px] text-[var(--gold)] bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] rounded px-3 py-2 mt-3">
                      No account needed — your details are saved for this session.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] tracking-widest uppercase text-[var(--text-muted)]">Full Name *</label>
                    <input value={form.name} onChange={set('name')} placeholder="e.g. Chidinma Okafor" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] tracking-widest uppercase text-[var(--text-muted)]">Email *</label>
                      <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] tracking-widest uppercase text-[var(--text-muted)]">Phone *</label>
                      <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+2349074112695" className={inputCls} />
                    </div>
                  </div>
                  <button onClick={nextStep} className="w-full mt-2 bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] text-black font-bold uppercase tracking-wider text-[13px] py-3.5 rounded hover:-translate-y-0.5 transition-all">
                    Continue →
                  </button>
                </motion.div>
              )}

              {/* Step 1 — Delivery */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
                  <h3 className="font-[Playfair_Display] text-2xl font-bold">Delivery Preference</h3>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { mode: 'delivery', Icon: Truck, label: 'Home Delivery' },
                      { mode: 'pickup', Icon: MapPin, label: 'Store Pickup' },
                    ].map(({ mode, Icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => setDeliveryMode(mode)}
                        className={`flex flex-col items-center gap-3 p-5 border rounded-lg transition-all ${
                          deliveryMode === mode
                            ? 'border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.08)] text-[var(--gold-light)]'
                            : 'border-[var(--border)] text-[var(--text-muted)] hover:border-white/20'
                        }`}
                      >
                        <Icon size={24} strokeWidth={1.5} />
                        <span className="text-[13px] font-semibold">{label}</span>
                      </button>
                    ))}
                  </div>

                  {deliveryMode === 'delivery' && (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] tracking-widest uppercase text-[var(--text-muted)]">Delivery Address *</label>
                        <input value={form.address} onChange={set('address')} placeholder="Street address, area, city" className={inputCls} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] tracking-widest uppercase text-[var(--text-muted)]">State</label>
                          <select value={form.state} onChange={set('state')} className={inputCls + ' cursor-pointer'}>
                            <option value="">Select state</option>
                            {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] tracking-widest uppercase text-[var(--text-muted)]">Landmark</label>
                          <input value={form.landmark} onChange={set('landmark')} placeholder="Optional" className={inputCls} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[13px] text-[var(--text-muted)] bg-[var(--bg-3)] border border-[var(--border)] rounded px-4 py-3">
                        <span className="text-[var(--gold)]">ℹ</span> Lagos: ₦1,500 · Other states: ₦3,000+
                      </div>
                    </div>
                  )}

                  {deliveryMode === 'pickup' && (
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] rounded-lg p-5">
                        <MapPin size={24} className="text-[var(--gold)] flex-shrink-0 mt-1" />
                        <div>
                          <strong className="block text-sm mb-1">LUMNG Store</strong>
                          <p className="text-[13px] text-[var(--text-muted)]">Ilorin, Kwara State. Open Mon–Sat 8am–7pm.</p>
                          <p className="text-[12px] text-[var(--gold)] mt-1">You'll receive a pickup-ready notification via WhatsApp: +2349074112695</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] tracking-widest uppercase text-[var(--text-muted)]">Preferred Pickup Date</label>
                        <input type="date" value={form.pickupDate} onChange={set('pickupDate')} className={inputCls} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    <button onClick={() => setStep(0)} className="flex-1 border border-[var(--border)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[13px] py-3.5 rounded hover:border-white/20 transition-all">
                      ← Back
                    </button>
                    <button onClick={nextStep} className="flex-1 bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] text-black font-bold uppercase tracking-wider text-[13px] py-3.5 rounded hover:-translate-y-0.5 transition-all">
                      Continue →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2 — Review */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
                  <h3 className="font-[Playfair_Display] text-2xl font-bold">Order Review</h3>

                  <div className="flex flex-col gap-3">
                    {items.map(item => {
                      const p = products.find(p => p.id === item.id);
                      if (!p) return null;
                      const price = item.qty >= (p.bulkMin || Infinity) ? p.bulkPrice : p.price;
                      return (
                        <div key={item.id} className="flex items-center gap-4 bg-[var(--bg-3)] border border-[var(--border)] rounded-lg p-4">
                          <div className="w-12 h-12 rounded-md flex-shrink-0" style={{ background: p.pattern }} />
                          <div className="flex-1">
                            <div className="text-sm font-semibold">{p.name}</div>
                            <div className="text-[12px] text-[var(--text-ghost)]">{item.qty} × {p.unit}</div>
                          </div>
                          <div className="text-[15px] font-semibold text-[var(--gold-light)]">{formatPrice(price * item.qty)}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-[var(--text-muted)]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between text-sm text-[var(--text-muted)]"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free Pickup' : formatPrice(deliveryFee)}</span></div>
                    <div className="flex justify-between text-base font-bold text-[var(--text)] pt-2 border-t border-[var(--border)]"><span>Total</span><span>{formatPrice(subtotal + deliveryFee)}</span></div>
                  </div>

                  {/* Customer summary */}
                  <div className="bg-[var(--bg-3)] border border-[var(--border)] rounded-lg p-4 text-[13px] text-[var(--text-muted)] flex flex-col gap-1">
                    <div><strong className="text-[var(--text-dim)]">Name:</strong> {form.name}</div>
                    <div><strong className="text-[var(--text-dim)]">Contact:</strong> {form.phone} · {form.email}</div>
                    {deliveryMode === 'delivery' && form.address && (
                      <div><strong className="text-[var(--text-dim)]">Address:</strong> {form.address}{form.state ? `, ${form.state}` : ''}</div>
                    )}
                  </div>

                  {orderError && (
                    <div className="text-[13px] text-[var(--danger)] bg-[rgba(232,92,92,0.1)] border border-[rgba(232,92,92,0.2)] rounded px-3 py-2.5">
                      {orderError}
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    <button onClick={() => setStep(1)} disabled={placing} className="flex-1 border border-[var(--border)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[13px] py-3.5 rounded hover:border-white/20 transition-all disabled:opacity-50">
                      ← Back
                    </button>
                    <button onClick={placeOrder} disabled={placing} className="flex-1 bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] text-black font-bold uppercase tracking-wider text-[13px] py-3.5 rounded flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                      <CheckCircle size={15} /> {placing ? 'Placing Order…' : 'Place Order'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3 — Success */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-6 gap-5">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                    className="w-24 h-24 rounded-full bg-[rgba(201,168,76,0.1)] border-2 border-[rgba(201,168,76,0.3)] flex items-center justify-center"
                  >
                    <CheckCircle size={48} className="text-[var(--gold)]" strokeWidth={1.5} />
                  </motion.div>
                  <h2 className="font-[Playfair_Display] text-3xl font-bold">Order Placed! 🎉</h2>
                  <p className="text-[var(--text-muted)] leading-relaxed max-w-sm">
                    Thank you for your order. No payment has been taken yet — we'll reach out via WhatsApp or email within <strong className="text-[var(--text-dim)]">24 hours</strong> to confirm and arrange payment.
                  </p>
                  <div className="font-mono text-[16px] text-[var(--gold-light)] bg-[var(--bg-3)] border border-[rgba(201,168,76,0.3)] rounded-lg px-6 py-3 tracking-widest">
                    {orderRef}
                  </div>

                  {orderToken && (
                    <div className="w-full max-w-sm flex flex-col gap-3">
                      <p className="text-[12px] text-[var(--text-ghost)] -mb-1">
                        Want to reach us right away? Send your order details directly:
                      </p>
                      <button
                        onClick={handleWhatsAppShare}
                        className="w-full bg-[#25D366] text-black font-bold uppercase tracking-wider text-[13px] py-3 rounded flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
                      >
                        <MessageCircle size={16} /> Send via WhatsApp
                      </button>
                      <button
                        onClick={handleInstagramShare}
                        className="w-full bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-bold uppercase tracking-wider text-[13px] py-3 rounded flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
                      >
                        <InstagramIcon size={16} /> Send via Instagram DM
                      </button>
                      <p className="text-[11px] text-[var(--text-ghost)]">
                        Instagram doesn't support pre-filled messages — we'll copy your order details to your clipboard first, then open the chat so you can paste them in.
                      </p>

                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={handleCopyMessage}
                          className="flex-1 border border-[var(--border)] text-[var(--text-muted)] text-[12px] uppercase tracking-wider py-2.5 rounded flex items-center justify-center gap-1.5 hover:border-white/20 transition-all"
                        >
                          <Copy size={13} /> {copied ? 'Copied!' : 'Copy Message'}
                        </button>
                        <a
                          href={`${window.location.origin}/order/${orderToken}`}
                          target="_blank" rel="noreferrer"
                          className="flex-1 border border-[var(--border)] text-[var(--text-muted)] text-[12px] uppercase tracking-wider py-2.5 rounded flex items-center justify-center gap-1.5 hover:border-white/20 transition-all"
                        >
                          <ExternalLink size={13} /> View Order
                        </a>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={closeCheckout}
                    className="mt-2 bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] text-black font-bold uppercase tracking-wider text-[13px] px-10 py-3.5 rounded hover:-translate-y-0.5 transition-all"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
