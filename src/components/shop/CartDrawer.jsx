import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore, useUIStore, useProductsStore } from '../../store';
import { formatPrice } from '../../data/products';

export default function CartDrawer() {
  const { cartOpen, closeCart, openCheckout } = useUIStore();
  const { items, updateQty, removeItem } = useCartStore();
  const { products } = useProductsStore();

  const cartTotal = items.reduce((sum, item) => {
    const p = products.find(p => p.id === item.id);
    if (!p) return sum;
    const price = item.qty >= (p.bulkMin || Infinity) ? p.bulkPrice : p.price;
    return sum + price * item.qty;
  }, 0);

  const hasBulk = items.some(item => {
    const p = products.find(p => p.id === item.id);
    return p && item.qty >= (p.bulkMin || Infinity);
  });

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm z-[199]"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[420px] max-w-full bg-[var(--bg-2)] border-l border-[var(--border)] z-[200] flex flex-col shadow-[var(--shadow)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-6 border-b border-[var(--border)]">
              <h2 className="font-[Playfair_Display] text-xl font-bold text-[var(--text)]">Your Cart</h2>
              <button onClick={closeCart} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-4">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-20">
                  <ShoppingBag size={48} strokeWidth={1} className="text-[var(--text-ghost)]" />
                  <p className="font-[Playfair_Display] text-xl text-[var(--text-muted)]">Your cart is empty</p>
                  <span className="text-sm text-[var(--text-ghost)]">Add some beautiful fabrics!</span>
                </div>
              ) : (
                items.map((item) => {
                  const p = products.find(p => p.id === item.id);
                  if (!p) return null;
                  const isBulk = item.qty >= (p.bulkMin || Infinity);
                  const price = isBulk ? p.bulkPrice : p.price;
                  return (
                    <motion.div
                      key={item.id} layout
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4 bg-[var(--bg-3)] border border-[var(--border)] rounded-lg p-4"
                    >
                      <div className="w-[60px] h-[60px] rounded-md flex-shrink-0" style={{ background: p.pattern }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[var(--text)] truncate">{p.name}</div>
                        <div className="text-sm text-[var(--gold-light)] mt-0.5 flex items-center gap-2">
                          {formatPrice(price * item.qty)}
                          {isBulk && (
                            <span className="text-[10px] bg-[var(--gold-glow)] border border-[var(--gold-dim)] text-[var(--gold)] px-1.5 py-0.5 rounded">
                              Bulk
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2.5">
                          <button onClick={() => updateQty(item.id, item.qty - 1)}
                            className="w-6 h-6 rounded border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--gold-dim)] hover:text-[var(--gold-light)] transition-all">
                            <Minus size={11} />
                          </button>
                          <span className="text-sm font-semibold min-w-[20px] text-center text-[var(--text)]">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.qty + 1)}
                            className="w-6 h-6 rounded border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--gold-dim)] hover:text-[var(--gold-light)] transition-all">
                            <Plus size={11} />
                          </button>
                          <button onClick={() => removeItem(item.id)} className="ml-auto text-[var(--danger)]/40 hover:text-[var(--danger)]/80 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-7 pb-7 pt-4 border-t border-[var(--border)]">
                <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
                  <span>Subtotal</span>
                  <span className="text-[var(--text)] font-semibold">{formatPrice(cartTotal)}</span>
                </div>
                {hasBulk && <div className="text-[12px] text-[var(--gold)] mb-4">🏷 Bulk discount applied</div>}
                <button onClick={openCheckout}
                  className="w-full mt-2 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg)] font-bold uppercase tracking-wider text-[13px] py-3.5 rounded flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[var(--shadow-gold)] transition-all">
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
