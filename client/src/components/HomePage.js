import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Menu from './Menu';
import Cart from './Cart';
import OrderForm from './OrderForm';
import { menuAPI, ordersAPI } from '../services/api';

function HomePage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setError(null);
      const data = await menuAPI.getAll();
      setMenuItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setError('Không thể kết nối đến server. Vui lòng kiểm tra lại backend có đang chạy không.');
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowOrderForm(true);
  };

  const handleOrderSubmit = async (customerInfo) => {
    const orderData = {
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: getTotalPrice(),
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      delivery_address: customerInfo.delivery_address,
    };

    try {
      await ordersAPI.create(orderData);
      alert('Đặt hàng thành công!');
      setCart([]);
      setShowOrderForm(false);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Có lỗi xảy ra khi đặt hàng');
    }
  };

  const foodItems = menuItems.filter((item) => item.category === 'ĐỒ ĂN');
  const drinkItems = menuItems.filter((item) => item.category === 'ĐỒ UỐNG');

  return (
    <div className="App">
      <header className="app-header">
        <h1>🍜 Câu Lạc Bộ Sinh Viên Thanh Hóa</h1>
        <p>Đặt món online</p>
        <Link to="/admin" className="admin-link">🔐 Quản trị viên</Link>
      </header>

      <div className="container">
        <div className="main-content">
          {loading ? (
            <div className="loading">Đang tải menu...</div>
          ) : error ? (
            <div className="error-message">
              <h2>⚠️ Lỗi kết nối</h2>
              <p>{error}</p>
              <p>
                Vui lòng đảm bảo backend đang chạy tại{' '}
                <strong>https://rauma.onrender.com</strong> (khi chạy trên máy)
              </p>
              <button onClick={fetchMenuItems} className="retry-btn">Thử lại</button>
            </div>
          ) : (
            <>
              <Menu
                title="ĐỒ ĂN"
                items={foodItems}
                onAddToCart={addToCart}
              />
              <Menu
                title="ĐỒ UỐNG"
                items={drinkItems}
                onAddToCart={addToCart}
              />
            </>
          )}
        </div>

        <div className="sidebar">
          <Cart
            cart={cart}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            totalPrice={getTotalPrice()}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {showOrderForm && (
        <OrderForm
          cart={cart}
          totalPrice={getTotalPrice()}
          onSubmit={handleOrderSubmit}
          onCancel={() => setShowOrderForm(false)}
        />
      )}
    </div>
  );
}

export default HomePage;

