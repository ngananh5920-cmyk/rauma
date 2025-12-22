import React, { useState, useEffect } from 'react';
import './OrdersManagement.css';

// URL backend mặc định khi chạy local
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: 'ĐỒ ĂN',
    price: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/menu`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setItems(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError('Không thể tải danh sách món ăn/đồ uống');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setForm({
      name: '',
      category: 'ĐỒ ĂN',
      price: '',
      description: '',
      image_url: '',
    });
    setImageFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setImageFile(null);
      return;
    }
    setImageFile(file);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      category: item.category || 'ĐỒ ĂN',
      price: item.price?.toString() || '',
      description: item.description || '',
      image_url: item.image_url || '',
    });
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) {
      alert('Vui lòng nhập tên, danh mục và giá');
      return;
    }

    let imageUrlToUse = form.image_url || null;

    // Nếu có chọn file ảnh, upload trước rồi lấy URL trả về
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append('image', imageFile);

        // Lấy base URL của backend (bỏ /api ở cuối nếu có)
        const baseUrl = API_URL.endsWith('/api')
          ? API_URL.slice(0, -4)
          : API_URL;

        const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`HTTP error! status: ${uploadResponse.status}`);
        }

        const uploadData = await uploadResponse.json();
        imageUrlToUse = uploadData.image_url || imageUrlToUse;
      } catch (err) {
        console.error('Error uploading image:', err);
        alert('Có lỗi xảy ra khi upload ảnh. Vui lòng thử lại.');
        return;
      }
    }

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      description: form.description,
      image_url: imageUrlToUse,
    };

    try {
      const url = editingItem
        ? `${API_URL}/menu/${editingItem.id}`
        : `${API_URL}/menu`;
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchMenu();
      resetForm();
    } catch (err) {
      console.error('Error saving menu item:', err);
      alert('Có lỗi xảy ra khi lưu món');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn xóa món "${item.name}"?`)) return;
    try {
      const response = await fetch(`${API_URL}/menu/${item.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchMenu();
      if (editingItem && editingItem.id === item.id) {
        resetForm();
      }
    } catch (err) {
      console.error('Error deleting menu item:', err);
      alert('Có lỗi xảy ra khi xóa món');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (loading) {
    return (
      <div className="orders-management">
        <div className="loading">Đang tải danh sách món...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-management">
        <div className="error-message">
          <h2>⚠️ Lỗi</h2>
          <p>{error}</p>
          <button onClick={fetchMenu} className="retry-btn">Thử lại</button>
        </div>
      </div>
    );
  }

  const foodItems = items.filter((i) => i.category === 'ĐỒ ĂN');
  const drinkItems = items.filter((i) => i.category === 'ĐỒ UỐNG');

  return (
    <div className="orders-management">
      <div className="orders-header">
        <h2>🍽 Quản lý thực đơn</h2>
        <button onClick={fetchMenu} className="refresh-btn">🔄 Làm mới</button>
      </div>

      <div className="orders-content">
        <div className="orders-list">
          <h3>Danh sách món ăn & đồ uống</h3>
          <div className="orders-grid">
            {[...foodItems, ...drinkItems].map((item) => (
              <div key={item.id} className="order-card">
                <div className="order-card-header">
                  <span className="order-id">{item.category}</span>
                  <span>{formatPrice(item.price)}đ</span>
                </div>
                <div className="order-card-body">
                  <p><strong>{item.name}</strong></p>
                  {item.description && <p>{item.description}</p>}
                  {item.image_url && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </div>
                  )}
                </div>
                <div className="status-buttons" style={{ marginTop: '0.5rem' }}>
                  <button
                    className="btn-confirm"
                    type="button"
                    onClick={() => handleEdit(item)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn-cancel"
                    type="button"
                    onClick={() => handleDelete(item)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-details">
          <h3>{editingItem ? `Sửa món: ${editingItem.name}` : 'Thêm món mới'}</h3>
          <form className="detail-section" onSubmit={handleSubmit}>
            <div className="detail-section">
              <label>
                Tên món *
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="detail-section">
              <label>
                Danh mục *
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="ĐỒ ĂN">ĐỒ ĂN</option>
                  <option value="ĐỒ UỐNG">ĐỒ UỐNG</option>
                </select>
              </label>
            </div>

            <div className="detail-section">
              <label>
                Giá (VNĐ) *
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="detail-section">
              <label>
                Mô tả
                <textarea
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="detail-section">
              <label>
                Ảnh từ thiết bị
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                />
              </label>
            </div>

            <div className="status-buttons">
              <button className="btn-confirm" type="submit">
                {editingItem ? 'Lưu thay đổi' : 'Thêm món'}
              </button>
              {editingItem && (
                <button
                  className="btn-cancel"
                  type="button"
                  onClick={resetForm}
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MenuManagement;



