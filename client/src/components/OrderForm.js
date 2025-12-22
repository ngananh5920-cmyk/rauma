import React, { useState } from 'react';
import './OrderForm.css';

function OrderForm({ cart, totalPrice, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Vui lòng nhập tên';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ 
        name: name.trim(), 
        phone: phone.trim(),
        delivery_address: address.trim()
      });
    }
  };

  return (
    <div className="order-form-overlay" onClick={onCancel}>
      <div className="order-form-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Xác nhận đặt hàng</h2>
        <div className="order-summary">
          <h3 className="order-items-title">Danh sách món đã chọn:</h3>
          <div className="order-items-list">
            {cart && cart.length > 0 ? (
              cart.map((item) => (
                <div key={`${item.id}-${item.name}`} className="order-item-row">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                  <span className="item-price">{formatPrice(item.price * item.quantity)}đ</span>
                </div>
              ))
            ) : (
              <div className="empty-cart-message">Không có món nào trong giỏ hàng</div>
            )}
          </div>
          <div className="order-total-section">
            <p className="order-total">Tổng tiền: {formatPrice(totalPrice)}đ</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Tên khách hàng *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại *</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="address">Địa chỉ giao hàng *</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Tòa-Phòng"
              className={errors.address ? 'error' : ''}
              rows="3"
            />
            {errors.address && (
              <span className="error-message">{errors.address}</span>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Hủy
            </button>
            <button type="submit" className="submit-btn">
              Xác nhận đặt hàng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrderForm;

