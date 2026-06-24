"use client";

import { useCallback, useEffect, useState } from "react";
import type { CartItem } from "@/types";

/** Hook do carrinho — persiste por loja no localStorage */
export function useCart(storeSlug: string) {
  const key = `agury_cart_${storeSlug}`;
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setItems(JSON.parse(saved));
    } catch { /* ignore */ }
    setLoaded(true);
  }, [key]);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(key, JSON.stringify(next));
  }, [key]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      let next: CartItem[];
      if (existing) {
        next = prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + qty, i.maxStock) }
            : i
        );
      } else {
        next = [...prev, { ...item, quantity: Math.min(qty, item.maxStock) }];
      }
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  const updateQty = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const next = quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => i.productId === productId ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i);
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return { items, addItem, removeItem, updateQty, clear, total, count, loaded };
}
