# Bizy's Drizzles Frontend 🍵

A production-ready React frontend for Bizy's Drizzles coffee sauce ecommerce brand.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- Bizy's Drizzles backend running on `http://localhost:5000`

### Installation & Run

```bash
# 1. Enter the project folder
cd bizys-drizzles-frontend

# 2. Install dependencies
npm install

# 3. Set up environment
# Edit .env if your backend runs on a different port/host
# REACT_APP_API_URL=http://localhost:5000/api

# 4. Start development server
npm start
```

The app will open at **http://localhost:3000**

### Build for Production
```bash
npm run build
```

---

## 🏗 Architecture

### Tech Stack
- **React 18** with functional components and hooks
- **Redux Toolkit** with `createEntityAdapter` for normalized state
- **Redux Persist** for auth and cart persistence
- **React Router v6** for routing
- **Axios** with centralized interceptors
- **Recharts** for analytics charts
- **CSS Modules** (scoped per component)

### Folder Structure
```
src/
├── app/store.js              # Redux store with persist config
├── features/
│   ├── auth/authSlice.js     # Auth state, thunks, selectors
│   ├── cart/cartSlice.js     # Cart with optimistic updates
│   ├── products/             # Products with entity adapter
│   ├── orders/               # Orders with entity adapter
│   ├── promocodes/           # Promo code management
│   ├── feedback/             # Feedback management
│   ├── analytics/            # Admin analytics
│   ├── users/                # User management (admin)
│   └── ui/uiSlice.js         # Toast, dark mode, mobile menu
├── services/                 # Centralized API layer
│   ├── api.js                # Axios instance + interceptors
│   ├── authService.js
│   ├── cartService.js
│   ├── productService.js
│   ├── orderService.js
│   └── index.js              # Promo, feedback, analytics, users
├── routes/ProtectedRoutes.jsx # PrivateRoute, AdminRoute, PublicRoute
├── components/
│   ├── Navbar/               # Responsive navbar with cart
│   ├── CartDrawer/           # Slide-in cart drawer
│   ├── Footer/               # Footer with newsletter
│   └── Toast/                # Toast notifications
├── pages/
│   ├── Home.jsx              # Hero, products, reviews, CTA
│   ├── Products.jsx          # Product listing with search/sort
│   ├── ProductDetail.jsx     # Single product page
│   ├── Cart.jsx              # Full cart page
│   ├── Checkout.jsx          # Multi-step checkout with promo
│   ├── Orders.jsx            # User order history
│   ├── OrderDetail.jsx       # Order detail + countdown timer
│   ├── Profile.jsx           # Profile, addresses, loyalty
│   ├── Feedback.jsx          # Reviews page
│   ├── Contact.jsx           # Contact form
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ForgotPassword.jsx
│   └── admin/
│       ├── AdminLayout.jsx   # Sidebar layout
│       ├── AdminDashboard.jsx # Overview with charts
│       ├── AdminProducts.jsx # CRUD products + stock
│       ├── AdminOrders.jsx   # Manage orders, status updates
│       ├── AdminUsers.jsx    # Manage users
│       ├── AdminPromoCodes.jsx # Manage promo codes
│       ├── AdminFeedback.jsx  # View/delete feedback
│       └── AdminAnalytics.jsx # Full analytics with charts
└── styles/globals.css        # CSS variables + global styles
```

---

## 🔐 Authentication
- JWT stored in localStorage
- Auto-injected via Axios interceptor
- Auto-logout on 401
- Guest cart uses UUID session ID (`x-session-id` header)
- Cart merged on login via `POST /cart/merge`

## 🛒 Cart Features
- Optimistic updates (UI updates immediately, rollback on error)
- Guest cart with UUID session ID
- Cart merge on login
- Persisted with Redux Persist
- Real-time subtotal calculation

## 🎁 Loyalty Program
- Progress shown in profile (5 orders threshold)
- Auto-discount at checkout if `user.isLoyaltyMember === true`
- Notification shown to guests in cart

## ⏱ Order Edit Window
- Countdown timer shows remaining edit time
- Orders editable within 15 minutes if status = "Pending"
- Timer auto-disables edit button on expiry

## 👑 Admin Panel (`/admin`)
- Protected by AdminRoute
- Sidebar navigation
- Products: CRUD + stock updates
- Orders: Status updates for all orders
- Users: Update roles, delete users
- Promo Codes: Create/update/delete with expiry
- Feedback: View and delete reviews
- Analytics: 5 chart types with date range filter

## 🎨 Design System
All colors are CSS variables in `src/styles/globals.css`:
```css
--primary-color: #5c3d1e    /* Deep coffee brown */
--secondary-color: #c8a97a  /* Golden caramel */
--accent-color: #d4641a     /* Warm amber/drizzle */
--background-color: #fdf6ee /* Cream white */
```

Toggle dark mode via the 🌙 button in the navbar.

---

## 🌐 API Integration
All endpoints from API.txt are implemented. No direct axios calls in components — all go through `services/`.

| Feature | Endpoints |
|---------|-----------|
| Auth | register, login, me, profile, addresses, forgot/reset password |
| Products | list, admin-list, detail, create, update, stock, delete |
| Cart | get, add, update, remove, clear, merge |
| Orders | create, my-orders, detail, update, cancel, status, admin-all |
| Promo | create, validate, list, active, update, delete |
| Feedback | create, list, detail, delete |
| Analytics | sales, date-range, popular, users, order-status |
| Users | list, detail, update, delete |
