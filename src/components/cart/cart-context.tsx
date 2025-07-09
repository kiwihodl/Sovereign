'use client';

import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

const initialState = {
  isOpen: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return <CartContext.Provider value={{ ...state, dispatch }}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
