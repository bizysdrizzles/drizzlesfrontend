import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { promoService } from '../../services/index';
import { getErrorMessage } from '../../services/api';

export const fetchPromoCodes = createAsyncThunk('promocodes/fetchAll', async (_, { rejectWithValue }) => {
  try { const res = await promoService.getAll(); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchActivePromoCodes = createAsyncThunk('promocodes/fetchActive', async (_, { rejectWithValue }) => {
  try { const res = await promoService.getActive(); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const validatePromoCode = createAsyncThunk('promocodes/validate', async (code, { rejectWithValue }) => {
  try { const res = await promoService.validate(code); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const createPromoCode = createAsyncThunk('promocodes/create', async (data, { rejectWithValue }) => {
  try { const res = await promoService.create(data); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const updatePromoCode = createAsyncThunk('promocodes/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await promoService.update(id, data); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const deletePromoCode = createAsyncThunk('promocodes/delete', async (id, { rejectWithValue }) => {
  try { await promoService.delete(id); return id; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

const promoSlice = createSlice({
  name: 'promocodes',
  initialState: { codes: [], active: [], validated: null, loading: false, error: null },
  reducers: { clearValidated: (state) => { state.validated = null; }, clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPromoCodes.fulfilled, (state, action) => { state.codes = action.payload || []; state.loading = false; })
      .addCase(fetchActivePromoCodes.fulfilled, (state, action) => { state.active = action.payload || []; })
      .addCase(validatePromoCode.pending, (state) => { state.loading = true; state.error = null; state.validated = null; })
      .addCase(validatePromoCode.fulfilled, (state, action) => { state.loading = false; state.validated = action.payload; })
      .addCase(validatePromoCode.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createPromoCode.fulfilled, (state, action) => { if (action.payload) state.codes.push(action.payload); })
      .addCase(updatePromoCode.fulfilled, (state, action) => {
        if (action.payload?._id) {
          const idx = state.codes.findIndex(c => c._id === action.payload._id);
          if (idx !== -1) state.codes[idx] = action.payload;
        }
      })
      .addCase(deletePromoCode.fulfilled, (state, action) => {
        state.codes = state.codes.filter(c => c._id !== action.payload);
      })
      .addCase(fetchPromoCodes.pending, (state) => { state.loading = true; })
      .addCase(fetchPromoCodes.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createPromoCode.rejected, (state, action) => { state.error = action.payload; })
      .addCase(deletePromoCode.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearValidated, clearError } = promoSlice.actions;
export const selectPromoCodes = (state) => state.promocodes.codes;
export const selectValidatedPromo = (state) => state.promocodes.validated;
export const selectPromoLoading = (state) => state.promocodes.loading;
export const selectPromoError = (state) => state.promocodes.error;
export default promoSlice.reducer;
