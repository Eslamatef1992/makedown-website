import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'md_cart_items_v1';

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function lineKey(item) {
  return `${item.productId}::${item.variantId ?? 'base'}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable — cart just won't persist across reloads
    }
  }, [items]);

  // item: { productId, variantId, name, image, price, variantLabel, quantity, maxQuantity }
  const addItem = useCallback((item) => {
    setItems((prev) => {
      const key = lineKey(item);
      const existing = prev.find((it) => lineKey(it) === key);
      if (existing) {
        const nextQty = existing.quantity + (item.quantity || 1);
        return prev.map((it) =>
          lineKey(it) === key
            ? { ...it, quantity: item.maxQuantity ? Math.min(nextQty, item.maxQuantity) : nextQty }
            : it
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const removeItem = useCallback((productId, variantId) => {
    setItems((prev) => prev.filter((it) => lineKey(it) !== lineKey({ productId, variantId })));
  }, []);

  const updateQuantity = useCallback((productId, variantId, quantity) => {
    setItems((prev) =>
      prev
        .map((it) =>
          lineKey(it) === lineKey({ productId, variantId })
            ? { ...it, quantity: Math.max(1, Math.min(quantity, it.maxQuantity || 999)) }
            : it
        )
        .filter((it) => it.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(() => items.reduce((sum, it) => sum + it.quantity, 0), [items]);
  const subtotal = useMemo(
    () => Math.round(items.reduce((sum, it) => sum + Number(it.price) * it.quantity, 0) * 1000) / 1000,
    [items]
  );

  const value = { items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
