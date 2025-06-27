// Configuration for API keys and environment variables
class Config {
  constructor() {
    // Sử dụng API key cố định từ .env file
    // Trong thực tế, bạn nên đọc từ server-side để bảo mật
    this.GEMINI_API_KEY = 'AIzaSyAVHNSx9UKsyx2frEC82ngtdwQJpm8JstQ'; // Thay bằng API key thật của bạn
    this.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    // Load API key từ .env nếu có
    this.loadFromEnv();
  }

  loadFromEnv() {
    // Trong môi trường thực tế, bạn sẽ cần một endpoint server để lấy API key
    // Ở đây chúng ta sẽ sử dụng API key cố định

    // Bạn có thể thay thế giá trị này bằng API key thật từ file .env
    // Ví dụ: Đọc từ meta tag hoặc inline script được server render
    const metaApiKey = document.querySelector('meta[name="gemini-api-key"]');
    if (metaApiKey) {
      this.GEMINI_API_KEY = metaApiKey.getAttribute('content');
    }
  }

  hasValidApiKey() {
    return this.GEMINI_API_KEY && this.GEMINI_API_KEY.length > 0;
  }

  getApiKey() {
    return this.GEMINI_API_KEY;
  }

  // Phương thức để cập nhật API key nếu cần
  setApiKey(key) {
    if (key && key.trim()) {
      this.GEMINI_API_KEY = key.trim();
      return true;
    }
    return false;
  }

  async testApiConnection() {
    try {
      console.log('Testing API connection...');
      console.log('API URL:', this.GEMINI_API_URL);
      console.log('API Key (first 10 chars):', this.GEMINI_API_KEY.substring(0, 10) + '...');

      const testPrompt = "Say hello in JSON format like this: {\"message\": \"hello\"}";

      const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: testPrompt
            }]
          }]
        })
      });

      console.log('Test response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Test API Error:', errorData);
        return false;
      }

      const data = await response.json();
      console.log('Test API Response:', data);
      return true;

    } catch (error) {
      console.error('API Connection Test Failed:', error);
      return false;
    }
  }
}

// Create global config instance
const config = new Config();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Config, config };
} else {
  window.config = config;
}
