import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/index';
import { useCartStore, useProductsStore } from '../store';
import toast from 'react-hot-toast';

// ─── Session ID ──────────────────────────────────────────────
// Stable browser-level UUID that persists across page loads.
// Lives in localStorage so it survives refreshes but not device changes.
function getOrCreateSessionId(): string {
  let id = localStorage.getItem('lumng_session_id');
  if (!id) {
    id = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('lumng_session_id', id);
  }
  return id;
}

export function getSessionId(): string {
  return getOrCreateSessionId();
}

// ─── Build cart snapshot for the API ────────────────────────
function buildSnapshot(items: { id: number; qty: number }[]) {
  const products = useProductsStore.getState().products;
  return items.map(item => {
    const p = products.find(p => p.id === item.id);
    if (!p) return null;
    const isBulk = item.qty >= (p.bulkMin || Infinity);
    const price  = isBulk ? (p.bulkPrice ?? p.price) : p.price;
    return {
      id:      p.id,
      qty:     item.qty,
      name:    p.name,
      price,
      unit:    p.unit,
      pattern: p.pattern,
    };
  }).filter(Boolean);
}

// ─── Hook ───────────────────────────────────────────────────
export function useCartRecovery() {
  const { items, addItem, clearCart } = useCartStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const syncTimer = useRef<number | null>(null);
  const sessionId = getOrCreateSessionId();

  // ── Restore cart from recovery link ─────────────────────
  useEffect(() => {
    const token = searchParams.get('restore');
    if (!token) return;

    api.get(`/cart-recovery/restore/${token}`)
      .then(({ data }) => {
        if (!data.success || !data.items?.length) return;

        clearCart();
        (data.items as any[]).forEach(item => {
          if (item.id && item.qty) addItem(item.id, item.qty);
        });

        toast.success('Your cart has been restored! 🛍', {
          duration: 5000,
          style: {
            background: 'var(--bg-card, #111)',
            color: 'var(--text, #fff)',
            border: '1px solid var(--gold-dim, rgba(201,168,76,0.3))',
          },
        });

        // Remove the token from the URL cleanly
        searchParams.delete('restore');
        setSearchParams(searchParams, { replace: true });
      })
      .catch(() => {/* silent — token may be expired or already used */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Debounced sync to backend on every cart change ───────
  useEffect(() => {
    if (syncTimer.current) window.clearTimeout(syncTimer.current);

    syncTimer.current = window.setTimeout(() => {
      const snapshot = buildSnapshot(items);
      const cartTotal = snapshot.reduce(
        (sum, i: any) => sum + (i?.price ?? 0) * (i?.qty ?? 0), 0
      );

      api.post('/cart-recovery/sync', {
        sessionId,
        items: snapshot,
        cartTotal,
      }).catch(() => {/* non-critical — silent */});
    }, 3000); // debounce: wait 3 s after last cart change before syncing

    return () => {
      if (syncTimer.current) window.clearTimeout(syncTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // ── Attach email when customer fills in checkout step 1 ──
  const attachEmail = useCallback((email: string, name: string) => {
    api.post('/cart-recovery/attach-email', { sessionId, email, name })
      .catch(() => {});
  }, [sessionId]);

  // ── Mark cart recovered once order is placed ─────────────
  const markRecovered = useCallback(() => {
    api.post('/cart-recovery/recovered', { sessionId })
      .catch(() => {});
  }, [sessionId]);

  return { attachEmail, markRecovered, sessionId };
}
