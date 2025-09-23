# 微信文章爬蟲

使用 Playwright 爬取微信公眾號文章的 Node.js 爬蟲工具。

## 功能特點

- 🚀 基於 Playwright 的高性能爬蟲
- 📖 支持單篇和批量文章爬取
- 💾 支持 JSON 和 CSV 格式輸出
- 🛡️ 內建反爬蟲機制
- 🔄 自動重試和錯誤處理
- 📊 詳細的日誌記錄
- ⚙️ 靈活的配置選項

## 安裝

1. 克隆或下載項目
```bash
cd /Users/joe-wang/my-n8n-project/Playwright
```

2. 安裝依賴
```bash
npm install
```

3. 安裝 Playwright 瀏覽器
```bash
npm run install-browsers
```

## 快速開始

### 基本使用

```javascript
const WeChatArticleCrawler = require('./src/crawler');

async function main() {
    const crawler = new WeChatArticleCrawler({
        headless: false, // 設為 false 可以看到瀏覽器操作
        outputDir: './output'
    });

    try {
        await crawler.init();
        
        // 爬取單篇文章
        const article = await crawler.crawlWeChatArticle('https://mp.weixin.qq.com/s/your-article-url');
        
        // 保存數據
        await crawler.saveToJSON();
        await crawler.saveToCSV();
        
    } finally {
        await crawler.close();
    }
}

main();
```

### 批量爬取

```javascript
const articleUrls = [
    'https://mp.weixin.qq.com/s/url1',
    'https://mp.weixin.qq.com/s/url2',
    'https://mp.weixin.qq.com/s/url3'
];

const articles = await crawler.crawlMultipleArticles(articleUrls);
```

## 配置選項

```javascript
const crawler = new WeChatArticleCrawler({
    headless: true,           // 是否使用無頭模式
    timeout: 30000,           // 頁面加載超時時間
    delay: 2000,              // 請求間隔時間
    maxRetries: 3,            // 最大重試次數
    userAgent: '...',         // 自定義 User-Agent
    outputDir: './output'     // 輸出目錄
});
```

## 輸出數據格式

### JSON 格式
```json
{
  "title": "文章標題",
  "author": "作者名稱",
  "publishTime": "發布時間",
  "content": "HTML 內容",
  "textContent": "純文本內容",
  "summary": "文章摘要",
  "images": ["圖片URL1", "圖片URL2"],
  "articleUrl": "文章鏈接",
  "crawledAt": "爬取時間"
}
```

### CSV 格式
包含標題、作者、發布時間、摘要、文章鏈接、爬取時間等字段。

## 運行示例

```bash
# 運行示例代碼
node src/example.js

# 運行爬蟲
npm start
```

## 注意事項

1. **合法使用**: 請確保您有權爬取目標文章，遵守相關法律法規和網站服務條款。

2. **反爬蟲**: 建議設置適當的延遲時間，避免過於頻繁的請求。

3. **URL 格式**: 確保提供的 URL 是有效的微信文章鏈接，格式為 `https://mp.weixin.qq.com/s/...`

4. **網絡環境**: 某些地區可能需要配置代理才能訪問微信公眾號。

## 文件結構

```
Playwright/
├── src/
│   ├── crawler.js      # 主爬蟲類
│   ├── example.js      # 使用示例
│   ├── config.js       # 配置文件
│   └── utils.js        # 工具函數
├── output/             # 輸出目錄
├── package.json        # 項目配置
└── README.md          # 說明文檔
```

## 故障排除

### 常見問題

1. **瀏覽器啟動失敗**
   ```bash
   npm run install-browsers
   ```

2. **頁面加載超時**
   - 檢查網絡連接
   - 增加 timeout 配置值
   - 檢查 URL 是否有效

3. **爬取失敗**
   - 檢查文章是否公開
   - 嘗試增加延遲時間
   - 檢查反爬蟲機制

## 開發

### 添加新功能

1. 在 `src/crawler.js` 中擴展 `WeChatArticleCrawler` 類
2. 在 `src/utils.js` 中添加工具函數
3. 更新配置文件 `src/config.js`

### 調試

設置 `headless: false` 可以看到瀏覽器操作過程，便於調試。

## 許可證

MIT License
