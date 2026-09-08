import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState({}); // { [menuItemId]: { menuItem, quantity } }

  const addItem = (menuItem) => {
    setItems((prev) => {
      const existing = prev[menuItem.id];
      if (existing) {
        return { ...prev, [menuItem.id]: { ...existing, quantity: existing.quantity + 1 } };
      }
      return { ...prev, [menuItem.id]: { menuItem, quantity: 1 } };
    });
  };

  const removeItem = (menuItemId) => {
    setItems((prev) => {
      const existing = prev[menuItemId];
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return { ...prev, [menuItemId]: { ...existing, quantity: existing.quantity - 1 } };
      }
      const next = { ...prev };
      delete next[menuItemId];
      return next;
    });
  };

  const deleteItem = (menuItemId) => {
    setItems((prev) => {
      const next = { ...prev };
      delete next[menuItemId];
      return next;
    });
  };

  const getCartItems = () => Object.values(items);

  const getItemCount = () =>
    Object.values(items).reduce((sum, i) => sum + i.quantity, 0);

  const getSubtotal = () =>
    Object.values(items).reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);

  const getTax = () => getSubtotal() * 0.05;

  const getDeliveryFee = () => (Object.keys(items).length > 0 ? 40 : 0);

  const getTotal = () => getSubtotal() + getTax() + getDeliveryFee();

  const clear = () => setItems({});

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        deleteItem,
        getCartItems,
        getItemCount,
        getSubtotal,
        getTax,
        getDeliveryFee,
        getTotal,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
