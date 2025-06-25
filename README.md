# 📚 FlashCard Master - AI Flashcard Generator

Ứng dụng tạo thẻ ghi nhớ thông minh từ nội dung học tập bằng AI, với giao diện đẹp mắt và tính năng học tập tương tác.

## ✨ Tính năng chính

### 🌍 Đa ngôn ngữ

- **Việt Nam** 🇻🇳 - Giao diện tiếng Việt hoàn chỉnh
- **English** 🇺🇸 - Complete English interface
- **日本語** 🇯🇵 - 完全な日本語インターフェース
- **Français** 🇫🇷 - Interface française complète

### 🎯 Chế độ học tập tương tác

- **Study Mode**: Chế độ học có tương tác - người dùng trả lời trước khi xem đáp án
- **Self Assessment**: Tự đánh giá kết quả học tập
- **Progress Tracking**: Theo dõi tiến độ học tập real-time
- **Accuracy Statistics**: Thống kê độ chính xác câu trả lời

### 🎨 Giao diện đẹp mắt

- **Modern UI**: Thiết kế hiện đại với gradient và glassmorphism
- **Interactive Cards**: Thẻ flashcard với hiệu ứng hover và transition
- **Color-coded**: Mã màu theo loại nội dung (câu hỏi, đáp án, phản hồi)
- **Responsive Design**: Giao diện thích ứng mọi kích thước màn hình

### 🤖 AI Intelligence

- **Google Gemini**: AI chất lượng cao với API key tích hợp sẵn
- **Smart Generation**: Tạo flashcard thông minh từ nội dung

### 📝 Phương thức nhập liệu

- **Upload Files**: Hỗ trợ PDF, PowerPoint (.pptx)
- **Text Input**: Nhập trực tiếp văn bản
- **Content Editing**: Chỉnh sửa nội dung đã trích xuất

### 💾 Quản lý thẻ ghi nhớ

- **Create & Edit**: Tạo và chỉnh sửa flashcards dễ dàng
- **Save Sets**: Lưu và quản lý bộ thẻ
- **Quick Load**: Tải nhanh bộ thẻ đã lưu
- **Study Mode Integration**: Chuyển đổi liền mạch giữa các chế độ

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống

- Python 3.8+
- pip hoặc uv package manager
- Kết nối internet (để sử dụng AI)

### Hướng dẫn cài đặt

```bash
# 1. Clone repository
git clone <your-repo-url>
cd FlashCardGenerator

# 2. Cài đặt dependencies
pip install -r requirements.txt
# Hoặc sử dụng uv (nhanh hơn)
uv sync

# 3. Chạy ứng dụng
streamlit run app.py
```

### Cài đặt nhanh với Docker

```bash
# Build Docker image
docker build -t flashcard-app .

# Chạy container
docker run -p 8501:8501 flashcard-app
```

## 🔧 Cấu hình

### API Key đã tích hợp sẵn

- ✅ **Google Gemini API**: Đã được cấu hình sẵn trong ứng dụng
- ✅ **Không cần nhập key**: Người dùng không cần lo lắng về API key
- ✅ **Sẵn sàng sử dụng**: Chỉ cần chạy và bắt đầu tạo flashcard

### Bảo mật

- API key được lưu trữ an toàn trong `.streamlit/secrets.toml`
- File secrets không được commit vào git (đã thêm vào .gitignore)
- Phù hợp cho deployment production

## 📁 Cấu trúc Project

```
FlashCardGenerator/
├── app.py                    # Ứng dụng Streamlit chính
├── flashcard_generator.py    # Logic tạo flashcard cốt lõi
├── online_ai.py             # Tích hợp AI APIs
├── utils.py                 # Các hàm tiện ích (xử lý PDF, PPT)
├── lang_manager.py          # Hỗ trợ đa ngôn ngữ
├── language_manager.py      # Quản lý ngôn ngữ nâng cao
├── requirements.txt         # Các thư viện Python cần thiết
├── pyproject.toml          # Cấu hình project
├── .streamlit/
│   ├── config.toml         # Cấu hình Streamlit
│   └── secrets.toml        # API keys (không commit)
├── .gitignore              # Quy tắc loại trừ Git
└── README.md               # Tài liệu này
```

## 🎯 Hướng dẫn sử dụng

### Tạo flashcard mới

1. **Chọn phương thức nhập**: Upload file hoặc nhập text
2. **Cung cấp nội dung**: PDF, PPT hoặc text thuần
3. **Thiết lập**: Chọn chủ đề và số lượng thẻ
4. **Tạo flashcard**: Nhấn nút "Tạo Thẻ Ghi Nhớ"

### Sử dụng Study Mode

1. **Kích hoạt**: Nhấn nút "🎯 Study Mode"
2. **Trả lời**: Đọc câu hỏi và gõ câu trả lời
3. **Xem đáp án**: Nhấn "Show Answer"
4. **Tự đánh giá**: Chọn "Correct" hoặc "Need Practice"
5. **Theo dõi**: Xem tiến độ và độ chính xác

### Quản lý bộ thẻ

1. **Lưu bộ thẻ**: Đặt tên và lưu flashcard
2. **Xem bộ đã lưu**: Truy cập tab "Saved Sets"
3. **Tải nhanh**: Chọn bộ thẻ và nhấn "Load"
4. **Học ngay**: Nhấn "Study" để vào Study Mode

## 🌐 Deployment

### Streamlit Cloud (Khuyên dùng)

