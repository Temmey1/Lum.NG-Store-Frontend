import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, MapPin, CheckCircle } from 'lucide-react';
import { useUIStore, useCartStore, useSessionStore, useProductsStore } from '../../store';
import { useCartRecovery } from '../../hooks/useCartRecovery';
import { ordersApi } from '../../api/index';
import { formatPrice, NIGERIAN_STATES } from '../../data/products';

const STEPS = ['Your Details', 'Delivery', 'Review'];

export default function CheckoutModal() {
  const { checkoutOpen, closeCheckout } = useUIStore();
  const { items, clearCart } = useCartStore();
  const { customer, deliveryMode, setCustomer, setDeliveryMode } = useSessionStore();
  const { products } = useProductsStore();

  const { attachEmail, markRecovered, sessionId } = useCartRecovery();
  const [step, setStep] = useState(0);
  const [orderRef, setOrderRef] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');
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
      markRecovered(); // tell backend the cart was converted
      clearCart();
      setOrderRef(data.ref);
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
                    Thank you for your order. We'll reach out via WhatsApp or email within <strong className="text-[var(--text-dim)]">24 hours</strong> to confirm and arrange payment.
                  </p>
                  <div className="font-mono text-[16px] text-[var(--gold-light)] bg-[var(--bg-3)] border border-[rgba(201,168,76,0.3)] rounded-lg px-6 py-3 tracking-widest">
                    {orderRef}
                  </div>
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
