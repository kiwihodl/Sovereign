'use client';

import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { getCart } from '@/lib/shopify';

const CartContext = createContext(null);

const initialState = {
  isOpen: false,
  cart: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const fetchCart = useCallback(async () => {
    const cartId = Cookies.get('cartId');
    console.log('Fetching cart with cartId:', cartId);
    if (cartId) {
      try {
        const cartData = await getCart(cartId);
        console.log('Cart data fetched:', cartData);
        dispatch({ type: 'SET_CART', payload: cartData });
      } catch (e) {
        console.error('Error fetching cart:', e);
      }
    } else {
      // Clear cart if no cartId
      console.log('No cartId found, clearing cart');
      dispatch({ type: 'SET_CART', payload: null });
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ ...state, dispatch, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
