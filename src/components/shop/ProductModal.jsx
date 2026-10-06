import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore, useCartStore, useProductsStore } from '../../store';
import { formatPrice } from '../../data/products';
import toast from 'react-hot-toast';
import ProductImage from './ProductImage';

export default function ProductModal() {
  const { modalProductId, closeModal, openCart } = useUIStore();
  const { addItem } = useCartStore();
  const modalProduct = useProductsStore(s => s.products.find(p => p.id === modalProductId) || null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (modalProduct) {
      setQty(modalProduct.minOrder || 1);
      setActiveImg(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [modalProduct]);

  const galleryImages = modalProduct
    ? (modalProduct.images?.length ? modalProduct.images : (modalProduct.imageUrl ? [modalProduct.imageUrl] : []))
    : [];

  const goPrev = () => setActiveImg(i => (i - 1 + galleryImages.length) % galleryImages.length);
  const goNext = () => setActiveImg(i => (i + 1) % galleryImages.length);

  useEffect(() => {
    if (!modalProduct || galleryImages.length < 2) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalProduct, galleryImages.length]);

  if (!modalProduct) return null;

  const isBulk = qty >= (modalProduct.bulkMin || Infinity);
  const unitPrice = isBulk ? modalProduct.bulkPrice : modalProduct.price;
  const total = unitPrice * qty;

  const handleAdd = () => {
    // Whichever photo is active in the gallery right now is the one the
    // customer sees — that's the fabric shot carried through to their order.
    const selectedImage = galleryImages[activeImg] || null;
    addItem(modalProduct.id, qty, selectedImage);
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
            <div className="relative h-[280px] sm:h-full min-h-[280px] rounded-tl-xl rounded-tr-xl sm:rounded-tr-none sm:rounded-bl-xl overflow-hidden group">
              <ProductImage product={modalProduct} index={activeImg} />

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/65 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={goNext}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/65 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Small galleries: tappable dots. Large ones (this can run up to 40
                      images): a compact counter instead — 40 dots would be unusable. */}
                  {galleryImages.length <= 10 ? (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                      {galleryImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          aria-label={`Show image ${i + 1}`}
                          className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/70'}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[11px] font-medium px-2.5 py-1 rounded-full tabular-nums">
                      {activeImg + 1} / {galleryImages.length}
                    </div>
                  )}
                </>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="sm:hidden flex gap-2 px-9 pt-4 overflow-x-auto">
                {galleryImages.map((url, i) => (
                  <button
                    key={url + i}
                    onClick={() => setActiveImg(i)}
                    className={`w-14 h-14 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${i === activeImg ? 'border-[var(--gold)]' : 'border-transparent opacity-60'}`}
                  >
                    <ProductImage product={modalProduct} index={i} />
                  </button>
                ))}
              </div>
            )}

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

              {/* Lets the customer know the photo currently showing is the
                  one that travels with their order — relevant once a product
                  has more than one fabric photo to choose between. */}
              {galleryImages.length > 1 && (
                <div className="text-[12px] text-[var(--text-ghost)] mb-4 -mt-1">
                  Showing photo {activeImg + 1} of {galleryImages.length} — this is the one we'll use for your order.
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
