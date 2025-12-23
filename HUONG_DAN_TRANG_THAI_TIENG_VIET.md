# Hướng dẫn: Trạng thái tự động là tiếng Việt khi đặt hàng

## ✅ Đã được cấu hình:

Khi có người đặt hàng mới, trạng thái sẽ **tự động** được lưu bằng tiếng Việt trong Google Sheets:

- `pending` → `Chờ xác nhận`
- `confirmed` → `Đã xác nhận`
- `preparing` → `Đang chuẩn bị`
- `delivering` → `Đang giao hàng`
- `completed` → `Hoàn thành`
- `cancelled` → `Đã hủy`

## 🔄 Để áp dụng thay đổi:

### 1. Khởi động lại Backend Server

Backend cần được khởi động lại để code mới có hiệu lực:

```bash
# Dừng server hiện tại (Ctrl+C trong terminal đang chạy server)
# Sau đó khởi động lại:
npm run server
```

Bạn sẽ thấy thông báo:
```
✅ Google Sheets initialized with credentials.json
```

### 2. Test thử:

1. Tạo một đơn hàng mới từ frontend
2. Kiểm tra Google Sheet
3. Trạng thái sẽ tự động là **"Chờ xác nhận"** (tiếng Việt) thay vì "pending"

## 📝 Cập nhật trạng thái cũ:

Nếu bạn có các đơn hàng cũ với trạng thái tiếng Anh, chạy lệnh sau để cập nhật tất cả:

```bash
npm run update-sheets-status
```

Lệnh này sẽ:
- Tìm tất cả trạng thái tiếng Anh trong Google Sheets
- Tự động chuyển sang tiếng Việt
- Hiển thị số lượng đã cập nhật

## ✨ Kết quả:

- ✅ Đơn hàng mới: Trạng thái tự động là tiếng Việt
- ✅ Cập nhật trạng thái: Tự động chuyển sang tiếng Việt
- ✅ Đơn hàng cũ: Có thể cập nhật bằng lệnh `npm run update-sheets-status`

