import React, { useState, useEffect } from 'react';
import './OrdersManagement.css';
import { ordersAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from './Notification';
import PasswordModal from './PasswordModal';

function OrdersManagement({ onOrderUpdate }) {
  const { notification, showNotification, hideNotification } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

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

  const handleEditOrder = () => {
    if (!selectedOrder) return;
    setEditForm({
      customer_name: selectedOrder.customer_name || '',
      customer_phone: selectedOrder.customer_phone || '',
      delivery_address: selectedOrder.delivery_address || '',
      delivery_time: selectedOrder.delivery_time || '',
      status: selectedOrder.status || 'pending',
      items: selectedOrder.items.map(item => ({ ...item })),
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder || !editForm) return;
    
    // Tính lại tổng tiền
    const newTotal = editForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
      await ordersAPI.update(selectedOrder.id, {
        ...editForm,
        total: newTotal,
      });
      await fetchOrders();
      setIsEditing(false);
      setEditForm(null);
      showNotification('Cập nhật đơn hàng thành công', 'success');
      if (onOrderUpdate) {
        onOrderUpdate();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showNotification('Có lỗi xảy ra khi cập nhật đơn hàng', 'error');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handleDeleteOrder = () => {
    if (!selectedOrder) {
      console.error('No order selected for deletion');
      return;
    }
    console.log('Attempting to delete order:', selectedOrder.id);
    setPendingAction(() => async () => {
      try {
        console.log('Calling ordersAPI.delete for order:', selectedOrder.id);
        const result = await ordersAPI.delete(selectedOrder.id);
        console.log('Delete result:', result);
        await fetchOrders();
        setSelectedOrder(null);
        showNotification('Xóa đơn hàng thành công', 'success');
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        // Nếu lỗi 404 (Not Found), coi như đã xóa thành công
        if (error.message && (error.message.includes('404') || error.message.includes('Not Found') || error.message.includes('not found'))) {
          console.log('Order not found (404), treating as successful deletion');
          await fetchOrders();
          setSelectedOrder(null);
          showNotification('Đơn hàng đã được xóa', 'success');
          if (onOrderUpdate) {
            onOrderUpdate();
          }
        } else {
          // Chỉ hiện lỗi cho các lỗi khác 404
          const errorMessage = error.message || 'Có lỗi xảy ra khi xóa đơn hàng';
          showNotification(errorMessage, 'error');
        }
      }
    });
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleEditItemChange = (index, field, value) => {
    if (!editForm) return;
    const newItems = [...editForm.items];
    if (field === 'quantity' || field === 'price') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setEditForm({ ...editForm, items: newItems });
  };

  const handleRemoveItem = (index) => {
    if (!editForm) return;
    const newItems = editForm.items.filter((_, i) => i !== index);
    setEditForm({ ...editForm, items: newItems });
  };

  const handleToggleOrderSelection = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedOrders.size === 0) return;
    setPendingAction(() => async () => {
      try {
        const deletePromises = Array.from(selectedOrders).map(async (id) => {
          try {
            return await ordersAPI.delete(id);
          } catch (error) {
            // Nếu lỗi 404, coi như thành công
            if (error.message && (error.message.includes('404') || error.message.includes('Not Found') || error.message.includes('not found'))) {
              console.log(`Order ${id} not found (404), treating as successful deletion`);
              return { success: true, id };
            }
            // Ném lại lỗi khác 404
            throw error;
          }
        });
        await Promise.all(deletePromises);
        await fetchOrders();
        setSelectedOrders(new Set());
        setShowBulkActions(false);
        if (selectedOrder && selectedOrders.has(selectedOrder.id)) {
          setSelectedOrder(null);
        }
        showNotification(`Đã xóa ${selectedOrders.size} đơn hàng thành công`, 'success');
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      } catch (error) {
        console.error('Error deleting orders:', error);
        // Chỉ hiện lỗi cho các lỗi không phải 404
        if (!error.message || (!error.message.includes('404') && !error.message.includes('Not Found') && !error.message.includes('not found'))) {
          showNotification('Có lỗi xảy ra khi xóa đơn hàng', 'error');
        } else {
          // Nếu chỉ có lỗi 404, coi như thành công
          await fetchOrders();
          setSelectedOrders(new Set());
          setShowBulkActions(false);
          if (selectedOrder && selectedOrders.has(selectedOrder.id)) {
            setSelectedOrder(null);
          }
          showNotification(`Đã xóa ${selectedOrders.size} đơn hàng thành công`, 'success');
          if (onOrderUpdate) {
            onOrderUpdate();
          }
        }
      }
    });
    setShowPasswordModal(true);
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
          <div className="orders-list-header">
            <h3>Tất cả đơn hàng ({orders.length})</h3>
            <div className="bulk-actions-header">
              <button
                className="btn-select-all"
                onClick={handleSelectAll}
              >
                {selectedOrders.size === orders.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
              {showBulkActions && (
                <button
                  className="btn-bulk-delete"
                  onClick={handleBulkDelete}
                >
                  Xóa đã chọn ({selectedOrders.size})
                </button>
              )}
            </div>
          </div>
          {orders.length === 0 ? (
            <div className="empty-orders">Chưa có đơn hàng nào</div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''} ${selectedOrders.has(order.id) ? 'bulk-selected' : ''}`}
                >
                  <div className="order-card-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={() => handleToggleOrderSelection(order.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div
                    className="order-card-content"
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

            {!isEditing ? (
              <>
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
              </>
            ) : (
              <div className="detail-section">
                <h4>Chỉnh sửa đơn hàng</h4>
                {editForm && (
                  <div className="edit-order-form">
                    <div className="form-group">
                      <label>Tên khách hàng</label>
                      <input
                        type="text"
                        value={editForm.customer_name}
                        onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại</label>
                      <input
                        type="text"
                        value={editForm.customer_phone}
                        onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Địa chỉ giao hàng</label>
                      <textarea
                        value={editForm.delivery_address}
                        onChange={(e) => setEditForm({ ...editForm, delivery_address: e.target.value })}
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Thời gian giao hàng</label>
                      <input
                        type="text"
                        value={editForm.delivery_time}
                        onChange={(e) => setEditForm({ ...editForm, delivery_time: e.target.value })}
                        placeholder="VD: 2 giờ"
                      />
                    </div>
                    <div className="form-group">
                      <label>Trạng thái</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Danh sách món</label>
                      {editForm.items.map((item, index) => (
                        <div key={index} className="edit-item-row">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleEditItemChange(index, 'name', e.target.value)}
                            placeholder="Tên món"
                          />
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleEditItemChange(index, 'quantity', e.target.value)}
                            placeholder="SL"
                            min="1"
                          />
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleEditItemChange(index, 'price', e.target.value)}
                            placeholder="Giá"
                            min="0"
                          />
                          <button
                            type="button"
                            className="btn-remove-item"
                            onClick={() => handleRemoveItem(index)}
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                      <div className="order-total">
                        <strong>Tổng cộng: {formatPrice(editForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}đ</strong>
                      </div>
                    </div>
                    <div className="status-buttons">
                      <button className="btn-confirm" onClick={handleSaveEdit}>
                        Lưu thay đổi
                      </button>
                      <button className="btn-cancel" onClick={handleCancelEdit}>
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingAction(null);
        }}
        onConfirm={handlePasswordConfirm}
        title="Xác nhận mật khẩu"
        message="Vui lòng nhập mật khẩu để thực hiện thao tác này"
      />
    </div>
  );
}

export default OrdersManagement;

