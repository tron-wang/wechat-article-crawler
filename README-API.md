# 微信文章爬蟲 API 服務

🚀 一個基於 Playwright 的微信文章爬蟲 API 服務，支持通過 HTTP 請求爬取微信公眾號文章。

## ✨ 功能特點

- 🌐 **HTTP API 接口**: 支持 RESTful API 調用
- 📖 **單篇爬取**: 爬取指定微信文章
- 📚 **批量爬取**: 支持批量爬取多篇文章
- 🐳 **Docker 支持**: 一鍵部署到雲端
- 🛡️ **安全防護**: 內建速率限制和錯誤處理
- 📊 **詳細日誌**: 完整的請求追蹤和錯誤記錄
- 🔄 **自動重試**: 智能重試機制
- 📁 **多格式輸出**: 支持 JSON 和 CSV 格式

## 🚀 快速開始

### 本地運行

```bash
# 1. 安裝依賴
npm install

# 2. 安裝 Playwright 瀏覽器
npm run install-browsers

# 3. 啟動服務器
npm run server

# 4. 測試 API
npm run test-api
```

### Docker 運行

```bash
# 1. 構建鏡像
docker build -t wechat-crawler .

# 2. 運行容器
docker run -d -p 3000:3000 wechat-crawler

# 3. 使用 Docker Compose
docker-compose up -d
```

## 📡 API 使用

### 基礎 URL
```
http://localhost:3000
```

### 主要端點

#### 1. 爬取單篇文章
```bash
POST /api/crawl
Content-Type: application/json

{
  "url": "https://mp.weixin.qq.com/s/your-article-url",
  "options": {
    "headless": true,
    "timeout": 30000,
    "delay": 3000
  }
}
```

#### 2. 批量爬取文章
```bash
POST /api/crawl/batch
Content-Type: application/json

{
  "urls": [
    "https://mp.weixin.qq.com/s/url1",
    "https://mp.weixin.qq.com/s/url2"
  ],
  "options": {
    "headless": true,
    "delay": 5000
  }
}
```

#### 3. 健康檢查
```bash
GET /health
```

## 💻 客戶端示例

### JavaScript/Node.js

```javascript
const axios = require('axios');

// 爬取單篇文章
const response = await axios.post('http://localhost:3000/api/crawl', {
  url: 'https://mp.weixin.qq.com/s/your-article-url',
  options: {
    headless: true,
    delay: 3000
  }
});

console.log(response.data);
```

### Python

```python
import requests

# 爬取單篇文章
response = requests.post('http://localhost:3000/api/crawl', json={
    'url': 'https://mp.weixin.qq.com/s/your-article-url',
    'options': {
        'headless': True,
        'delay': 3000
    }
})

print(response.json())
```

### cURL

```bash
curl -X POST http://localhost:3000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://mp.weixin.qq.com/s/your-article-url",
    "options": {
      "headless": true,
      "delay": 3000
    }
  }'
```

## ☁️ 雲端部署

### 1. Heroku

```bash
# 創建應用
heroku create your-app-name

# 設置環境變量
heroku config:set NODE_ENV=production

# 部署
git push heroku main
```

### 2. Railway

1. 連接 GitHub 倉庫
2. 選擇項目根目錄
3. 自動部署

### 3. DigitalOcean App Platform

1. 創建新應用
2. 連接 GitHub 倉庫
3. 配置構建設置

### 4. AWS EC2

```bash
# 使用 Docker Compose
docker-compose up -d
```

### 5. Google Cloud Run

```bash
# 構建並部署
gcloud builds submit --tag gcr.io/PROJECT_ID/wechat-crawler
gcloud run deploy --image gcr.io/PROJECT_ID/wechat-crawler
```

## 📊 響應格式

### 成功響應

```json
{
  "success": true,
  "data": {
    "title": "文章標題",
    "author": "作者名稱",
    "publishTime": "發布時間",
    "content": "HTML 內容",
    "textContent": "純文本內容",
    "summary": "文章摘要",
    "images": ["圖片URL1", "圖片URL2"],
    "articleUrl": "文章鏈接",
    "crawledAt": "爬取時間"
  },
  "requestId": "uuid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 錯誤響應

```json
{
  "success": false,
  "error": "錯誤信息",
  "requestId": "uuid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## ⚙️ 配置選項

| 選項 | 類型 | 默認值 | 說明 |
|------|------|--------|------|
| `headless` | boolean | true | 是否使用無頭模式 |
| `timeout` | number | 30000 | 頁面加載超時時間（毫秒） |
| `delay` | number | 3000 | 請求延遲時間（毫秒） |
| `maxRetries` | number | 3 | 最大重試次數 |

## 🛡️ 安全特性

- **速率限制**: 每 15 分鐘最多 100 次請求
- **輸入驗證**: 嚴格驗證 URL 格式
- **錯誤處理**: 完整的錯誤捕獲和日誌記錄
- **資源限制**: 內存和 CPU 使用限制
- **CORS 支持**: 跨域請求支持

## 📈 性能優化

- **並發控制**: 限制同時爬取的數量
- **緩存機制**: 避免重複爬取
- **資源管理**: 自動清理瀏覽器資源
- **錯誤重試**: 智能重試機制

## 🔧 故障排除

### 常見問題

1. **瀏覽器啟動失敗**
   ```bash
   npx playwright install --with-deps chromium
   ```

2. **內存不足**
   - 增加容器內存限制
   - 減少並發爬取數量

3. **超時錯誤**
   - 增加 timeout 設置
   - 檢查網絡連接

### 日誌查看

```bash
# Docker 容器日誌
docker logs -f wechat-crawler

# Docker Compose 日誌
docker-compose logs -f
```

## 📚 文檔

- [API 文檔](./api-docs.md)
- [部署指南](./DEPLOYMENT.md)
- [客戶端示例](./client-example.js)

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 許可證

MIT License

## 🆘 支持

如有問題，請提交 Issue 或聯繫開發者。

---

**注意**: 請確保您有權爬取目標文章，遵守相關法律法規和網站服務條款。
