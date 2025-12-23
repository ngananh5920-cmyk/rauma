import React, { useState } from 'react';
import './PasswordModal.css';

function PasswordModal({ isOpen, onClose, onConfirm, title = 'Xác nhận mật khẩu', message = 'Vui lòng nhập mật khẩu để thực hiện thao tác này' }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Password đơn giản - giống với AdminLogin
  const ADMIN_PASSWORD = 'tpc36pka';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      onConfirm();
      setPassword('');
      onClose();
    } else {
      setError('Mật khẩu không đúng');
      setPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="password-modal-overlay" onClick={handleClose}>
      <div className="password-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="password-modal-header">
          <h3>{title}</h3>
          <button className="password-modal-close" onClick={handleClose}>✕</button>
        </div>
        <div className="password-modal-body">
          <p className="password-modal-message">{message}</p>
          <form onSubmit={handleSubmit}>
            <div className="password-form-group">
              <label htmlFor="password-input">Mật khẩu</label>
              <input
                type="password"
                id="password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                autoFocus
                required
              />
              {error && <span className="password-error">{error}</span>}
            </div>
            <div className="password-modal-actions">
              <button type="button" className="btn-cancel-modal" onClick={handleClose}>
                Hủy
              </button>
              <button type="submit" className="btn-confirm-modal">
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PasswordModal;

