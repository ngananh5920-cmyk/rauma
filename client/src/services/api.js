// API Service - Quản lý tất cả các API calls đến backend

// Xác định base URL của API
// - Development: sử dụng proxy (chỉ cần /api)
// - Production: sử dụng biến môi trường REACT_APP_API_URL hoặc mặc định
const getApiBaseUrl = () => {
  // Nếu có biến môi trường, dùng nó
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Development: sử dụng proxy (React sẽ tự động proxy đến https://rauma.onrender.com)
  // Production: sử dụng full URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://rauma.onrender.com/api';
  }
  
  return '/api';
};

// Base URL cho backend (không có /api)
const getBackendBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    const url = process.env.REACT_APP_API_URL;
    return url.endsWith('/api') ? url.slice(0, -4) : url;
  }
  
  if (process.env.NODE_ENV === 'production') {
    return 'https://rauma.onrender.com';
  }
  
  return '';
};

const API_BASE_URL = getApiBaseUrl();
const BACKEND_BASE_URL = getBackendBaseUrl();

// Helper function để xử lý image URLs
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Nếu đã là full URL, trả về nguyên
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Nếu là relative URL (bắt đầu bằng /), thêm backend base URL
  if (imageUrl.startsWith('/')) {
    return `${BACKEND_BASE_URL}${imageUrl}`;
  }
  
  // Trường hợp khác, thêm backend base URL và /
  return `${BACKEND_BASE_URL}/${imageUrl}`;
};

// Helper function để thực hiện fetch với error handling
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Menu API
export const menuAPI = {
  // Lấy tất cả menu items
  getAll: async () => {
    return fetchAPI('/menu');
  },

  // Lấy menu items theo category
  getByCategory: async (category) => {
    return fetchAPI(`/menu/category/${category}`);
  },

  // Lấy menu item theo ID
  getById: async (id) => {
    return fetchAPI(`/menu/${id}`);
  },

  // Tạo menu item mới
  create: async (menuItem) => {
    return fetchAPI('/menu', {
      method: 'POST',
      body: JSON.stringify(menuItem),
    });
  },

  // Cập nhật menu item
  update: async (id, menuItem) => {
    return fetchAPI(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuItem),
    });
  },

  // Xóa menu item
  delete: async (id) => {
    return fetchAPI(`/menu/${id}`, {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersAPI = {
  // Lấy tất cả orders
  getAll: async () => {
    return fetchAPI('/orders');
  },

  // Lấy order theo ID
  getById: async (id) => {
    return fetchAPI(`/orders/${id}`);
  },

  // Tạo order mới
  create: async (orderData) => {
    return fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Cập nhật order status
  updateStatus: async (id, status) => {
    return fetchAPI(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Upload API
export const uploadAPI = {
  // Upload image
  uploadImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const uploadUrl = `${BACKEND_BASE_URL}/api/upload`;
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  },
};

export default {
  menuAPI,
  ordersAPI,
  uploadAPI,
  getImageUrl,
};


