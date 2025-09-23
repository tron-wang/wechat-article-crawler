# 微信文章爬蟲 API 文檔

## 概述

這是一個基於 HTTP API 的微信文章爬蟲服務，支持單篇和批量文章爬取。

## 基礎信息

- **基礎 URL**: `http://localhost:3000` (本地) 或您的雲端服務器地址
- **API 版本**: v1.0.0
- **支持格式**: JSON
- **認證**: 無需認證

## 端點列表

### 1. 健康檢查

**GET** `/health`

檢查服務器狀態。

**響應示例**:
```json
{
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "version": "1.0.0"
}
```

### 2. 爬取單篇文章

**POST** `/api/crawl`

爬取指定的微信文章。

**請求參數**:
```json
{
    "url": "https://mp.weixin.qq.com/s/your-article-url",
    "options": {
        "headless": true,
        "timeout": 30000,
        "delay": 3000
    }
}
```

**參數說明**:
- `url` (必需): 微信文章 URL
- `options` (可選): 爬蟲配置選項
  - `headless`: 是否使用無頭模式 (默認: true)
  - `timeout`: 頁面加載超時時間，毫秒 (默認: 30000)
  - `delay`: 請求延遲時間，毫秒 (默認: 3000)

**響應示例**:
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

### 3. 批量爬取文章

**POST** `/api/crawl/batch`

批量爬取多篇微信文章。

**請求參數**:
```json
{
    "urls": [
        "https://mp.weixin.qq.com/s/url1",
        "https://mp.weixin.qq.com/s/url2",
        "https://mp.weixin.qq.com/s/url3"
    ],
    "options": {
        "headless": true,
        "timeout": 30000,
        "delay": 5000
    }
}
```

**參數說明**:
- `urls` (必需): 微信文章 URL 數組，最多 10 篇
- `options` (可選): 爬蟲配置選項

**響應示例**:
```json
{
    "success": true,
    "data": {
        "articles": [
            {
                "title": "文章1標題",
                "author": "作者1",
                // ... 其他字段
            }
        ],
        "statistics": {
            "success": 2,
            "failed": 1,
            "skipped": 0,
            "errors": [
                {
                    "url": "https://mp.weixin.qq.com/s/failed-url",
                    "error": "錯誤信息",
                    "timestamp": "2024-01-01T00:00:00.000Z"
                }
            ]
        }
    },
    "requestId": "uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4. 獲取服務狀態

**GET** `/api/status`

獲取服務器運行狀態。

**響應示例**:
```json
{
    "status": "running",
    "uptime": 3600,
    "memory": {
        "rss": 123456789,
        "heapTotal": 123456789,
        "heapUsed": 123456789,
        "external": 123456789
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 5. 下載爬取結果

**GET** `/api/download/:format`

下載爬取結果文件。

**參數**:
- `format`: 文件格式 (`json` 或 `csv`)
- `filename` (查詢參數): 文件名

**示例**:
- `GET /api/download/json?filename=articles.json`
- `GET /api/download/csv?filename=articles.csv`

## 錯誤處理

所有 API 響應都包含以下字段：

**成功響應**:
```json
{
    "success": true,
    "data": { /* 實際數據 */ },
    "requestId": "uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**錯誤響應**:
```json
{
    "success": false,
    "error": "錯誤信息",
    "requestId": "uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 速率限制

- 每 15 分鐘最多 100 次請求
- 超過限制會返回 429 狀態碼

## 使用示例

### cURL 示例

**爬取單篇文章**:
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

**批量爬取**:
```bash
curl -X POST http://localhost:3000/api/crawl/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://mp.weixin.qq.com/s/url1",
      "https://mp.weixin.qq.com/s/url2"
    ]
  }'
```

### JavaScript 示例

```javascript
// 爬取單篇文章
const response = await fetch('http://localhost:3000/api/crawl', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        url: 'https://mp.weixin.qq.com/s/your-article-url',
        options: {
            headless: true,
            delay: 3000
        }
    })
});

const result = await response.json();
console.log(result);
```

### Python 示例

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

result = response.json()
print(result)
```

## 注意事項

1. **URL 格式**: 只支持微信公眾號文章 URL (`https://mp.weixin.qq.com/s/...`)
2. **批量限制**: 批量爬取最多支持 10 篇文章
3. **超時設置**: 建議設置適當的超時時間
4. **反爬蟲**: 建議設置合理的延遲時間
5. **資源使用**: 爬蟲會消耗較多內存和 CPU 資源
