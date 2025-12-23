import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import OrdersManagement from './OrdersManagement';
import MenuManagement from './MenuManagement';
import NewOrderAlert from './NewOrderAlert';
import './AdminDashboard.css';

// URL backend mặc định khi chạy local
const API_URL = process.env.REACT_APP_API_URL || 'https://rauma.onrender.com/api';

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu'
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const processedOrderIds = useRef(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra authentication
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/admin', { replace: true });
      return;
    }

    fetchOrders().then((data) => {
      // Đánh dấu tất cả đơn pending hiện tại là đã xử lý (không hiển thị alert)
      if (data && data.length > 0) {
        const currentPendingOrders = data.filter(order => order.status === 'pending');
        currentPendingOrders.forEach(order => {
          processedOrderIds.current.add(order.id);
        });
      }
    });
    
    // Polling để check đơn mới mỗi 3 giây
    const interval = setInterval(() => {
      checkForNewOrders();
    }, 3000);

    return () => clearInterval(interval);
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
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
      return [];
    }
  };

  const checkForNewOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      if (!response.ok) return;
      
      const data = await response.json();
      // Tìm đơn mới (status = 'pending' và chưa được xử lý)
      const newPendingOrders = data.filter(order => 
        order.status === 'pending' && !processedOrderIds.current.has(order.id)
      );

      if (newPendingOrders.length > 0) {
        // Lấy đơn mới nhất
        const latestOrder = newPendingOrders.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )[0];
        
        // Đánh dấu đã xử lý
        processedOrderIds.current.add(latestOrder.id);
        
        // Hiển thị alert
        setNewOrderAlert(latestOrder);
      }

      // Cập nhật danh sách orders
      setOrders(data);
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  };

  const handleAcceptOrder = async (order) => {
    try {
      const response = await fetch(`${API_URL}/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Đánh dấu đơn này đã được xử lý để không hiển thị lại trong alert
      processedOrderIds.current.add(order.id);
      
      // Cập nhật đơn hàng trong state thay vì fetch lại toàn bộ
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(o => 
          o.id === order.id ? { ...o, status: 'confirmed' } : o
        );
        return updatedOrders;
      });

      setNewOrderAlert(null);
      
      // Cập nhật stats mà không cần fetch lại toàn bộ
      setStats(prevStats => ({
        ...prevStats,
        pendingOrders: Math.max(0, prevStats.pendingOrders - 1),
      }));
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Có lỗi xảy ra khi nhận đơn');
    }
  };

  const handleCancelOrder = async (order) => {
    try {
      const response = await fetch(`${API_URL}/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Đánh dấu đơn này đã được xử lý để không hiển thị lại trong alert
      processedOrderIds.current.add(order.id);
      
      // Cập nhật đơn hàng trong state thay vì fetch lại toàn bộ
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(o => 
          o.id === order.id ? { ...o, status: 'cancelled' } : o
        );
        return updatedOrders;
      });

      setNewOrderAlert(null);
      
      // Cập nhật stats mà không cần fetch lại toàn bộ
      setStats(prevStats => ({
        ...prevStats,
        pendingOrders: Math.max(0, prevStats.pendingOrders - 1),
      }));
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Có lỗi xảy ra khi hủy đơn');
    }
  };

  const handleCloseAlert = () => {
    setNewOrderAlert(null);
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

      {newOrderAlert && (
        <NewOrderAlert
          order={newOrderAlert}
          onAccept={() => handleAcceptOrder(newOrderAlert)}
          onCancel={() => handleCancelOrder(newOrderAlert)}
          onClose={handleCloseAlert}
        />
      )}
    </div>
  );
}

export default AdminDashboard;

