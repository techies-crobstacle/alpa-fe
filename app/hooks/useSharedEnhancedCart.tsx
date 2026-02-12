"use client";

import { createContext, useContext, useCallback, useRef, useState } from 'react';
import { useEnhancedCart } from './useEnhancedCart';

type SharedCartContextType = ReturnType<typeof useEnhancedCart> & {
  subscribeToUpdates: (callback: () => void) => () => void;
  triggerUpdate: () => void;
  addToCart: (productId: string, productData: { title: string, price: string, images: string[] }) => Promise<void>;
};

const EnhancedCartContext = createContext<SharedCartContextType | null>(null);

export function EnhancedCartProvider({ children }: { children: React.ReactNode }) {
  const cartData = useEnhancedCart();
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  // Create refs to store update functions so we can trigger updates across components
  const updateCallbacks = useRef<Set<() => void>>(new Set());
  
  // Function to trigger updates across all subscribed components
  const triggerUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
    updateCallbacks.current.forEach(callback => {
      try {
        callback();
      } catch (err) {
        console.error('Error triggering cart update:', err);
      }
    });
  }, []);

  // Enhanced add to cart function that notifies all components
  const enhancedAddToCart = useCallback(async (productId: string, productData: { title: string, price: string, images: string[] }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      const response = await fetch("https://alpa-be-1.onrender.com/api/cart/add", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");
      
      // Small delay to ensure backend is updated before triggering refresh
      setTimeout(() => {
        triggerUpdate();
      }, 100);
      
    } catch (error) {
      console.error('Enhanced add to cart error:', error);
      throw error;
    }
  }, [triggerUpdate]);

  // Enhanced update function that notifies all components
  const enhancedUpdateQuantity = useCallback(async (productId: string, newQuantity: number) => {
    try {
      const result = await cartData.updateQuantity(productId, newQuantity);
      
      // Small delay to ensure backend is updated before triggering refresh
      setTimeout(() => {
        triggerUpdate();
      }, 100);
      
      return result;
    } catch (error) {
      console.error('Enhanced update quantity error:', error);
      throw error;
    }
  }, [cartData.updateQuantity, triggerUpdate]);

  // Enhanced remove function that notifies all components
  const enhancedRemoveItem = useCallback(async (productId: string) => {
    try {
      const result = await cartData.removeItem(productId);
      
      // Small delay to ensure backend is updated before triggering refresh
      setTimeout(() => {
        triggerUpdate();
      }, 100);
      
      return result;
    } catch (error) {
      console.error('Enhanced remove item error:', error);
      throw error;
    }
  }, [cartData.removeItem, triggerUpdate]);

  // Enhanced fetch function that notifies all components
  const enhancedFetchCartData = useCallback(async (isRefresh?: boolean) => {
    try {
      const result = await cartData.fetchCartData(isRefresh);
      
      setTimeout(() => {
        triggerUpdate();
      }, 100);
      
      return result;
    } catch (error) {
      console.error('Enhanced fetch cart data error:', error);
      throw error;
    }
  }, [cartData.fetchCartData, triggerUpdate]);

  // Function to subscribe to cart updates
  const subscribeToUpdates = useCallback((callback: () => void) => {
    updateCallbacks.current.add(callback);
    
    // Return unsubscribe function
    return () => {
      updateCallbacks.current.delete(callback);
    };
  }, []);

  const contextValue: SharedCartContextType = {
    ...cartData,
    updateQuantity: enhancedUpdateQuantity,
    removeItem: enhancedRemoveItem,
    fetchCartData: enhancedFetchCartData,
    subscribeToUpdates,
    triggerUpdate,
    addToCart: enhancedAddToCart,
  };

  return (
    <EnhancedCartContext.Provider value={contextValue}>
      {children}
    </EnhancedCartContext.Provider>
  );
}

export function useSharedEnhancedCart() {
  const context = useContext(EnhancedCartContext);
  if (!context) {
    throw new Error('useSharedEnhancedCart must be used within an EnhancedCartProvider');
  }
  return context;
}