import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../helpers/api';

export const fetchMenus = createAsyncThunk(
  'menus/fetchMenus',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/menu'); 
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message || 'Failed to fetch menus');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null
};

const menusSlice = createSlice({
  name: 'menus',
  initialState,
  reducers: {

    setMenus(state, action) {
      state.items = action.payload || [];
    },
    clearMenusError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenus.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMenus.fulfilled, (s, a) => {
        s.loading = false;
        s.items = Array.isArray(a.payload) ? a.payload : (a.payload?.items ?? []);
      })
      .addCase(fetchMenus.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error?.message; });
  }
});

export const { setMenus, clearMenusError } = menusSlice.actions;
export default menusSlice.reducer;

export const selectMenus = (state) => state.menus?.items ?? [];
export const selectMenusLoading = (state) => Boolean(state.menus?.loading);
export const selectMenusError = (state) => state.menus?.error ?? null;
