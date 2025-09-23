# 微信文章爬蟲 API 部署指南

## 本地開發

### 1. 安裝依賴

```bash
npm install
```

### 2. 安裝 Playwright 瀏覽器

```bash
npm run install-browsers
```

### 3. 啟動服務器

```bash
# 開發模式（自動重啟）
npm run dev

# 生產模式
npm run server
```

### 4. 測試 API

```bash
# 健康檢查
curl http://localhost:3000/health

# 爬取單篇文章
curl -X POST http://localhost:3000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://mp.weixin.qq.com/s/your-article-url"}'
```

## Docker 部署

### 1. 構建 Docker 鏡像

```bash
docker build -t wechat-crawler .
```

### 2. 運行容器

```bash
docker run -d \
  --name wechat-crawler \
  -p 3000:3000 \
  -v $(pwd)/temp:/app/temp \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/logs:/app/logs \
  wechat-crawler
```

### 3. 使用 Docker Compose

```bash
# 啟動服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

## 雲端部署

### 1. Heroku 部署

#### 創建 Heroku 應用

```bash
# 安裝 Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 登錄 Heroku
heroku login

# 創建應用
heroku create your-app-name

# 設置環境變量
heroku config:set NODE_ENV=production
heroku config:set PORT=3000

# 部署
git push heroku main
```

#### 添加 Heroku 構建包

創建 `app.json`:

```json
{
  "name": "WeChat Article Crawler",
  "description": "微信文章爬蟲 API 服務",
  "repository": "https://github.com/your-username/wechat-crawler",
  "logo": "https://node-js-sample.herokuapp.com/node.png",
  "keywords": ["node", "express", "playwright", "crawler"],
  "buildpacks": [
    {
      "url": "https://github.com/jontewks/puppeteer-heroku-buildpack"
    },
    {
      "url": "heroku/nodejs"
    }
  ],
  "formation": {
    "web": {
      "quantity": 1,
      "size": "basic"
    }
  }
}
```

### 2. Railway 部署

#### 連接 GitHub 倉庫

1. 訪問 [Railway](https://railway.app)
2. 連接您的 GitHub 倉庫
3. 選擇項目根目錄
4. Railway 會自動檢測並部署

#### 環境變量設置

在 Railway 控制台設置：
- `NODE_ENV=production`
- `PORT=3000`

### 3. DigitalOcean App Platform 部署

#### 創建應用

1. 訪問 [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. 選擇 "Create App"
3. 連接 GitHub 倉庫
4. 配置構建設置

#### 構建配置

```yaml
name: wechat-crawler
services:
- name: web
  source_dir: /
  github:
    repo: your-username/wechat-crawler
    branch: main
  run_command: node server.js
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
  routes:
  - path: /
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "3000"
```

### 4. AWS EC2 部署

#### 創建 EC2 實例

```bash
# 使用 Ubuntu 20.04 LTS
# 實例類型: t3.medium 或更大
# 安全組: 開放 3000 端口
```

#### 安裝 Docker

```bash
# 更新系統
sudo apt update

# 安裝 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 添加用戶到 docker 組
sudo usermod -aG docker $USER

# 安裝 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 部署應用

```bash
# 克隆倉庫
git clone https://github.com/your-username/wechat-crawler.git
cd wechat-crawler

# 使用 Docker Compose 部署
docker-compose up -d
```

### 5. Google Cloud Run 部署

#### 創建 Dockerfile

確保 Dockerfile 存在（已創建）

#### 部署到 Cloud Run

```bash
# 安裝 gcloud CLI
# https://cloud.google.com/sdk/docs/install

# 設置項目
gcloud config set project YOUR_PROJECT_ID

# 構建並推送鏡像
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/wechat-crawler

# 部署到 Cloud Run
gcloud run deploy wechat-crawler \
  --image gcr.io/YOUR_PROJECT_ID/wechat-crawler \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --timeout 900 \
  --max-instances 10
```

## 環境變量配置

### 必需環境變量

- `NODE_ENV`: 運行環境 (production/development)
- `PORT`: 服務端口 (默認: 3000)

### 可選環境變量

- `CORS_ORIGIN`: CORS 允許的源
- `RATE_LIMIT_WINDOW`: 速率限制時間窗口（毫秒）
- `RATE_LIMIT_MAX`: 速率限制最大請求數

## 監控和日誌

### 1. 健康檢查

```bash
curl http://your-domain.com/health
```

### 2. 服務狀態

```bash
curl http://your-domain.com/api/status
```

### 3. 日誌查看

#### Docker 容器

```bash
# 查看實時日誌
docker logs -f wechat-crawler

# 查看最近 100 行日誌
docker logs --tail 100 wechat-crawler
```

#### Docker Compose

```bash
# 查看所有服務日誌
docker-compose logs -f

# 查看特定服務日誌
docker-compose logs -f wechat-crawler
```

## 性能優化

### 1. 資源限制

在 `docker-compose.yml` 中設置：

```yaml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
    reservations:
      memory: 1G
      cpus: '0.5'
```

### 2. 並發控制

在服務器代碼中限制並發爬取數量：

```javascript
// 在 server.js 中添加
const MAX_CONCURRENT_CRAWLS = 3;
let activeCrawls = 0;
```

### 3. 緩存策略

可以添加 Redis 緩存來避免重複爬取：

```javascript
const redis = require('redis');
const client = redis.createClient();

// 檢查緩存
const cached = await client.get(`article:${url}`);
if (cached) {
    return JSON.parse(cached);
}
```

## 故障排除

### 1. 常見問題

**Playwright 瀏覽器啟動失敗**:
```bash
# 重新安裝瀏覽器
npx playwright install --with-deps chromium
```

**內存不足**:
- 增加容器內存限制
- 減少並發爬取數量
- 優化爬蟲代碼

**超時錯誤**:
- 增加 timeout 設置
- 檢查網絡連接
- 調整延遲時間

### 2. 日誌分析

```bash
# 查看錯誤日誌
grep "ERROR" logs/crawler.log

# 查看爬取統計
grep "爬取完成" logs/crawler.log
```

## 安全建議

1. **使用 HTTPS**: 在生產環境中啟用 SSL/TLS
2. **API 認證**: 添加 API 密鑰或 JWT 認證
3. **速率限制**: 設置合理的速率限制
4. **輸入驗證**: 嚴格驗證輸入 URL
5. **資源限制**: 限制內存和 CPU 使用
6. **日誌安全**: 避免記錄敏感信息

## 擴展功能

### 1. 添加認證

```javascript
const jwt = require('jsonwebtoken');

// 認證中間件
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: '需要認證' });
    }
    // 驗證 JWT
    next();
};
```

### 2. 添加數據庫

```javascript
const mongoose = require('mongoose');

// 文章模型
const ArticleSchema = new mongoose.Schema({
    url: String,
    title: String,
    author: String,
    content: String,
    crawledAt: Date
});
```

### 3. 添加隊列系統

```javascript
const Bull = require('bull');
const crawlQueue = new Bull('crawl queue');

// 添加爬取任務
crawlQueue.add('crawl-article', { url, options });
```
