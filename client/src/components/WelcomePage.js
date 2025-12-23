import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

function WelcomePage() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/menu');
  };

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <div className="welcome-icon">🌿</div>
        <h1 className="welcome-title">Chào mừng bạn!</h1>
        <p className="welcome-message">
          Chào mừng bạn đã quan tâm đến gian hàng của{' '}
          <strong>Câu Lạc Bộ Sinh Viên Thanh Hóa Đại học Phenikaa</strong>
        </p>
        <p className="welcome-subtitle">
          Khám phá menu đa dạng với các món ăn và đồ uống ngon miệng
        </p>
        <button className="continue-btn" onClick={handleContinue}>
          <span>Tiếp tục</span>
          <span className="btn-icon">🌿</span>
        </button>
      </div>
      <div className="welcome-decoration">
        <div className="decoration-leaf decoration-leaf-1">🌿</div>
        <div className="decoration-leaf decoration-leaf-2">🌿</div>
        <div className="decoration-leaf decoration-leaf-3">🌿</div>
        <div className="decoration-leaf decoration-leaf-4">🌿</div>
      </div>
    </div>
  );
}

export default WelcomePage;

