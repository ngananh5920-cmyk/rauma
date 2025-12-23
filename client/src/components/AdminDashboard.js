import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import OrdersManagement from './OrdersManagement';
import MenuManagement from './MenuManagement';
import './AdminDashboard.css';

// URL backend mặc định khi chạy local
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const [, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu'
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra authentication
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/admin', { replace: true });
      return;
    }

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrders(data);

      // Tính toán thống kê
      const totalOrders = data.length;
      const totalRevenue = data
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = data.filter(order => 
        ['pending', 'confirmed', 'preparing', 'delivering'].includes(order.status)
      ).length;
      const completedOrders = data.filter(order => order.status === 'completed').length;

      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Bảng điều khiển quản trị</h1>
          <div className="admin-actions">
            <Link to="/" className="home-link">Trang chủ</Link>
            <button onClick={handleLogout} className="logout-btn">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Tổng đơn hàng</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Doanh số</h3>
            <p className="stat-value">{formatPrice(stats.totalRevenue)}đ</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Đơn chờ xử lý</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Đơn đã hoàn thành</h3>
            <p className="stat-value">{stats.completedOrders}</p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Đơn hàng
          </button>
          <button
            className={`admin-tab ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            Thực đơn
          </button>
        </div>

        {activeTab === 'orders' ? (
          <OrdersManagement
            onOrderUpdate={() => {
              fetchOrders();
            }}
          />
        ) : (
          <MenuManagement />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

