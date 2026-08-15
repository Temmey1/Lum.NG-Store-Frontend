import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/shop/ProductCard';
import ShopFilters from '../components/shop/ShopFilters';
import CartDrawer from '../components/shop/CartDrawer';
import ProductModal from '../components/shop/ProductModal';
import CheckoutModal from '../components/checkout/CheckoutModal';
import AiChatWidget from '../components/ai/AiChatWidget';
import { useCartRecovery } from '../hooks/useCartRecovery';
import { useProductsStore } from '../store';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  useCartRecovery(); // handles ?restore= token + syncs cart to backend
  const { products, loaded, loading, fetchProducts } = useProductsStore();
  const [category, setCategory] = useState(searchParams.get('cat') || 'all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sort, setSort] = useState('default');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync URL param on mount
  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) setCategory(cat);
  }, []);

  // Refresh product data whenever the shop page is visited
  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== 'all') list = list.filter(p => p.category === category);
    if (onlyInStock) list = list.filter(p => p.inStock);
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [category, onlyInStock, sort]);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      {/* Shop Hero */}
      <div className="relative pt-[76px] pb-14 text-center bg-[var(--bg-card)] border-b border-[var(--border)] overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(201,168,76,0.4),transparent)', filter: 'blur(100px)', opacity: 0.12, top: -200, left: '50%', transform: 'translateX(-50%)' }} />
        <div className="relative z-10 pt-12">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--gold)] font-semibold mb-4">Our Collection</div>
          <h1 className="font-[Playfair_Display] font-black leading-[1.1] mb-4"
            style={{ fontSize: 'clamp(44px,6vw,76px)' }}>
            Premium Native<br />
            <em className="italic font-[400] text-[var(--gold-light)]">Fabrics</em>
          </h1>
          <p className="text-[var(--text-muted)] text-[17px]">From a single yard to bulk rolls — authentic fabrics at honest prices.</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <ShopFilters
            category={category} setCategory={setCategory}
            onlyInStock={onlyInStock} setOnlyInStock={setOnlyInStock}
            sort={sort} setSort={setSort}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-[var(--bg-card)] border-r border-[var(--border)] overflow-y-auto z-10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <span className="font-semibold">Filters</span>
                <button onClick={() => setSidebarOpen(false)}><X size={20} className="text-[var(--text-muted)]" /></button>
              </div>
              <ShopFilters
                category={category} setCategory={(c) => { setCategory(c); setSidebarOpen(false); }}
                onlyInStock={onlyInStock} setOnlyInStock={setOnlyInStock}
                sort={sort} setSort={setSort}
              />
            </div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 px-6 lg:px-10 py-8 min-h-[60vh]">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-7">
            <p className="text-sm text-[var(--text-muted)]">
              Showing <span className="text-[var(--text)] font-semibold">{filtered.length}</span> fabric{filtered.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm text-[var(--text-muted)] border border-[var(--border)] rounded px-4 py-2 hover:border-[rgba(201,168,76,0.4)] hover:text-[var(--gold-light)] transition-all"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
          </div>

          {loading && !loaded ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-[var(--text-ghost)] text-sm">Loading fabrics…</p>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <p className="font-[Playfair_Display] text-2xl text-[var(--text-ghost)] mb-3">No fabrics found</p>
              <p className="text-[var(--text-ghost)] text-sm mb-6">Try adjusting your filters</p>
              <button
                onClick={() => { setCategory('all'); setOnlyInStock(false); }}
                className="border border-white/15 text-[var(--text-muted)] text-sm uppercase tracking-wider px-6 py-2.5 rounded hover:border-[rgba(201,168,76,0.4)] hover:text-[var(--gold-light)] transition-all"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
      <CartDrawer />
      <ProductModal />
      <CheckoutModal />
      <AiChatWidget />
    </div>
  );
}
