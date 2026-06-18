import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/index';
import { getErrorMessage } from '../../services/api';

export const fetchSalesAnalytics = createAsyncThunk('analytics/sales', async (_, { rejectWithValue }) => {
  try { const res = await analyticsService.getSales(); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchDateRangeAnalytics = createAsyncThunk('analytics/daterange', async ({ startDate, endDate }, { rejectWithValue }) => {
  try { const res = await analyticsService.getDateRange(startDate, endDate); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchPopularProducts = createAsyncThunk('analytics/popular', async (_, { rejectWithValue }) => {
  try { const res = await analyticsService.getPopular(); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchUserStats = createAsyncThunk('analytics/users', async (_, { rejectWithValue }) => {
  try { const res = await analyticsService.getUsers(); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchOrderStatus = createAsyncThunk('analytics/orderStatus', async (_, { rejectWithValue }) => {
  try { const res = await analyticsService.getOrderStatus(); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    sales: null,
    dateRange: null,
    popular: null,
    userStats: null,
    orderStatus: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesAnalytics.pending, (state) => { state.loading = true; })
      .addCase(fetchSalesAnalytics.fulfilled, (state, action) => { state.loading = false; state.sales = action.payload; })
      .addCase(fetchSalesAnalytics.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchDateRangeAnalytics.fulfilled, (state, action) => { state.dateRange = action.payload; })
      .addCase(fetchPopularProducts.fulfilled, (state, action) => { state.popular = action.payload; })
      .addCase(fetchUserStats.fulfilled, (state, action) => { state.userStats = action.payload; })
      .addCase(fetchOrderStatus.fulfilled, (state, action) => { state.orderStatus = action.payload; });
  },
});

export const selectAnalytics = (state) => state.analytics;
export const selectSalesData = (state) => state.analytics.sales;
export const selectPopularProducts = (state) => state.analytics.popular;
export const selectUserStats = (state) => state.analytics.userStats;
export const selectOrderStatusData = (state) => state.analytics.orderStatus;
export const selectAnalyticsLoading = (state) => state.analytics.loading;
export default analyticsSlice.reducer;
