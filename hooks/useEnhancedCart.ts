"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { guestCartUtils, getShippingMethods } from '@/lib/guestCartUtils';

export interface CartProduct {
  id: string;
  title: string;
  price: string;
  images: string[];
  stock: number;
  category: string;
}

export interface CartItem {
  qty: any;
  id: any;
  productId: string;
  quantity: number;
  product: CartProduct;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  cost: string;
  estimatedDays: string;
}

export interface GST {
  id: string;
  name: string;
  percentage: string;
  description: string;
}

export interface CartCalculations {
  subtotal: string;
  shippingCost: string;
  gstPercentage: string;
  gstAmount: string;
  grandTotal: string;
  selectedShipping: ShippingOption | null;
  gstDetails: {
    id: string;
    name: string;
    percentage: string;
    description: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface EnhancedCartData {
  success: boolean;
  cart: CartItem[];
  availableShipping: ShippingOption[];
  gst: GST;
  calculations: CartCalculations;
}

export function useEnhancedCart() {
  const [cartData, setCartData] = useState<EnhancedCartData | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track current selection for async operations like setInterval
  const selectedShippingRef = useRef<ShippingOption | null>(null);

  const baseUrl = "https://alpa-be-1.onrender.com";

  // Sync ref with state whenever selectedShipping changes
  useEffect(() => {
    selectedShippingRef.current = selectedShipping;
  }, [selectedShipping]);

  const fetchCartData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const token = localStorage.getItem("token");
      const currentSelectedShipping = selectedShippingRef.current; // Use ref to get latest value

      // Guest mode: load cart from localStorage
      if (!token) {
        const guestItems = guestCartUtils.getGuestCart();
        const { subtotal } = guestCartUtils.calculateGuestCartTotals(guestItems);
        
        // Map guest items to CartItem format
        const cartItems: CartItem[] = guestItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          qty: item.quantity, // Legacy field
          id: item.productId, // Legacy field
          product: item.product,
        }));
        
        // Fetch real shipping methods from backend
        const availableShipping = await getShippingMethods();
        
        // Create guest cart data structure
        const guestCartData: EnhancedCartData = {
          success: true,
          cart: cartItems,
          availableShipping: availableShipping,
          gst: {
            id: 'default_gst',
            name: 'GST',
            percentage: '10',
            description: 'Goods and Services Tax',
          },
          calculations: {
            subtotal: subtotal.toString(),
            shippingCost: '0',
            gstPercentage: '10',
            gstAmount: '0',
            grandTotal: subtotal.toString(),
            selectedShipping: null,
            gstDetails: {
              id: '1',
              name: 'GST',
              percentage: '10',
              description: 'Goods and Services Tax',
              isActive: true,
              isDefault: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        };
        
        setCartData(guestCartData);
        
        // Set default shipping
        if (!currentSelectedShipping && guestCartData.availableShipping.length > 0) {
          setSelectedShipping(guestCartData.availableShipping[0]);
        }
        
        setError(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Authenticated mode: fetch from API
      const response = await fetch(`${baseUrl}/api/cart/my-cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EnhancedCartData = await response.json();
      setCartData(data);
      
      // Set shipping method priority:
      // 1. Currently selected in UI (ref)
      // 2. Saved in backend (data.calculations.selectedShipping)
      // 3. Default "General" shipping
      
      if (!currentSelectedShipping) {
        if (data.calculations.selectedShipping) {
           setSelectedShipping(data.calculations.selectedShipping);
        } else if (data.availableShipping.length > 0) {
           const generalShipping = data.availableShipping.find(
             ship => ship.name.toLowerCase().includes('general')
           ) || data.availableShipping[0];
           setSelectedShipping(generalShipping);
        }
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cart data");
      console.error("Error fetching cart data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Calculate real-time totals based on selected shipping
  const calculateTotals = () => {
    // If we have cartData but no selectedShipping yet, use the one from cartData if available
    let currentShipping = selectedShipping;
    if (!currentShipping && cartData?.calculations?.selectedShipping) {
      currentShipping = cartData.calculations.selectedShipping;
    }
    
    if (!cartData || !currentShipping) {
      return {
        subtotal: 0,
        shippingCost: 0,
        gstAmount: 0,
        grandTotal: 0,
        gstPercentage: 10, // Default GST
      };
    }

    const subtotal = parseFloat(cartData.calculations.subtotal || '0');
    const shippingCost = parseFloat(currentShipping.cost || '0');
    const gstPercentage = parseFloat(cartData.calculations.gstPercentage || '10');
    
    // Calculate GST on subtotal + shipping
    const taxableAmount = subtotal + shippingCost;
    const gstAmount = (taxableAmount * gstPercentage) / 100;
    const grandTotal = taxableAmount + gstAmount;

    return {
      subtotal,
      shippingCost,
      gstAmount,
      grandTotal,
      gstPercentage,
    };
  };

  // Update quantity
  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      const token = localStorage.getItem("token");
      
      // Guest mode: update in localStorage
      if (!token) {
        guestCartUtils.updateGuestCartItem(productId, newQuantity);
        await fetchCartData(true);
        return;
      }

      // Authenticated mode: update via API
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        const response = await fetch(`${baseUrl}/api/cart/remove/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to remove item");
      } else {
        // Update quantity
        const response = await fetch(`${baseUrl}/api/cart/update`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity: newQuantity,
          }),
        });

        if (!response.ok) throw new Error("Failed to update quantity");
      }

