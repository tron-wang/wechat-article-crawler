# Railway 部署指南

## 🚀 快速部署到 Railway

### 1. 連接 GitHub 倉庫

1. 訪問 [railway.app](https://railway.app)
2. 使用 GitHub 帳號登入
3. 點擊 "New Project" → "Deploy from GitHub repo"
4. 搜索並選擇 `tron-wang/wechat-article-crawler`
5. 點擊 "Deploy"

### 2. 環境變量設置

在 Railway 項目設置中添加以下環境變量：

```bash
NODE_ENV=production
PORT=3000
```

### 3. 自動部署

Railway 會自動：
- 安裝 Node.js 依賴
- 安裝 Playwright 瀏覽器
- 啟動 API 服務器

### 4. 訪問您的 API

部署完成後，您會獲得一個公開 URL，例如：
`https://your-app-name.railway.app`

## 📋 API 端點

- **健康檢查**: `GET /health`
- **API 狀態**: `GET /api/status`
- **爬取單篇文章**: `POST /api/crawl`
- **批量爬取**: `POST /api/crawl/batch`
- **API 文檔**: `GET /api/docs`

## 🔧 故障排除

### 如果部署失敗：

1. 檢查 Railway 日誌
2. 確保所有依賴都已安裝
3. 檢查環境變量設置
4. 確認 Playwright 瀏覽器已正確安裝

### 常見問題：

- **內存不足**: Railway 免費版有內存限制，可能需要升級
- **超時**: 爬取操作可能需要較長時間，考慮增加超時設置
- **瀏覽器安裝失敗**: 檢查 `postinstall` 腳本是否正確執行

## 💡 優化建議

1. **使用 Railway Pro**: 獲得更多資源和功能
2. **設置自定義域名**: 在 Railway 設置中配置
3. **監控日誌**: 使用 Railway 的日誌功能監控應用狀態
4. **設置環境變量**: 根據需要調整爬蟲參數

## 📞 支持

如果遇到問題，請檢查：
- Railway 官方文檔
- 項目 GitHub Issues
- Railway 社區論壇
