import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSalesAnalytics, fetchDateRangeAnalytics, fetchPopularProducts,
  fetchUserStats, fetchOrderStatus,
  selectSalesData, selectPopularProducts, selectUserStats, selectOrderStatusData, selectAnalyticsLoading,
} from '../../features/analytics/analyticsSlice';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import './AdminCommon.css';
import './AdminAnalytics.css';

const COLORS = ['#5c3d1e', '#c8a97a', '#d4641a', '#2d7a4f', '#2980b9', '#8b6240'];

export default function AdminAnalytics() {
  const dispatch = useDispatch();
  const sales = useSelector(selectSalesData);
  const popular = useSelector(selectPopularProducts);
  const userStats = useSelector(selectUserStats);
  const orderStatus = useSelector(selectOrderStatusData);
  const loading = useSelector(selectAnalyticsLoading);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    dispatch(fetchSalesAnalytics());
    dispatch(fetchPopularProducts());
    dispatch(fetchUserStats());
    dispatch(fetchOrderStatus());
  }, [dispatch]);

  const handleDateRange = () => {
    if (dateRange.start && dateRange.end) {
      dispatch(fetchDateRangeAnalytics({ startDate: dateRange.start, endDate: dateRange.end }));
    }
  };

  const revenueData = (sales?.byDate || sales?.dailyRevenue || []).map(d => ({
    date: d.date || d._id,
    revenue: d.revenue || d.total || 0,
    orders: d.orders || d.count || 0,
  }));

  const popularData = (popular || []).slice(0, 8).map(p => ({
    name: (p.name || p.product?.name || 'Product').substring(0, 12),
    orders: p.totalOrders || p.count || 0,
  }));

  const statusPieData = Object.entries(orderStatus || {}).map(([name, value]) => ({ name, value }));

  const userPieData = userStats ? [
    { name: 'With Loyalty Cycles', value: userStats.loyaltyMembers || userStats.activeLoyaltyUsers || 0 },
    { name: 'No Cycles Yet', value: (userStats.totalUsers || 0) - (userStats.loyaltyMembers || userStats.activeUnaltyUsers || 0) },
  ] : [];

  return (
    <div className="analytics-page">
      <div className="admin-page-header">
        <h1>Analytics</h1>
      </div>

      {/* Stats */}
      <div className="analytics-stats">
        <div className="card analytic-stat">
          <div className="as-icon">💰</div>
          <div>
            <strong>${(sales?.totalRevenue || 0).toFixed(2)}</strong>
            <span>Total Revenue</span>
          </div>
        </div>
        <div className="card analytic-stat">
          <div className="as-icon">📦</div>
          <div>
            <strong>{sales?.totalOrders || 0}</strong>
            <span>Total Orders</span>
          </div>
        </div>
        <div className="card analytic-stat">
          <div className="as-icon">👥</div>
          <div>
            <strong>{userStats?.totalUsers || 0}</strong>
            <span>Total Users</span>
          </div>
        </div>
        <div className="card analytic-stat">
          <div className="as-icon">👑</div>
          <div>
            <strong>{userStats?.loyaltyMembers || 0}</strong>
            <span>Loyalty Members</span>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card date-range-filter">
        <h4>Filter by Date Range</h4>
        <div className="date-inputs">
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" className="form-control" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" className="form-control" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
          </div>
          <button className="btn btn-accent" onClick={handleDateRange}>Apply Filter</button>
        </div>
      </div>

      {/* Charts */}
      {revenueData.length > 0 && (
        <div className="card chart-card-full">
          <h3>Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => n === 'revenue' ? `$${v}` : v} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="var(--accent-color)" strokeWidth={2} name="Revenue ($)" />
              <Line type="monotone" dataKey="orders" stroke="var(--primary-color)" strokeWidth={2} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="charts-pair">
        {popularData.length > 0 && (
          <div className="card chart-card">
            <h3>Most Popular Products</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popularData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="orders" fill="var(--primary-color)" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="charts-pair-right">
          {statusPieData.length > 0 && (
            <div className="card chart-card-sm">
              <h3>Order Status</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {statusPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {userPieData.length > 0 && (
            <div className="card chart-card-sm">
              <h3>User Breakdown</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={userPieData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {userPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
