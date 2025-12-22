import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Password đơn giản - trong thực tế nên dùng authentication phức tạp hơn
  const ADMIN_PASSWORD = 'tpc36pka';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminAuthenticated', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Mật khẩu không đúng');
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

