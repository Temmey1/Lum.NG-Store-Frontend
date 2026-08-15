import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/landing/Hero';
import { Marquee, About, FabricsShowcase, Process, Testimonials, CTABanner, Contact } from '../components/landing/Sections';
import CartDrawer from '../components/shop/CartDrawer';
import ProductModal from '../components/shop/ProductModal';
import CheckoutModal from '../components/checkout/CheckoutModal';
import AiChatWidget from '../components/ai/AiChatWidget';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <Hero />
      <Marquee />
      <About />
      <FabricsShowcase />
      <Process />
      <Testimonials />
      <CTABanner />
      <Contact />
      <Footer />
      <CartDrawer />
      <ProductModal />
      <CheckoutModal />
      <AiChatWidget />
    </div>
  );
}
