# 增強版反爬蟲機制

## 更新內容

### 1. 多策略反爬蟲機制

新增了 4 種不同的反爬蟲策略：

#### 策略1: 標準配置
- **用戶代理**: Chrome on macOS
- **視窗大小**: 1920x1080
- **延遲**: 3秒
- **超時**: 30秒

#### 策略2: 移動端模擬
- **用戶代理**: iPhone Safari
- **視窗大小**: 375x667 (手機尺寸)
- **延遲**: 5秒
- **超時**: 45秒

#### 策略3: 延長等待時間
- **用戶代理**: Chrome on Windows
- **視窗大小**: 1366x768
- **延遲**: 8秒
- **超時**: 90秒

#### 策略4: 高級瀏覽器模擬
- **用戶代理**: Edge on macOS
- **視窗大小**: 1440x900
- **延遲**: 10秒
- **超時**: 120秒
- **額外HTTP頭**: 完整的瀏覽器請求頭

### 2. 會話建立機制

每次爬取前會：
1. 先訪問 `https://mp.weixin.qq.com` 建立會話
2. 等待 3 秒讓會話穩定
3. 再訪問目標文章

### 3. 智能重試機制

- **多層重試**: 每個策略失敗後嘗試下一個策略
- **全局重試**: 所有策略失敗後等待 10-30 秒重試
- **最大重試次數**: 3 次全局重試

### 4. 驗證頁面檢測

自動檢測並處理：
- "環境異常" 頁面
- "驗證" 頁面
- 其他異常頁面

### 5. 錯誤截圖

每次失敗時自動截圖保存，便於調試：
- 文件路徑: `./temp/error_{requestId}_strategy_{策略編號}.png`

## 使用方法

### 基本使用

```bash
curl -X POST https://wechat-article-crawler-production.up.railway.app/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://mp.weixin.qq.com/s/your-article-url"}'
```

### 自定義策略

```bash
curl -X POST https://wechat-article-crawler-production.up.railway.app/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://mp.weixin.qq.com/s/your-article-url",
    "options": {
      "maxRetries": 2,
      "strategies": [
        {
          "name": "自定義策略",
          "options": {
            "headless": true,
            "delay": 5000,
            "timeout": 60000,
            "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        }
      ]
    }
  }'
```

### 批量爬取

```bash
curl -X POST https://wechat-article-crawler-production.up.railway.app/api/crawl/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://mp.weixin.qq.com/s/article1",
      "https://mp.weixin.qq.com/s/article2"
    ],
    "options": {
      "maxRetries": 2
    }
  }'
```

## 測試

運行測試腳本：

```bash
node test-enhanced-api.js
```

## 部署到 Railway

1. 提交代碼到 GitHub
2. Railway 會自動重新部署
3. 新版本將包含所有反爬蟲增強功能

## 監控和調試

- 查看 Railway 日誌了解爬取過程
- 檢查 `./temp/` 目錄中的錯誤截圖
- 使用 `/api/status` 端點監控服務狀態

## 注意事項

1. **請求頻率**: 建議在請求間隔 5-10 秒
2. **超時設置**: 複雜文章可能需要更長的超時時間
3. **內存使用**: 批量爬取時注意內存使用情況
4. **錯誤處理**: 失敗時會自動嘗試多種策略

## 故障排除

### 常見問題

1. **所有策略都失敗**
   - 檢查文章是否仍然可訪問
   - 嘗試手動在瀏覽器中訪問
   - 等待一段時間後重試

2. **超時錯誤**
   - 增加 timeout 設置
   - 檢查網絡連接
   - 嘗試不同的策略

3. **內存不足**
   - 減少批量爬取的數量
   - 增加 Railway 的內存配置

### 調試步驟

1. 查看錯誤截圖
2. 檢查 Railway 日誌
3. 嘗試不同的用戶代理
4. 調整延遲和超時設置
