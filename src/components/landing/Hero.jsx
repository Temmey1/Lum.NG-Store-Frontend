import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FABRIC_CARDS = [
  { label: 'Ankara',  pattern: 'linear-gradient(145deg,#8B1A1A,#D4380D,#FA8C16)', style: { width: 220, height: 280, top: 0, left: 0 }, delay: 0 },
  { label: 'Senator', pattern: 'linear-gradient(135deg,#0a0a1a,#1a1a2e,#0d1a0d)', style: { width: 170, height: 210, top: 160, left: 180 }, delay: -2 },
  { label: 'Lace',    pattern: 'linear-gradient(135deg,#0d0d2e,#1a1a4a,#0d2e4a)', style: { width: 140, height: 170, top: -60, left: 200 }, delay: -4 },
];

const float = {
  animate: (d) => ({
    y: [0, -14, 0],
    rotate: [-1, 1, -1],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: d },
  }),
};

export default function Hero() {
  const glowRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (glowRef.current) {
        glowRef.current.style.left = e.clientX + 'px';
        glowRef.current.style.top = e.clientY + 'px';
      }
    };
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-20">
      {/* Cursor glow */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed w-[400px] h-[400px] rounded-full z-0"
        style={{
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          transform: 'translate(-50%,-50%)',
          transition: 'left 0.12s ease, top 0.12s ease',
        }}
      />

      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Orbs */}
      <motion.div
        animate={{ y: [0,-30,0], scale: [1,1.05,1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(201,168,76,0.5),transparent)', filter: 'blur(80px)', opacity: 0.22, top: -100, right: -100 }}
      />
      <motion.div
        animate={{ y: [0,-20,0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: -4 }}
        className="absolute w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(255,255,255,0.2),transparent)', filter: 'blur(80px)', opacity: 0.18, bottom: -50, left: -50 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[700px] pl-[clamp(20px,6vw,120px)]">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
          className="text-[11px] tracking-[0.25em] uppercase text-[var(--gold)] font-semibold mb-6"
        >
          Unisex Fabric Store · Ilorin, Kwara
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="font-[Playfair_Display] leading-none mb-7"
          style={{ fontSize: 'clamp(52px,7.5vw,100px)', fontWeight: 900 }}
        >
          <span className="block">Look Classy</span>
          <span
            className="block italic font-[400]"
            style={{ background: 'linear-gradient(135deg,#fff 30%,#e8c97a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            To Your Taste
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="font-[Cormorant_Garamond] text-[18px] text-[var(--text-muted)] leading-relaxed mb-12"
        >
          Lace · Ankara · Senator · Guinea · Bonnets<br />
          Premium unisex fabrics — look classy to your taste.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="flex gap-4 flex-wrap"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] text-black font-semibold uppercase tracking-widest text-[13px] px-9 py-3.5 rounded hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(201,168,76,0.35)] transition-all"
          >
            Explore Collection
          </Link>
          <a
            href="#fabrics"
            className="inline-flex items-center gap-2 border border-[var(--border)] text-[var(--text)] font-medium uppercase tracking-widest text-[13px] px-9 py-3.5 rounded hover:border-[rgba(201,168,76,0.4)] hover:text-[var(--gold-light)] hover:bg-[rgba(201,168,76,0.1)] transition-all"
          >
            Our Fabrics
          </a>
        </motion.div>
      </div>

      {/* Floating fabric cards — desktop only */}
      <div className="absolute hidden lg:block" style={{ right: 'clamp(20px,8vw,160px)', top: '50%', transform: 'translateY(-50%)' }}>
        <div className="relative" style={{ width: 360, height: 380 }}>
          {FABRIC_CARDS.map((card, i) => (
            <motion.div
              key={i}
              custom={card.delay}
              variants={float}
              animate="animate"
              className="absolute rounded-lg overflow-hidden border border-[var(--border)] shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
              style={{ ...card.style, background: card.pattern }}
            >
              <div className="w-full h-full flex items-end p-4">
                <span className="font-[Playfair_Display] italic text-[13px] text-[var(--text-muted)]">{card.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[var(--text-ghost)] text-[11px] tracking-[0.15em] uppercase">
        <span>Scroll</span>
        <motion.div
          animate={{ scaleY: [1, 0.5, 1], opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent"
        />
      </div>
    </section>
  );
}
