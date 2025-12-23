import React from 'react';
import './Menu.css';
import { getImageUrl } from '../services/api';

function Menu({ title, items, onAddToCart }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="menu-section">
      <h2 className="menu-title">{title}</h2>
      <div className="menu-grid">
        {items.map((item) => (
          <div key={item.id} className="menu-item">
            {item.image_url && (
              <div className="menu-item-image-wrapper">
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.name}
                  className="menu-item-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="menu-item-content">
              <h3 className="menu-item-name">{item.name}</h3>
              {item.description && (
                <p className="menu-item-description">{item.description}</p>
              )}
              <div className="menu-item-footer">
                <span className="menu-item-price">
                  {formatPrice(item.price)}đ
                </span>
                <button
                  className="add-to-cart-btn"
                  onClick={() => onAddToCart(item)}
                >
                  ➕ Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Menu;

