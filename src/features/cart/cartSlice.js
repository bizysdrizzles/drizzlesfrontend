import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import cartService from '../../services/cartService';
import { getErrorMessage } from '../../services/api';

// Init session ID
const initSessionId = () => {
  let id = localStorage.getItem('sessionId');
  if (!id) { id = uuidv4(); localStorage.setItem('sessionId', id); }
  return id;
};

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await cartService.getCart();
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity }, { dispatch, getState, rejectWithValue }) => {
  const prevItems = getState().cart.items;
  dispatch(optimisticAdd({ productId, quantity }));
  try {
    const res = await cartService.addToCart(productId, quantity);
    return res.data.data || res.data;
  } catch (err) {
    dispatch(setItems(prevItems));
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { dispatch, getState, rejectWithValue }) => {
  const prevItems = getState().cart.items;
  dispatch(optimisticUpdate({ productId, quantity }));
  try {
    const res = await cartService.updateCartItem(productId, quantity);
    return res.data.data || res.data;
  } catch (err) {
    dispatch(setItems(prevItems));
    return rejectWithValue(getErrorMessage(err));
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { dispatch, getState, rejectWithValue }) => {
  const prevItems = getState().cart.items;
  dispatch(optimisticRemove(productId));
  try {
    const res = await cartService.removeFromCart(productId);
    return res.data.data || res.data;
  } catch (err) {
    dispatch(setItems(prevItems));
    return rejectWithValue(getErrorMessage(err));
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await cartService.clearCart();
    return [];
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const mergeCart = createAsyncThunk('cart/merge', async (sessionId, { dispatch, rejectWithValue }) => {
  try {
    await cartService.mergeCart(sessionId);
    dispatch(fetchCart());
    localStorage.removeItem('sessionId');
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

const getItemPrice = (item) =>
  Number(item.price) || Number(item.product?.price) || 0;

const calcTotals = (items) => {
  const totalItems = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const subtotal = items.reduce((sum, i) => sum + (getItemPrice(i) * (Number(i.quantity) || 0)), 0);
  return { totalItems, subtotal };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalItems: 0,
    subtotal: 0,
    sessionId: initSessionId(),
    loading: false,
    error: null,
  },
  reducers: {
    optimisticAdd: (state, action) => {
      const { productId, quantity } = action.payload;
      const existing = state.items.find((i) => i.product === productId || i.productId === productId);
      if (existing) { existing.quantity += quantity; }
      else { state.items.push({ product: productId, quantity, price: 0 }); }
      const totals = calcTotals(state.items);
      state.totalItems = totals.totalItems;
      state.subtotal = totals.subtotal;
    },
    optimisticUpdate: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product === productId || i.productId === productId);
      if (item) {
        if (quantity === 0) {
          state.items = state.items.filter((i) => i.product !== productId && i.productId !== productId);
        } else { item.quantity = quantity; }
      }
      const totals = calcTotals(state.items);
      state.totalItems = totals.totalItems;
      state.subtotal = totals.subtotal;
    },
    optimisticRemove: (state, action) => {
      state.items = state.items.filter((i) => i.product !== action.payload && i.productId !== action.payload);
      const totals = calcTotals(state.items);
      state.totalItems = totals.totalItems;
      state.subtotal = totals.subtotal;
    },
    setItems: (state, action) => {
      state.items = action.payload;
      const totals = calcTotals(state.items);
      state.totalItems = totals.totalItems;
      state.subtotal = totals.subtotal;
    },
    resetCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const syncCart = (state, action) => {
      if (!action.payload) return;
      const cart = action.payload;
      state.items = cart.items || cart.cartItems || [];
      const totals = calcTotals(state.items);
      state.totalItems = totals.totalItems;
      state.subtotal = cart.subtotal || totals.subtotal;
      state.loading = false;
    };

    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, syncCart)
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(addToCart.fulfilled, syncCart)
      .addCase(addToCart.rejected, (state, action) => { state.error = action.payload; })

      .addCase(updateCartItem.fulfilled, syncCart)
      .addCase(updateCartItem.rejected, (state, action) => { state.error = action.payload; })

      .addCase(removeFromCart.fulfilled, syncCart)
      .addCase(removeFromCart.rejected, (state, action) => { state.error = action.payload; })

      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totalItems = 0;
        state.subtotal = 0;
      });
  },
});

export const {
  optimisticAdd, optimisticUpdate, optimisticRemove,
  setItems, resetCart, clearError,
} = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.totalItems;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectSessionId = (state) => state.cart.sessionId;

export default cartSlice.reducer;
