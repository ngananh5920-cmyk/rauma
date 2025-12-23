import React from 'react';
import './NewOrderAlert.css';

function NewOrderAlert({ order, onAccept, onCancel, onClose }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="new-order-alert">
      <div className="new-order-alert-content">
        <div className="alert-header">
          <div className="alert-icon">⚠️</div>
          <div className="alert-title">
            <h3>Cảnh báo: Có đơn mới!</h3>
            <p>Xách đít lên làm mau!</p>
          </div>
          <button className="alert-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="alert-order-info">
          <div className="order-info-row">
            <span className="info-label">Mã đơn:</span>
            <span className="info-value">#{order.id}</span>
          </div>
          <div className="order-info-row">
            <span className="info-label">Khách hàng:</span>
            <span className="info-value">{order.customer_name || 'Không có'}</span>
          </div>
          <div className="order-info-row">
            <span className="info-label">Số điện thoại:</span>
            <span className="info-value">{order.customer_phone || 'Không có'}</span>
          </div>
          <div className="order-info-row">
            <span className="info-label">Tổng tiền:</span>
            <span className="info-value highlight">{formatPrice(order.total)}đ</span>
          </div>
          {order.delivery_time && (
            <div className="order-info-row">
              <span className="info-label">Thời gian giao:</span>
              <span className="info-value">{order.delivery_time}</span>
            </div>
          )}
        </div>

        <div className="alert-actions">
          <button className="btn-accept-order" onClick={onAccept}>
            Nhận đơn
          </button>
          <button className="btn-cancel-order" onClick={onCancel}>
            Hủy đơn
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewOrderAlert;

