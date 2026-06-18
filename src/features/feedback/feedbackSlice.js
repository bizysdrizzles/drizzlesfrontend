import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedbackService } from '../../services/index';
import { getErrorMessage } from '../../services/api';

export const createFeedback = createAsyncThunk('feedback/create', async (data, { rejectWithValue }) => {
  try { const res = await feedbackService.create(data); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchAllFeedback = createAsyncThunk('feedback/fetchAll', async (_, { rejectWithValue }) => {
  try { const res = await feedbackService.getAll(); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchFeedback = createAsyncThunk('feedback/fetchOne', async (id, { rejectWithValue }) => {
  try { const res = await feedbackService.getById(id); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const deleteFeedback = createAsyncThunk('feedback/delete', async (id, { rejectWithValue }) => {
  try { await feedbackService.delete(id); return id; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: { items: [], selected: null, loading: false, error: null, success: null },
  reducers: { clearError: (state) => { state.error = null; }, clearSuccess: (state) => { state.success = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFeedback.pending, (state) => { state.loading = true; })
      .addCase(fetchAllFeedback.fulfilled, (state, action) => { state.loading = false; state.items = action.payload || []; })
      .addCase(fetchAllFeedback.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeedback.fulfilled, (state, action) => { state.selected = action.payload; })
      .addCase(createFeedback.pending, (state) => { state.loading = true; state.error = null; state.success = null; })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Thank you for your feedback!';
        if (action.payload) state.items.push(action.payload);
      })
      .addCase(createFeedback.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.items = state.items.filter(f => f._id !== action.payload);
      });
  },
});

export const { clearError, clearSuccess } = feedbackSlice.actions;
export const selectAllFeedback = (state) => state.feedback.items;
export const selectFeedbackLoading = (state) => state.feedback.loading;
export const selectFeedbackError = (state) => state.feedback.error;
export const selectFeedbackSuccess = (state) => state.feedback.success;
export default feedbackSlice.reducer;
