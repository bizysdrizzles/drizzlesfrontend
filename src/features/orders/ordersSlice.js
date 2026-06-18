import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';
import { getErrorMessage } from '../../services/api';

const ordersAdapter = createEntityAdapter({ selectId: (o) => o._id });

export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try {
    const res = await orderService.createOrder(data);
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const res = await orderService.getMyOrders();
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await orderService.getOrder(id);
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const updateOrder = createAsyncThunk('orders/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await orderService.updateOrder(id, data);
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => {
  try {
    await orderService.cancelOrder(id);
    return id;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await orderService.updateStatus(id, status);
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchAllOrdersAdmin = createAsyncThunk('orders/fetchAdmin', async (_, { rejectWithValue }) => {
  try {
    const res = await orderService.getAllAdmin();
    return res.data.data || res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: ordersAdapter.getInitialState({
    loading: false,
    error: null,
    selected: null,
    lastCreated: null,
  }),
  reducers: {
    clearError: (state) => { state.error = null; },
    clearLastCreated: (state) => { state.lastCreated = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.lastCreated = action.payload;
        if (action.payload?._id) ordersAdapter.addOne(state, action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        ordersAdapter.setAll(state, Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchOrder.pending, (state) => { state.loading = true; })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
        if (action.payload?._id) ordersAdapter.upsertOne(state, action.payload);
      })
      .addCase(fetchOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateOrder.fulfilled, (state, action) => {
        if (action.payload?._id) {
          ordersAdapter.upsertOne(state, action.payload);
          state.selected = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => { state.error = action.payload; })

      .addCase(cancelOrder.fulfilled, (state, action) => {
        ordersAdapter.removeOne(state, action.payload);
        if (state.selected?._id === action.payload) state.selected = null;
      })

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        if (action.payload?._id) ordersAdapter.upsertOne(state, action.payload);
      })

      .addCase(fetchAllOrdersAdmin.pending, (state) => { state.loading = true; })
      .addCase(fetchAllOrdersAdmin.fulfilled, (state, action) => {
        state.loading = false;
        ordersAdapter.setAll(state, Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(fetchAllOrdersAdmin.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError, clearLastCreated } = ordersSlice.actions;

export const {
  selectAll: selectAllOrders,
  selectById: selectOrderById,
} = ordersAdapter.getSelectors((state) => state.orders);
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersError = (state) => state.orders.error;
export const selectSelectedOrder = (state) => state.orders.selected;
export const selectLastCreated = (state) => state.orders.lastCreated;

export default ordersSlice.reducer;
