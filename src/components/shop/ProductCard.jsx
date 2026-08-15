import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { formatPrice } from '../../data/products';
import { useCartStore, useUIStore } from '../../store';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCartStore();
  const { openModal, openCart } = useUIStore();

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addItem(product.id, product.minOrder || 1);
    toast.success(`${product.name} added to cart`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(201,168,76,0.3)' },
      iconTheme: { primary: '#c9a84c', secondary: '#000' },
    });
    openCart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden group hover:border-[var(--gold-dim)] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(201,168,76,0.12)] transition-all duration-400 ${!product.inStock ? 'opacity-60' : ''}`}
    >
      {/* Image area */}
      <div
        className="relative h-[220px] cursor-pointer overflow-hidden"
        onClick={() => openModal(product)}
      >
        <div
          className="w-full h-full transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ background: product.pattern }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="bg-[#c9a84c] text-black text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm">
              {product.badge}
            </span>
          )}
          {!product.inStock && (
            <span className="bg-[#333] text-[var(--text-muted)] text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick view hint */}
        <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[11px] tracking-widest uppercase text-[var(--text-muted)] flex items-center gap-1.5">
            <Search size={12} /> Quick View
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="text-[10px] tracking-[0.15em] uppercase text-[var(--gold)] mb-1.5">{product.category}</div>
        <h3 className="font-[Playfair_Display] text-[18px] font-bold mb-2">{product.name}</h3>
        <p className="text-[12px] text-[var(--text-muted)] leading-relaxed mb-4 line-clamp-2">{product.description}</p>

        {/* Pricing */}
        <div className="mb-4">
          <div className="text-[17px] font-semibold text-[var(--gold-light)]">
            {formatPrice(product.price)}{' '}
            <span className="text-[12px] text-[var(--text-ghost)] font-normal">{product.unit}</span>
          </div>
          {product.bulkMin && (
            <div className="text-[11px] text-[rgba(201,168,76,0.6)] mt-0.5">
              Bulk ({product.bulkMin}+): {formatPrice(product.bulkPrice)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex-1 bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] text-black font-bold uppercase tracking-wider text-[11px] rounded py-2.5 flex items-center justify-center gap-1.5 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(201,168,76,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Plus size={13} strokeWidth={2.5} />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button
            onClick={() => openModal(product)}
            className="border border-[var(--border)] rounded py-2.5 px-3 text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--gold-light)] transition-all"
          >
            <Search size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
