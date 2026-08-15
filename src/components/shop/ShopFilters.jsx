import React from 'react';
import { CATEGORIES } from '../../data/products';

export default function ShopFilters({ category, setCategory, onlyInStock, setOnlyInStock, sort, setSort }) {
  const inputCls = 'w-full bg-[var(--input-bg)] border border-[var(--border)] rounded px-3.5 py-2.5 text-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--gold-dim)] cursor-pointer';

  return (
    <aside className="bg-[var(--bg-2)] border-r border-[var(--border)] w-[280px] shrink-0 p-10 flex flex-col gap-9 sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto">
      {/* Categories */}
      <div>
        <h3 className="text-[11px] tracking-[0.15em] uppercase text-[var(--gold)] mb-4">Categories</h3>
        <ul className="flex flex-col gap-1 list-none">
          {CATEGORIES.map(cat => (
            <li key={cat.value}>
              <button
                onClick={() => setCategory(cat.value)}
                className={`w-full text-left px-3.5 py-2.5 rounded text-sm border transition-all ${
                  category === cat.value
                    ? 'bg-[var(--gold-glow)] border-[var(--gold-dim)] text-[var(--gold-light)]'
                    : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--input-bg)] hover:text-[var(--text)]'
                }`}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-[11px] tracking-[0.15em] uppercase text-[var(--gold)] mb-4">Availability</h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setOnlyInStock(!onlyInStock)}
            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
              onlyInStock ? 'bg-[var(--gold)] border-[var(--gold)]' : 'border-[var(--border)] group-hover:border-[var(--text-muted)]'
            }`}
          >
            {onlyInStock && (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <polyline points="2 6 5 9 10 3" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">In Stock Only</span>
        </label>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-[11px] tracking-[0.15em] uppercase text-[var(--gold)] mb-4">Sort By</h3>
        <select value={sort} onChange={e => setSort(e.target.value)} className={inputCls}>
          <option value="default">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* Bulk CTA */}
      <div className="bg-[var(--gold-glow)] border border-[var(--gold-dim)] rounded-lg p-4">
        <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mb-3">
          Order 6+ yards and unlock bulk pricing. Contact us for 50+ yard orders.
        </p>
        <a href="/#contact" className="inline-flex text-[11px] tracking-widest uppercase font-semibold border border-[var(--border)] text-[var(--text-muted)] rounded px-4 py-2 hover:border-[var(--gold-dim)] hover:text-[var(--gold-light)] transition-all">
          Get a Quote
        </a>
      </div>
    </aside>
  );
}
