import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { productsApi } from '../api/index';

// ===== PRODUCTS STORE (live data from the backend — no mock/static data) =====
// Starts empty. The UI shows an explicit loading state (see `loaded`/`loading`
// below) until real data arrives — it never falls back to fake products, so
// there's no risk of a customer seeing placeholder data mistaken for real
// inventory, and no stale-snapshot bugs from a "seed" array silently existing
// in the codebase. This is the single source of truth for product data
// across the storefront — cart pricing, checkout, and the shop page all read
// from here.
export const useProductsStore = create((set, get) => ({
  products: [],
  categories: [],
  loaded: false,
  categoriesLoaded: false,
  loading: false,
  error: null,

  fetchProducts: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const { data } = await productsApi.getAll();
      set({ products: data.products ?? [], loaded: true, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message || 'Failed to load products' });
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await productsApi.getCategories();
      set({ categories: data.categories ?? [], categoriesLoaded: true });
    } catch {
      set({ categoriesLoaded: true });
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
  modalProductId: null,
  checkoutOpen: false,

  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set(s => ({ cartOpen: !s.cartOpen })),

  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),

  // Takes a product ID (not the object) so the modal always re-derives the
  // freshest product data from useProductsStore on every render, instead of
  // freezing whatever object existed at the moment of the click. Previously,
  // clicking a product before fetchProducts() resolved (e.g. during a slow
  // Render cold-start) could permanently show stale/placeholder data even
  // after the real data loaded, since the old object reference never updated.
  openModal: (productId) => set({ modalProductId: productId }),
  closeModal: () => set({ modalProductId: null }),

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
