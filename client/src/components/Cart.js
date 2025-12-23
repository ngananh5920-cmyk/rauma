import React from 'react';
import './Cart.css';

function Cart({ cart, onRemove, onUpdateQuantity, totalPrice, onCheckout }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (cart.length === 0) {
    return (
      <div className="cart">
        <h2 className="cart-title">Giỏ hàng</h2>
        <div className="cart-empty">
          <p>Giỏ hàng trống</p>
          <span>Thêm món vào giỏ để bắt đầu đặt hàng</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2 className="cart-title">Giỏ hàng ({cart.length})</h2>
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <h4 className="cart-item-name">{item.name}</h4>
              <p className="cart-item-price">{formatPrice(item.price)}đ</p>
            </div>
            <div className="cart-item-controls">
              <button
                className="quantity-btn"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              >
                −
              </button>
              <span className="quantity">{item.quantity}</span>
              <button
                className="quantity-btn"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
              <button
                className="remove-btn"
                onClick={() => onRemove(item.id)}
                title="Xóa"
              >
                🗑️
              </button>
            </div>
            <div className="cart-item-total">
              {formatPrice(item.price * item.quantity)}đ
            </div>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <div className="cart-total">
          <span className="total-label">Tổng cộng:</span>
          <span className="total-amount">{formatPrice(totalPrice)}đ</span>
        </div>
        <button className="checkout-btn" onClick={onCheckout}>
          Đặt hàng ngay
        </button>
      </div>
    </div>
  );
}

export default Cart;

