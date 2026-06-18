import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { userService } from '../../services/index';
import { getErrorMessage } from '../../services/api';

const usersAdapter = createEntityAdapter({ selectId: (u) => u._id });

export const fetchAllUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
  try { const res = await userService.getAll(); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchUser = createAsyncThunk('users/fetchOne', async (id, { rejectWithValue }) => {
  try { const res = await userService.getById(id); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const updateUser = createAsyncThunk('users/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await userService.update(id, data); return res.data.data || res.data; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const deleteUser = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
  try { await userService.delete(id); return id; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: usersAdapter.getInitialState({ loading: false, error: null }),
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        usersAdapter.setAll(state, Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(fetchAllUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchUser.fulfilled, (state, action) => { if (action.payload?._id) usersAdapter.upsertOne(state, action.payload); })
      .addCase(updateUser.fulfilled, (state, action) => { if (action.payload?._id) usersAdapter.upsertOne(state, action.payload); })
      .addCase(updateUser.rejected, (state, action) => { state.error = action.payload; })
      .addCase(deleteUser.fulfilled, (state, action) => { usersAdapter.removeOne(state, action.payload); })
      .addCase(deleteUser.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearError } = usersSlice.actions;
export const { selectAll: selectAllUsers, selectById: selectUserById } = usersAdapter.getSelectors((state) => state.users);
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export default usersSlice.reducer;
