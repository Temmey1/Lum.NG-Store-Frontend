import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore, useUIStore } from '../../store';
import ThemeToggle from '../ui/ThemeToggle';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { items } = useCartStore();
  const { openCart, mobileNavOpen, openMobileNav, closeMobileNav } = useUIStore();
  const location = useLocation();
  const isShop = location.pathname === '/shop';
  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { to: '/#about', label: 'About' },
    { to: '/#fabrics', label: 'Materials' },
    { to: '/shop', label: 'Shop' },
    { to: '/#contact', label: 'Contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-[76px] transition-all duration-500 ${
          scrolled || isShop
            ? 'bg-[var(--bg-2)]/95 backdrop-blur-xl border-b border-[var(--border)]'
            : ''
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.jpeg"
            alt="LUM NG"
            className="w-9 h-9 rounded-full object-cover border border-[var(--gold-dim)] group-hover:border-[var(--gold)] transition-all"
          />
          <span
            className="font-[Playfair_Display] text-xl font-black tracking-widest hidden sm:block"
            style={{ background: 'linear-gradient(135deg, var(--text), var(--gold-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            LUM NG
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-9 list-none">
          {links.map(l => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="text-[13px] tracking-[0.1em] uppercase font-medium transition-colors duration-300 relative group text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px bg-[var(--gold)] w-0 group-hover:w-full transition-all duration-300" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <button
            onClick={openCart}
            className="relative text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-colors"
          >
            <ShoppingBag size={22} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-[var(--gold)] text-[var(--bg)] text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button onClick={openMobileNav} className="md:hidden text-[var(--text)]">
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <div
        className={`fixed inset-0 bg-[var(--bg-2)] z-[200] flex flex-col items-center justify-center transition-opacity duration-400 ${
          mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button onClick={closeMobileNav} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text)]">
          <X size={28} />
        </button>
        <div className="absolute top-6 left-6">
          <ThemeToggle />
        </div>
        <ul className="list-none text-center flex flex-col gap-8">
          {links.map(l => (
            <li key={l.to}>
              <Link
                to={l.to}
                onClick={closeMobileNav}
                className="font-[Playfair_Display] text-4xl font-bold text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
