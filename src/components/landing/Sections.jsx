import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Search, ShoppingBag, Gift, CheckCircle } from 'lucide-react';
import { formatPrice } from '../../data/products';
import { useProductsStore } from '../../store';

// ===== MARQUEE =====
export function Marquee() {
  const items = ['Lace','·','Ankara','·','Senator Material','·','Guinea Brocade','·','Bonnets','·','Alhaji Caps','·','Children\'s Wear','·','Adire','·'];
  return (
    <div className="border-t border-b border-[var(--border)] py-[18px] overflow-hidden bg-[var(--bg-card)]">
      <div className="flex gap-10 whitespace-nowrap" style={{ animation: 'marquee 28s linear infinite' }}>
        {[...items,...items].map((item, i) => (
          <span key={i} className={`text-[13px] tracking-[0.12em] uppercase flex-shrink-0 ${item === '·' ? 'text-[var(--gold)] text-[10px]' : 'text-[var(--text-muted)] font-medium'}`}>
            {item}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { 0% { transform:translateX(0) } 100% { transform:translateX(-50%) } }`}</style>
    </div>
  );
}

// ===== ABOUT =====
export function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section id="about" className="py-32 bg-[var(--bg-card)]" ref={ref}>
      <div className="max-w-6xl mx-auto px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative h-[420px]"
          >
            <div className="absolute w-[280px] h-[340px] top-0 left-0 rounded-lg overflow-hidden border border-[var(--border)]">
              <div className="w-full h-full" style={{ background: 'linear-gradient(145deg,#8B1A1A,#D4380D,#FA8C16,#1D6B1D,#003A8C)' }} />
            </div>
            <div className="absolute w-[200px] h-[240px] bottom-0 right-0 rounded-lg overflow-hidden border border-[var(--border)]">
              <div className="w-full h-full" style={{ background: 'repeating-linear-gradient(45deg,rgba(201,168,76,0.3) 0,rgba(201,168,76,0.3) 2px,transparent 2px,transparent 20px),linear-gradient(135deg,#1a1a2e,#0d0d1a)' }} />
            </div>
            <div className="absolute bottom-[60px] left-[240px] bg-[rgba(26,26,26,0.95)] border border-[rgba(201,168,76,0.3)] rounded-lg p-4 text-center backdrop-blur-sm shadow-[0_0_40px_rgba(201,168,76,0.15)]">
              <span className="block font-[Playfair_Display] text-3xl font-bold text-[var(--gold-light)]">500+</span>
              <span className="text-[11px] tracking-wider uppercase text-[var(--text-muted)]">Fabric Patterns</span>
            </div>
          </motion.div>
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--gold)] font-semibold mb-4">About LUM NG</div>
            <h2 className="font-[Playfair_Display] text-[clamp(32px,4vw,52px)] font-bold leading-[1.15] mb-6">
              Rooted in Heritage,<br /><em className="italic text-[var(--gold-light)]">Elevated by Design</em>
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed mb-5">LUM NG is a premium unisex fabric store founded by Oluwapelumi Adeboye, based in Ilorin, Kwara State. We deal in Lace, Ankara, Senator materials, Guinea Brocade, Embroidered Alhaji caps, Bonnets (all types), and Baby/Children's wears.</p>
            <p className="text-[var(--text-muted)] leading-relaxed mb-10">Whether you're dressing for celebration, culture, or commerce — we carry what you need, in the quantities you require.</p>
            <div className="grid grid-cols-3 gap-6 py-8 border-t border-b border-[var(--border)] mb-10">
              {[['8+','Product Types'],['500+','Happy Customers'],['Bulk','Orders Welcome']].map(([n,l]) => (
                <div key={l} className="text-center">
                  <span className="block font-[Playfair_Display] text-3xl font-bold" style={{ background:'linear-gradient(135deg,#fff,#e8c97a)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{n}</span>
                  <span className="text-[11px] tracking-wider uppercase text-[var(--text-muted)] mt-1 block">{l}</span>
                </div>
              ))}
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] text-black font-semibold uppercase tracking-widest text-[13px] px-9 py-3.5 rounded hover:-translate-y-0.5 transition-all">
              Shop Now
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ===== FABRICS GRID =====
export function FabricsShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { products } = useProductsStore();
  const featured = (() => {
    const flagged = products.filter(p => p.featured);
    return (flagged.length ? flagged : products).slice(0, 6);
  })();

  return (
    <section id="fabrics" className="py-32" ref={ref}>
      <div className="max-w-6xl mx-auto px-10">
        <div className="text-center mb-16">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--gold)] font-semibold mb-4">Our Materials</div>
          <h2 className="font-[Playfair_Display] text-[clamp(32px,4vw,52px)] font-bold mb-5">The Finest Native Fabrics</h2>
          <p className="text-[var(--text-muted)] text-[17px] max-w-[500px] mx-auto">Every roll, every yard — curated with purpose and pride.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden cursor-pointer group hover:border-[rgba(201,168,76,0.3)] hover:-translate-y-1.5 hover:shadow-[0_0_40px_rgba(201,168,76,0.15)] transition-all duration-400"
              onClick={() => window.location.href = '/shop'}
            >
              <div className="h-[240px] relative overflow-hidden">
                <div className="w-full h-full transition-transform duration-700 group-hover:scale-105" style={{ background: p.pattern }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {p.badge && (
                  <div className="absolute top-3 right-3 bg-[#c9a84c] text-black text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm">
                    {p.badge}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-[Playfair_Display] text-xl font-bold mb-2">{p.name}</h3>
                <p className="text-[13px] text-[var(--text-muted)] mb-4 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-[16px] font-semibold text-[var(--gold-light)]">{formatPrice(p.price)} <span className="text-[11px] text-[var(--text-ghost)] font-normal">{p.unit}</span></div>
                  <span className="text-[12px] tracking-widest uppercase text-[var(--text-ghost)] group-hover:text-[var(--gold-light)] transition-colors flex items-center gap-1">
                    View →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/shop" className="inline-flex items-center gap-2 bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] text-black font-semibold uppercase tracking-widest text-[13px] px-9 py-3.5 rounded hover:-translate-y-0.5 transition-all">
            View All Materials
          </Link>
        </div>
      </div>
    </section>
  );
}

// ===== PROCESS =====
export function Process() {
  const steps = [
    { Icon: Search, title: 'Browse & Select', desc: 'Explore our full collection. Filter by type, color, and occasion.' },
    { Icon: ShoppingBag, title: 'Add to Cart', desc: 'Choose your quantity — single yards or bulk rolls. Cart saves automatically.' },
    { Icon: Gift, title: 'Choose Delivery', desc: 'Opt for home delivery or pickup. Enter your details — no account needed.' },
    { Icon: CheckCircle, title: 'Enjoy Your Fabric', desc: 'We deliver with care. Quality you can see, feel, and trust.' },
  ];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-32 bg-[var(--bg-card)]" ref={ref}>
      <div className="max-w-6xl mx-auto px-10">
        <div className="text-center mb-16">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--gold)] font-semibold mb-4">How It Works</div>
          <h2 className="font-[Playfair_Display] text-[clamp(32px,4vw,52px)] font-bold">Simple. Seamless. Swift.</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-0">
          {steps.map(({ Icon, title, desc }, i) => (
            <React.Fragment key={title}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="flex-1 max-w-[260px] text-center px-6 py-8 group"
              >
                <div className="w-16 h-16 rounded-full border border-[var(--border)] flex items-center justify-center mx-auto mb-5 text-[var(--gold)] bg-[rgba(201,168,76,0.1)] group-hover:border-[rgba(201,168,76,0.4)] group-hover:shadow-[0_0_30px_rgba(201,168,76,0.15)] group-hover:scale-110 transition-all">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold mb-3">{title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
              </motion.div>
              {i < steps.length - 1 && (
                <div className="hidden md:block flex-shrink-0 w-16 h-px bg-gradient-to-r from-[rgba(201,168,76,0.4)] to-transparent mb-10" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== TESTIMONIALS =====
export function Testimonials() {
  const items = [
    { stars: 5, text: "The Ankara I ordered was beyond stunning — rich colors, impeccable quality. LUM NG is my go-to for every owambe!", author: 'Adaeze O., Ilorin' },
    { stars: 5, text: "Ordered Guinea Brocade for my daughter's introduction — top quality and very prompt delivery. Highly satisfied!", author: 'Mrs. Folake B., Kwara' },
    { stars: 5, text: 'The lace collection at LUMNG is world class. I\'ve been a fashion designer for 12 years and I trust no other supplier.', author: 'Emeka T., Abuja' },
    { stars: 5, text: "Got the Alhaji cap and Senator material for my dad — he absolutely loved it! Fast delivery and genuine quality.", author: 'Chioma N., Port Harcourt' },
  ];
  return (
    <section className="py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-10">
        <div className="text-center mb-16">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--gold)] font-semibold mb-4">Testimonials</div>
          <h2 className="font-[Playfair_Display] text-[clamp(32px,4vw,52px)] font-bold">What Our Customers Say</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 scroll-snap-x" style={{ scrollbarWidth: 'none' }}>
          {items.map((t, i) => (
            <div key={i} className="flex-shrink-0 w-[360px] bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-10 hover:border-[rgba(201,168,76,0.3)] transition-all scroll-snap-start">
              <div className="text-[var(--gold)] text-lg mb-4">{'★'.repeat(t.stars)}</div>
              <p className="font-[Cormorant_Garamond] text-[17px] text-[var(--text-dim)] leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="text-[12px] tracking-widest uppercase text-[var(--text-ghost)]">— {t.author}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== CTA BANNER =====
export function CTABanner() {
  return (
    <section className="py-32 text-center relative overflow-hidden" style={{ background: 'linear-gradient(180deg,var(--bg),rgba(40,30,10,0.3),var(--bg))' }}>
      <div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(201,168,76,0.6),transparent)', filter: 'blur(100px)', opacity: 0.18, top: -200, left: '50%', transform: 'translateX(-50%)' }} />
      <div className="relative z-10 max-w-3xl mx-auto px-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-[Playfair_Display] font-black mb-5"
          style={{ fontSize: 'clamp(36px,5vw,64px)' }}
        >
          Ready to Look Classy?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-[18px] text-[var(--text-muted)] mb-12"
        >
          From a single yard to bulk orders — LUM NG has everything to your taste.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link to="/shop" className="inline-flex items-center gap-2 bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] text-black font-semibold uppercase tracking-widest text-[15px] px-12 py-[18px] rounded hover:-translate-y-0.5 transition-all">
            Shop the Collection
          </Link>
          <a href="#contact" className="inline-flex items-center gap-2 border border-[var(--border)] text-[var(--text)] font-medium uppercase tracking-widest text-[15px] px-12 py-[18px] rounded hover:border-[rgba(201,168,76,0.4)] hover:text-[var(--gold-light)] transition-all">
            Contact Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ===== CONTACT =====
export function Contact() {
  const [sent, setSent] = React.useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 4000); };
  return (
    <section id="contact" className="py-32 bg-[var(--bg-card)]">
      <div className="max-w-6xl mx-auto px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-20 items-start">
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--gold)] font-semibold mb-4">Contact</div>
            <h2 className="font-[Playfair_Display] text-[clamp(32px,4vw,52px)] font-bold mb-6">Get In Touch</h2>
            <p className="text-[var(--text-muted)] leading-relaxed mb-8">Have questions about bulk orders or availability? Reach us on WhatsApp or send us an email — we'd love to hear from you.</p>
            <div className="flex flex-col gap-5">
              {[['📞', '+2349074112695'], ['✉️', 'lumngfabrics@gmail.com'], ['📍', 'Ilorin, Kwara State'], ['📱', '@lum_ng on Instagram']].map(([icon, val]) => (
                <div key={val} className="flex items-center gap-4 text-[var(--text-dim)]">{icon} {val}</div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="bg-[var(--bg-3)] border border-[var(--border)] rounded-xl p-12 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-widest uppercase text-[var(--text-muted)]">Full Name</label>
                <input required placeholder="Your name" className="bg-[var(--input-bg)] border border-[var(--border)] rounded px-4 py-3 text-[var(--text)] text-[15px] focus:outline-none focus:border-[rgba(201,168,76,0.4)] placeholder:text-[var(--text-ghost)]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-widest uppercase text-[var(--text-muted)]">Email</label>
                <input type="email" required placeholder="your@email.com" className="bg-[var(--input-bg)] border border-[var(--border)] rounded px-4 py-3 text-[var(--text)] text-[15px] focus:outline-none focus:border-[rgba(201,168,76,0.4)] placeholder:text-[var(--text-ghost)]" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] tracking-widest uppercase text-[var(--text-muted)]">Message</label>
              <textarea rows={5} required placeholder="Tell us about your order or question..." className="bg-[var(--input-bg)] border border-[var(--border)] rounded px-4 py-3 text-[var(--text)] text-[15px] focus:outline-none focus:border-[rgba(201,168,76,0.4)] placeholder:text-[var(--text-ghost)] resize-y" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] text-black font-semibold uppercase tracking-widest text-[13px] py-3.5 rounded hover:-translate-y-0.5 transition-all">
              {sent ? '✓ Message Sent!' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