      // Refresh cart data
      await fetchCartData(true);
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError(err instanceof Error ? err.message : "Failed to update quantity");
    }
  };

  // Remove item from cart
  const removeItem = async (productId: string) => {
    try {
      const token = localStorage.getItem("token");
      
      // Guest mode: remove from localStorage
      if (!token) {
        guestCartUtils.removeFromGuestCart(productId);
        await fetchCartData(true);
        return;
      }

      // Authenticated mode: remove via API
      const response = await fetch(`${baseUrl}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to remove item");

      // Refresh cart data
      await fetchCartData(true);
    } catch (err) {
      console.error("Error removing item:", err);
      setError(err instanceof Error ? err.message : "Failed to remove item");
    }
  };

  useEffect(() => {
    fetchCartData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchCartData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Refetch when shipping changes to get updated calculations
  useEffect(() => {
    if (selectedShipping) {
      // You can add an API call here to update shipping selection on backend if needed
    }
  }, [selectedShipping]);

  // OPTIMISTIC UPDATES
  const optimisticAddItem = (newItem: CartProduct, quantity: number) => {
    setCartData(prev => {
      if (!prev) return prev;
      
      const existingItemIndex = prev.cart.findIndex(item => item.productId === newItem.id);
      
      let newCart = [...prev.cart];
      if (existingItemIndex >= 0) {
        // Update existing
        const existing = newCart[existingItemIndex];
        const newQty = (existing.quantity || 0) + quantity;
        newCart[existingItemIndex] = {
          ...existing,
          quantity: newQty,
          qty: newQty
        };
      } else {
        // Add new
        newCart.push({
          id: newItem.id,
          productId: newItem.id,
          quantity: quantity,
          qty: quantity,
          product: newItem
        });
      }
      
      return {
        ...prev,
        cart: newCart
      };
    });
  };

  const optimisticUpdateItem = (productId: string, quantity: number) => {
    setCartData(prev => {
      if (!prev) return prev;
      
      const newCart = prev.cart.map(item => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity: quantity,
            qty: quantity
          };
        }
        return item;
      });

      return {
        ...prev,
        cart: newCart
      };
    });
  };

  const optimisticRemoveItem = (productId: string) => {
    setCartData(prev => {
      if (!prev) return prev;
      const newCart = prev.cart.filter(item => item.productId !== productId);
      return {
        ...prev,
        cart: newCart
      };
    });
  };

  return {
    cartData,
    selectedShipping,
    setSelectedShipping,
    loading,
    refreshing,
    error,
    fetchCartData,
    calculateTotals: calculateTotals(),
    updateQuantity,
    removeItem,
    optimisticAddItem,
    optimisticUpdateItem,
    optimisticRemoveItem
  };
}