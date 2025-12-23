# Hướng dẫn cấu hình nhanh Google Sheets

## ✅ Bước 1: File credentials đã được thiết lập
File `server/credentials.json` đã được tạo với thông tin Service Account của bạn.

**Service Account Email:** `nem-chua@nem-482104.iam.gserviceaccount.com`

## 📋 Bước 2: Tạo Google Sheet và lấy Spreadsheet ID

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo một Google Sheet mới (hoặc dùng sheet có sẵn)
3. Copy **Spreadsheet ID** từ URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
   Ví dụ: Nếu URL là `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   Thì Spreadsheet ID là: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## 🔐 Bước 3: Chia sẻ Google Sheet với Service Account

1. Trong Google Sheet, click nút **Share** (Chia sẻ) ở góc trên bên phải
2. Dán email Service Account: `nem-chua@nem-482104.iam.gserviceaccount.com`
3. Chọn quyền **Editor** (Chỉnh sửa)
4. **Bỏ tích** "Notify people" (Không cần gửi thông báo)
5. Click **Share**

## ⚙️ Bước 4: Cấu hình biến môi trường

Tạo file `.env` trong thư mục gốc (cùng cấp với `package.json`):

```env
# Server Configuration
PORT=5000

# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_NAME=Đơn hàng
```

**Lưu ý:** Thay `your_spreadsheet_id_here` bằng Spreadsheet ID bạn đã copy ở Bước 2.

## 🚀 Bước 5: Cài đặt và khởi động

```bash
# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi động server
npm run server
```

Bạn sẽ thấy thông báo:
```
✅ Google Sheets initialized with credentials.json
```

## ✅ Bước 6: Kiểm tra

1. Tạo một đơn hàng mới từ frontend
2. Mở Google Sheet của bạn
3. Bạn sẽ thấy dữ liệu đơn hàng được tự động thêm vào sheet với các cột:
   - ID Đơn hàng
   - Thời gian đặt
   - Tên khách hàng
   - Số điện thoại
   - Địa chỉ giao hàng
   - Danh sách món
   - Số lượng món
   - Tổng tiền
   - Trạng thái

## 🔧 Troubleshooting

### Lỗi: "The caller does not have permission"
→ Đảm bảo đã chia sẻ Google Sheet với email `nem-chua@nem-482104.iam.gserviceaccount.com` và chọn quyền **Editor**

### Lỗi: "Requested entity was not found"
→ Kiểm tra lại Spreadsheet ID có đúng không trong file `.env`

### Không thấy dữ liệu trong Sheets
→ Kiểm tra console log xem có thông báo lỗi không
→ Đảm bảo Google Sheets API đã được bật trong Google Cloud Console


