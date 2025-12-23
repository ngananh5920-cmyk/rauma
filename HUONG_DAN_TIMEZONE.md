# Hướng dẫn cấu hình Timezone trên Render

## Vấn đề
Khi deploy lên Render, thời gian ghi vào Google Sheets có thể không đúng múi giờ Việt Nam (UTC+7).

## Giải pháp

### 1. Đảm bảo code đã được cập nhật
Code đã được cập nhật với hàm `formatVietnamTime` có fallback để đảm bảo luôn hiển thị đúng giờ Việt Nam.

### 2. Cấu hình Environment Variable trên Render (Tùy chọn)
Nếu muốn đảm bảo server sử dụng timezone đúng, có thể set:

```
TZ=Asia/Ho_Chi_Minh
```

**Cách thêm:**
1. Vào Render Dashboard
2. Chọn service của bạn
3. Vào tab "Environment"
4. Thêm variable: `TZ` = `Asia/Ho_Chi_Minh`
5. Save và redeploy

### 3. Kiểm tra
Sau khi deploy, kiểm tra thời gian trong Google Sheets:
- Thời gian phải là giờ Việt Nam (UTC+7)
- Format: DD/MM/YYYY, HH:mm:ss

### 4. Nếu vẫn sai
Code đã có fallback tự động tính toán thủ công, nên sẽ luôn hiển thị đúng giờ Việt Nam dù server ở timezone nào.

## Lưu ý
- Code hiện tại đã tự động convert UTC sang VN time
- Không cần cài thêm package nào
- Hoạt động trên mọi server (local, Render, Vercel, etc.)

