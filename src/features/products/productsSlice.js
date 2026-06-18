import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import productService from '../../services/productService';
import { getErrorMessage } from '../../services/api';

const productsAdapter = createEntityAdapter({ selectId: (p) => p._id });

export const fetchProducts = createAsyncThunk('products/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await productService.getAll();
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchProductsAdmin = createAsyncThunk('products/fetchAdmin', async (_, { rejectWithValue }) => {
  try {
    const res = await productService.getAllAdmin();
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await productService.getById(id);
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const createProduct = createAsyncThunk('products/create', async (data, { rejectWithValue }) => {
  try {
    const res = await productService.create(data);
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await productService.update(id, data);
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const updateStock = createAsyncThunk('products/updateStock', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await productService.updateStock(id, data);
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await productService.delete(id);
    return id;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: productsAdapter.getInitialState({
    loading: false,
    error: null,
    selected: null,
  }),
  reducers: {
    clearError: (state) => { state.error = null; },
    setSelected: (state, action) => { state.selected = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        productsAdapter.setAll(state, Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProductsAdmin.pending, (state) => { state.loading = true; })
      .addCase(fetchProductsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        productsAdapter.setAll(state, Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(fetchProductsAdmin.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProduct.pending, (state) => { state.loading = true; })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
        if (action.payload?._id) productsAdapter.upsertOne(state, action.payload);
      })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createProduct.fulfilled, (state, action) => {
        if (action.payload?._id) productsAdapter.addOne(state, action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        if (action.payload?._id) productsAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        if (action.payload?._id) productsAdapter.upsertOne(state, action.payload);
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        productsAdapter.removeOne(state, action.payload);
      })

      .addCase(createProduct.rejected, (state, action) => { state.error = action.payload; })
      .addCase(updateProduct.rejected, (state, action) => { state.error = action.payload; })
      .addCase(deleteProduct.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearError, setSelected } = productsSlice.actions;

// Selectors
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
} = productsAdapter.getSelectors((state) => state.products);
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectSelectedProduct = (state) => state.products.selected;

export default productsSlice.reducer;
