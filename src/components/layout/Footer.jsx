import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Phone, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] pt-20 pb-10 relative overflow-hidden bg-[var(--bg-2)]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[var(--gold-dim)] to-transparent" />

      <div className="max-w-6xl mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-16 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.jpeg" alt="LUM NG" className="w-11 h-11 rounded-full object-cover border border-[var(--gold-dim)]" />
              <div className="font-[Playfair_Display] text-2xl font-black tracking-widest" style={{ background: 'linear-gradient(135deg, var(--text), var(--gold-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LUM NG</div>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-[280px] mb-6">
              Premium unisex fabric store — Ilorin, Kwara State. Look classy to your taste.
            </p>
            <div className="flex gap-4">
              {[Globe, Phone, Share2].map((Icon, i) => (
                <a
                  key={i} href="#"
                  className="w-10 h-10 border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--gold-dim)] hover:text-[var(--gold-light)] hover:bg-[var(--gold-glow)] transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] tracking-[0.15em] uppercase text-[var(--gold)] mb-5">Shop</h4>
            <ul className="flex flex-col gap-3">
              {['All Products','Ankara','Lace','Senator','Guinea'].map(item => (
                <li key={item}>
                  <Link
                    to={`/shop${item !== 'All Products' ? `?cat=${item.toLowerCase()}` : ''}`}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] tracking-[0.15em] uppercase text-[var(--gold)] mb-5">Company</h4>
            <ul className="flex flex-col gap-3">
              {[['About','/#about'],['Contact','/#contact'],['Bulk Orders','/#contact'],['Admin','/admin']].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-8 flex flex-wrap justify-between gap-3 text-[13px] text-[var(--text-ghost)]">
          <span>© 2026 LUM NG. All rights reserved.</span>
          <span>Look classy to your taste 👑</span>
        </div>
      </div>
    </footer>
  );
}
