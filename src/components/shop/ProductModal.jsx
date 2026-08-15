import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useUIStore, useCartStore } from '../../store';
import { formatPrice } from '../../data/products';
import toast from 'react-hot-toast';

export default function ProductModal() {
  const { modalProduct, closeModal, openCart } = useUIStore();
  const { addItem } = useCartStore();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (modalProduct) {
      setQty(modalProduct.minOrder || 1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [modalProduct]);

  if (!modalProduct) return null;

  const isBulk = qty >= (modalProduct.bulkMin || Infinity);
  const unitPrice = isBulk ? modalProduct.bulkPrice : modalProduct.price;
  const total = unitPrice * qty;

  const handleAdd = () => {
    addItem(modalProduct.id, qty);
    toast.success(`${qty} × ${modalProduct.name} added`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(201,168,76,0.3)' },
      iconTheme: { primary: '#c9a84c', secondary: '#000' },
    });
    closeModal();
    openCart();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[300] flex items-center justify-center p-5"
        onClick={closeModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl w-full max-w-[680px] max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <X size={22} />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Swatch */}
            <div
              className="h-[280px] sm:h-full min-h-[280px] rounded-tl-xl rounded-tr-xl sm:rounded-tr-none sm:rounded-bl-xl"
              style={{ background: modalProduct.pattern }}
            />

            {/* Info */}
            <div className="p-9">
              <div className="text-[11px] tracking-[0.15em] uppercase text-[var(--gold)] mb-2">{modalProduct.category}</div>
              <h2 className="font-[Playfair_Display] text-2xl font-bold mb-3">{modalProduct.name}</h2>
              <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-6">{modalProduct.description}</p>

              {/* Price */}
              <div className="text-2xl font-bold text-[var(--gold-light)] mb-1">{formatPrice(unitPrice)}</div>
              <div className="text-[13px] text-[var(--text-ghost)] mb-2">{modalProduct.unit} · Min {modalProduct.minOrder}</div>
              {modalProduct.bulkMin && (
                <div className="inline-block text-[13px] text-[var(--gold)] bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] px-3 py-2 rounded mb-5">
                  🏷 Bulk ({modalProduct.bulkMin}+): {formatPrice(modalProduct.bulkPrice)}/unit
                  {isBulk && <span className="ml-2 text-green-400 text-[11px]">✓ Applied</span>}
                </div>
              )}

              {/* Qty */}
              <div className="flex items-center gap-4 mb-5">
                <span className="text-[13px] text-[var(--text-muted)]">Quantity:</span>
                <div className="flex items-center gap-3 bg-[var(--bg-3)] border border-[var(--border)] rounded-lg p-1">
                  <button
                    onClick={() => setQty(q => Math.max(modalProduct.minOrder || 1, q - 1))}
                    className="w-8 h-8 rounded flex items-center justify-center bg-white/[0.05] text-[var(--text)] hover:bg-[rgba(201,168,76,0.1)] hover:text-[var(--gold-light)] transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="min-w-[32px] text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-8 h-8 rounded flex items-center justify-center bg-white/[0.05] text-[var(--text)] hover:bg-[rgba(201,168,76,0.1)] hover:text-[var(--gold-light)] transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Tags */}
              {modalProduct.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {modalProduct.tags.map(t => (
                    <span key={t} className="bg-white/[0.05] border border-[var(--border)] rounded-sm px-2.5 py-1 text-[11px] tracking-widest uppercase text-[var(--text-ghost)]">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={!modalProduct.inStock}
                className="w-full bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] text-black font-bold uppercase tracking-wider text-[13px] py-3.5 rounded flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(201,168,76,0.35)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={15} />
                {modalProduct.inStock ? `Add to Cart · ${formatPrice(total)}` : 'Out of Stock'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
