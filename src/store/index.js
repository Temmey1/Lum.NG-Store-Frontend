import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_PRODUCTS } from '../data/products';
import { productsApi } from '../api/index';

// ===== PRODUCTS STORE (live data from the backend) =====
// Seeds with the static DEFAULT_PRODUCTS so the UI has something to render
// on first paint / while offline, then replaces it with real data from the
// API as soon as it loads. This is the single source of truth for product
// data across the storefront — cart pricing, checkout, and the shop page
// all read from here instead of the static file.
export const useProductsStore = create((set, get) => ({
  products: DEFAULT_PRODUCTS,
  loaded: false,
  loading: false,
  error: null,

  fetchProducts: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const { data } = await productsApi.getAll();
      set({ products: data.products ?? [], loaded: true, loading: false });
    } catch (err) {
      // Keep the static fallback list on screen if the API is unreachable
      set({ loading: false, error: err.message || 'Failed to load products' });
    }
  },

  getProduct: (id) => get().products.find(p => p.id === id),
}));

// ===== CART STORE (persisted to localStorage) =====
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId, qty = 1) => {
        const items = get().items;
        const existing = items.find(i => i.id === productId);
        if (existing) {
          set({ items: items.map(i => i.id === productId ? { ...i, qty: i.qty + qty } : i) });
        } else {
          set({ items: [...items, { id: productId, qty }] });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter(i => i.id !== productId) }),

      updateQty: (productId, qty) => {
        if (qty <= 0) return get().removeItem(productId);
        set({ items: get().items.map(i => i.id === productId ? { ...i, qty } : i) });
      },

      clearCart: () => set({ items: [] }),

      // computed helpers (call as functions: useCartStore.getState().cartCount())
      cartCount: () => get().items.reduce((s, i) => s + i.qty, 0),
      cartTotal: () => get().items.reduce((sum, item) => {
        const p = useProductsStore.getState().getProduct(item.id);
        if (!p) return sum;
        const price = (item.qty >= (p.bulkMin || Infinity)) ? p.bulkPrice : p.price;
        return sum + price * item.qty;
      }, 0),
    }),
    { name: 'lumng_cart' }
  )
);

// ===== SESSION STORE (persisted to sessionStorage) =====
export const useSessionStore = create(
  persist(
    (set) => ({
      customer: null,
      deliveryMode: 'delivery',

      setCustomer: (data) => set({ customer: data }),
      setDeliveryMode: (mode) => set({ deliveryMode: mode }),
      clearSession: () => set({ customer: null, deliveryMode: 'delivery' }),
    }),
    { name: 'lumng_session', storage: createJSONStorage(() => sessionStorage) }
  )
);

// ===== UI STORE (ephemeral — no persistence) =====
export const useUIStore = create((set) => ({
  cartOpen: false,
  mobileNavOpen: false,
  modalProduct: null,
  checkoutOpen: false,

  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set(s => ({ cartOpen: !s.cartOpen })),

  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),

  openModal: (product) => set({ modalProduct: product }),
  closeModal: () => set({ modalProduct: null }),

  openCheckout: () => set({ checkoutOpen: true, cartOpen: false }),
  closeCheckout: () => set({ checkoutOpen: false }),
}));

// ===== THEME STORE (persisted to localStorage) =====
const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // default: dark

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
      },

      initTheme: () => {
        applyTheme(get().theme);
      },
    }),
    { name: 'lumng_theme' }
  )
);


/* NOTE: product, order, and site-content management used to live here in a
 * local-only `useAdminStore` (localStorage/Zustand, never touching the real
 * backend). That store has been removed — it's been replaced by the
 * standalone `admin` app, a separate deployable frontend that talks directly
 * to the NestJS API (real JWT auth, Postgres-backed products/orders, and the
 * `settings` table for site copy). See /admin in the monorepo root.
 */
