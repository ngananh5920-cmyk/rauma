import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Password đơn giản - trong thực tế nên dùng authentication phức tạp hơn
  const ADMIN_PASSWORD = 'tpc36pka';

  // Nếu đã đăng nhập, tự động redirect đến dashboard
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      // Set authentication
      localStorage.setItem('adminAuthenticated', 'true');
      // Navigate ngay lập tức với replace để không thể quay lại trang login
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Mật khẩu không đúng');
      setPassword(''); // Xóa password khi sai
    }
  };

  return (
    <div className="admin-login-container" style={{ minHeight: '100vh', width: '100%' }}>
      <div className="admin-login-box">
        <h2>🔐 Đăng nhập quản trị viên</h2>
        <p className="login-subtitle">Vui lòng nhập mật khẩu để tiếp tục</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              autoFocus
            />
            {error && <span className="error-message">{error}</span>}
          </div>
          <button type="submit" className="login-btn">
            Đăng nhập
          </button>
        </form>
        <Link to="/" className="back-link">← Quay lại trang chủ</Link>
      </div>
    </div>
  );
}

export default AdminLogin;

