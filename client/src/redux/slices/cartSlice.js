// src/redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../helpers/api';

/* -------------------------
   Thunks (unchanged endpoints)
   ------------------------- */

// GET /cart
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || err.message);
  }
});

// POST /cart/item
export const addItemServer = createAsyncThunk(
  'cart/addItemServer',
  async ({ menuId, qty = 1, type = 'takeaway' }, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/cart/item', { menu: menuId, qty, type });
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

// PATCH /cart/item/:menuId
export const updateItemServer = createAsyncThunk(
  'cart/updateItemServer',
  async ({ menuId, qty }, { rejectWithValue }) => {
    try {
      const { data } = await API.patch(`/cart/item/${menuId}`, { qty });
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

// DELETE /cart/item/:menuId
export const removeItemServer = createAsyncThunk(
  'cart/removeItemServer',
  async ({ menuId }, { rejectWithValue }) => {
    try {
      const { data } = await API.delete(`/cart/item/${menuId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

// DELETE /cart
export const clearCartServer = createAsyncThunk(
  'cart/clearCartServer',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.delete('/cart');
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

/* -------------------------
   Helper: normalize backend payloads
   ------------------------- */

function normalizeCartPayload(payload) {
  // expected shapes:
  // - payload = { items: [...] , _id: 'cartId' }
  // - payload = { cart: { items: [...], _id: '...' } }
  // - payload = { items: [...] } (array inside)
  // - payload = [ ... ] (direct array)
  // - payload = { someOtherShape: ... }
  if (!payload) return { items: [], cartId: null };

  // if payload is array
  if (Array.isArray(payload)) return { items: payload, cartId: null };

  // payload.items as array
  if (Array.isArray(payload.items)) return { items: payload.items, cartId: payload._id || null };

  // payload.cart.items
  if (payload.cart && Array.isArray(payload.cart.items)) return { items: payload.cart.items, cartId: payload.cart._id || payload.cart.id || null };

  // sometimes server returns { cart: { items: [...] } } at top-level
  if (payload?.cart?.items) return { items: payload.cart.items, cartId: payload.cart._id || payload.cart.id || null };

  // fallback: try to find first array inside payload values
  for (const key of Object.keys(payload)) {
    if (Array.isArray(payload[key])) return { items: payload[key], cartId: payload._id || payload.id || null };
  }

  // nothing found -> empty
  return { items: [], cartId: payload._id || payload.id || null };
}

/* -------------------------
   Initial state & slice
   ------------------------- */

const initialState = {
  items: [],
  cartId: null,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // local reducers kept if you still use local cart add/update
    setCart(state, action) {
      const { items, cartId } = normalizeCartPayload(action.payload);
      state.items = items;
      state.cartId = cartId;
    },
    setLoading(state, action) { state.loading = !!action.payload; },
    setError(state, action) { state.error = action.payload || null; },

    // optional local add/update (if components dispatch these)
    addCartLocal(state, action) {
      state.items.push(action.payload);
    },
    updateCartLocal(state, action) {
      const idx = state.items.findIndex(i => i.id === action.payload.id || i._id === action.payload._id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
    },
  },
  extraReducers: (builder) => {
    const start = (state) => { state.loading = true; state.error = null; };
    const fail = (state, action) => { state.loading = false; state.error = action.payload || 'Something went wrong'; };

    builder
      // fetch
      .addCase(fetchCart.pending, start)
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { items, cartId } = normalizeCartPayload(payload);
        state.items = items;
        state.cartId = cartId;
      })
      .addCase(fetchCart.rejected, fail)

      // add item
      .addCase(addItemServer.pending, start)
      .addCase(addItemServer.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { items, cartId } = normalizeCartPayload(payload);
        // if backend returns items array, use it; otherwise keep old and/or attempt to merge
        state.items = items.length ? items : state.items;
        state.cartId = cartId || state.cartId;
      })
      .addCase(addItemServer.rejected, fail)

      // update item
      .addCase(updateItemServer.pending, start)
      .addCase(updateItemServer.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { items } = normalizeCartPayload(payload);
        state.items = items.length ? items : state.items;
      })
      .addCase(updateItemServer.rejected, fail)

      // remove item
      .addCase(removeItemServer.pending, start)
      .addCase(removeItemServer.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { items } = normalizeCartPayload(payload);
        state.items = items.length ? items : state.items;
      })
      .addCase(removeItemServer.rejected, fail)

      // clear cart
      .addCase(clearCartServer.pending, start)
      .addCase(clearCartServer.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { items } = normalizeCartPayload(payload);
        state.items = items;
      })
      .addCase(clearCartServer.rejected, fail);
  },
});

export const selectCartRaw = (state) => state.cart || initialState;

export const selectCartItems = (state) => {
  const raw = selectCartRaw(state);
  return Array.isArray(raw.items) ? raw.items : [];
};

export const selectCartCount = (state) => {
  const items = selectCartItems(state);
  return items.reduce((sum, it) => sum + (Number(it.qty) || Number(it.quantity) || 1), 0);
};

export const { setCart, setLoading, setError, addCartLocal, updateCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
