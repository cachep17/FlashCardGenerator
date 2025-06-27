# Hướng dẫn thiết lập Gemini API

## Bước 1: Lấy API Key từ Google AI Studio

1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google
3. Nhấn "Create API Key"
4. Sao chép API key được tạo

## Bước 2: Cập nhật API Key trong dự án

### Cách 1: Cập nhật file .env

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### Cách 2: Cập nhật trong index.html

Tìm và thay thế trong file `index.html`:

```html
<meta name="gemini-api-key" content="your_actual_api_key_here" />
```

### Cách 3: Cập nhật trong config.js

Tìm và thay thế trong file `config.js`:

```javascript
this.GEMINI_API_KEY = "your_actual_api_key_here";
```

## Bước 3: Kiểm tra hoạt động

1. Mở ứng dụng trong browser
2. Nhập nội dung để tạo flashcard
3. Nhấn "Generate Flashcards"
4. Kiểm tra console nếu có lỗi

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**:

- Không chia sẻ API key với người khác
- Không commit API key lên GitHub
- Trong production, nên sử dụng server-side proxy để ẩn API key
- Hạn chế quyền truy cập API key trong Google Console

## Troubleshooting

### Lỗi "API key not configured"

- Kiểm tra API key đã được cập nhật đúng chưa
- Đảm bảo API key hợp lệ và chưa hết hạn

### Lỗi "Failed to generate flashcards"

- Kiểm tra kết nối internet
- Verify API key có quyền truy cập Gemini API
- Kiểm tra console để xem lỗi chi tiết

### Lỗi CORS

- Nếu chạy trên file://, hãy sử dụng local server
- Chạy: `python -m http.server 8000`
- Truy cập: `http://localhost:8000`
