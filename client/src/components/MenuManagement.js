import React, { useState, useEffect } from 'react';
import './OrdersManagement.css';
import { menuAPI, uploadAPI, getImageUrl } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from './Notification';

function MenuManagement() {
  const { notification, showNotification, hideNotification } = useNotification();
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
      const data = await menuAPI.getAll();
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
      showNotification('Vui lòng nhập tên, danh mục và giá', 'error');
      return;
    }

    let imageUrlToUse = form.image_url || null;

    // Nếu có chọn file ảnh, upload trước rồi lấy URL trả về
    if (imageFile) {
      try {
        const uploadData = await uploadAPI.uploadImage(imageFile);
        imageUrlToUse = uploadData.image_url || imageUrlToUse;
      } catch (err) {
        console.error('Error uploading image:', err);
        showNotification('Có lỗi xảy ra khi upload ảnh. Vui lòng thử lại.', 'error');
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
      if (editingItem) {
        await menuAPI.update(editingItem.id, payload);
      } else {
        await menuAPI.create(payload);
      }

      await fetchMenu();
      resetForm();
    } catch (err) {
      console.error('Error saving menu item:', err);
      showNotification('Có lỗi xảy ra khi lưu món', 'error');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn xóa món "${item.name}"?`)) return;
    try {
      await menuAPI.delete(item.id);
      await fetchMenu();
      if (editingItem && editingItem.id === item.id) {
        resetForm();
      }
    } catch (err) {
      console.error('Error deleting menu item:', err);
      showNotification('Có lỗi xảy ra khi xóa món', 'error');
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
          <h2>Lỗi</h2>
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
        <h2>Quản lý thực đơn</h2>
        <button onClick={fetchMenu} className="refresh-btn">Làm mới</button>
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
                        src={getImageUrl(item.image_url)}
                        alt={item.name}
                        style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8 }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
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

export default MenuManagement;



