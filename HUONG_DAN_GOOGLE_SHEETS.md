# Hướng dẫn cấu hình Google Sheets để tự động ghi đơn hàng

Khi có đơn hàng mới, hệ thống sẽ tự động ghi dữ liệu lên Google Sheets của bạn.

## Các bước cấu hình:

### Bước 1: Tạo Google Cloud Project và bật Google Sheets API

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo một project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Library**
4. Tìm "Google Sheets API" và bật nó

### Bước 2: Tạo Service Account (Khuyến nghị)

**Cách này phù hợp cho production và dễ cấu hình nhất:**

1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Đặt tên cho service account (ví dụ: "sheets-writer")
4. Click **Create and Continue**
5. Bỏ qua phần "Grant this service account access to project" (không cần)
6. Click **Done**

7. Click vào service account vừa tạo
8. Vào tab **Keys**
9. Click **Add Key** > **Create new key**
10. Chọn **JSON** và download file về

11. Mở file JSON vừa download, copy toàn bộ nội dung

### Bước 3: Tạo Google Sheet và chia sẻ quyền

1. Tạo một Google Sheet mới tại [Google Sheets](https://sheets.google.com)
2. Copy **Spreadsheet ID** từ URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
   Ví dụ: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

3. Click nút **Share** (Chia sẻ) ở góc trên bên phải
4. Dán **Email của Service Account** (tìm trong file JSON vừa download, trường `client_email`)
   - Ví dụ: `sheets-writer@your-project.iam.gserviceaccount.com`
5. Chọn quyền **Editor** (Chỉnh sửa)
6. Click **Send**

### Bước 4: Cấu hình biến môi trường

Tạo file `.env` trong thư mục gốc của project (cùng cấp với `package.json`):

```env
# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_NAME=Đơn hàng
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Lưu ý quan trọng:**
- `GOOGLE_SERVICE_ACCOUNT_KEY` phải là một JSON string hợp lệ (toàn bộ nội dung file JSON, không có xuống dòng)
- Nếu bạn dùng Windows PowerShell, có thể cần escape các ký tự đặc biệt
- Hoặc bạn có thể đặt file JSON vào thư mục `server/` với tên `credentials.json` và bỏ qua biến `GOOGLE_SERVICE_ACCOUNT_KEY`

### Bước 5: Cài đặt dependencies

```bash
npm install
```

### Bước 6: Khởi động lại server

```bash
npm run server
```

Bạn sẽ thấy thông báo:
```
✅ Google Sheets initialized with Service Account
```

## Kiểm tra hoạt động:

1. Tạo một đơn hàng mới từ frontend
2. Mở Google Sheet của bạn
3. Bạn sẽ thấy dữ liệu đơn hàng được tự động thêm vào sheet

## Cấu trúc dữ liệu trong Google Sheets:

Sheet sẽ có các cột sau:
- **ID Đơn hàng**: Số ID đơn hàng
- **Thời gian đặt**: Thời gian đặt hàng
- **Tên khách hàng**: Tên người đặt hàng
- **Số điện thoại**: Số điện thoại khách hàng
- **Địa chỉ giao hàng**: Địa chỉ giao hàng
- **Danh sách món**: Danh sách các món đã đặt
- **Số lượng món**: Tổng số món
- **Tổng tiền**: Tổng số tiền
- **Trạng thái**: Trạng thái đơn hàng (pending, confirmed, preparing, delivering, completed, cancelled)

## Xử lý lỗi:

- Nếu không cấu hình Google Sheets, hệ thống vẫn hoạt động bình thường, chỉ không ghi dữ liệu lên Sheets
- Nếu có lỗi khi ghi lên Sheets, đơn hàng vẫn được lưu vào database
- Kiểm tra console log để xem thông báo lỗi cụ thể

## Các cách cấu hình khác:

### Cách 2: Sử dụng OAuth2 (Cho development)

Nếu bạn muốn dùng OAuth2 thay vì Service Account:

1. Tạo OAuth2 credentials trong Google Cloud Console
2. Lấy access token và refresh token
3. Đặt vào biến môi trường:
   ```env
   GOOGLE_OAUTH2_TOKEN={"access_token":"...","refresh_token":"...","scope":"...","token_type":"Bearer","expiry_date":...}
   ```

### Cách 3: Sử dụng file credentials.json

1. Đặt file JSON credentials vào thư mục `server/` với tên `credentials.json`
2. Không cần đặt biến môi trường `GOOGLE_SERVICE_ACCOUNT_KEY`

## Troubleshooting:

### Lỗi: "The caller does not have permission"
- Đảm bảo đã chia sẻ Google Sheet với email của Service Account
- Đảm bảo Service Account có quyền Editor

### Lỗi: "Requested entity was not found"
- Kiểm tra lại Spreadsheet ID có đúng không
- Đảm bảo Google Sheet tồn tại và bạn có quyền truy cập

### Lỗi: "Invalid JSON"
- Kiểm tra lại `GOOGLE_SERVICE_ACCOUNT_KEY` có phải là JSON string hợp lệ không
- Nếu dùng file `credentials.json`, đảm bảo file có định dạng JSON đúng

### Không thấy dữ liệu trong Sheets
- Kiểm tra console log xem có thông báo lỗi không
- Đảm bảo Google Sheets API đã được bật
- Kiểm tra lại quyền truy cập của Service Account

