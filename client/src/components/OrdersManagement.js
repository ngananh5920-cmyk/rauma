import React, { useState, useEffect } from 'react';
import './OrdersManagement.css';
import { ordersAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from './Notification';

function OrdersManagement({ onOrderUpdate }) {
  const { notification, showNotification, hideNotification } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
    // Refresh orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setError(null);
      const data = await ordersAPI.getAll();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Không thể tải danh sách đơn hàng');
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      await fetchOrders(); // Refresh orders
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      // Notify parent component to update stats
      if (onOrderUpdate) {
        onOrderUpdate();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Có lỗi xảy ra khi cập nhật trạng thái', 'error');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'preparing':
        return 'status-preparing';
      case 'delivering':
        return 'status-delivering';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'preparing':
        return 'Đang chuẩn bị';
      case 'delivering':
        return 'Đang giao hàng';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="orders-management">
        <div className="loading">Đang tải danh sách đơn hàng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-management">
            <div className="error-message">
              <h2>Lỗi</h2>
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-btn">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-management">
        <div className="orders-header">
          <h2>Quản lý đơn hàng</h2>
          <button onClick={fetchOrders} className="refresh-btn">Làm mới</button>
      </div>

      <div className="orders-content">
        <div className="orders-list">
          <h3>Tất cả đơn hàng ({orders.length})</h3>
          {orders.length === 0 ? (
            <div className="empty-orders">Chưa có đơn hàng nào</div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-card-header">
                    <span className="order-id">#{order.id}</span>
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <p><strong>Khách hàng:</strong> {order.customer_name || 'N/A'}</p>
                    <p><strong>SĐT:</strong> {order.customer_phone || 'N/A'}</p>
                    <p><strong>Tổng tiền:</strong> {formatPrice(order.total)}đ</p>
                    <p><strong>Thời gian:</strong> {formatDate(order.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedOrder && (
          <div className="order-details">
            <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
            <div className="detail-section">
              <h4>Thông tin khách hàng</h4>
              <p><strong>Tên:</strong> {selectedOrder.customer_name || 'N/A'}</p>
              <p><strong>Số điện thoại:</strong> {selectedOrder.customer_phone || 'N/A'}</p>
              <p><strong>Địa chỉ giao hàng:</strong></p>
              <p className="delivery-address">{selectedOrder.delivery_address || 'N/A'}</p>
            </div>

            <div className="detail-section">
              <h4>Danh sách món</h4>
              <div className="order-items">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-price">{formatPrice(item.price * item.quantity)}đ</span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <strong>Tổng cộng: {formatPrice(selectedOrder.total)}đ</strong>
              </div>
            </div>

            <div className="detail-section">
              <h4>Thông tin đơn hàng</h4>
              <p><strong>Trạng thái:</strong> 
                <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </p>
              <p><strong>Thời gian đặt:</strong> {formatDate(selectedOrder.created_at)}</p>
            </div>

            <div className="detail-section">
              <h4>Cập nhật trạng thái</h4>
              <div className="status-buttons">
                {selectedOrder.status === 'pending' && (
                  <>
                    <button
                      className="btn-confirm"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                    >
                      Xác nhận đơn hàng
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    >
                      Hủy đơn hàng
                    </button>
                  </>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <>
                    <button
                      className="btn-complete"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    >
                      Hoàn thành
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    >
                      Hủy đơn hàng
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={hideNotification}
        />
      )}
    </div>
  );
}

export default OrdersManagement;

