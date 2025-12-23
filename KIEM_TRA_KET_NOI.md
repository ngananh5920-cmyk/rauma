# Hướng dẫn kiểm tra kết nối Frontend và Backend

## Các cải tiến đã được thực hiện:

1. ✅ **Database initialization**: Đã sửa lại để database được khởi tạo đúng cách trước khi server nhận requests
2. ✅ **Error handling**: Thêm xử lý lỗi tốt hơn ở frontend với thông báo rõ ràng
3. ✅ **API connection**: Đảm bảo frontend có thể kết nối với backend qua proxy
4. ✅ **Proxy configuration**: Đã thêm proxy vào `client/package.json` để tự động chuyển tiếp requests từ frontend đến backend trong development
5. ✅ **Centralized API service**: Đã tạo file `client/src/services/api.js` để quản lý tất cả API calls một cách tập trung
6. ✅ **Image URL handling**: Đã thêm helper function `getImageUrl()` để xử lý image URLs đúng cách
7. ✅ **CORS configuration**: Backend đã được cấu hình CORS để cho phép frontend kết nối

## Cách kiểm tra (khi chạy trên máy local):

### 1. Kiểm tra Backend (Port 5000)

Mở trình duyệt hoặc terminal và kiểm tra (backend local):
```
https://rauma.onrender.com/api/menu
```

Nếu backend chạy đúng, bạn sẽ thấy JSON response với danh sách menu items.

Hoặc dùng PowerShell (kiểm tra backend local):
```powershell
Invoke-WebRequest -Uri "https://rauma.onrender.com/api/menu" | Select-Object -ExpandProperty Content
```

### 2. Kiểm tra Frontend (Port 4000)

Truy cập:
```
http://localhost:4000
```

Nếu frontend không kết nối được với backend, bạn sẽ thấy thông báo lỗi với nút "Thử lại".

Frontend đang gọi API theo nguyên tắc:

- **Development (local)**: Sử dụng proxy trong `client/package.json` - frontend tự động chuyển tiếp requests đến `https://rauma.onrender.com`
  - API calls sẽ được gọi như: `/api/menu`, `/api/orders`, v.v.
  - Proxy sẽ tự động chuyển thành: `https://rauma.onrender.com/api/menu`, `https://rauma.onrender.com/api/orders`, v.v.
- **Production**: Dùng biến môi trường `REACT_APP_API_URL` để trỏ đến URL backend (vd: `http://your-backend-url.com/api`)

**Lưu ý**: Tất cả API calls được quản lý tập trung trong file `client/src/services/api.js` để dễ bảo trì và cập nhật.

### 3. Kiểm tra các process đang chạy

```powershell
# Kiểm tra port 5000 (backend)
netstat -ano | findstr ":5000"

# Kiểm tra port 4000 (frontend)
netstat -ano | findstr ":4000"
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
1. Đảm bảo backend đang chạy trước (port 5000)
2. Kiểm tra proxy trong `client/package.json` có đúng không (phải có `"proxy": "https://rauma.onrender.com"`)
3. Nếu đã thêm proxy, cần restart frontend server (dừng và chạy lại `npm run client`)
4. Kiểm tra console trong browser (F12) để xem lỗi cụ thể
5. Kiểm tra Network tab trong DevTools để xem requests có được gửi đúng không

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

