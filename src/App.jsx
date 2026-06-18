import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './features/auth/authSlice';
import { fetchCart } from './features/cart/cartSlice';
import { selectIsAuthenticated } from './features/auth/authSlice';
import './styles/globals.css';
import { ForgotPassword, ResetPassword } from './pages/auth/ForgotPassword';

// Layout
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ToastContainer from './components/Toast/Toast';

// Route protection
import { PrivateRoute, AdminRoute, PublicRoute } from './routes/ProtectedRoutes';

// Pages (lazy loaded)
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const OrderEdit = lazy(() => import('./pages/OrderEdit'));
const Profile = lazy(() => import('./pages/Profile'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminPromoCodes = lazy(() => import('./pages/admin/AdminPromoCodes'));
const AdminFeedback = lazy(() => import('./pages/admin/AdminFeedback'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));

const LoadingFallback = () => (
  <div className="loading-center" style={{ height: '100vh' }}>
    <div className="spinner" />
  </div>
);

function AppInner() {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(getMe());
    }
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (isAuth) dispatch(fetchCart());
  }, [isAuth, dispatch]);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Admin Routes - no navbar/footer */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="promocodes" element={<AdminPromoCodes />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Public/Store Routes */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* Protected Routes */}
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                  <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
                  <Route path="/orders/:id/edit" element={<PrivateRoute><OrderEdit /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </Suspense>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingFallback />} persistor={persistor}>
        <AppInner />
      </PersistGate>
    </Provider>
  );
}
