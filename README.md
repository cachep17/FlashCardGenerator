# FlashCard Generator - AI-Powered Learning

Ứng dụng tạo thẻ học tập tự động sử dụng AI Gemini từ Google.

## 🚀 Cách sử dụng nhanh

### Bước 1: Mở ứng dụng

- Mở file `start.html` trong trình duyệt web
- Hoặc mở trực tiếp file `index.html`

### Bước 2: Tạo flashcard

1. Nhập nội dung học tập vào ô "Text Input"
2. Chọn số lượng thẻ muốn tạo (3-20 thẻ)
3. Click "Generate Flashcards"
4. Chờ AI tạo thẻ (có thể mất vài giây)

### Bước 3: Học tập

- Xem thẻ ở tab "View Cards"
- Dùng "Study Mode" để tự kiểm tra
- Lưu bộ thẻ để sử dụng sau

## ✨ Tính năng chính

- **🤖 AI thông minh**: Tự động tạo câu hỏi từ nội dung bạn cung cấp
- **🌏 Đa ngôn ngữ**: Hỗ trợ tiếng Việt và tiếng Anh
- **🌙 Theme đẹp mắt**: Chuyển đổi giao diện sáng/tối
- **📱 Responsive**: Hoạt động tốt trên điện thoại, máy tính bảng
- **💾 Lưu trữ local**: Tự động lưu trong trình duyệt

## 🎯 Hướng dẫn chi tiết

### Chuyển ngôn ngữ

- Click dropdown 🇺🇸/🇻🇳 ở góc phải trên
- Chọn ngôn ngữ mong muốn
- Giao diện sẽ tự động cập nhật

### Chuyển theme sáng/tối

- Click icon 🌙/☀️ để chuyển đổi
- Lựa chọn được lưu tự động

### Tạo flashcard hiệu quả

1. **Nội dung chất lượng**: Cung cấp văn bản có cấu trúc rõ ràng
2. **Độ dài vừa phải**: 1-3 đoạn văn cho kết quả tốt nhất
3. **Chủ đề cụ thể**: Nên có chủ đề rõ ràng (VD: "Lịch sử Việt Nam", "Toán học")

### Chế độ học tập

1. Tạo flashcard trước
2. Chuyển sang tab "View Cards"
3. Click "Study Mode"
4. Nhập câu trả lời của bạn
5. Click "Check Answer" để xem đáp án
6. Đánh giá "Correct" hoặc "Need Practice"

## 📋 Yêu cầu

- Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)
- Kết nối internet (để gọi AI)
- Không cần cài đặt gì thêm!

## 🔧 Cấu trúc project

```
FlashCardGenerator/
├── start.html          # Trang khởi động
├── index.html          # Ứng dụng chính
├── script.js           # Logic chính
├── language.js         # Đa ngôn ngữ
├── config.js           # Cấu hình API
├── styles.css          # Giao diện
├── .env               # API key (đã cấu hình sẵn)
└── README.md          # Hướng dẫn này
```

## Tips sử dụng

1. **Nội dung tốt**: Dán văn bản có cấu trúc rõ ràng
2. **Số lượng hợp lý**: 5-10 thẻ cho chất lượng tốt
3. **Xem lại**: Luôn kiểm tra và chỉnh sửa nếu cần
4. **Học đều đặn**: Dùng Study Mode thường xuyên
5. **Tổ chức tốt**: Đặt tên có ý nghĩa cho bộ thẻ

## � Lưu ý

- API key đã được cấu hình sẵn
- Ứng dụng chạy hoàn toàn trên trình duyệt
- Dữ liệu lưu trong trình duyệt (localStorage)
- Không cần server hay cài đặt phức tạp

## 🐛 Khắc phục sự cố

### Không tạo được flashcard

- Kiểm tra kết nối internet
- Thử refresh trang
- Đảm bảo nội dung không quá ngắn

### Giao diện bị lỗi

- Thử trình duyệt khác
- Xóa cache trình duyệt
- Đảm bảo JavaScript được bật

---

**Lưu ý**: Ứng dụng sử dụng AI Gemini của Google để tạo flashcard. API key đã được cấu hình sẵn cho việc demo.
