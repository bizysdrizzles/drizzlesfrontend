import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import productsReducer from '../features/products/productsSlice';
import ordersReducer from '../features/orders/ordersSlice';
import promoReducer from '../features/promocodes/promoSlice';
import feedbackReducer from '../features/feedback/feedbackSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';
import usersReducer from '../features/users/usersSlice';
import uiReducer from '../features/ui/uiSlice';

const authPersistConfig = { key: 'auth', storage, whitelist: ['user', 'token', 'isAuthenticated'] };
const cartPersistConfig = { key: 'cart', storage, whitelist: ['items', 'totalItems', 'subtotal', 'sessionId'] };

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
  products: productsReducer,
  orders: ordersReducer,
  promocodes: promoReducer,
  feedback: feedbackReducer,
  analytics: analyticsReducer,
  users: usersReducer,
  ui: uiReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Expose state to API interceptor
store.subscribe(() => {
  window.__REDUX_STATE__ = store.getState();
});

export const persistor = persistStore(store);
export default store;
