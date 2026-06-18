import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { getErrorMessage } from '../../services/api';

// Thunks
export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    if (res.data.token) localStorage.setItem('token', res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.login(data);
    if (res.data.token) localStorage.setItem('token', res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await authService.getMe();
    return res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.updateProfile(data);
    return res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const addAddress = createAsyncThunk('auth/addAddress', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.addAddress(data);
    return res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const updateAddress = createAsyncThunk('auth/updateAddress', async ({ addressId, data }, { rejectWithValue }) => {
  try {
    const res = await authService.updateAddress(addressId, data);
    return res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (addressId, { rejectWithValue }) => {
  try {
    const res = await authService.deleteAddress(addressId);
    return res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const res = await authService.forgotPassword(email);
    return res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const res = await authService.resetPassword(token, password);
    return res.data;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload.data;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, rejected)

      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload.data;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, rejected)

      .addCase(getMe.pending, pending)
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data || action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('token');
      })

      .addCase(updateProfile.pending, pending)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data || action.payload.user || state.user;
        state.success = 'Profile updated successfully';
      })
      .addCase(updateProfile.rejected, rejected)

      .addCase(addAddress.fulfilled, (state, action) => {
        state.user = action.payload.data || state.user;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.user = action.payload.data || state.user;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.user = action.payload.data || state.user;
      })

      .addCase(forgotPassword.pending, pending)
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = 'Password reset email sent! Check your inbox.';
      })
      .addCase(forgotPassword.rejected, rejected)

      .addCase(resetPassword.pending, pending)
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user || action.payload.data;
        state.isAuthenticated = true;
        state.success = 'Password reset successful!';
      })
      .addCase(resetPassword.rejected, rejected);
  },
});

export const { logout, clearError, clearSuccess } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
