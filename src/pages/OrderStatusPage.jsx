import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, MapPin, Clock, XCircle } from 'lucide-react';
import { ordersApi, resolveImageUrl } from '../api/index';
import { formatPrice } from '../data/products';

const STATUS_META = {
  PENDING:    { label: 'Pending Confirmation', Icon: Clock,        color: '#c9a84c' },
  CONFIRMED:  { label: 'Confirmed',             Icon: CheckCircle, color: '#4caf6e' },
  PROCESSING: { label: 'Being Prepared',        Icon: Package,     color: '#6482dc' },
  FULFILLED:  { label: 'Fulfilled',             Icon: CheckCircle, color: '#4caf6e' },
  CANCELLED:  { label: 'Cancelled',             Icon: XCircle,     color: '#e85c5c' },
};

export default function OrderStatusPage() {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await ordersApi.trackPublic(token);
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (!cancelled) setError(err.response?.status === 404 ? 'not_found' : 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <p className="text-[var(--text-muted)] text-sm">Loading order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <XCircle size={40} className="text-[var(--text-ghost)]" />
        <h1 className="font-[Playfair_Display] text-xl font-bold text-[var(--text)]">Order not found</h1>
        <p className="text-[var(--text-muted)] text-sm max-w-sm">
          This link may be invalid or the order may have been removed. If you believe this is a mistake, reach out to us directly.
        </p>
        <Link to="/" className="mt-2 text-[var(--gold)] text-sm hover:underline">← Back to LUM NG</Link>
      </div>
    );
  }

  const meta = STATUS_META[order.status] || STATUS_META.PENDING;
  const { Icon } = meta;

  return (
    <div className="min-h-screen bg-[var(--bg)] px-5 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-[560px] mx-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 sm:p-9"
      >
        <div className="text-center mb-8">
          <div
            className="font-[Playfair_Display] text-xl font-black tracking-widest mb-1"
            style={{ background: 'linear-gradient(135deg,#fff,#e8c97a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            LUM NG
          </div>
          <p className="text-[var(--text-muted)] text-sm">Hi {order.firstName}, here's your order status</p>
        </div>

        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: `${meta.color}22`, border: `1.5px solid ${meta.color}55` }}
          >
            <Icon size={28} style={{ color: meta.color }} />
          </div>
          <div className="text-center">
            <div className="font-semibold text-[var(--text)]">{meta.label}</div>
            <div className="font-mono text-[12px] text-[var(--gold)] mt-1">{order.ref}</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {order.items.map((item, i) => {
            const src = resolveImageUrl(item.imageUrl);
            return (
              <div key={i} className="flex items-center gap-3 bg-[var(--bg-3)] border border-[var(--border)] rounded-lg p-3">
                <div className="w-11 h-11 rounded-md flex-shrink-0 overflow-hidden">
                  {src
                    ? <img src={src} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full" style={{ background: item.pattern }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--text)] truncate">{item.name}</div>
                  <div className="text-[12px] text-[var(--text-ghost)]">{item.qty} × {item.unit}</div>
                </div>
                <div className="text-[13px] text-[var(--gold-light)] font-semibold flex-shrink-0">{formatPrice(item.unitPrice * item.qty)}</div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-2 mb-6">
          <div className="flex justify-between text-sm text-[var(--text-muted)]"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-sm text-[var(--text-muted)]">
            <span>{order.delivery === 'PICKUP' ? 'Pickup' : 'Delivery'}</span>
            <span>{order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-[var(--text)] pt-2 border-t border-[var(--border)]"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-[var(--text-ghost)] justify-center">
          {order.delivery === 'PICKUP' ? <MapPin size={13}/> : <Truck size={13}/>}
          {order.delivery === 'PICKUP' ? 'Store pickup — Ilorin, Kwara State' : 'Home delivery'}
          <span className="mx-1">·</span>
          {new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>

        <p className="text-center text-[12px] text-[var(--text-ghost)] mt-6">
          No payment has been collected yet — we'll reach out via WhatsApp or email to confirm and arrange payment.
        </p>

        <Link to="/" className="block text-center mt-6 text-[var(--gold)] text-sm hover:underline">← Back to LUM NG</Link>
      </motion.div>
    </div>
  );
}
