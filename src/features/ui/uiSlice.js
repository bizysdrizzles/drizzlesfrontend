import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],
    darkMode: false,
    mobileMenuOpen: false,
    cartOpen: false,
  },
  reducers: {
    addToast: (state, action) => {
      const toast = { id: Date.now(), ...action.payload };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      document.body.classList.toggle('dark-mode', state.darkMode);
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      document.body.classList.toggle('dark-mode', action.payload);
    },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false; },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    closeCart: (state) => { state.cartOpen = false; },
  },
});

export const {
  addToast, removeToast,
  toggleDarkMode, setDarkMode,
  toggleMobileMenu, closeMobileMenu,
  toggleCart, closeCart,
} = uiSlice.actions;

export const selectToasts = (state) => state.ui.toasts;
export const selectDarkMode = (state) => state.ui.darkMode;
export const selectMobileMenu = (state) => state.ui.mobileMenuOpen;
export const selectCartOpen = (state) => state.ui.cartOpen;

// Toast helper
export const showToast = (message, type = 'info') => (dispatch) => {
  const id = Date.now();
  dispatch(addToast({ id, message, type }));
  setTimeout(() => dispatch(removeToast(id)), 4000);
};

export default uiSlice.reducer;