1. **Đẩy code lên GitHub**: Commit và push toàn bộ code
2. **Kết nối Streamlit Cloud**: Truy cập [share.streamlit.io](https://share.streamlit.io)
3. **Deploy**: Chọn repository và deploy tự động
4. **Cấu hình secrets**: Thêm `GOOGLE_API_KEY` vào Streamlit secrets

### Heroku Deployment

```bash
# Tạo Procfile
echo "web: streamlit run app.py --server.port=\$PORT --server.address=0.0.0.0" > Procfile

# Khởi tạo Heroku app
heroku create your-app-name

# Cấu hình API key
heroku config:set GOOGLE_API_KEY="your-api-key"

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Docker Container

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Cài đặt dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 8501

# Health check
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health

# Run application
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

### Railway/Render Deployment

- **Railway**: Kết nối GitHub và deploy tự động
- **Render**: Thiết lập Web Service với build command `pip install -r requirements.txt`
- **Start command**: `streamlit run app.py --server.port=$PORT --server.address=0.0.0.0`

## 🔄 Tính năng AI

### Google Gemini Integration

- **API tích hợp sẵn**: Không cần cấu hình thêm
- **Chất lượng cao**: Tạo flashcard thông minh và chính xác
- **Đa ngôn ngữ**: Hỗ trợ tạo flashcard bằng nhiều ngôn ngữ
- **Tối ưu hóa**: Prompt được tối ưu cho việc tạo flashcard học tập

### Mở rộng AI APIs

Để thêm AI API mới:

1. **Implement trong `online_ai.py`**:

```python
def generate_with_new_api(content, subject, num_cards):
    # Implementation here
    pass
```

2. **Thêm vào danh sách ưu tiên**:

```python
self.apis["new_api"] = {
    "enabled": True,
    "free": True
}
```

3. **Cập nhật language files** nếu cần thiết

## 🐛 Khắc phục sự cố

### Lỗi thường gặp

| Lỗi                       | Nguyên nhân                 | Giải pháp                     |
| ------------------------- | --------------------------- | ----------------------------- |
| **Upload thất bại**       | Định dạng file không hỗ trợ | Chỉ sử dụng PDF hoặc PPTX     |
| **AI generation lỗi**     | API không phản hồi          | Thử lại hoặc kiểm tra kết nối |
| **Ngôn ngữ không chuyển** | Cache browser               | Xóa cache hoặc refresh trang  |
| **Flashcard trống**       | Nội dung không đủ           | Cung cấp nội dung dài hơn     |

### Tối ưu hiệu suất

- **File lớn**: Có thể mất thời gian xử lý, hãy kiên nhẫn
- **AI generation**: Phụ thuộc vào tốc độ API, thường 10-30 giây
- **Study mode**: Dữ liệu được lưu trong session, làm mới trang sẽ mất dữ liệu
- **Responsive**: Giao diện tự động thích ứng với màn hình di động

### Debug Mode

Để bật debug mode, thêm vào URL: `?debug=true`

```
http://localhost:8501/?debug=true
```

## 🤝 Đóng góp

### Cách đóng góp

1. **Fork repository**: Tạo bản sao của project
2. **Tạo branch mới**: `git checkout -b feature/tinh-nang-moi`
3. **Commit changes**: `git commit -m 'Thêm tính năng mới'`
4. **Push branch**: `git push origin feature/tinh-nang-moi`
5. **Tạo Pull Request**: Mở PR để review và merge

### Guideline đóng góp

- **Code style**: Tuân thủ PEP 8 cho Python
- **Comments**: Viết comment bằng tiếng Việt hoặc tiếng Anh
- **Testing**: Test kỹ trước khi submit
- **Documentation**: Cập nhật README nếu cần

### Ý tưởng phát triển

- 🔄 **Export/Import**: Xuất flashcard ra file JSON/CSV
- 🎮 **Game Mode**: Chế độ chơi game với flashcard
- 📊 **Analytics**: Thống kê học tập chi tiết
- 🔊 **Text-to-Speech**: Đọc flashcard bằng giọng nói
- 📱 **Mobile App**: Ứng dụng di động
- 🌐 **Offline Mode**: Hoạt động không cần internet

## 📄 Giấy phép

Dự án này được phân phối dưới giấy phép MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

### Quyền được phép

- ✅ Sử dụng thương mại
- ✅ Sửa đổi
- ✅ Phân phối
- ✅ Sử dụng riêng tư

### Điều kiện

- 📋 Giữ nguyên thông tin license
- 📋 Giữ nguyên thông tin copyright

## 🙏 Lời cảm ơn

### Công nghệ sử dụng

- **[Streamlit](https://streamlit.io/)** - Framework web tuyệt vời cho Python
- **[Google Gemini](https://ai.google.dev/)** - AI API chất lượng cao
- **[PyPDF2](https://pypdf2.readthedocs.io/)** - Xử lý file PDF
- **[python-pptx](https://python-pptx.readthedocs.io/)** - Xử lý PowerPoint

### Inspiration

- **Anki** - Inspiration cho spaced repetition
- **Quizlet** - Inspiration cho flashcard design
- **Notion** - Inspiration cho modern UI

### Community

Cảm ơn cộng đồng open source đã đóng góp ý kiến và feedback!

---

<div align="center">

**📚 FlashCard Master - Học thông minh hơn với AI**

Made with ❤️ in Vietnam

[🌟 Star this repo](https://github.com/your-username/flashcard-generator) • [🐛 Report Bug](https://github.com/your-username/flashcard-generator/issues) • [💡 Request Feature](https://github.com/your-username/flashcard-generator/issues)

</div>
