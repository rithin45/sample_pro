import { createContext, useContext, useReducer, useEffect } from "react";
import { cartService } from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

// Coupon validation rules
const COUPONS = {
  SAVE10: {
    type: "percentage",
    value: 10,
    minAmount: 0,
    description: "10% discount"
  },
  FLAT100: {
    type: "flat",
    value: 100,
    minAmount: 500,
    description: "₹100 off (min ₹500)"
  }
};

// Helper function to validate coupon based on subtotal
const validateCoupon = (coupon, subtotal) => {
  if (!coupon) return null;
  
  const couponData = COUPONS[coupon.code];
  if (!couponData) return null;
  
  // If subtotal falls below minimum, coupon is invalid
  if (subtotal < couponData.minAmount) {
    return null;
  }
  
  return coupon;
};

const cartReducer = (state, action) => {
  switch (action.type) {

    case "SET_CART_ITEMS":
      return {
        ...state,
        items: action.payload,
        loading: false
      };

    case "ADD_TO_CART": {
      const item = action.payload;

      const existingItem = state.items.find(
        i =>
          i.id === item.id &&
          i.color === item.color &&
          i.size === item.size
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(i =>
            i === existingItem
              ? {
                  ...i,
                  quantity: Math.min(i.quantity + item.quantity, i.maxStock)
                }
              : i
          )
        };
      }

      return {
        ...state,
        items: [...state.items, { ...item }]
      };
    }

    case "INCREASE_QTY":
      return {
        ...state,
        items: state.items.map((item, index) =>
          index === action.payload
            ? { ...item, quantity: Math.min(item.quantity + 1, item.maxStock) }
            : item
        )
      };

    case "DECREASE_QTY": {
      const newItems = state.items
        .map((item, index) =>
          index === action.payload
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0);
      
      // Validate coupon after quantity change
      const newSubtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const validCoupon = validateCoupon(state.coupon, newSubtotal);

      return {
        ...state,
        items: newItems,
        coupon: validCoupon,
        couponError: validCoupon ? null : (state.coupon && newSubtotal < COUPONS[state.coupon.code]?.minAmount ? `Coupon removed: Minimum purchase of ₹${COUPONS[state.coupon.code]?.minAmount} required` : null)
      };
    }

    case "REMOVE_FROM_CART": {
      const newItems = state.items.filter((_, index) => index !== action.payload);
      
      // Validate coupon after item removal
      const newSubtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const validCoupon = validateCoupon(state.coupon, newSubtotal);

      return {
        ...state,
        items: newItems,
        coupon: validCoupon,
        couponError: validCoupon ? null : (state.coupon && newSubtotal < COUPONS[state.coupon.code]?.minAmount ? `Coupon removed: Minimum purchase of ₹${COUPONS[state.coupon.code]?.minAmount} required` : null)
      };
    }

    case "APPLY_COUPON": {
      const couponCode = action.payload.toUpperCase();
      const coupon = COUPONS[couponCode];

      if (!coupon) {
        return {
          ...state,
          coupon: null,
          couponError: "Invalid coupon code"
        };
      }

      const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      if (subtotal < coupon.minAmount) {
        return {
          ...state,
          coupon: null,
          couponError: `Minimum purchase of ₹${coupon.minAmount} required`
        };
      }

      return {
        ...state,
        coupon: { code: couponCode, ...coupon },
        couponError: null
      };
    }

    case "REMOVE_COUPON":
      return {
        ...state,
        coupon: null,
        couponError: null
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        coupon: null,
        couponError: null
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;

  }
  
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartState, dispatch] = useReducer(cartReducer, {
    items: [],
    coupon: null,
    couponError: null,
    loading: false,
    error: null
  });

  // Fetch cart from backend when user logs in
  useEffect(() => {
    if (user) {
      fetchCartFromBackend();
    } else {
      dispatch({ type: "CLEAR_CART" });
    }
  }, [user]);

  const fetchCartFromBackend = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const data = await cartService.getCart();
      // Handle both wrapped and unwrapped responses
      const cartData = data.cart || data;
      const items = cartData?.items || [];
      dispatch({ type: "SET_CART_ITEMS", payload: items });
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const addToCartBackend = async (itemData) => {
    try {
      dispatch({ type: "SET_ERROR", payload: null });
      const data = await cartService.addToCart(itemData);
      
      // Handle both wrapped ({cart: {...}}) and unwrapped responses
      const cartData = data.cart || data;
      const items = Array.isArray(cartData.items) ? cartData.items : [];
      
      if (items && items.length >= 0) {
        dispatch({ type: "SET_CART_ITEMS", payload: items });
        return true;
      } else {
        throw new Error("Invalid cart response format");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to add item to cart";
      dispatch({ type: "SET_ERROR", payload: errorMsg });
      console.error("Error adding to cart:", err);
      return false;
    }
  };

  const removeFromCartBackend = async (itemId) => {
    try {
      dispatch({ type: "SET_ERROR", payload: null });
      const data = await cartService.removeFromCart(itemId);
      const cartData = data.cart || data;
      const items = cartData.items || [];
      dispatch({ type: "SET_CART_ITEMS", payload: items });
      
      // Revalidate coupon after removing item
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const validCoupon = validateCoupon(cartState.coupon, subtotal);
      if (!validCoupon && cartState.coupon) {
        dispatch({ type: "REMOVE_COUPON" });
      }
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to remove item from cart";
      dispatch({ type: "SET_ERROR", payload: errorMsg });
      console.error("Error removing from cart:", err);
      return false;
    }
  };

  const updateQuantityBackend = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCartBackend(itemId);
    }

    try {
      dispatch({ type: "SET_ERROR", payload: null });
      const data = await cartService.updateCartItem(itemId, quantity);
      const cartData = data.cart || data;
      const items = cartData.items || [];
      dispatch({ type: "SET_CART_ITEMS", payload: items });
      
      // Revalidate coupon after updating quantity
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const validCoupon = validateCoupon(cartState.coupon, subtotal);
      if (!validCoupon && cartState.coupon) {
        dispatch({ type: "REMOVE_COUPON" });
      }
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update cart item";
      dispatch({ type: "SET_ERROR", payload: errorMsg });
      console.error("Error updating cart:", err);
      return false;
    }
  };

  const clearCartBackend = async () => {
    try {
      dispatch({ type: "SET_ERROR", payload: null });
      await cartService.clearCart();
      dispatch({ type: "CLEAR_CART" });
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to clear cart";
      dispatch({ type: "SET_ERROR", payload: errorMsg });
      console.error("Error clearing cart:", err);
      return false;
    }
  };

  const handleAddToCart = async (item) => {
    if (user) {
      // If user is logged in, sync with backend and return result
      return await addToCartBackend(item);
    } else {
      // If not logged in, add to local state
      dispatch({ type: "ADD_TO_CART", payload: item });
      return true;
    }
  };

  const handleRemoveFromCart = (itemId) => {
    if (user) {
      removeFromCartBackend(itemId);
    } else {
      dispatch({ type: "REMOVE_FROM_CART", payload: itemId });
    }
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (user) {
      updateQuantityBackend(itemId, quantity);
    } else {
      if (quantity <= 0) {
        dispatch({ type: "REMOVE_FROM_CART", payload: itemId });
      } else {
        dispatch({ type: "INCREASE_QTY", payload: itemId });
      }
    }
  };

  const handleClearCart = () => {
    if (user) {
      clearCartBackend();
    } else {
      dispatch({ type: "CLEAR_CART" });
    }
  };

  const getTotalPrice = () => {
    return cartState.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartState.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart: cartState.items, 
        dispatch, 
        coupon: cartState.coupon, 
        couponError: cartState.couponError,
        loading: cartState.loading,
        error: cartState.error,
        // Backend methods
        addToCart: handleAddToCart,
        removeFromCart: handleRemoveFromCart,
        updateQuantity: handleUpdateQuantity,
        clearCart: handleClearCart,
        getTotalPrice,
        getTotalItems,
        // Direct dispatch for local storage when not logged in
        dispatchCart: dispatch
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
