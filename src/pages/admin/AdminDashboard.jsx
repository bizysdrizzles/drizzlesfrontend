import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSalesAnalytics, fetchUserStats, fetchOrderStatus, fetchPopularProducts, selectSalesData, selectUserStats, selectOrderStatusData, selectPopularProducts } from '../../features/analytics/analyticsSlice';
import { fetchAllOrdersAdmin, selectAllOrders } from '../../features/orders/ordersSlice';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import './AdminDashboard.css';

const COLORS = ['#5c3d1e', '#c8a97a', '#d4641a', '#2d7a4f', '#2980b9'];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const sales = useSelector(selectSalesData);
  const userStats = useSelector(selectUserStats);
  const orderStatus = useSelector(selectOrderStatusData);
  const popular = useSelector(selectPopularProducts);
  const orders = useSelector(selectAllOrders);

  useEffect(() => {
    dispatch(fetchSalesAnalytics());
    dispatch(fetchUserStats());
    dispatch(fetchOrderStatus());
    dispatch(fetchPopularProducts());
    dispatch(fetchAllOrdersAdmin());
  }, [dispatch]);

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const totalRevenue = sales?.totalRevenue || sales?.revenue || 0;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;

  const revenueData = sales?.byDate || sales?.dailyRevenue || [];
  const popularData = (popular || []).slice(0, 5).map(p => ({
    name: (p.name || p.product?.name || 'Product').substring(0, 15),
    orders: p.totalOrders || p.count || 0,
  }));

  const statusData = Object.entries(orderStatus || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Welcome to Bizy's Drizzles admin panel</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        {[
          { label: 'Total Revenue', value: `${Number(totalRevenue)} EGP`, icon: '💰', color: 'var(--success-color)' },
          { label: 'Total Orders', value: totalOrders, icon: '📦', color: 'var(--info-color)' },
          { label: 'Pending Orders', value: pendingOrders, icon: '⏳', color: 'var(--warning-color)' },
          { label: 'Completed Orders', value: completedOrders, icon: '✅', color: 'var(--success-color)' },
          { label: 'Total Users', value: userStats?.totalUsers || 0, icon: '👥', color: 'var(--accent-color)' },
          { label: 'Active Loyalty Users', value: userStats?.activeLoyaltyUsers || userStats?.loyaltyMembers || 0, icon: '👑', color: 'var(--primary-color)' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card card">
            <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Revenue Chart */}
        <div className="card chart-card">
          <h3>Revenue Over Time</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `$${v}`} />
                <Line type="monotone" dataKey="revenue" stroke="var(--accent-color)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="no-data">No revenue data available</div>}
        </div>

        {/* Order Status Pie */}
        <div className="card chart-card small">
          <h3>Order Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="no-data">No status data</div>}
        </div>
      </div>

      {/* Popular Products & Recent Orders */}
      <div className="bottom-row">
        {/* Popular Products */}
        {popularData.length > 0 && (
          <div className="card chart-card">
            <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
              <h3>Most Popular Products</h3>
              <Link to="/admin/products" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={popularData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="var(--primary-color)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Orders */}
        <div className="card recent-orders">
          <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td><Link to={`/orders/${order._id}`} style={{ color: 'var(--accent-color)' }}>#{order._id?.slice(-6).toUpperCase()}</Link></td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.total}&nbsp;EGP</td>
                    <td><span className={`badge badge-${order.status === 'Completed' ? 'success' : order.status === 'Cancelled' ? 'error' : order.status === 'Pending' ? 'warning' : 'info'}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
