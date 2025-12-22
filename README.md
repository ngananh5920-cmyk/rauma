# Ứng dụng Bán Hàng - Câu Lạc Bộ Sinh Viên Thanh Hóa

Ứng dụng web bán hàng đầy đủ với frontend (React) và backend (Node.js/Express), sử dụng SQLite database.

## Tính năng

- 📱 Giao diện đẹp và hiện đại
- 🍜 Menu đầy đủ với 2 danh mục: ĐỒ ĂN và ĐỒ UỐNG
- 🛒 Giỏ hàng với tính năng thêm/xóa/cập nhật số lượng
- 📝 Đặt hàng với thông tin khách hàng
- 💾 Lưu trữ đơn hàng trong database
- 📊 Quản lý đơn hàng (xem tất cả đơn, cập nhật trạng thái)

## Cấu trúc dự án

```
.
├── server/           # Backend (Node.js/Express)
│   ├── index.js     # Server chính và API routes
│   └── database.js  # Database setup và seed data
├── client/          # Frontend (React)
│   └── src/
│       ├── App.js   # Component chính
│       └── components/
│           ├── Menu.js        # Hiển thị menu
│           ├── Cart.js        # Giỏ hàng
│           └── OrderForm.js   # Form đặt hàng
└── package.json
```

## Menu

### ĐỒ ĂN
- Nem chua: 36,000đ/10c
- Nem cối: 25,000đ
- Nem cối bigsize: 40,000đ

### ĐỒ UỐNG
- Trà chanh: 10,000đ
- Trà quất: 10,000đ
- Trà tắc dứa: 15,000đ
- Trà táo xanh: 15,000đ
- Soda việt quất: 10,000đ
- Soda dứa: 10,000đ
- Soda táo xanh: 10,000đ
- Trà việt quất: 15,000đ
- Trà lài vải: 15,000đ
- Soda vải: 10,000đ

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm run install-all
```

Lệnh này sẽ cài đặt dependencies cho cả backend và frontend.

### 2. Chạy ứng dụng

**Development mode (cả backend và frontend):**
```bash
npm run dev
```

**Chạy riêng lẻ:**

Backend only:
```bash
npm run server
```

Frontend only:
```bash
npm run client
```

### 3. Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## API Endpoints

### Menu
- `GET /api/menu` - Lấy tất cả menu items
- `GET /api/menu/category/:category` - Lấy menu items theo danh mục
- `GET /api/menu/:id` - Lấy menu item theo ID

### Orders
- `GET /api/orders` - Lấy tất cả đơn hàng
- `GET /api/orders/:id` - Lấy đơn hàng theo ID
- `POST /api/orders` - Tạo đơn hàng mới
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái đơn hàng

## Database

Ứng dụng sử dụng SQLite database (`server/database.sqlite`). Database sẽ được tự động tạo và seed dữ liệu khi server khởi động lần đầu.

### Schema

**menu_items:**
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- category (TEXT) - 'ĐỒ ĂN' hoặc 'ĐỒ UỐNG'
- price (INTEGER) - Giá tiền (VND)
- description (TEXT)
- image_url (TEXT)

**orders:**
- id (INTEGER PRIMARY KEY)
- items (TEXT) - JSON string của các items
- total (INTEGER) - Tổng tiền (VND)
- customer_name (TEXT)
- customer_phone (TEXT)
- created_at (TEXT) - ISO timestamp
- status (TEXT) - 'pending', 'confirmed', 'completed', 'cancelled'

## Production Build

Để build ứng dụng cho production:

```bash
npm run build
```

Sau đó chạy server:
```bash
npm start
```

Server sẽ serve frontend build từ `client/build`.

## Công nghệ sử dụng

- **Frontend:** React, CSS3
- **Backend:** Node.js, Express
- **Database:** SQLite3
- **Development:** Concurrently, Nodemon

## Tác giả

Ứng dụng được tạo cho Câu Lạc Bộ Sinh Viên Thanh Hóa

