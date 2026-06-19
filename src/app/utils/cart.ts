export interface CartItem {
  dishId: string;
  quantity: number;
}

export const CART_STORAGE_KEY = 'foodkitchen-order-cart';
export const CART_CHANGED_EVENT = 'foodkitchen-cart-changed';

export const normalizeCartItems = (items: CartItem[]) => {
  const merged = new Map<string, number>();

  items.forEach((item) => {
    if (!item?.dishId) return;
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    merged.set(item.dishId, (merged.get(item.dishId) || 0) + quantity);
  });

  return Array.from(merged.entries()).map(([dishId, quantity]) => ({
    dishId,
    quantity,
  }));
};

export const addCartItem = (items: CartItem[], dishId: string, quantity = 1) => {
  const normalizedQuantity = Number(quantity);
  if (!dishId || !Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
    return normalizeCartItems(items);
  }

  return normalizeCartItems([
    ...items,
    {
      dishId,
      quantity: normalizedQuantity,
    },
  ]);
};

export const updateCartItemQuantity = (items: CartItem[], dishId: string, quantity: number) => {
  if (!dishId || !Number.isFinite(quantity)) {
    return normalizeCartItems(items);
  }

  if (quantity <= 0) {
    return items.filter((item) => item.dishId !== dishId);
  }

  return normalizeCartItems(
    items.map((item) => (item.dishId === dishId ? { ...item, quantity } : item)),
  );
};

export const removeCartItem = (items: CartItem[], dishId: string) =>
  items.filter((item) => item.dishId !== dishId);

export const flattenCartItemIds = (items: CartItem[]) =>
  items.flatMap((item) => Array.from({ length: item.quantity }, () => item.dishId));

export const persistCartItems = (items: CartItem[]) => {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeCartItems(items)));
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
};
