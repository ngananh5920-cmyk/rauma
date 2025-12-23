# Kiểm tra tại sao đơn hàng không hiện lên Google Sheets

## ✅ Đã kiểm tra và sửa:

1. ✅ File `server/credentials.json` đã được tạo
2. ✅ File `.env` đã có `GOOGLE_SHEETS_ID`
3. ✅ Spreadsheet ID: `1adOweEUvNog0EZIqeJi7yPs4z7PQ21Z1HZTZltYJ39Q`

## 🔍 Các bước kiểm tra:

### 1. Khởi động lại Backend Server

Backend cần được khởi động lại để đọc lại file `.env` và `credentials.json`:

```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó khởi động lại:
npm run server
```

Bạn sẽ thấy thông báo:
```
✅ Google Sheets initialized with credentials.json
```

Nếu không thấy thông báo này, có nghĩa là Google Sheets chưa được khởi tạo.

### 2. Kiểm tra Google Sheet đã được chia sẻ chưa

**QUAN TRỌNG:** Google Sheet phải được chia sẻ với Service Account email:

1. Mở Google Sheet: https://docs.google.com/spreadsheets/d/1adOweEUvNog0EZIqeJi7yPs4z7PQ21Z1HZTZltYJ39Q/edit
2. Click nút **Share** (Chia sẻ)
3. Dán email: `nem-chua@nem-482104.iam.gserviceaccount.com`
4. Chọn quyền **Editor** (Chỉnh sửa)
5. **Bỏ tích** "Notify people"
6. Click **Share**

### 3. Kiểm tra Console Log

Khi tạo đơn hàng mới, kiểm tra console log của backend:

- ✅ Nếu thành công: `✅ Đã ghi đơn hàng #X lên Google Sheets`
- ❌ Nếu có lỗi: Sẽ hiển thị thông báo lỗi cụ thể

### 4. Kiểm tra Google Sheets API đã được bật chưa

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project: `nem-482104`
3. Vào **APIs & Services** > **Library**
4. Tìm "Google Sheets API" và đảm bảo đã được **ENABLED**

## 🔧 Các lỗi thường gặp:

### Lỗi: "The caller does not have permission"
→ **Giải pháp:** Chia sẻ Google Sheet với email `nem-chua@nem-482104.iam.gserviceaccount.com` và chọn quyền **Editor**

### Lỗi: "Requested entity was not found"
→ **Giải pháp:** Kiểm tra lại Spreadsheet ID trong file `.env` có đúng không

### Không thấy thông báo "Google Sheets initialized"
→ **Giải pháp:** 
- Kiểm tra file `server/credentials.json` có tồn tại không
- Kiểm tra file `.env` có `GOOGLE_SHEETS_ID` không
- Khởi động lại server

### Đơn hàng được tạo nhưng không có trong Sheets
→ **Giểm tra:**
- Console log có thông báo lỗi không
- Google Sheet có được chia sẻ với Service Account không
- Google Sheets API đã được bật chưa

## 📝 Test thử:

1. Khởi động lại backend: `npm run server`
2. Tạo một đơn hàng mới từ frontend
3. Kiểm tra console log của backend
4. Mở Google Sheet và kiểm tra xem có dữ liệu mới không

