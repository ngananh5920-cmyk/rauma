# Hướng dẫn kiểm tra kết nối Frontend và Backend

## Các vấn đề đã được sửa:

1. ✅ **Database initialization**: Đã sửa lại để database được khởi tạo đúng cách trước khi server nhận requests
2. ✅ **Error handling**: Thêm xử lý lỗi tốt hơn ở frontend với thông báo rõ ràng
3. ✅ **API connection**: Đảm bảo frontend có thể kết nối với backend qua proxy

## Cách kiểm tra (khi chạy trên máy local):

### 1. Kiểm tra Backend (Port 5000)

Mở trình duyệt hoặc terminal và kiểm tra (backend local):
```
http://localhost:5000/api/menu
```

Nếu backend chạy đúng, bạn sẽ thấy JSON response với danh sách menu items.

Hoặc dùng PowerShell (kiểm tra backend local):
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/menu" | Select-Object -ExpandProperty Content
```

### 2. Kiểm tra Frontend (Port 3000)

Truy cập:
```
http://localhost:3000
```

Nếu frontend không kết nối được với backend, bạn sẽ thấy thông báo lỗi với nút "Thử lại".

Frontend đang gọi API theo nguyên tắc:

- Mặc định (local): `http://localhost:5000/api/...`
- Khi deploy: dùng biến môi trường `REACT_APP_API_URL` để trỏ đến URL backend (vd: `https://rauma.onrender.com/api`)

### 3. Kiểm tra các process đang chạy

```powershell
# Kiểm tra port 5000 (backend)
netstat -ano | findstr ":5000"

# Kiểm tra port 3000 (frontend)
netstat -ano | findstr ":3000"
```

### 4. Kiểm tra log

Khi chạy `npm run dev`, bạn sẽ thấy:
- Backend: "Server is running on port 5000"
- Backend: "Connected to SQLite database"
- Backend: "Database tables created successfully"
- Backend: "Database seeded successfully"
- Frontend: Compilation messages từ React

## Nếu gặp lỗi:

### Backend không chạy:
1. Kiểm tra xem có process nào đang dùng port 5000 không
2. Kiểm tra file `server/database.sqlite` có được tạo không
3. Xem log trong terminal để tìm lỗi cụ thể

### Frontend không kết nối được:
1. Đảm bảo backend đang chạy trước
2. Kiểm tra proxy trong `client/package.json` có đúng không
3. Kiểm tra console trong browser (F12) để xem lỗi cụ thể

## Khởi động lại ứng dụng:

```bash
# Dừng tất cả process hiện tại (Ctrl+C trong terminal)
# Sau đó chạy lại:
npm run dev
```

Hoặc chạy riêng lẻ:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run client
```

